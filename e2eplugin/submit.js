// Candor Extension - Submit Page Script
// 反馈提交页面

// ==================== i18n ====================
const i18n = {
  zh: {
    loading: '加载中…',
    eyebrow: '匿名反馈',
    h1: '发一句匿名话',
    h1Sub: '让你的队友知道',
    lead: '一句真心话，胜过十句客套。',
    oneKicker: 'The One Thing',
    oneH: '如果你是 TA 的 co-founder，',
    oneH2: '你最想推 TA 改的',
    oneHEm: '那一件',
    oneH3: '事是什么？',
    onePlaceholder: '可以真实，可以带梗，但别只说「加油」。真心话在这里最值钱。',
    warmup: '需要点灵感？下面的标签可选可不选。',
    strengthsTitle: '核心优势',
    suggestionsTitle: '优化建议',
    multi: '可不选 · 可多选',
    ship: 'Ship it 🚀',
    shipping: '送出中…',
    legal: '原文直接送达，不署名，不记 IP。',
    doneH1: '你这句话，已经放到 TA 桌上了。',
    doneSub: '原文送达。没人知道是你写的——除非你署了名。',
    doneSee: 'TA 会看到',
    installH: '想知道别人眼中真实的你？',
    installP: '创建你自己的 Repo，让真诚的反馈主动找上门——两次点击，遇见更好的自己。',
    installCta: '创建我的 Repo →',
    another: '再写一条',
    errorTitle: '出错了',
    errorInvalid: '无效的链接',
    retry: '重试',
    strengthsPrefix: '✅ 优势',
    suggestionsPrefix: '🛠 建议',
    coFounderPrefix: 'If I were your co-founder…'
  },
  en: {
    loading: 'Loading...',
    eyebrow: 'Anonymous Feedback',
    h1: 'Send an anonymous note',
    h1Sub: 'to your teammate',
    lead: 'One honest line beats ten polite ones.',
    oneKicker: 'The One Thing',
    oneH: "If you were their co-founder,",
    oneH2: "what's the",
    oneHEm: 'ONE',
    oneH3: "thing you'd push them to fix?",
    onePlaceholder: "Be honest, be funny — just don't write «keep going». Real talk is what's worth the most here.",
    warmup: 'Need a warm-up? Tap a few tags below — totally optional.',
    strengthsTitle: 'Core Strengths',
    suggestionsTitle: 'Optimization Suggestions',
    multi: 'optional · multi-select',
    ship: 'Ship it 🚀',
    shipping: 'Shipping…',
    legal: 'Delivered as written. Anonymous by default.',
    doneH1: 'Your note just landed on their desk.',
    doneSub: 'Sent word-for-word. No name attached — unless you signed it.',
    doneSee: "What they'll read",
    installH: 'Curious what people really think of you?',
    installP: 'Spin up your own repo and let honest feedback find you. Two clicks to a better you.',
    installCta: 'Spin up my repo →',
    another: 'Submit another PR',
    errorTitle: 'Error',
    errorInvalid: 'Invalid link',
    retry: 'Retry',
    strengthsPrefix: '✅ Strengths',
    suggestionsPrefix: '🛠 Suggestions',
    coFounderPrefix: "If I were your co-founder…"
  }
};

let currentLang = 'zh';
let linkId = null;
let selectedStrengths = new Set();
let selectedSuggestions = new Set();

// ==================== Helpers ====================
function t(key) {
  return i18n[currentLang][key] || i18n.en[key] || key;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ==================== API ====================
async function sendMessage(type, data = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...data }, resolve);
  });
}

