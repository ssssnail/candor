// Candor Extension - Submit Page Script
// 反馈提交页面

// ==================== i18n ====================
const i18n = {
  zh: {
    title: '发送匿名反馈',
    subtitle: '一句真心话，胜过十句客套',
    recipient: '收件人',
    loading: '加载中...',
    yourFeedback: '你的反馈',
    placeholder: '写下你的真诚反馈...\n\n可以包括：\n• TA 做得好的地方\n• 可以改进的建议\n• 你最想告诉 TA 的一件事',
    submit: '发送反馈 🚀',
    privacy: '🔒 完全匿名 · 不收集任何个人信息 · 直接送达对方本地收件箱',
    successTitle: '反馈已发送！',
    successDesc: '你的反馈已经安全送达对方的本地收件箱',
    sendAnother: '再发一条',
    getInbox: '获取自己的收件箱',
    errorTitle: '出错了',
    errorInvalid: '无效的链接',
    errorNotFound: '找不到收件人',
    retry: '重试',
    charCount: '字符数'
  },
  en: {
    title: 'Send Anonymous Feedback',
    subtitle: 'One honest line beats ten polite ones',
    recipient: 'To',
    loading: 'Loading...',
    yourFeedback: 'Your Feedback',
    placeholder: 'Write your honest feedback...\n\nYou can include:\n• What they do well\n• Suggestions for improvement\n• The one thing you want to tell them',
    submit: 'Send Feedback 🚀',
    privacy: '🔒 Completely anonymous · No personal info collected · Delivered directly to their local inbox',
    successTitle: 'Feedback Sent!',
    successDesc: 'Your feedback has been safely delivered to their local inbox',
    sendAnother: 'Send Another',
    getInbox: 'Get Your Own Inbox',
    errorTitle: 'Error',
    errorInvalid: 'Invalid link',
    errorNotFound: 'Recipient not found',
    retry: 'Retry',
    charCount: 'characters'
  }
};

let currentLang = 'zh';
let linkId = null;

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

// ==================== Main ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Get link ID from URL
  linkId = getQueryParam('link');
  
  if (!linkId) {
    showError(t('errorInvalid'));
    return;
  }
  
  // Show recipient (just show the extension is ready)
  document.getElementById('recipient-name').textContent = 'Candor User';
  
  // Character count
  const textarea = document.getElementById('feedback-text');
  const charCount = document.getElementById('char-count');
  
  textarea.addEventListener('input', () => {
    charCount.textContent = textarea.value.length;
  });
  
  // Form submit
  document.getElementById('feedback-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = textarea.value.trim();
    if (!text || text.length < 2) return;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'zh' ? '发送中...' : 'Sending...';
    
    const result = await sendMessage('SUBMIT_FEEDBACK', {
      data: {
        text,
        linkId,
        senderName: '匿名'
      }
    });
    
    if (result.success) {
      showSuccess();
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = t('submit');
      alert(result.error || 'Failed to send');
    }
  });
  
  // Send another
  document.getElementById('send-another').addEventListener('click', () => {
    document.getElementById('feedback-text').value = '';
    document.getElementById('char-count').textContent = '0';
    showSubmit();
  });
  
  // Get inbox link — open Chrome extensions page
  document.getElementById('install-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://chromewebstore.google.com/category/extensions', '_blank');
  });
  
  // Retry
  document.getElementById('retry-btn').addEventListener('click', () => {
    location.reload();
  });
});

function showSubmit() {
  document.getElementById('submit-view').classList.remove('hidden');
  document.getElementById('success-view').classList.add('hidden');
  document.getElementById('error-view').classList.add('hidden');
}

function showSuccess() {
  document.getElementById('submit-view').classList.add('hidden');
  document.getElementById('success-view').classList.remove('hidden');
  document.getElementById('error-view').classList.add('hidden');
}

function showError(message) {
  document.getElementById('submit-view').classList.add('hidden');
  document.getElementById('success-view').classList.add('hidden');
  document.getElementById('error-view').classList.remove('hidden');
  document.getElementById('error-message').textContent = message;
}
