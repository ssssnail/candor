// Candor Extension - Popup Script
// 收件箱主界面

// ==================== i18n ====================
const i18n = {
  zh: {
    unread: '未读',
    total: '总计',
    links: '链接',
    shareTitle: '分享收礼链接',
    newLink: '+ 新建',
    selectLink: '选择链接...',
    copy: '复制',
    copied: '已复制！',
    linkHint: '任何人打开此链接都可以给你发送匿名反馈',
    recentFeedback: '最近反馈',
    all: '全部',
    new: '未读',
    emptyTitle: '暂无反馈',
    emptySub: '分享你的链接，开始收礼物',
    loading: '加载中...',
    back: '返回',
    reply: '回复',
    delete: '删除',
    replyTitle: '回复反馈',
    replyPlaceholder: '写下你的回复...',
    cancel: '取消',
    sendReply: '发送回复',
    settings: '设置',
    notifications: '桌面通知',
    export: '导出数据',
    import: '导入数据',
    clearAll: '清除所有数据',
    close: '关闭',
    localOnly: '数据仅存储在本地',
    confirmDelete: '确定要删除这条反馈吗？',
    confirmClear: '确定要清除所有数据吗？此操作不可恢复！',
    replies: '回复记录'
  },
  en: {
    unread: 'Unread',
    total: 'Total',
    links: 'Links',
    shareTitle: 'Share Your Link',
    newLink: '+ New',
    selectLink: 'Select link...',
    copy: 'Copy',
    copied: 'Copied!',
    linkHint: 'Anyone with this link can send you anonymous feedback',
    recentFeedback: 'Recent Feedback',
    all: 'All',
    new: 'New',
    emptyTitle: 'No feedback yet',
    emptySub: 'Share your link to start receiving gifts',
    loading: 'Loading...',
    back: 'Back',
    reply: 'Reply',
    delete: 'Delete',
    replyTitle: 'Reply to Feedback',
    replyPlaceholder: 'Write your reply...',
    cancel: 'Cancel',
    sendReply: 'Send Reply',
    settings: 'Settings',
    notifications: 'Notifications',
    export: 'Export Data',
    import: 'Import Data',
    clearAll: 'Clear All Data',
    close: 'Close',
    localOnly: 'Data stored locally only',
    confirmDelete: 'Are you sure you want to delete this feedback?',
    confirmClear: 'Are you sure you want to clear all data? This cannot be undone!',
    replies: 'Replies'
  }
};

let currentLang = 'zh';
let currentData = null;
let currentFilter = 'all';
let selectedFeedback = null;

// ==================== Helpers ====================
function t(key) {
  return i18n[currentLang][key] || i18n.en[key] || key;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return currentLang === 'zh' ? '刚刚' : 'Just now';
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return currentLang === 'zh' ? `${mins}分钟前` : `${mins}m ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return currentLang === 'zh' ? `${hours}小时前` : `${hours}h ago`;
  }
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return currentLang === 'zh' ? `${days}天前` : `${days}d ago`;
  }
  
  return date.toLocaleDateString(currentLang === 'zh' ? 'zh-CN' : 'en-US');
}

function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== API ====================
async function sendMessage(type, data = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...data }, resolve);
  });
}

// ==================== UI Functions ====================
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');
}

function showToast(message) {
  const toast = document.getElementById('copy-toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

function updateStats(data) {
  const unread = data.feedbacks.filter(f => f.status === 'new').length;
  const total = data.feedbacks.length;
  const links = data.links.length;
  
  document.getElementById('unread-count').textContent = unread;
  document.getElementById('total-count').textContent = total;
  document.getElementById('links-count').textContent = links;
  
  // Update footer inbox ID
  document.getElementById('inbox-id').textContent = data.inboxId.slice(0, 16) + '...';
}

function renderLinks(links) {
  const select = document.getElementById('link-select');
  select.innerHTML = `<option value="">${t('selectLink')}</option>`;
  
  links.forEach(link => {
    const option = document.createElement('option');
    option.value = link.id;
    option.textContent = link.label || link.id;
    select.appendChild(option);
  });
  
  // Select first link by default
  if (links.length > 0) {
    select.value = links[0].id;
    updateLinkDisplay(links[0].id);
  }
}

function updateLinkDisplay(linkId) {
  if (!linkId) {
    document.getElementById('link-display').textContent = '—';
    return;
  }
  
  const extensionId = chrome.runtime.id;
  const url = `chrome-extension://${extensionId}/submit.html?link=${linkId}`;
  document.getElementById('link-display').textContent = url;
}

