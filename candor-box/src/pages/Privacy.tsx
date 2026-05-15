import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../App";
import "./Privacy.css";

export function Privacy() {
  const { t, locale, setLocale } = useLocale();
  const [showOath, setShowOath] = useState(false);

  return (
    <div className="privacy">
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
        <h1>{t.privacy.h1}</h1>
        <p className="lead">{t.privacy.lead}</p>

        <div className="cards">
          <div className="card">
            <div className="card-icon">🔐</div>
            <h3>{t.privacy.card1Title}</h3>
            <p>{t.privacy.card1Desc}</p>
          </div>
          <div className="card">
            <div className="card-icon">📝</div>
            <h3>{t.privacy.card2Title}</h3>
            <p>{t.privacy.card2Desc}</p>
          </div>
        </div>

        <div className="oath-section">
          <button
            className="skeptical-btn"
            onClick={() => setShowOath(!showOath)}
          >
            {t.privacy.skeptical}
          </button>

          {showOath && (
            <div className="oath-content">
              <p className="oath-text">
                {locale === "en" ? t.privacy.oath : "不匿名死全家。"}
              </p>
              <p className="oath-sub">{t.privacy.oathSub}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
