/**
 * Real VK login for Золотой червонец.
 * Primary: VK Open API (popup VK.Auth.login) — classic real VK connect.
 * Fallback: oauth.vk.com implicit token redirect.
 * Optional: VK ID SDK One Tap when available.
 */

const VK_APP_ID_KEY = "chervonets_vk_app_id";
const VK_SESSION_KEY = "chervonets_vk_session_v1";
const OPENAPI_URL = "https://vk.com/js/api/openapi.js?169";
const VK_SDK_URL = "https://unpkg.com/@vkid/sdk@2.6.1/dist-sdk/umd/index.js";

let openApiReady = null;
let vkidModule = null;

function randomString(length = 32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
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

export function getStoredVkAppId() {
  try {
    return String(localStorage.getItem(VK_APP_ID_KEY) || "")
      .replace(/\D/g, "")
      .trim();
  } catch {
    return "";
  }
}

export function setStoredVkAppId(appId) {
  const clean = String(appId || "").replace(/\D/g, "").trim();
  if (!clean) localStorage.removeItem(VK_APP_ID_KEY);
  else localStorage.setItem(VK_APP_ID_KEY, clean);
  return clean;
}

export async function resolveVkAppId() {
  const stored = getStoredVkAppId();
  if (stored) return stored;
  if (window.__CHERVONETS_VK_APP_ID__) {
    return String(window.__CHERVONETS_VK_APP_ID__).replace(/\D/g, "").trim();
  }
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.vkAppId) return String(data.vkAppId).replace(/\D/g, "").trim();
    }
  } catch {
    /* static host */
  }
  return "";
}

export function getRedirectUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  let href = url.toString();
  if (href.endsWith("index.html")) href = href.slice(0, -"index.html".length);
  // Prefer origin root for VK trusted URL stability.
  return `${url.origin}/`;
}

export function getSiteDomain() {
  return window.location.hostname;
}

