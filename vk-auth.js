/**
 * VK ID authorization for Золотой червонец.
 * Uses @vkid/sdk (CDN). App ID is public client_id — set via UI, api/config, or env.
 */

const VK_APP_ID_KEY = "chervonets_vk_app_id";
const VK_SDK_URL = "https://unpkg.com/@vkid/sdk@2.6.1/dist-sdk/umd/index.js";

let vkidModule = null;
let oneTapInstance = null;

function randomString(length = 64) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function getStoredVkAppId() {
  try {
    return (localStorage.getItem(VK_APP_ID_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function setStoredVkAppId(appId) {
  const clean = String(appId || "").trim();
  if (!clean) localStorage.removeItem(VK_APP_ID_KEY);
  else localStorage.setItem(VK_APP_ID_KEY, clean);
  return clean;
}

export async function resolveVkAppId() {
  const stored = getStoredVkAppId();
  if (stored) return stored;
  if (window.__CHERVONETS_VK_APP_ID__) return String(window.__CHERVONETS_VK_APP_ID__).trim();
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.vkAppId) return String(data.vkAppId).trim();
    }
  } catch {
    // offline / static host without API
  }
  return "";
}

export function getRedirectUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  // VK requires exact trusted redirect URL (no trailing slash mismatch).
  let href = url.toString();
  if (href.endsWith("index.html")) href = href.slice(0, -"index.html".length);
  if (href.endsWith("/") && href !== `${url.origin}/`) href = href.slice(0, -1);
  return href || `${url.origin}/`;
}

function readVkidGlobal() {
  return window.VKID || window.VKIDSDK || null;
}

async function loadVkidSdk() {
  if (vkidModule) return vkidModule;
  const existingGlobal = readVkidGlobal();
  if (existingGlobal) {
    vkidModule = existingGlobal;
    return vkidModule;
  }
  await new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${VK_SDK_URL}"]`);
    if (existing) {
      if (readVkidGlobal()) {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = VK_SDK_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Не удалось загрузить VK ID SDK"));
    document.head.appendChild(script);
  });
  const sdk = readVkidGlobal();
  if (!sdk) throw new Error("VK ID SDK не инициализирован");
  vkidModule = sdk;
  return vkidModule;
}

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "VK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export async function fetchVkUserProfile(accessToken) {
  const VKID = await loadVkidSdk();
  if (VKID?.Auth?.userInfo) {
    try {
      const info = await VKID.Auth.userInfo(accessToken);
      const user = info?.user || info;
      const first = user?.first_name || user?.firstName || "";
      const last = user?.last_name || user?.lastName || "";
      const name = `${first} ${last}`.trim() || user?.name || "Пользователь VK";
      const id = user?.user_id || user?.id || user?.userId;
      return {
        key: String(id || "vk"),
        provider: "vk",
        name,
        handle: id ? `id${id}` : "@vk",
        email: user?.email || null,
        photo: user?.avatar || user?.photo_200 || null,
        color: "#7ad7ff",
        initials: initialsFromName(name),
        accessToken,
      };
    } catch {
      // fall through to legacy API
    }
  }

  const api = new URL("https://api.vk.com/method/users.get");
  api.searchParams.set("access_token", accessToken);
  api.searchParams.set("fields", "photo_100,screen_name");
  api.searchParams.set("v", "5.199");
  const res = await fetch(api.toString());
  const data = await res.json();
  if (data?.error) throw new Error(data.error.error_msg || "VK API error");
  const user = data?.response?.[0];
  if (!user) throw new Error("Профиль VK не получен");
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Пользователь VK";
  return {
    key: String(user.id),
    provider: "vk",
    name,
    handle: user.screen_name ? `@${user.screen_name}` : `id${user.id}`,
    email: null,
    photo: user.photo_100 || null,
    color: "#7ad7ff",
    initials: initialsFromName(name),
    accessToken,
  };
}

export async function initVkConfig(appId) {
  const VKID = await loadVkidSdk();
  const codeVerifier = randomString(64);
  const state = randomString(32);
  sessionStorage.setItem("chervonets_vk_code_verifier", codeVerifier);
  sessionStorage.setItem("chervonets_vk_state", state);

  const initOptions = {
    app: Number(appId),
    redirectUrl: getRedirectUrl(),
    state,
    codeVerifier,
    scope: "email",
  };
  if (VKID.ConfigResponseMode?.Callback != null) {
    initOptions.responseMode = VKID.ConfigResponseMode.Callback;
  }
  VKID.Config.init(initOptions);
  return VKID;
}

