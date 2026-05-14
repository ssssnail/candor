import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { fetchInbox, createLink, markRead } from "@/lib/candor.functions";
import { ensureInboxToken } from "@/lib/inbox-token";
import { useT } from "@/lib/i18n";
import { LangSwitcher } from "@/components/LangSwitcher";

export const Route = createFileRoute("/inbox")({
  component: InboxPage,
});

type FeedbackItem = {
  id: string;
  link_id: string;
  sanitized_text: string;
  status: string;
  reply_token: string;
  created_at: string;
  expires_at: string;
  replies: Array<{ id: string; reply_text: string; created_at: string }>;
};

function InboxPage() {
  const t = useT();
  const [token, setToken] = useState<string>("");
  useEffect(() => {
    setToken(ensureInboxToken());
  }, []);
  const fetchInboxFn = useServerFn(fetchInbox);
  const createLinkFn = useServerFn(createLink);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["inbox", token],
    queryFn: () => fetchInboxFn({ data: { token } }),
    enabled: !!token,
    refetchInterval: 30000,
  });

  const linkMut = useMutation({
    mutationFn: () => createLinkFn({ data: { token } }),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  const links = q.data?.links ?? [];
  const allFeedbacks: FeedbackItem[] = q.data?.feedbacks ?? [];

  // Sort: unread first, then by created_at desc within each group
  const sorted = useMemo(() => {
    const isUnread = (f: FeedbackItem) => f.status === "new";
    return [...allFeedbacks].sort((a, b) => {
      const ua = isUnread(a) ? 0 : 1;
      const ub = isUnread(b) ? 0 : 1;
      if (ua !== ub) return ua - ub;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [allFeedbacks]);

  const unreadCount = allFeedbacks.filter((f) => f.status === "new").length;

  const primaryLink = links[0];
  const primaryUrl =
    primaryLink && typeof window !== "undefined"
      ? `${window.location.origin}/r/${primaryLink.id}`
      : null;

  const [copied, setCopied] = useState(false);
  function copy() {
    if (!primaryUrl) return;
    navigator.clipboard.writeText(primaryUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between max-w-3xl mx-auto w-full">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          Candor<span className="text-mint">.</span>Box
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition">
            {t.nav.privacy}
          </Link>
          <LangSwitcher />
        </nav>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t.inbox.h1}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
            {t.inbox.sub}
          </p>
        </div>

        {/* Repo link bar */}
        <div className="mb-6 p-2 pl-4 rounded-xl border border-border bg-card flex items-center gap-3">
          <code className="flex-1 text-xs text-muted-foreground truncate min-w-0">
            {primaryUrl ?? "—"}
          </code>
          {primaryUrl ? (
            <>
              <button
                onClick={copy}
                className="shrink-0 text-sm rounded-full bg-mint text-mint-foreground px-4 py-1.5 font-medium hover:opacity-90 transition"
              >
                {copied ? "✓" : t.inbox.copy}
              </button>
              <span className="h-5 w-px bg-border shrink-0" aria-hidden />
              <button
                onClick={() => linkMut.mutate()}
                disabled={linkMut.isPending}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition px-2"
                title={t.inbox.newLink}
              >
                {t.inbox.newLink}
              </button>
            </>
          ) : (
            <button
              onClick={() => linkMut.mutate()}
              disabled={linkMut.isPending}
              className="shrink-0 text-sm rounded-full bg-mint text-mint-foreground px-4 py-1.5 font-medium hover:opacity-90 transition"
            >
              {t.inbox.spinUp}
            </button>
          )}
        </div>

        {allFeedbacks.length > 0 && (
          <p className="mb-3 text-xs text-muted-foreground">
            {t.inbox.counts(unreadCount, allFeedbacks.length)}
          </p>
        )}

        {q.isLoading && <p className="text-sm text-muted-foreground">{t.inbox.loading}</p>}

        {!q.isLoading && sorted.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {t.inbox.emptyAll}
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {sorted.map((f) => (
            <FeedbackCard key={f.id} feedback={f} token={token} />
          ))}
        </ul>

        <p className="mt-12 text-xs text-muted-foreground text-center">
          {t.inbox.footer}
        </p>
      </main>
    </div>
  );
}

function FeedbackCard({ feedback, token }: { feedback: FeedbackItem; token: string }) {
  const t = useT();
  const markReadFn = useServerFn(markRead);
  const qc = useQueryClient();
  const isNew = feedback.status === "new";
  const [marked, setMarked] = useState(false);

  async function handleMark() {
    if (!isNew || marked) return;
    setMarked(true);
    try {
      await markReadFn({ data: { token, feedbackId: feedback.id } });
      qc.invalidateQueries({ queryKey: ["inbox"] });
    } catch {
      setMarked(false);
    }
  }

  return (
    <li
      onClick={handleMark}
      className={
        "relative rounded-xl border overflow-hidden transition cursor-default " +
        (isNew
          ? "border-mint/40 bg-card border-l-4 border-l-mint"
          : "border-border bg-card/50")
      }
    >
      <div className="p-5">
        {isNew && (
          <span className="inline-block mb-2 text-[10px] tracking-widest font-medium text-mint">
            {t.inbox.newDot}
          </span>
        )}
        <pre
          className={
            "text-sm leading-relaxed whitespace-pre-wrap font-sans " +
            (isNew ? "text-foreground" : "text-muted-foreground")
          }
        >
          {feedback.sanitized_text}
        </pre>
        <p className="mt-3 text-xs text-muted-foreground/80">
          {new Date(feedback.created_at).toLocaleString()}
        </p>
      </div>
    </li>
  );
}