function renderFeedbacks(feedbacks) {
  const list = document.getElementById('feedback-list');
  const emptyState = document.getElementById('empty-state');
  
  // Filter
  let filtered = feedbacks;
  if (currentFilter === 'new') {
    filtered = feedbacks.filter(f => f.status === 'new');
  }
  
  // Sort: unread first, then by date
  filtered.sort((a, b) => {
    if (a.status === 'new' && b.status !== 'new') return -1;
    if (a.status !== 'new' && b.status === 'new') return 1;
    return b.createdAt - a.createdAt;
  });
  
  if (filtered.length === 0) {
    list.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  list.innerHTML = filtered.map(fb => `
    <li class="feedback-item ${fb.status}" data-id="${fb.id}">
      ${fb.status === 'new' ? `<span class="feedback-badge">${t('new').toUpperCase()}</span>` : ''}
      <pre class="feedback-text">${escapeHtml(truncate(fb.text))}</pre>
      <div class="feedback-meta">
        <span>${formatDate(fb.createdAt)}</span>
        ${fb.replies?.length > 0 ? `<span>💬 ${fb.replies.length}</span>` : ''}
      </div>
    </li>
  `).join('');
  
  // Click handlers
  list.querySelectorAll('.feedback-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      showFeedbackDetail(id);
    });
  });
}

