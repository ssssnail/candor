import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { fetchThanks } from "@/lib/candor.functions";
import { useT } from "@/lib/i18n";
import { LangSwitcher } from "@/components/LangSwitcher";

export const Route = createFileRoute("/thanks/$replyToken")({
  component: ThanksPage,
});

function ThanksPage() {
  const t = useT();
  const { replyToken } = useParams({ from: "/thanks/$replyToken" });
  const fn = useServerFn(fetchThanks);
  const q = useQuery({
    queryKey: ["thanks", replyToken],
    queryFn: () => fn({ data: { replyToken } }),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 max-w-2xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          Candor<span className="text-mint">.</span>Box
        </Link>
        <LangSwitcher />
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        {q.isLoading && <p className="text-sm text-muted-foreground">{t.thanks.loading}</p>}

        {q.data && q.data.found === false && (
          <div className="text-center py-20">
            <h1 className="text-2xl font-semibold mb-3">{t.thanks.goneH}</h1>
            <p className="text-sm text-muted-foreground">{t.thanks.goneSub}</p>
          </div>
        )}

        {q.data && q.data.found && (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-mint mb-4">
              {t.thanks.eyebrow}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight mb-6">{t.thanks.h1}</h1>

            <div className="mb-6 p-4 rounded-xl border border-border bg-card/50">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                {t.thanks.yourPR}
              </p>
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {q.data.feedback.sanitized_text}
              </pre>
            </div>

            {q.data.replies.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">{t.thanks.noReply}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {q.data.replies.map((r, i) => (
                  <div key={i} className="p-5 rounded-xl border border-mint/30 bg-mint/5">
                    <p className="text-xs text-mint uppercase tracking-wider mb-2">
                      {t.thanks.from}
                    </p>
                    <p className="text-base leading-relaxed">{r.reply_text}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
