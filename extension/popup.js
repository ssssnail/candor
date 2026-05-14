// Candor popup — talks to the same server functions as the web inbox.
const DEFAULT_ORIGIN = "";

async function getConfig() {
  const { origin, token } = await chrome.storage.local.get(["origin", "token"]);
  return { origin: origin || DEFAULT_ORIGIN, token: token || null };
}

async function ensureToken() {
  let { token } = await chrome.storage.local.get("token");
  if (!token) {
    token =
      crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    await chrome.storage.local.set({ token });
  }
  return token;
}

async function callServerFn(origin, name, payload) {
  // TanStack server functions are exposed at /_serverFn/<name>?createServerFn=true&_serverFnId=...
  // Easier: round-trip through a hidden API by opening the inbox URL with a postMessage bridge.
  // For MVP we keep it simple: ask the user to open inbox in a tab; popup just shows a copy link + opens the page.
  // (Polling backend directly from the extension is intentionally deferred until we publish a public REST endpoint.)
  return null;
}

async function main() {
  const cfg = await getConfig();
  const token = await ensureToken();

  document.getElementById("origin").value = cfg.origin;

  document.getElementById("save-origin").addEventListener("click", async () => {
    const v = document.getElementById("origin").value.trim().replace(/\/$/, "");
    await chrome.storage.local.set({ origin: v });
    document.getElementById("copied-msg").textContent = "站点已保存";
    setTimeout(() => (document.getElementById("copied-msg").textContent = ""), 1500);
  });

  document.getElementById("open-inbox").addEventListener("click", (e) => {
    e.preventDefault();
    if (cfg.origin) chrome.tabs.create({ url: cfg.origin + "/inbox" });
    else alert("请先在下方填入 Candor 站点地址");
  });

  document.getElementById("copy-link").addEventListener("click", async () => {
    if (!cfg.origin) {
      alert("请先在下方填入 Candor 站点地址");
      return;
    }
    // Open the inbox so the user can copy from there (one-tap convenience).
    chrome.tabs.create({ url: cfg.origin + "/inbox" });
  });

  // Stub: empty state for now. Real polling will arrive once /api/public endpoints are added.
  document.getElementById("empty").style.display = "block";
}

main();
