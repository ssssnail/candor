// Background service worker — placeholder for future polling.
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: "#6fe7c1" });
});
