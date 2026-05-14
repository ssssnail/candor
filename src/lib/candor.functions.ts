import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sha256Hex, shortId } from "./crypto.server";

// Ensure inbox exists for the given device token; returns { inboxId }.
export const ensureInbox = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(16).max(128) }).parse(d))
  .handler(async ({ data }) => {
    const hash = await sha256Hex(data.token);
    const existing = await supabaseAdmin
      .from("inboxes")
      .select("id")
      .eq("owner_token_hash", hash)
      .maybeSingle();
    if (existing.data) {
      await supabaseAdmin
        .from("inboxes")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", existing.data.id);
      return { inboxId: existing.data.id };
    }
    const ins = await supabaseAdmin
      .from("inboxes")
      .insert({ owner_token_hash: hash })
      .select("id")
      .single();
    if (ins.error) throw new Error(ins.error.message);
    return { inboxId: ins.data.id };
  });

// Create a new feedback link for the inbox owner.
export const createLink = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token: z.string().min(16), label: z.string().max(60).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const hash = await sha256Hex(data.token);
    const inbox = await supabaseAdmin
      .from("inboxes")
      .select("id")
      .eq("owner_token_hash", hash)
      .maybeSingle();
    let inboxId = inbox.data?.id;
    if (!inboxId) {
      const ins = await supabaseAdmin
        .from("inboxes")
        .insert({ owner_token_hash: hash })
        .select("id")
        .single();
      if (ins.error) throw new Error(ins.error.message);
      inboxId = ins.data.id;
    }
    let id = shortId();
    for (let i = 0; i < 3; i++) {
      const exists = await supabaseAdmin
        .from("feedback_links")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (!exists.data) break;
      id = shortId();
    }
    const ins = await supabaseAdmin
      .from("feedback_links")
      .insert({ id, inbox_id: inboxId, label: data.label ?? null })
      .select("id")
      .single();
    if (ins.error) throw new Error(ins.error.message);
    return { linkId: ins.data.id };
  });

// Fetch the inbox view for the owner: feedbacks + replies grouped.
export const fetchInbox = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(16) }).parse(d))
  .handler(async ({ data }) => {
    const hash = await sha256Hex(data.token);
    const inbox = await supabaseAdmin
      .from("inboxes")
      .select("id")
      .eq("owner_token_hash", hash)
      .maybeSingle();
    if (!inbox.data) return { links: [], feedbacks: [] };

    const links = await supabaseAdmin
      .from("feedback_links")
      .select("id, label, created_at, revoked")
      .eq("inbox_id", inbox.data.id)
      .order("created_at", { ascending: false });
    const linkIds = (links.data ?? []).map((l) => l.id);
    if (linkIds.length === 0) return { links: links.data ?? [], feedbacks: [] };

    const feedbacks = await supabaseAdmin
      .from("feedbacks")
      .select("id, link_id, sanitized_text, status, reply_token, created_at, expires_at")
      .in("link_id", linkIds)
      .order("created_at", { ascending: false })
      .limit(200);

    const fbIds = (feedbacks.data ?? []).map((f) => f.id);
    const replies = fbIds.length
      ? await supabaseAdmin
          .from("replies")
          .select("id, feedback_id, reply_text, created_at")
          .in("feedback_id", fbIds)
      : { data: [] as Array<{ id: string; feedback_id: string; reply_text: string; created_at: string }> };

    const repliesByFb = new Map<string, Array<{ id: string; reply_text: string; created_at: string }>>();
    for (const r of replies.data ?? []) {
      const arr = repliesByFb.get(r.feedback_id) ?? [];
      arr.push({ id: r.id, reply_text: r.reply_text, created_at: r.created_at });
      repliesByFb.set(r.feedback_id, arr);
    }

    return {
      links: links.data ?? [],
      feedbacks: (feedbacks.data ?? []).map((f) => ({
        ...f,
        replies: repliesByFb.get(f.id) ?? [],
      })),
    };
  });

