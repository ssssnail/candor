import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale, getShareableLink, generateLinkId, getInboxData, saveInboxData } from "../App";
import "./Landing.css";

export function Landing() {
  const { t, locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateRepo = () => {
    setLoading(true);
    setTimeout(() => {
      const linkId = generateLinkId();
      const inboxData = getInboxData();
      const existingIndex = inboxData.findIndex((d) => d.linkId === linkId);
      if (existingIndex === -1) {
        inboxData.push({ linkId, feedback: [] });
        saveInboxData(inboxData);
      }
      localStorage.setItem("candor-primary-link", linkId);
      navigate("/inbox");
    }, 800);
  };

  return (
    <div className="landing">
      <header className="header">
        <nav className="nav">
          <span className="logo">Candor.Box</span>
          <button
            className="locale-toggle"
            onClick={() => setLocale(locale === "en" ? "zh" : "en")}
          >
            {locale === "en" ? "中" : "EN"}
          </button>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <span className="eyebrow">// {t.landing.eyebrow}</span>
          <h1 className="title">
            {t.landing.h1}
            <br />
            <span className="title-accent">{t.landing.h1Suffix}</span>
          </h1>
          <p className="subtitle">{t.landing.sub}</p>

          <div className="cta-group">
            <button
              className="btn-primary"
              onClick={handleCreateRepo}
              disabled={loading}
            >
              {loading ? t.landing.ctaLoading : t.landing.cta}
            </button>
            <a href="#how-it-works" className="btn-secondary">
              {t.landing.secondaryCta}
            </a>
          </div>

          <p className="legal">{t.landing.legal}</p>
        </section>

        <section id="how-it-works" className="how-it-works">
          <h2 className="section-title">// {t.landing.howItWorks.title}</h2>
          <div className="steps">
            <div className="step">
              <span className="step-number">01</span>
              <div className="step-content">
                <h3>{t.landing.howItWorks.step1Title}</h3>
                <p>{t.landing.howItWorks.step1Desc}</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">02</span>
              <div className="step-content">
                <h3>{t.landing.howItWorks.step2Title}</h3>
                <p>{t.landing.howItWorks.step2Desc}</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">03</span>
              <div className="step-content">
                <h3>{t.landing.howItWorks.step3Title}</h3>
                <p>{t.landing.howItWorks.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <a href="/privacy">{locale === "en" ? "Privacy" : "隐私政策"}</a>
          <span className="divider">·</span>
          <span className="version">v1.0.0</span>
        </footer>
      </main>
    </div>
  );
}
