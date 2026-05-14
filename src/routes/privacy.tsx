import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { LangSwitcher } from "@/components/LangSwitcher";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  const t = useT();
  const [showEgg, setShowEgg] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between max-w-3xl mx-auto w-full">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          Candor<span className="text-mint">.</span>Box
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/inbox" className="hover:text-foreground transition">
            {t.nav.repo}
          </Link>
          <LangSwitcher />
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-mint mb-4">
          {t.privacy.kicker}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">{t.privacy.h1}</h1>
        <p className="text-muted-foreground leading-relaxed">{t.privacy.lead}</p>

        <div className="mt-10 space-y-4">
          {t.privacy.cards.map((s, i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <span className="text-mint text-xs">●</span>
                {s.t}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>

        {t.privacy.hashtag && (
          <p className="mt-10 text-sm text-muted-foreground leading-relaxed">
            {t.privacy.hashtag}{" "}
            <span className="text-foreground font-medium">{t.privacy.tag}</span>
          </p>
        )}

        <div className="mt-12 text-center">
          {!showEgg ? (
            <button
              onClick={() => setShowEgg(true)}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {t.privacy.eggBtn}
            </button>
          ) : (
            <div className="py-10 px-6 rounded-2xl border border-violet/40 bg-violet/5">
              <p className="text-3xl font-semibold tracking-tight">{t.privacy.eggH}</p>
              <p className="mt-3 text-muted-foreground text-sm">{t.privacy.eggSub}</p>
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            {t.nav.back}
          </Link>
        </div>
      </main>
    </div>
  );
}
