const CORE_STRENGTHS = [
  { id: "vision", emoji: "👁️", label: "Visionary (Altman Mode)", desc: "Sees three steps ahead" },
  { id: "execution", emoji: "🚀", label: "Execution Beast", desc: "Ships so fast even AI feels slow" },
  { id: "principles", emoji: "🧠", label: "First-Principles Master", desc: "Breaks problems down to atoms" },
  { id: "communicator", emoji: "📢", label: "10x Communicator", desc: "Even PMs get it on the first pass" }
];

const OPTIMIZATIONS = [
  { id: "async", emoji: "⚡", label: "Default to Async", desc: "If Slack works, don't open Zoom" },
  { id: "paralysis", emoji: "🎯", label: "Break Analysis Paralysis", desc: "Ship at 70%, iterate live" },
  { id: "sayNo", emoji: "🛡️", label: "Say No Like a Pro", desc: "Strategic refusal beats «sure I'll do it»" },
  { id: "shorter", emoji: "✂️", label: "Write Shorter", desc: "Cut the email in half. Everyone wins." }
];

const translations = {
  en: {
    submit: {
      coreStrengths: "Core Strengths",
      optimization: "Optimization Suggestions",
      oneThingTitle: "The One Thing",
      oneThingPlaceholder: "If you were their co-founder, what's the ONE thing you'd push them to fix? Be honest, be funny.",
      cta: "Ship it 🚀",
      legal: "Delivered as written. Anonymous by default."
    },
    submitted: {
      eyebrow: "Patch submitted",
      h1: "✅ Your PR is in their inbox.",
      sub: "Delivered as written. No one knows it was you — unless you signed it.",
      ctaAnother: "Submit another PR"
    }
  },
  zh: {
    submit: {
      coreStrengths: "核心优势",
      optimization: "优化建议",
      oneThingTitle: "那件最重要的事",
      oneThingPlaceholder: "如果你是他们的联合创始人，你会让他们修复哪一件事？诚实、有趣一点。",
      cta: "提交 🚀",
      legal: "原文送达。默认匿名。"
    },
    submitted: {
      eyebrow: "补丁已提交",
      h1: "✅ 你的 PR 已在对方收件箱。",
      sub: "原文送达。没人知道是你——除非你自己署名。",
      ctaAnother: "再提交一个 PR"
    }
  }
};

class SubmitApp {
  constructor() {
    this.locale = 'en';
    this.linkId = null;
    this.selectedStrengths = [];
    this.selectedOptimizations = [];
    this.oneThing = '';
    this.submitting = false;
    this.init();
  }

  get t() {
    return translations[this.locale];
  }

  sendMessage(message) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  async init() {
    const params = new URLSearchParams(window.location.search);
    this.linkId = params.get('link');

    if (!this.linkId) {
      document.body.innerHTML = '<div class="container"><p style="color: var(--text-muted); text-align: center; padding: 40px;">Invalid link</p></div>';
      return;
    }

    const { locale } = await this.sendMessage({ type: 'getLocale' });
    this.locale = locale || 'en';
    this.render();
  }

  toggleLocale() {
    this.locale = this.locale === 'en' ? 'zh' : 'en';
    this.sendMessage({ type: 'setLocale', locale: this.locale });
    this.render();
  }

  toggleStrength(id) {
    if (this.selectedStrengths.includes(id)) {
      this.selectedStrengths = this.selectedStrengths.filter(s => s !== id);
    } else {
      this.selectedStrengths.push(id);
    }
    this.render();
  }

  toggleOptimization(id) {
    if (this.selectedOptimizations.includes(id)) {
      this.selectedOptimizations = this.selectedOptimizations.filter(s => s !== id);
    } else {
      this.selectedOptimizations.push(id);
    }
    this.render();
  }

  setOneThing(text) {
    this.oneThing = text;
  }

  isValid() {
    return this.selectedStrengths.length > 0 || this.selectedOptimizations.length > 0 || this.oneThing.trim().length > 0;
  }

  async handleSubmit() {
    if (!this.isValid() || this.submitting) return;

    this.submitting = true;
    const btn = document.querySelector('.btn-submit');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '...';
    }

