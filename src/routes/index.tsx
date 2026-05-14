import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createLink } from "@/lib/candor.functions";
import { ensureInboxToken } from "@/lib/inbox-token";
import { useT } from "@/lib/i18n";
import { LangSwitcher } from "@/components/LangSwitcher";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const t = useT();
  const createLinkFn = useServerFn(createLink);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const token = ensureInboxToken();
      const res = await createLinkFn({ data: { token } });
      const url = `${window.location.origin}/r/${res.linkId}`;
      setLink(url);
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
    } catch (e) {
      console.error(e);
      alert(t.home.genFail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          Candor<span className="text-mint">.</span>Box
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/inbox" className="hover:text-foreground transition">
            {t.nav.repo}
          </Link>
          <Link to="/privacy" className="hover:text-foreground transition">
            {t.nav.privacy}
          </Link>
          <LangSwitcher />
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl w-full text-center py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-mint mb-6">
            {t.home.eyebrow}
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {t.home.h1a}
            <br />
            {t.home.h1b} <span className="text-mint">{t.home.h1c}</span>
            <span className="text-muted-foreground">{t.home.h1d}</span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.home.sub}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-mint text-mint-foreground px-7 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? t.home.cta1Loading : t.home.cta1Idle}
            </button>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-accent transition"
            >
              {t.home.cta2}
            </a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t.home.legal}</p>

          {link && (
            <div className="mt-10 mx-auto max-w-lg p-5 rounded-xl border border-border bg-card text-left">
              <p className="text-xs text-mint uppercase tracking-wider mb-2">
                {t.home.copied}
              </p>
              <code className="block text-sm break-all text-foreground/90">{link}</code>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate({ to: "/inbox" })}
                  className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-accent transition"
                >
                  {t.home.openRepo}
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(link)}
                  className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-accent transition"
                >
                  {t.home.copyAgain}
                </button>
              </div>
            </div>
          )}

          <div id="how" className="mt-24 scroll-mt-20">
            <p className="text-xs uppercase tracking-[0.2em] text-mint mb-6 text-center">
              {t.home.howKicker}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {t.home.how.map((s) => (
                <div key={s.k} className="p-5 rounded-xl border border-border bg-card">
                  <p className="text-mint text-xs tracking-widest mb-3">{s.k}</p>
                  <h3 className="font-medium mb-1.5">{s.t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-muted-foreground">
        <Link to="/privacy" className="hover:text-foreground transition">
          {t.home.footer}
        </Link>
      </footer>
    </div>
  );
}
