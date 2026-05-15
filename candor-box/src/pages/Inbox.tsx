import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocale, getShareableLink, generateLinkId, getInboxData, saveInboxData } from "../App";
import "./Inbox.css";

interface Feedback {
  id: string;
  linkId: string;
  coreStrengths: string[];
  optimization: string[];
  oneThing: string;
  timestamp: number;
  read: boolean;
}

export function Inbox() {
  const { t, locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [primaryLink, setPrimaryLink] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("candor-primary-link");
    setPrimaryLink(stored);
  }, []);

  const inboxData = getInboxData();
  const primaryData = primaryLink
    ? inboxData.find((d) => d.linkId === primaryLink)
    : inboxData[0];

  const unreadCount = primaryData?.feedback.filter((f) => !f.read).length || 0;
  const totalCount = primaryData?.feedback.length || 0;

  const handleCopy = () => {
    if (primaryData) {
      const link = getShareableLink(primaryData.linkId);
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewLink = () => {
    const linkId = generateLinkId();
    const inboxData = getInboxData();
    inboxData.push({ linkId, feedback: [] });
    saveInboxData(inboxData);
    localStorage.setItem("candor-primary-link", linkId);
    setPrimaryLink(linkId);
  };

  const markAsRead = (feedbackId: string) => {
    if (!primaryData) return;
    const updated = primaryData.feedback.map((f) =>
      f.id === feedbackId ? { ...f, read: true } : f
    );
    const newInboxData = inboxData.map((d) =>
      d.linkId === primaryData.linkId ? { ...d, feedback: updated } : d
    );
    saveInboxData(newInboxData);
    window.location.reload();
  };

  if (!primaryData) {
    return (
      <div className="inbox">
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
          <p>{t.inbox.empty}</p>
          <Link to="/" className="btn-primary">{t.landing.cta}</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="inbox">
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
        <section className="repo-header">
          <h1>{t.inbox.title}</h1>
          <p className="subtitle">{t.inbox.sub}</p>
        </section>

        <section className="link-bar">
          <div className="link-display">
            <code className="link-text">
              {typeof window !== "undefined" ? window.location.origin : ""}/r/{primaryData.linkId}
            </code>
            <button className="btn-copy" onClick={handleCopy}>
              {copied ? "✓" : t.inbox.copy}
            </button>
          </div>
          <button className="btn-new" onClick={handleNewLink}>
            {t.inbox.newLink}
          </button>
        </section>

        <section className="stats">
          <span className="stat">
            <strong>{unreadCount}</strong> {t.inbox.unread}
          </span>
          <span className="divider">·</span>
          <span className="stat">
            <strong>{totalCount}</strong> {t.inbox.total}
          </span>
        </section>

        <section className="feedback-list">
          {primaryData.feedback.length === 0 ? (
            <div className="empty-state">
              <p>{t.inbox.empty}</p>
            </div>
          ) : (
            primaryData.feedback.map((feedback) => (
              <div
                key={feedback.id}
                className={`feedback-item ${!feedback.read ? "unread" : ""}`}
                onClick={() => !feedback.read && markAsRead(feedback.id)}
              >
                {!feedback.read && <span className="new-tag">{t.inbox.unreadTag}</span>}
                <div className="feedback-content">
                  <div className="feedback-section">
                    <span className="section-label">Core Strengths:</span>
                    <div className="chips">
                      {feedback.coreStrengths.map((s, i) => (
                        <span key={i} className="chip strength">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="feedback-section">
                    <span className="section-label">Optimize:</span>
                    <div className="chips">
                      {feedback.optimization.map((s, i) => (
                        <span key={i} className="chip optimize">{s}</span>
                      ))}
                    </div>
                  </div>
                  {feedback.oneThing && (
                    <div className="feedback-section">
                      <span className="section-label">One Thing:</span>
                      <p className="one-thing">{feedback.oneThing}</p>
                    </div>
                  )}
                  <span className="timestamp">
                    {new Date(feedback.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        <footer className="inbox-footer">
          {t.inbox.footer}
        </footer>
      </main>
    </div>
  );
}