    const feedback = {
      id: crypto.randomUUID(),
      linkId: this.linkId,
      coreStrengths: this.selectedStrengths.map(id => {
        const item = CORE_STRENGTHS.find(s => s.id === id);
        return item ? `${item.emoji} ${item.label}` : id;
      }),
      optimization: this.selectedOptimizations.map(id => {
        const item = OPTIMIZATIONS.find(s => s.id === id);
        return item ? `${item.emoji} ${item.label}` : id;
      }),
      oneThing: this.oneThing.trim(),
      timestamp: Date.now(),
      read: false
    };

    await this.sendMessage({ type: 'submitFeedback', linkId: this.linkId, feedback });

    this.showSubmitted();
  }

  showSubmitted() {
    document.getElementById('app').innerHTML = this.renderSubmitted();
    this.attachSubmittedListeners();
  }

  getStrengthLabel(id) {
    const item = CORE_STRENGTHS.find(s => s.id === id);
    return item ? `${item.emoji} ${item.label}` : id;
  }

  getOptimizationLabel(id) {
    const item = OPTIMIZATIONS.find(s => s.id === id);
    return item ? `${item.emoji} ${item.label}` : id;
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = this.renderForm();
    this.attachListeners();
  }

  renderForm() {
    return `
      <div class="container form-view fade-up">
        <header class="header">
          <span class="logo">Candor.Box</span>
          <button class="locale-toggle">${this.locale === 'en' ? '中' : 'EN'}</button>
        </header>

        <div class="form-section">
          <h2>${this.t.submit.coreStrengths}</h2>
          <div class="chips-grid">
            ${CORE_STRENGTHS.map(item => `
              <button class="chip ${this.selectedStrengths.includes(item.id) ? 'selected strength' : ''}" data-strength="${item.id}">
                <span class="chip-emoji">${item.emoji}</span>
                <span class="chip-label">${item.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-section">
          <h2>${this.t.submit.optimization}</h2>
          <div class="chips-grid">
            ${OPTIMIZATIONS.map(item => `
              <button class="chip ${this.selectedOptimizations.includes(item.id) ? 'selected optimize' : ''}" data-optimization="${item.id}">
                <span class="chip-emoji">${item.emoji}</span>
                <span class="chip-label">${item.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-section">
          <h2>${this.t.submit.oneThingTitle}</h2>
          <textarea class="textarea" placeholder="${this.t.submit.oneThingPlaceholder}">${this.oneThing}</textarea>
        </div>

        <button class="btn-submit" ${!this.isValid() ? 'disabled' : ''}>${this.t.submit.cta}</button>
        <p class="legal">${this.t.submit.legal}</p>
      </div>

      <div class="submitted-view">
        ${this.renderSubmittedContent()}
      </div>
    `;
  }

  renderSubmitted() {
    return `
      <div class="submitted-view active fade-up">
        ${this.renderSubmittedContent()}
      </div>
    `;
  }

  renderSubmittedContent() {
    return `
      <div class="container">
        <div class="success-icon">✓</div>
        <span class="eyebrow">// ${this.t.submitted.eyebrow}</span>
        <h1>${this.t.submitted.h1}</h1>
        <p class="subtitle">${this.t.submitted.sub}</p>
        <button class="btn-secondary">${this.t.submitted.ctaAnother}</button>
      </div>
    `;
  }

  attachListeners() {
    document.querySelector('.locale-toggle')?.addEventListener('click', () => this.toggleLocale());

    document.querySelectorAll('[data-strength]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleStrength(btn.dataset.strength));
    });

    document.querySelectorAll('[data-optimization]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleOptimization(btn.dataset.optimization));
    });

    document.querySelector('.textarea')?.addEventListener('input', (e) => this.setOneThing(e.target.value));

    document.querySelector('.btn-submit')?.addEventListener('click', () => this.handleSubmit());
  }

  attachSubmittedListeners() {
    document.querySelector('.btn-secondary')?.addEventListener('click', () => {
      window.close();
    });
  }
}

new SubmitApp();
