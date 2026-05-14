// Candor Pure Extension - Background Service Worker
// 完全本地存储，无需服务器

// ==================== Storage Keys ====================
const STORAGE_KEYS = {
  INBOX_ID: 'candor:inbox_id',
  FEEDBACKS: 'candor:feedbacks',
  SETTINGS: 'candor:settings',
  LINKS: 'candor:links'
};

// ==================== ID 生成器 ====================
function generateId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateInboxId() {
  return `candor-${generateId(12)}`;
}

function generateFeedbackId() {
  return `fb-${generateId(16)}`;
}

function generateReplyToken() {
  return `rt-${generateId(24)}`;
}

// ==================== Storage Helpers ====================
async function getStorage(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

async function setStorage(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

// ==================== Inbox 管理 ====================
async function ensureInbox() {
  let inboxId = await getStorage(STORAGE_KEYS.INBOX_ID);
  if (!inboxId) {
    inboxId = generateInboxId();
    await setStorage(STORAGE_KEYS.INBOX_ID, inboxId);
    await setStorage(STORAGE_KEYS.FEEDBACKS, []);
    await setStorage(STORAGE_KEYS.LINKS, []);
    console.log('Candor: Created new inbox', inboxId);
  }
  return inboxId;
}

async function getFeedbacks() {
  return await getStorage(STORAGE_KEYS.FEEDBACKS) || [];
}

async function saveFeedback(feedback) {
  const feedbacks = await getFeedbacks();
  feedbacks.unshift(feedback);
  await setStorage(STORAGE_KEYS.FEEDBACKS, feedbacks);
  return feedback;
}

async function markFeedbackRead(feedbackId) {
  const feedbacks = await getFeedbacks();
  const updated = feedbacks.map(fb => 
    fb.id === feedbackId ? { ...fb, status: 'read', readAt: Date.now() } : fb
  );
  await setStorage(STORAGE_KEYS.FEEDBACKS, updated);
  return updated.find(fb => fb.id === feedbackId);
}

async function addReply(feedbackId, replyText) {
  const feedbacks = await getFeedbacks();
  const updated = feedbacks.map(fb => {
    if (fb.id === feedbackId) {
      return {
        ...fb,
        status: 'replied',
        replies: [...(fb.replies || []), {
          id: generateId(),
          text: replyText,
          createdAt: Date.now()
        }]
      };
    }
    return fb;
  });
  await setStorage(STORAGE_KEYS.FEEDBACKS, updated);
  return updated.find(fb => fb.id === feedbackId);
}

async function deleteFeedback(feedbackId) {
  const feedbacks = await getFeedbacks();
  const updated = feedbacks.filter(fb => fb.id !== feedbackId);
  await setStorage(STORAGE_KEYS.FEEDBACKS, updated);
  return updated;
}

// ==================== Link 管理 ====================
async function getLinks() {
  return await getStorage(STORAGE_KEYS.LINKS) || [];
}

async function createLink(label = '') {
  const links = await getLinks();
  const newLink = {
    id: generateId(8),
    label: label || `Link ${links.length + 1}`,
    createdAt: Date.now(),
    useCount: 0
  };
  links.unshift(newLink);
  await setStorage(STORAGE_KEYS.LINKS, links);
  return newLink;
}

// ==================== Badge 更新 ====================
async function updateBadge() {
  const feedbacks = await getFeedbacks();
  const unreadCount = feedbacks.filter(fb => fb.status === 'new').length;
  
  await chrome.action.setBadgeText({ 
    text: unreadCount > 0 ? String(unreadCount) : '' 
  });
  await chrome.action.setBadgeBackgroundColor({ color: '#6fe7c1' });
}

// ==================== 通知 ====================
async function showNotification(title, message) {
  const settings = await getStorage(STORAGE_KEYS.SETTINGS) || {};
  if (settings.notifications === false) return;

  await chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
    priority: 1
  });
}

