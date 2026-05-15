const translations = {
  en: {
    landing: {
      eyebrow: "Feedback is a gift.",
      h1: "Debug Your Career.",
      h1Suffix: "With Love (and a few laughs).",
      sub: "Write feedback for teammates the way top engineers do code review — zero fluff, high signal, with a touch of humor.",
      cta: "Open My Repo →",
      ctaLoading: "Spinning up…",
      legal: "Anonymous by default. No names, no IPs, no fingerprints."
    },
    inbox: {
      title: "Your Personal Repo",
      sub: "Everyone is a beta build with bugs. Welcome your teammates to PR you 🧑‍💻",
      footer: "Be honest. Be kind. Ship better.",
      empty: "Zero feedback yet. Either you're already a 10x engineer, or your teammates are still leveling up.",
      copy: "Copy",
      newLink: "+ New",
      unread: "unread",
      total: "total",
      unreadTag: "NEW"
    }
  },
  zh: {
    landing: {
      eyebrow: "反馈是一份礼物。",
      h1: "Debug 你的职业生涯。",
      h1Suffix: "带着爱（和一点幽默）。",
      sub: "像顶级工程师做 Code Review 一样给队友写反馈——零废话，高信噪比，带一点梗。",
      cta: "打开我的 Repo →",
      ctaLoading: "正在启动…",
      legal: "默认匿名。无姓名，无IP，无指纹。"
    },
    inbox: {
      title: "你的个人 Repo",
      sub: "每个人都是带 Bug 的 Beta 版。欢迎你的队友来给你提交 PR 🧑‍💻",
      footer: "诚实、友善、做得更好。",
      empty: "还没有反馈。要么你已经是 10x 工程师了，要么你的队友还在修炼中。",
      copy: "复制",
      newLink: "+ 新建",
      unread: "未读",
      total: "总计",
      unreadTag: "新"
    }
  }
};

class App {
  constructor() {
    this.locale = 'en';
    this.currentView = 'landing';
    this.primaryLink = null;
    this.inboxData = [];
    this.init();
  }

  async init() {
    const { locale } = await this.sendMessage({ type: 'getLocale' });
    this.locale = locale || 'en';
    this.updateLocaleToggle();
    await this.checkExistingLink();
    this.render();
  }

  get t() {
    return translations[this.locale];
  }

  sendMessage(message) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  updateLocaleToggle() {
    const btn = document.querySelector('.locale-toggle');
    if (btn) {
      btn.textContent = this.locale === 'en' ? '中' : 'EN';
    }
  }

  toggleLocale() {
    this.locale = this.locale === 'en' ? 'zh' : 'en';
    this.sendMessage({ type: 'setLocale', locale: this.locale });
    this.updateLocaleToggle();
    this.render();
  }

  async checkExistingLink() {
    const { linkId } = await this.sendMessage({ type: 'getPrimaryLink' });
    if (linkId) {
      this.primaryLink = linkId;
      this.currentView = 'inbox';
    }
  }

  async createLink() {
    const btn = document.querySelector('.btn-primary');
    if (btn) {
      btn.disabled = true;
      btn.textContent = this.t.landing.ctaLoading;
    }

    const { linkId } = await this.sendMessage({ type: 'createLink' });
    await this.sendMessage({ type: 'setPrimaryLink', linkId });
    this.primaryLink = linkId;
    this.currentView = 'inbox';
    await this.loadInboxData();
    this.render();
  }

  async loadInboxData() {
    const { data } = await this.sendMessage({ type: 'getInboxData' });
    this.inboxData = data;
  }

  async generateNewLink() {
    const { linkId } = await this.sendMessage({ type: 'createLink' });
    await this.sendMessage({ type: 'setPrimaryLink', linkId });
    this.primaryLink = linkId;
    await this.loadInboxData();
    this.render();
  }

  getPrimaryData() {
    if (!this.primaryLink) return null;
    return this.inboxData.find(d => d.linkId === this.primaryLink) || this.inboxData[0];
  }

  getShareableLink(linkId) {
    return `chrome-extension://${chrome.runtime.id}/submit.html?link=${linkId}`;
  }

  async copyLink() {
    const data = this.getPrimaryData();
    if (!data) return;
    const link = this.getShareableLink(data.linkId);
    await navigator.clipboard.writeText(link);
    const btn = document.querySelector('.btn-copy');
    if (btn) {
      btn.textContent = '✓';
      setTimeout(() => {
        btn.textContent = this.t.inbox.copy;
      }, 1500);
    }
  }

