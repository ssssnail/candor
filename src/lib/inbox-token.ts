// Client-side inbox token helpers (runs in browser only).
const KEY = "candor:inbox_token";
const REPLY_PREFIX = "candor:reply:";

export function getInboxToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function ensureInboxToken(): string {
  if (typeof window === "undefined") return "";
  let t = localStorage.getItem(KEY);
  if (!t) {
    t = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem(KEY, t);
  }
  return t;
}

export function setInboxToken(t: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, t);
}

export function saveReplyToken(token: string, linkId: string) {
  if (typeof window === "undefined") return;
  const list = listReplyTokens();
  if (!list.find((r) => r.token === token)) {
    list.unshift({ token, linkId, savedAt: Date.now() });
    localStorage.setItem(REPLY_PREFIX + "list", JSON.stringify(list.slice(0, 50)));
  }
}

export function listReplyTokens(): Array<{ token: string; linkId: string; savedAt: number }> {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(REPLY_PREFIX + "list") || "[]");
  } catch {
    return [];
  }
}