export function buildVkAppSetupHelp() {
  const redirectUrl = getRedirectUrl();
  const domain = getSiteDomain();
  return {
    createAppUrl: "https://vk.com/editapp?act=create",
    idBusinessUrl: "https://id.vk.com/about/business/go",
    appsUrl: "https://vk.com/apps?act=manage",
    redirectUrl,
    domain,
    steps: [
      "Откройте https://vk.com/editapp?act=create и создайте приложение типа «Веб-сайт»",
      `В настройках укажите адрес сайта / базовый домен: ${domain}`,
      `Trusted redirect URL / Redirect URI: ${redirectUrl}`,
      "Скопируйте ID приложения и сохраните его ниже",
      "Нажмите «Войти через VK» — откроется настоящее окно ВКонтакте",
    ],
  };
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const found = document.querySelector(`script[src="${src}"]`);
    if (found) {
      if (src.includes("openapi") && window.VK) return resolve();
      if (src.includes("@vkid/sdk") && (window.VKID || window.VKIDSDK)) return resolve();
      found.addEventListener("load", () => resolve());
      found.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Не загрузился скрипт ${src}`));
    document.head.appendChild(script);
  });
}

async function loadOpenApi() {
  if (window.VK?.Auth) return window.VK;
  if (!openApiReady) {
    openApiReady = loadScript(OPENAPI_URL).then(() => {
      if (!window.VK) throw new Error("VK Open API не доступен");
      return window.VK;
    });
  }
  return openApiReady;
}

function readVkidGlobal() {
  return window.VKID || window.VKIDSDK || null;
}

async function loadVkidSdk() {
  if (vkidModule) return vkidModule;
  const existing = readVkidGlobal();
  if (existing) {
    vkidModule = existing;
    return vkidModule;
  }
  await loadScript(VK_SDK_URL);
  const sdk = readVkidGlobal();
  if (!sdk) throw new Error("VK ID SDK не инициализирован");
  vkidModule = sdk;
  return vkidModule;
}

function toUserFromVkApi(user, accessToken = null, email = null) {
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Пользователь VK";
  return {
    key: String(user.id),
    provider: "vk",
    name,
    handle: user.screen_name ? `@${user.screen_name}` : `id${user.id}`,
    email: email || null,
    photo: user.photo_100 || user.photo_200 || null,
    color: "#7ad7ff",
    initials: initialsFromName(name),
    accessToken: accessToken || null,
  };
}

export function saveVkSession(user) {
  const safe = {
    key: user.key,
    provider: "vk",
    name: user.name,
    handle: user.handle,
    email: user.email || null,
    photo: user.photo || null,
    color: user.color || "#7ad7ff",
    initials: user.initials,
    // keep token only in sessionStorage for this browser tab session
  };
  localStorage.setItem(VK_SESSION_KEY, JSON.stringify(safe));
  if (user.accessToken) {
    sessionStorage.setItem(`${VK_SESSION_KEY}_token`, user.accessToken);
  }
}

export function loadVkSession() {
  try {
    const raw = localStorage.getItem(VK_SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user?.name || user.provider !== "vk") return null;
    user.accessToken = sessionStorage.getItem(`${VK_SESSION_KEY}_token`) || null;
    return user;
  } catch {
    return null;
  }
}

export function clearVkSession() {
  localStorage.removeItem(VK_SESSION_KEY);
  sessionStorage.removeItem(`${VK_SESSION_KEY}_token`);
}

async function usersGetViaProxy(accessToken, userId) {
  const url = new URL("/api/vk-profile", window.location.origin);
  url.searchParams.set("access_token", accessToken);
  if (userId) url.searchParams.set("user_id", String(userId));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "VK proxy error");
  }
  const data = await res.json();
  if (!data?.user) throw new Error("Профиль VK не получен");
  return data.user;
}

function usersGetWithJsonp(accessToken, userId) {
  // Fallback when /api/vk-profile is unavailable (pure static host).
  return new Promise((resolve, reject) => {
    const cb = `__vkUsersGet_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[cb];
      script.remove();
    };
    window[cb] = (data) => {
      cleanup();
      if (data?.error) {
        reject(new Error(data.error.error_msg || "VK API error"));
        return;
      }
      const user = data?.response?.[0];
      if (!user) {
        reject(new Error("Профиль VK не получен"));
        return;
      }
      resolve(user);
    };
    const api = new URL("https://api.vk.com/method/users.get");
    api.searchParams.set("access_token", accessToken);
    api.searchParams.set("fields", "photo_100,photo_200,screen_name");
    api.searchParams.set("v", "5.199");
    api.searchParams.set("callback", cb);
    if (userId) api.searchParams.set("user_ids", String(userId));
    script.src = api.toString();
    script.onerror = () => {
      cleanup();
      reject(new Error("Не удалось запросить профиль VK"));
    };
    document.head.appendChild(script);
  });
}

async function usersGetWithToken(accessToken, userId) {
  try {
    return await usersGetViaProxy(accessToken, userId);
  } catch {
    return usersGetWithJsonp(accessToken, userId);
  }
}

/**
 * Real VK popup login via Open API.
 */
export async function loginWithVkOpenApi(appId) {
  const VK = await loadOpenApi();
  VK.init({ apiId: Number(appId) });

  const session = await new Promise((resolve, reject) => {
    // bit 22 (4194304) = email; bit 0 = friends not required
    const rights = 4194304;
    VK.Auth.login((response) => {
      if (response?.session) resolve(response);
      else reject(new Error("Вход через VK отменён"));
    }, rights);
  });

  const mid = session.session.mid || session.session.user?.id;
  const accessToken = session.session.sid || session.session.access_token || null;
  const email = session.session.user?.email || session.session.email || null;

  // Prefer Open API call when available (uses user session cookie/token).
  const profile = await new Promise((resolve, reject) => {
    try {
      VK.Api.call(
        "users.get",
        { user_ids: mid, fields: "photo_100,photo_200,screen_name", v: "5.199" },
        (data) => {
          if (data?.response?.[0]) resolve(data.response[0]);
          else if (data?.error) reject(new Error(data.error.error_msg || "VK API error"));
          else reject(new Error("Пустой ответ users.get"));
        }
      );
    } catch (err) {
      reject(err);
    }
  }).catch(async () => {
    if (!accessToken) throw new Error("Не удалось получить профиль VK");
    return usersGetWithToken(accessToken, mid);
  });

  const user = toUserFromVkApi(profile, accessToken, email);
  saveVkSession(user);
  return user;
}

/**
 * OAuth redirect (implicit token) — works even if Open API popup blocked.
 */
