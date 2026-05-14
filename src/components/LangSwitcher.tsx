import { useLang } from "@/lib/i18n";

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
      className={
        "text-xs text-muted-foreground hover:text-foreground transition tabular-nums " +
        className
      }
      aria-label="Switch language"
      title={lang === "en" ? "切换到中文" : "Switch to English"}
    >
      <span className={lang === "en" ? "text-foreground" : ""}>EN</span>
      <span className="mx-1.5 opacity-40">/</span>
      <span className={lang === "zh" ? "text-foreground" : ""}>中</span>
    </button>
  );
}