// Submit feedback via a public link. Raw text is delivered as-is (no AI rewrite).
export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ linkId: z.string().min(4).max(16), rawText: z.string().min(2).max(4000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const link = await supabaseAdmin
      .from("feedback_links")
      .select("id, revoked")
      .eq("id", data.linkId)
      .maybeSingle();
    if (!link.data || link.data.revoked) {
      throw new Error("This link is no longer active.");
    }
    const text = data.rawText.trim().slice(0, 4000);
    const ins = await supabaseAdmin
      .from("feedbacks")
      .insert({ link_id: data.linkId, sanitized_text: text })
      .select("reply_token, sanitized_text")
      .single();
    if (ins.error) throw new Error(ins.error.message);
    return { replyToken: ins.data.reply_token, sanitizedPreview: ins.data.sanitized_text };
  });

// Owner posts a reply on a feedback they own.
export const postReply = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token: z.string().min(16),
        feedbackId: z.string().uuid(),
        replyText: z.string().min(1).max(500),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const hash = await sha256Hex(data.token);
    const inbox = await supabaseAdmin
      .from("inboxes")
      .select("id")
      .eq("owner_token_hash", hash)
      .maybeSingle();
    if (!inbox.data) throw new Error("收件箱不存在");

    // Verify ownership: feedback -> link -> inbox
    const fb = await supabaseAdmin
      .from("feedbacks")
      .select("id, link_id, feedback_links!inner(inbox_id)")
      .eq("id", data.feedbackId)
      .maybeSingle();
    // feedback_links is joined; type widens to any-ish but we check manually
    const ownerInboxId = (fb.data as unknown as { feedback_links: { inbox_id: string } } | null)
      ?.feedback_links?.inbox_id;
    if (!fb.data || ownerInboxId !== inbox.data.id) {
      throw new Error("无权回复");
    }

    const ins = await supabaseAdmin
      .from("replies")
      .insert({ feedback_id: data.feedbackId, reply_text: data.replyText.trim() })
      .select("id")
      .single();
    if (ins.error) throw new Error(ins.error.message);

    await supabaseAdmin
      .from("feedbacks")
      .update({ status: "replied" })
      .eq("id", data.feedbackId);

    return { ok: true };
  });

// Mark a feedback as read.
export const markRead = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token: z.string().min(16), feedbackId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const hash = await sha256Hex(data.token);
    const inbox = await supabaseAdmin
      .from("inboxes")
      .select("id")
      .eq("owner_token_hash", hash)
      .maybeSingle();
    if (!inbox.data) return { ok: false };
    const fb = await supabaseAdmin
      .from("feedbacks")
      .select("id, status, feedback_links!inner(inbox_id)")
      .eq("id", data.feedbackId)
      .maybeSingle();
    const ownerInboxId = (fb.data as unknown as { feedback_links: { inbox_id: string } } | null)
      ?.feedback_links?.inbox_id;
    if (!fb.data || ownerInboxId !== inbox.data.id) return { ok: false };
    if (fb.data.status === "new") {
      await supabaseAdmin.from("feedbacks").update({ status: "read" }).eq("id", data.feedbackId);
    }
    return { ok: true };
  });

// Public: fetch the reply for a given reply_token (used on /thanks/$token).
export const fetchThanks = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ replyToken: z.string().min(8).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const fb = await supabaseAdmin
      .from("feedbacks")
      .select("id, sanitized_text, created_at, expires_at")
      .eq("reply_token", data.replyToken)
      .maybeSingle();
    if (!fb.data) return { found: false as const };
    const replies = await supabaseAdmin
      .from("replies")
      .select("reply_text, created_at")
      .eq("feedback_id", fb.data.id)
      .order("created_at", { ascending: true });
    return {
      found: true as const,
      feedback: {
        sanitized_text: fb.data.sanitized_text,
        created_at: fb.data.created_at,
        expires_at: fb.data.expires_at,
      },
      replies: replies.data ?? [],
    };
  });
