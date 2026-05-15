import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLocale } from "../App";
import "./Submit.css";

const CORE_STRENGTHS = [
  { id: "vision", emoji: "👁️", labelKey: "vision", descKey: "visionDesc" },
  { id: "execution", emoji: "🚀", labelKey: "execution", descKey: "executionDesc" },
  { id: "principles", emoji: "🧠", labelKey: "principles", descKey: "principlesDesc" },
  { id: "communicator", emoji: "📢", labelKey: "communicator", descKey: "communicatorDesc" },
];

const OPTIMIZATIONS = [
  { id: "async", emoji: "⚡", labelKey: "async", descKey: "asyncDesc" },
  { id: "paralysis", emoji: "🎯", labelKey: "paralysis", descKey: "paralysisDesc" },
  { id: "sayNo", emoji: "🛡️", labelKey: "sayNo", descKey: "sayNoDesc" },
  { id: "shorter", emoji: "✂️", labelKey: "shorter", descKey: "shorterDesc" },
];

export function Submit() {
  const { linkId } = useParams<{ linkId: string }>();
  const { t, locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);
  const [oneThing, setOneThing] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleStrength = (id: string) => {
    setSelectedStrengths((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleOptimization = (id: string) => {
    setSelectedOptimizations((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedStrengths.length === 0 && selectedOptimizations.length === 0 && !oneThing.trim()) {
      return;
    }

    setSubmitting(true);

    const feedback = {
      id: crypto.randomUUID(),
      linkId: linkId!,
      coreStrengths: selectedStrengths,
      optimization: selectedOptimizations,
      oneThing: oneThing.trim(),
      timestamp: Date.now(),
      read: false,
    };

    const allInboxData = JSON.parse(localStorage.getItem("candor-all-inboxes") || "{}");
    if (!allInboxData[linkId!]) {
      allInboxData[linkId!] = [];
    }
    allInboxData[linkId!].push(feedback);
    localStorage.setItem("candor-all-inboxes", JSON.stringify(allInboxData));

    setTimeout(() => {
      navigate("/submitted");
    }, 500);
  };

  const isValid = selectedStrengths.length > 0 || selectedOptimizations.length > 0 || oneThing.trim().length > 0;

  return (
    <div className="submit">
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
        <section className="form-section">
          <h2>{t.submit.coreStrengths.title}</h2>
          <div className="chips-grid">
            {CORE_STRENGTHS.map((item) => (
              <button
                key={item.id}
                className={`chip ${selectedStrengths.includes(item.id) ? "selected strength" : ""}`}
                onClick={() => toggleStrength(item.id)}
              >
                <span className="chip-emoji">{item.emoji}</span>
                <span className="chip-label">{t.submit.coreStrengths[item.labelKey as keyof typeof t.submit.coreStrengths]}</span>
                <span className="chip-desc">{t.submit.coreStrengths[item.descKey as keyof typeof t.submit.coreStrengths]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>{t.submit.optimization.title}</h2>
          <div className="chips-grid">
            {OPTIMIZATIONS.map((item) => (
              <button
                key={item.id}
                className={`chip ${selectedOptimizations.includes(item.id) ? "selected optimize" : ""}`}
                onClick={() => toggleOptimization(item.id)}
              >
                <span className="chip-emoji">{item.emoji}</span>
                <span className="chip-label">{t.submit.optimization[item.labelKey as keyof typeof t.submit.optimization]}</span>
                <span className="chip-desc">{t.submit.optimization[item.descKey as keyof typeof t.submit.optimization]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>{t.submit.oneThing.title}</h2>
          <textarea
            className="textarea"
            placeholder={t.submit.oneThing.placeholder}
            value={oneThing}
            onChange={(e) => setOneThing(e.target.value)}
            rows={4}
          />
        </section>

        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? "..." : t.submit.cta}
        </button>

        <p className="legal">{t.submit.legal}</p>
      </main>
    </div>
  );
}
