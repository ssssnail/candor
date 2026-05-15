import React from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../App";
import "./Submitted.css";

export function Submitted() {
  const { t, locale, setLocale } = useLocale();

  return (
    <div className="submitted">
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo">Candor.Box</Link>
          <button
            className="locale-toggle"
            onClick={() => setLocale(locale === "en" ? "zh" : "en")}
          >
            {locale === "en" ? "中" : "EN"}
          </button>
        </nav>
      </header>

      <main className="main">
        <div className="success-icon">✓</div>
        
        <span className="eyebrow">// {t.submitted.eyebrow}</span>
        <h1>{t.submitted.h1}</h1>
        <p className="subtitle">{t.submitted.sub}</p>

        <div className="plugin-promo">
          <h3>{t.submitted.installTitle}</h3>
          <p>{t.submitted.installDesc}</p>
          <div className="cta-group">
            <a href="#" className="btn-primary">
              {t.submitted.ctaInstall}
            </a>
            <Link to="/" className="btn-secondary">
              {t.submitted.ctaAnother}
            </Link>
          </div>
        </div>

        <footer className="footer">
          <Link to="/privacy">{locale === "en" ? "Privacy" : "隐私政策"}</Link>
          <span className="divider">·</span>
          <span className="version">v1.0.0</span>
        </footer>
      </main>
    </div>
  );
}