  async markAsRead(feedbackId) {
    await this.sendMessage({ type: 'markAsRead', feedbackId });
    await this.loadInboxData();
    this.render();
  }

  showLanding() {
    this.currentView = 'landing';
    this.render();
  }

  render() {
    const app = document.getElementById('app');
    if (this.currentView === 'inbox') {
      app.innerHTML = this.renderInbox();
      this.attachInboxListeners();
    } else {
      app.innerHTML = this.renderLanding();
      this.attachLandingListeners();
    }
  }

  renderLanding() {
    return `
      <div class="container fade-up">
        <header class="header">
          <span class="logo">Candor.Box</span>
          <button class="locale-toggle">${this.locale === 'en' ? '中' : 'EN'}</button>
        </header>
        <span class="eyebrow">// ${this.t.landing.eyebrow}</span>
        <h1>${this.t.landing.h1}<br><span>${this.t.landing.h1Suffix}</span></h1>
        <p class="subtitle">${this.t.landing.sub}</p>
        <button class="btn-primary">${this.t.landing.cta}</button>
        <p class="legal">${this.t.landing.legal}</p>
      </div>
    `;
  }

  renderInbox() {
    const data = this.getPrimaryData();
    const unreadCount = data?.feedback.filter(f => !f.read).length || 0;
    const totalCount = data?.feedback.length || 0;

    return `
      <div class="container fade-up">
        <header class="header">
          <span class="logo">Candor.Box</span>
          <button class="locale-toggle">${this.locale === 'en' ? '中' : 'EN'}</button>
        </header>
        <div class="back-link" data-action="back">← Back</div>
        <h1>${this.t.inbox.title}</h1>
        <p class="subtitle">${this.t.inbox.sub}</p>
        
        <div class="link-bar">
          <div class="link-display">
            <span class="link-text">${data?.linkId || ''}</span>
            <button class="btn-copy">${this.t.inbox.copy}</button>
          </div>
          <button class="btn-new">${this.t.inbox.newLink}</button>
        </div>

        <div class="stats">
          <strong>${unreadCount}</strong> ${this.t.inbox.unread} · <strong>${totalCount}</strong> ${this.t.inbox.total}
        </div>

        <div class="feedback-list">
          ${!data?.feedback?.length ? `
            <div class="empty-state">
              <p>${this.t.inbox.empty}</p>
            </div>
          ` : data.feedback.map(f => `
            <div class="feedback-item ${!f.read ? 'unread' : ''}" data-feedback-id="${f.id}">
              ${!f.read ? `<span class="new-tag">${this.t.inbox.unreadTag}</span>` : ''}
              ${f.coreStrengths?.length ? `
                <div class="feedback-section">
                  <div class="section-label">Core Strengths:</div>
                  <div class="chips">
                    ${f.coreStrengths.map(s => `<span class="chip strength">${s}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
              ${f.optimization?.length ? `
                <div class="feedback-section">
                  <div class="section-label">Optimize:</div>
                  <div class="chips">
                    ${f.optimization.map(s => `<span class="chip optimize">${s}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
              ${f.oneThing ? `
                <div class="feedback-section">
                  <div class="section-label">One Thing:</div>
                  <p class="one-thing">${f.oneThing}</p>
                </div>
              ` : ''}
              <span class="timestamp">${new Date(f.timestamp).toLocaleDateString()}</span>
            </div>
          `).join('')}
        </div>

        <footer class="footer">${this.t.inbox.footer}</footer>
      </div>
    `;
  }

  attachLandingListeners() {
    document.querySelector('.btn-primary')?.addEventListener('click', () => this.createLink());
    document.querySelector('.locale-toggle')?.addEventListener('click', () => this.toggleLocale());
  }

  attachInboxListeners() {
    document.querySelector('.locale-toggle')?.addEventListener('click', () => this.toggleLocale());
    document.querySelector('.back-link')?.addEventListener('click', () => this.showLanding());
    document.querySelector('.btn-copy')?.addEventListener('click', () => this.copyLink());
    document.querySelector('.btn-new')?.addEventListener('click', () => this.generateNewLink());
    document.querySelectorAll('.feedback-item.unread').forEach(item => {
      item.addEventListener('click', () => {
        this.markAsRead(item.dataset.feedbackId);
      });
    });
  }
}

new App();