export async function startVkOAuthRedirect(appId) {
  const state = randomString(24);
  sessionStorage.setItem("chervonets_vk_oauth_state", state);
  const redirectUri = encodeURIComponent(getRedirectUrl());
  const url =
    `https://oauth.vk.com/authorize?client_id=${encodeURIComponent(appId)}` +
    `&display=page&redirect_uri=${redirectUri}` +
    `&scope=email&response_type=token&v=5.199&state=${encodeURIComponent(state)}`;
  window.location.assign(url);
}

export async function consumeVkRedirectIfPresent() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const error = hash.get("error") || query.get("error");
  const errorDescription = hash.get("error_description") || query.get("error_description");
  const accessToken = hash.get("access_token");
  const userId = hash.get("user_id");
  const email = hash.get("email");
  const state = hash.get("state") || query.get("state");
  const code = query.get("code");
  const deviceId = query.get("device_id") || query.get("deviceId");

  if (!accessToken && !code && !error) return null;

  const clean = new URL(window.location.href);
  clean.search = "";
  clean.hash = "";
  history.replaceState(null, "", clean.pathname === "/" ? clean.origin + "/" : clean.toString());

  if (error) throw new Error(errorDescription || error);

  if (accessToken) {
    const expected = sessionStorage.getItem("chervonets_vk_oauth_state");
    if (expected && state && expected !== state) {
      throw new Error("Не совпал state OAuth — войдите ещё раз");
    }
    const profile = await usersGetWithToken(accessToken, userId);
    const user = toUserFromVkApi(profile, accessToken, email);
    saveVkSession(user);
    return user;
  }

  // VK ID code flow
  if (code && deviceId) {
    const VKID = await loadVkidSdk();
    const codeVerifier = sessionStorage.getItem("chervonets_vk_code_verifier") || undefined;
    const tokens = await VKID.Auth.exchangeCode(code, deviceId, codeVerifier);
    const token = tokens?.access_token || tokens?.accessToken;
    if (!token) throw new Error("VK ID не вернул access_token");
    let profileUser;
    try {
      const info = await VKID.Auth.userInfo(token);
      const u = info?.user || info;
      profileUser = {
        id: u.user_id || u.id,
        first_name: u.first_name || u.firstName,
        last_name: u.last_name || u.lastName,
        screen_name: u.screen_name,
        photo_100: u.avatar || u.photo_100,
      };
    } catch {
      profileUser = await usersGetWithToken(token);
    }
    const user = toUserFromVkApi(profileUser, token);
    saveVkSession(user);
    return user;
  }

  return null;
}

export async function renderVkOneTap(container, { appId, onSuccess, onError }) {
  if (!container) return null;
  container.innerHTML = "";
  try {
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
    const oneTap = new VKID.OneTap();
    oneTap
      .render({
        container,
        showAlternativeLogin: true,
        styles: { borderRadius: 12 },
        scheme: VKID.Scheme?.DARK,
        lang: VKID.Languages?.RUS,
      })
      .on(VKID.WidgetEvents?.ERROR || "error", (err) => onError?.(err))
      .on(VKID.OneTapInternalEvents?.LOGIN_SUCCESS || "login_success", async (payload) => {
        try {
          const tokens = await VKID.Auth.exchangeCode(
            payload.code,
            payload.device_id || payload.deviceId,
            codeVerifier
          );
          const token = tokens?.access_token || tokens?.accessToken;
          const profile = await usersGetWithToken(token);
          const user = toUserFromVkApi(profile, token);
          saveVkSession(user);
          onSuccess?.(user);
        } catch (err) {
          onError?.(err);
        }
      });
    return oneTap;
  } catch (err) {
    onError?.(err);
    return null;
  }
}

/**
 * Main entry: try Open API popup first, then OAuth redirect.
 */
export async function connectVkReal() {
  const appId = await resolveVkAppId();
  if (!appId) {
    const err = new Error("NO_APP_ID");
    err.code = "NO_APP_ID";
    throw err;
  }
  try {
    return await loginWithVkOpenApi(appId);
  } catch (err) {
    // Popup blocked / Open API domain not allowed → OAuth redirect
    const message = String(err?.message || err || "");
    if (/отмен|cancel|close/i.test(message)) throw err;
    await startVkOAuthRedirect(appId);
    return null; // navigating away
  }
}