// ==================== 消息处理 ====================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        // 获取收件箱信息
        case 'GET_INBOX':
          const inboxId = await ensureInbox();
          const feedbacks = await getFeedbacks();
          const links = await getLinks();
          sendResponse({
            success: true,
            data: {
              inboxId,
              feedbacks,
              links,
              unreadCount: feedbacks.filter(f => f.status === 'new').length,
              totalCount: feedbacks.length
            }
          });
          break;

        // 提交反馈（任何人都可以调用）
        case 'SUBMIT_FEEDBACK':
          const { text, linkId, senderName = '匿名' } = message.data;
          
          if (!text || text.trim().length < 2) {
            sendResponse({ success: false, error: '反馈内容太短' });
            return;
          }

          // 验证 linkId 是否存在
          const existingLinks = await getLinks();
          const validLink = existingLinks.find(l => l.id === linkId);
          
          // 即使 linkId 无效也接受反馈（兼容旧链接）
          const newFeedback = {
            id: generateFeedbackId(),
            text: text.trim(),
            status: 'new',
            createdAt: Date.now(),
            replyToken: generateReplyToken(),
            linkId: linkId || null,
            senderName: senderName || '匿名',
            replies: []
          };

          await saveFeedback(newFeedback);
          await updateBadge();

          // 显示通知
          await showNotification(
            '收到新反馈',
            text.slice(0, 50) + (text.length > 50 ? '...' : '')
          );

          sendResponse({
            success: true,
            data: {
              feedbackId: newFeedback.id,
              replyToken: newFeedback.replyToken
            }
          });
          break;

        // 标记已读
        case 'MARK_READ':
          const marked = await markFeedbackRead(message.feedbackId);
          await updateBadge();
          sendResponse({ success: true, data: marked });
          break;

        // 添加回复
        case 'ADD_REPLY':
          const replied = await addReply(message.feedbackId, message.replyText);
          sendResponse({ success: true, data: replied });
          break;

        // 删除反馈
        case 'DELETE_FEEDBACK':
          await deleteFeedback(message.feedbackId);
          await updateBadge();
          sendResponse({ success: true });
          break;

        // 创建新链接
        case 'CREATE_LINK':
          const newLink = await createLink(message.label);
          sendResponse({ success: true, data: newLink });
          break;

        // 获取链接列表
        case 'GET_LINKS':
          const allLinks = await getLinks();
          sendResponse({ success: true, data: allLinks });
          break;

        // 导出数据
        case 'EXPORT_DATA':
          const exportData = {
            inboxId: await getStorage(STORAGE_KEYS.INBOX_ID),
            feedbacks: await getFeedbacks(),
            links: await getLinks(),
            exportedAt: Date.now(),
            version: '1.0.0'
          };
          sendResponse({ success: true, data: exportData });
          break;

        // 导入数据
        case 'IMPORT_DATA':
          const { data: importData } = message;
          if (importData.feedbacks) {
            await setStorage(STORAGE_KEYS.FEEDBACKS, importData.feedbacks);
          }
          if (importData.links) {
            await setStorage(STORAGE_KEYS.LINKS, importData.links);
          }
          await updateBadge();
          sendResponse({ success: true });
          break;

        // 清除所有数据
        case 'CLEAR_ALL':
          await chrome.storage.local.remove([
            STORAGE_KEYS.INBOX_ID,
            STORAGE_KEYS.FEEDBACKS,
            STORAGE_KEYS.LINKS
          ]);
          await updateBadge();
          sendResponse({ success: true });
          break;

        // 更新设置
        case 'UPDATE_SETTINGS':
          const currentSettings = await getStorage(STORAGE_KEYS.SETTINGS) || {};
          await setStorage(STORAGE_KEYS.SETTINGS, { ...currentSettings, ...message.settings });
          sendResponse({ success: true });
          break;

        // 获取设置
        case 'GET_SETTINGS':
          const settings = await getStorage(STORAGE_KEYS.SETTINGS) || {};
          sendResponse({ success: true, data: settings });
          break;

        default:
          sendResponse({ success: false, error: '未知消息类型' });
      }
    } catch (error) {
      console.error('Candor background error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // 保持消息通道开启
});

// ==================== 安装/更新处理 ====================
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Candor: Extension installed/updated', details.reason);

  // 初始化收件箱
  await ensureInbox();
  await updateBadge();

  // 设置默认配置
  const settings = await getStorage(STORAGE_KEYS.SETTINGS);
  if (!settings) {
    await setStorage(STORAGE_KEYS.SETTINGS, {
      notifications: true,
      language: 'zh'
    });
  }

  // 如果没有链接，创建一个默认链接
  const links = await getLinks();
  if (links.length === 0) {
    await createLink('默认链接');
  }
});

console.log('Candor: Background script loaded');
