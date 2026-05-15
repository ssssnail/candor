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
    },
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
    },
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

function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  return crypto.subtle.digestSync("SHA-256", data);
}

function getUserHash() {
  return new Promise(async (resolve) => {
    const stored = await chrome.storage.local.get(['token', 'hash']);
    if (stored.token && stored.hash) {
      resolve(stored.hash);
      return;
    }
    const token = generateToken();
    const hashBuffer = hashToken(token);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    await chrome.storage.local.set({ token, hash });
    resolve(hash);
  });
}

function generateLinkId() {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function getLocale() {
  return chrome.storage.local.get(['locale']).then(r => r.locale || 'en');
}

function setLocale(locale) {
  return chrome.storage.local.set({ locale });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getUserHash') {
    getUserHash().then(hash => sendResponse({ hash }));
    return true;
  }

  if (message.type === 'getInboxData') {
    getUserHash().then(async (userHash) => {
      const result = await chrome.storage.local.get([`inbox-${userHash}`]);
      const data = result[`inbox-${userHash}`] || [];
      sendResponse({ data });
    });
    return true;
  }

  if (message.type === 'getLocale') {
    getLocale().then(locale => sendResponse({ locale }));
    return true;
  }

  if (message.type === 'setLocale') {
    setLocale(message.locale).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'createLink') {
    getUserHash().then(async (userHash) => {
      const linkId = generateLinkId();
      const result = await chrome.storage.local.get([`inbox-${userHash}`]);
      const data = result[`inbox-${userHash}`] || [];
      data.push({ linkId, feedback: [] });
      await chrome.storage.local.set({ [`inbox-${userHash}`]: data });
      sendResponse({ linkId, userHash });
    });
    return true;
  }

  if (message.type === 'getPrimaryLink') {
    chrome.storage.local.get(['primaryLink']).then(r => sendResponse({ linkId: r.primaryLink }));
    return true;
  }

  if (message.type === 'setPrimaryLink') {
    chrome.storage.local.set({ primaryLink: message.linkId }).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'submitFeedback') {
    chrome.storage.local.get(['allInboxes']).then(async (result) => {
      const allInboxes = result.allInboxes || {};
      if (!allInboxes[message.linkId]) {
        allInboxes[message.linkId] = [];
      }
      allInboxes[message.linkId].push(message.feedback);
      await chrome.storage.local.set({ allInboxes });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'markAsRead') {
    getUserHash().then(async (userHash) => {
      const result = await chrome.storage.local.get([`inbox-${userHash}`, 'primaryLink']);
      const data = result[`inbox-${userHash}`] || [];
      const primaryLink = result.primaryLink;
      const updatedData = data.map(item => {
        if (item.linkId === primaryLink) {
          return {
            ...item,
            feedback: item.feedback.map(f =>
              f.id === message.feedbackId ? { ...f, read: true } : f
            )
          };
        }
        return item;
      });
      await chrome.storage.local.set({ [`inbox-${userHash}`]: updatedData });
      sendResponse({ success: true });
    });
    return true;
  }
});
