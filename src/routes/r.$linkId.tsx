import { createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { submitFeedback } from "@/lib/candor.functions";
import { saveReplyToken } from "@/lib/inbox-token";
import { useT } from "@/lib/i18n";
import { LangSwitcher } from "@/components/LangSwitcher";

export const Route = createFileRoute("/r/$linkId")({
  component: SubmitPage,
});

function SubmitPage() {
  const t = useT();
  const { linkId } = useParams({ from: "/r/$linkId" });
  const submitFn = useServerFn(submitFeedback);
  const [strengths, setStrengths] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<Set<string>>(new Set());
  const [oneThing, setOneThing] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ replyToken: string; preview: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, id: string) {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  }

  function buildRawText(): string {
    const lines: string[] = [];
    if (strengths.size) {
      const labels = t.submit.strengths
        .filter((s) => strengths.has(s.id))
        .map((s) => s.label);
      lines.push(`${t.submit.strengthsPrefix}: ${labels.join(", ")}`);
    }
    if (suggestions.size) {
      const labels = t.submit.suggestions
        .filter((s) => suggestions.has(s.id))
        .map((s) => s.label);
      lines.push(`${t.submit.suggestionsPrefix}: ${labels.join(", ")}`);
    }
    const one = oneThing.trim();
    if (one) {
      if (lines.length) lines.push("");
      lines.push(`> ${t.submit.coFounderPrefix}`);
      lines.push(one);
    }
    return lines.join("\n");
  }

  const canSubmit =
    !loading && (strengths.size > 0 || suggestions.size > 0 || oneThing.trim().length >= 2);

  async function handleSubmit() {
    const raw = buildRawText();
    if (raw.length < 2) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await submitFn({ data: { linkId, rawText: raw } });
      saveReplyToken(res.replyToken, linkId);
      setDone({ replyToken: res.replyToken, preview: res.sanitizedPreview });
      setStrengths(new Set());
      setSuggestions(new Set());
      setOneThing("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.submit.submitFail);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const thanksUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/thanks/${done.replyToken}`
        : "";
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-10">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-end">
            <LangSwitcher />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-mint mb-4">
            {t.submit.doneEyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mb-4">
            {t.submit.doneH1}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {t.submit.doneSub}
          </p>

          <div className="text-left p-4 rounded-xl border border-border bg-card mb-6 max-h-60 overflow-auto">
            <p className="text-xs text-mint mb-2 uppercase tracking-wider">
              {t.submit.doneSee}
            </p>
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {done.preview}
            </pre>
          </div>

          <div className="p-5 rounded-xl border border-violet/40 bg-violet/5 text-left">
            <p className="text-sm font-medium mb-1.5">{t.submit.installH}</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t.submit.installP}
            </p>
            <a
              href="/inbox"
              className="inline-block text-xs rounded-full bg-mint text-mint-foreground px-4 py-2 font-medium hover:opacity-90"
            >
              {t.submit.installCta}
            </a>
            <p className="mt-4 text-[11px] text-muted-foreground break-all">
              {t.submit.backup}: {thanksUrl}
            </p>
          </div>

          <button
            onClick={() => setDone(null)}
            className="mt-8 text-xs text-muted-foreground hover:text-foreground"
          >
            {t.submit.another}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-end">
          <LangSwitcher />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-mint mb-3 text-center">
          {t.submit.eyebrow}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-3">
          {t.submit.h1} <span className="text-muted-foreground">{t.submit.h1Sub}</span>
        </h1>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-12 max-w-md mx-auto">
          {t.submit.lead}
        </p>

        {/* The One Thing — hero */}
        <section className="mb-10 p-6 rounded-2xl border border-violet/40 bg-violet/5">
          <p className="text-xs uppercase tracking-[0.2em] text-violet mb-3">
            {t.submit.oneKicker}
          </p>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug mb-4">
            {t.submit.oneH}
            <br />
            {t.submit.oneH2}{" "}
            <span className="text-violet">{t.submit.oneHEm}</span> {t.submit.oneH3}
          </h2>
          <textarea
            autoFocus
            value={oneThing}
            onChange={(e) => setOneThing(e.target.value)}
            rows={6}
            maxLength={2000}
            placeholder={t.submit.onePlaceholder}
            className="w-full rounded-xl border border-input bg-background p-4 text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-violet"
          />
          <p className="mt-2 text-xs text-muted-foreground text-right">
            {oneThing.length} / 2000
          </p>
        </section>

        <p className="text-xs text-muted-foreground text-center mb-6">
          {t.submit.warmup}
        </p>

        {/* Strengths */}
        <section className="mb-8">
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground">
              <span className="text-mint">●</span> {t.submit.strengthsTitle}
            </h2>
            <span className="text-xs text-muted-foreground">{t.submit.multi}</span>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {t.submit.strengths.map((s) => {
              const on = strengths.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(strengths, setStrengths, s.id)}
                  className={
                    "text-left p-2.5 rounded-lg border transition " +
                    (on
                      ? "border-mint bg-mint/10"
                      : "border-border/60 bg-card/50 hover:border-mint/40")
                  }
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Suggestions */}
        <section className="mb-10">
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground">
              <span className="text-amber">●</span> {t.submit.suggestionsTitle}
            </h2>
            <span className="text-xs text-muted-foreground">{t.submit.multi}</span>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {t.submit.suggestions.map((s) => {
              const on = suggestions.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(suggestions, setSuggestions, s.id)}
                  className={
                    "text-left p-2.5 rounded-lg border transition " +
                    (on
                      ? "border-amber bg-amber/10"
                      : "border-border/60 bg-card/50 hover:border-amber/40")
                  }
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {err && <p className="mb-3 text-xs text-destructive text-center">{err}</p>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-full bg-mint text-mint-foreground px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
        >
          {loading ? t.submit.shipping : t.submit.ship}
        </button>
        <p className="mt-3 text-xs text-muted-foreground text-center">
          {t.submit.legal}{" "}
          <a href="/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {t.submit.legalLink}
          </a>
        </p>
      </div>
    </div>
  );
}