export async function exchangeVkCode(code, deviceId) {
  const VKID = await loadVkidSdk();
  const codeVerifier = sessionStorage.getItem("chervonets_vk_code_verifier") || undefined;
  const tokens = await VKID.Auth.exchangeCode(code, deviceId, codeVerifier);
  const accessToken = tokens?.access_token || tokens?.accessToken;
  if (!accessToken) throw new Error("VK не вернул access_token");
  return fetchVkUserProfile(accessToken);
}

export async function renderVkOneTap(container, { appId, appName, onSuccess, onError }) {
  if (!container) throw new Error("Нет контейнера для VK One Tap");
  container.innerHTML = "";
  const VKID = await initVkConfig(appId);

  if (oneTapInstance?.close) {
    try {
      oneTapInstance.close();
    } catch {
      /* ignore */
    }
  }

  const oneTap = new VKID.OneTap();
  oneTapInstance = oneTap;
  oneTap
    .render({
      container,
      showAlternativeLogin: true,
      styles: { borderRadius: 12 },
      scheme: VKID.Scheme?.DARK ?? undefined,
      lang: VKID.Languages?.RUS ?? undefined,
      fastAuthEnabled: true,
    })
    .on(VKID.WidgetEvents?.ERROR || "error", (err) => onError?.(err))
    .on(VKID.OneTapInternalEvents?.LOGIN_SUCCESS || "login_success", async (payload) => {
      try {
        const user = await exchangeVkCode(payload.code, payload.device_id || payload.deviceId);
        onSuccess?.(user);
      } catch (err) {
        onError?.(err);
      }
    });

  // Optional app name caption for clarity in the dialog.
  if (appName) {
    const caption = document.createElement("p");
    caption.className = "auth-hint";
    caption.textContent = `Приложение VK: ${appName}`;
    container.prepend(caption);
  }

  return oneTap;
}

export async function startVkLoginRedirect(appId) {
  const VKID = await loadVkidSdk();
  const codeVerifier = randomString(64);
  const state = randomString(32);
  sessionStorage.setItem("chervonets_vk_code_verifier", codeVerifier);
  sessionStorage.setItem("chervonets_vk_state", state);

  const initOptions = {
    app: Number(appId),
    redirectUrl: getRedirectUrl(),
    state,
    codeVerifier,
    scope: "email",
  };
  if (VKID.ConfigAuthMode?.Redirect != null) {
    initOptions.mode = VKID.ConfigAuthMode.Redirect;
  }
  VKID.Config.init(initOptions);
  return VKID.Auth.login({ scheme: VKID.Scheme?.DARK });
}

export async function consumeVkRedirectIfPresent() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const deviceId = params.get("device_id") || params.get("deviceId");
  const state = params.get("state");
  const error = params.get("error");
  const errorDescription = params.get("error_description");

  // Legacy implicit flow fragment support
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const implicitToken = hash.get("access_token");

  if (!code && !implicitToken && !error) return null;

  // Clean URL early to avoid re-processing.
  const clean = new URL(window.location.href);
  clean.search = "";
  clean.hash = "";
  history.replaceState(null, "", clean.toString());

  if (error) {
    throw new Error(errorDescription || error);
  }

  if (implicitToken) {
    return fetchVkUserProfile(implicitToken);
  }

  const expected = sessionStorage.getItem("chervonets_vk_state");
  if (expected && state && expected !== state) {
    throw new Error("Не совпал state VK OAuth — попробуйте ещё раз");
  }
  if (!code || !deviceId) {
    throw new Error("VK вернул неполный ответ авторизации");
  }
  return exchangeVkCode(code, deviceId);
}

export function buildVkAppSetupHelp(redirectUrl) {
  return {
    createAppUrl: "https://id.vk.com/about/business/go",
    appsUrl: "https://vk.com/apps?act=manage",
    redirectUrl,
    steps: [
      "Создайте приложение VK ID / веб-приложение на id.vk.com или vk.com/apps",
      `В «Доверенный redirect URL» укажите точно: ${redirectUrl}`,
      "Скопируйте Application ID (client_id) и вставьте ниже",
      "Нажмите «Сохранить App ID» и войдите через VK",
    ],
  };
}