async function showFeedbackDetail(feedbackId) {
  const feedback = currentData.feedbacks.find(f => f.id === feedbackId);
  if (!feedback) return;
  
  selectedFeedback = feedback;
  
  // Mark as read
  if (feedback.status === 'new') {
    await sendMessage('MARK_READ', { feedbackId });
    feedback.status = 'read';
    updateStats(currentData);
    renderFeedbacks(currentData.feedbacks);
  }
  
  // Update detail view
  const badge = document.getElementById('detail-badge');
  if (feedback.status === 'new') {
    badge.textContent = t('new').toUpperCase();
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
  
  document.getElementById('detail-text').textContent = feedback.text;
  document.getElementById('detail-meta').textContent = 
    `${formatDate(feedback.createdAt)} · ${feedback.senderName || '匿名'}`;
  
  // Render replies
  const repliesSection = document.getElementById('replies-section');
  const repliesList = document.getElementById('replies-list');
  
  if (feedback.replies && feedback.replies.length > 0) {
    repliesSection.classList.remove('hidden');
    repliesList.innerHTML = feedback.replies.map(r => `
      <div class="reply-item">
        <div class="reply-text">${r.text}</div>
        <div class="reply-time">${formatDate(r.createdAt)}</div>
      </div>
    `).join('');
  } else {
    repliesSection.classList.add('hidden');
  }
  
  showView('detail-view');
}

// ==================== Load Data ====================
async function loadData() {
  showView('loading-view');
  
  // Load language preference
  const settingsResult = await sendMessage('GET_SETTINGS');
  if (settingsResult.success && settingsResult.data.language) {
    currentLang = settingsResult.data.language;
  }
  
  const result = await sendMessage('GET_INBOX');
  
  if (result.success) {
    currentData = result.data;
    updateStats(currentData);
    renderLinks(currentData.links);
    renderFeedbacks(currentData.feedbacks);
    showView('main-view');
  } else {
    console.error('Failed to load data:', result.error);
    showView('main-view');
  }
}

// ==================== Event Handlers ====================
document.addEventListener('DOMContentLoaded', () => {
  // Load initial data
  loadData();
  
  // Language toggle
  document.getElementById('lang-toggle').addEventListener('click', async () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    await sendMessage('UPDATE_SETTINGS', { settings: { language: currentLang } });
    location.reload();
  });
  
  // Refresh
  document.getElementById('refresh-btn').addEventListener('click', loadData);
  
  // Link selector
  document.getElementById('link-select').addEventListener('change', (e) => {
    updateLinkDisplay(e.target.value);
  });
  
  // Copy link
  document.getElementById('copy-link-btn').addEventListener('click', async () => {
    const linkText = document.getElementById('link-display').textContent;
    if (linkText && linkText !== '—') {
      await navigator.clipboard.writeText(linkText);
      showToast(t('copied'));
    }
  });
  
  // New link
  document.getElementById('new-link-btn').addEventListener('click', async () => {
    const label = prompt(currentLang === 'zh' ? '输入链接名称（可选）' : 'Enter link name (optional)');
    if (label === null) return; // Cancelled
    
    const result = await sendMessage('CREATE_LINK', { label: label || '' });
    if (result.success) {
      await loadData();
      // Select the new link
      document.getElementById('link-select').value = result.data.id;
      updateLinkDisplay(result.data.id);
      showToast(t('copied'));
    }
  });
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderFeedbacks(currentData.feedbacks);
    });
  });
  
  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    showView('main-view');
    selectedFeedback = null;
  });
  
  // Reply button
  document.getElementById('reply-btn').addEventListener('click', () => {
    document.getElementById('reply-modal').classList.remove('hidden');
    document.getElementById('reply-text').value = '';
    document.getElementById('reply-text').focus();
  });
  
  // Cancel reply
  document.getElementById('cancel-reply').addEventListener('click', () => {
    document.getElementById('reply-modal').classList.add('hidden');
  });
  
  // Confirm reply
  document.getElementById('confirm-reply').addEventListener('click', async () => {
    const text = document.getElementById('reply-text').value.trim();
    if (!text) return;
    
    const result = await sendMessage('ADD_REPLY', {
      feedbackId: selectedFeedback.id,
      replyText: text
    });
    
    if (result.success) {
      document.getElementById('reply-modal').classList.add('hidden');
      // Re-fetch from currentData to get latest state
      const updated = currentData.feedbacks.find(f => f.id === selectedFeedback.id);
      if (updated) {
        selectedFeedback = updated;
      }
      // Re-render detail view
      const repliesSection = document.getElementById('replies-section');
      const repliesList = document.getElementById('replies-list');
      repliesSection.classList.remove('hidden');
      repliesList.innerHTML = selectedFeedback.replies.map(r => `
        <div class="reply-item">
          <div class="reply-text">${escapeHtml(r.text)}</div>
          <div class="reply-time">${formatDate(r.createdAt)}</div>
        </div>
      `).join('');
    }
  });
  
  // Delete button
  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (!confirm(t('confirmDelete'))) return;
    
    await sendMessage('DELETE_FEEDBACK', { feedbackId: selectedFeedback.id });
    currentData.feedbacks = currentData.feedbacks.filter(f => f.id !== selectedFeedback.id);
    updateStats(currentData);
    renderFeedbacks(currentData.feedbacks);
    showView('main-view');
    selectedFeedback = null;
  });
  
  // Menu
  document.getElementById('menu-btn').addEventListener('click', () => {
    document.getElementById('menu-modal').classList.remove('hidden');
  });
  
  document.getElementById('close-menu').addEventListener('click', () => {
    document.getElementById('menu-modal').classList.add('hidden');
  });
  
  // Close modals when clicking their own overlay
  document.querySelectorAll('.modal').forEach(modal => {
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
  });
  
  // Notification toggle
  document.getElementById('notification-toggle').addEventListener('change', async (e) => {
    await sendMessage('UPDATE_SETTINGS', {
      settings: { notifications: e.target.checked }
    });
  });
  
  // Export
  document.getElementById('export-btn').addEventListener('click', async () => {
    const result = await sendMessage('EXPORT_DATA');
    if (result.success) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candor-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
  
  // Import
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  document.getElementById('import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (confirm(currentLang === 'zh' 
        ? '导入将覆盖现有数据，确定继续吗？' 
        : 'Import will overwrite existing data. Continue?')) {
        
        const result = await sendMessage('IMPORT_DATA', { data });
        if (result.success) {
          alert(currentLang === 'zh' ? '导入成功！' : 'Import successful!');
          loadData();
        }
      }
    } catch (err) {
      alert(currentLang === 'zh' ? '导入失败：无效的文件格式' : 'Import failed: Invalid file format');
    }
    
    e.target.value = ''; // Reset
  });
  
  // Clear all
  document.getElementById('clear-btn').addEventListener('click', async () => {
    if (!confirm(t('confirmClear'))) return;
    
    await sendMessage('CLEAR_ALL');
    loadData();
  });
});