// ==================== Build Feedback Text ====================
function buildFeedbackText() {
  const lines = [];
  const textarea = document.getElementById('feedback-text');
  const text = textarea.value.trim();

  if (selectedStrengths.size > 0) {
    const labels = [];
    selectedStrengths.forEach(id => {
      const btn = document.querySelector(`[data-id="${id}"]`);
      if (btn) {
        const labelEl = btn.querySelector('.tag-label');
        if (labelEl) labels.push(labelEl.textContent.trim());
      }
    });
    if (labels.length > 0) {
      lines.push(`${t('strengthsPrefix')}: ${labels.join(', ')}`);
    }
  }

  if (selectedSuggestions.size > 0) {
    const labels = [];
    selectedSuggestions.forEach(id => {
      const btn = document.querySelector(`[data-id="${id}"]`);
      if (btn) {
        const labelEl = btn.querySelector('.tag-label');
        if (labelEl) labels.push(labelEl.textContent.trim());
      }
    });
    if (labels.length > 0) {
      lines.push(`${t('suggestionsPrefix')}: ${labels.join(', ')}`);
    }
  }

  if (text) {
    if (lines.length > 0) lines.push('');
    lines.push(`> ${t('coFounderPrefix')}`);
    lines.push(text);
  }

  return lines.join('\n');
}

// ==================== Update Submit Button State ====================
function updateSubmitButton() {
  const textarea = document.getElementById('feedback-text');
  const submitBtn = document.getElementById('submit-btn');
  const hasText = textarea.value.trim().length >= 2;
  const hasTags = selectedStrengths.size > 0 || selectedSuggestions.size > 0;

  submitBtn.disabled = !(hasText || hasTags);
}

// ==================== Show/Hide Views ====================
function showView(viewId) {
  document.getElementById('loading-view').style.display = 'none';
  document.getElementById('submit-view').classList.add('hidden');
  document.getElementById('success-view').classList.add('hidden');
  document.getElementById('error-view').classList.add('hidden');

  if (viewId === 'submit') {
    document.getElementById('submit-view').classList.remove('hidden');
  } else if (viewId === 'success') {
    document.getElementById('success-view').classList.remove('hidden');
  } else if (viewId === 'error') {
    document.getElementById('error-view').classList.remove('hidden');
  }
}

// ==================== Main ====================
document.addEventListener('DOMContentLoaded', async () => {
  linkId = getQueryParam('link');

  if (!linkId) {
    showView('error');
    document.getElementById('error-message').textContent = t('errorInvalid');
    return;
  }

  // Get language from settings
  const settingsResult = await sendMessage('GET_SETTINGS');
  if (settingsResult.success && settingsResult.data.language) {
    currentLang = settingsResult.data.language;
  }

  showView('submit');

  // Character count
  const textarea = document.getElementById('feedback-text');
  const charCount = document.getElementById('char-count');

  textarea.addEventListener('input', () => {
    charCount.textContent = textarea.value.length;
    updateSubmitButton();
  });

  // Tag selection - Strengths
  document.querySelectorAll('#strengths-grid .tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (selectedStrengths.has(id)) {
        selectedStrengths.delete(id);
        btn.classList.remove('selected');
      } else {
        selectedStrengths.add(id);
        btn.classList.add('selected');
      }
      updateSubmitButton();
    });
  });

  // Tag selection - Suggestions
  document.querySelectorAll('#suggestions-grid .tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (selectedSuggestions.has(id)) {
        selectedSuggestions.delete(id);
        btn.classList.remove('selected');
      } else {
        selectedSuggestions.add(id);
        btn.classList.add('selected');
      }
      updateSubmitButton();
    });
  });

  // Submit button
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.addEventListener('click', async () => {
    const feedbackText = buildFeedbackText();

    if (feedbackText.length < 2) return;

    submitBtn.disabled = true;
    const span = submitBtn.querySelector('span');
    span.textContent = t('shipping');

    const result = await sendMessage('SUBMIT_FEEDBACK', {
      data: {
        text: feedbackText,
        linkId,
        senderName: '匿名'
      }
    });

    if (result.success) {
      showView('success');
    } else {
      submitBtn.disabled = false;
      span.textContent = t('ship');
      alert(result.error || 'Failed to send');
    }
  });

  // Send another
  document.getElementById('another-btn').addEventListener('click', () => {
    textarea.value = '';
    charCount.textContent = '0';
    selectedStrengths.clear();
    selectedSuggestions.clear();

    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    updateSubmitButton();
    showView('submit');
  });

  // Retry
  document.getElementById('retry-btn').addEventListener('click', () => {
    location.reload();
  });

  // Install button - open extension page
  document.getElementById('install-btn').addEventListener('click', () => {
    window.open(`chrome-extension://${chrome.runtime.id}/popup.html`, '_blank');
  });
});