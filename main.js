const QUALITIES = {
  1080: {
    label: "1080p",
    bitrate: 5.0,
    src: "./media/stream-1080.mp4",
  },
  720: {
    label: "720p",
    bitrate: 2.5,
    src: "./media/stream-720.mp4",
  },
  480: {
    label: "480p",
    bitrate: 1.2,
    src: "./media/stream-480.mp4",
  },
};

const PROFILES = {
  anna: { name: "Анна К.", handle: "@anna.north", color: "#7ad7ff", initials: "АК" },
  igor: { name: "Игорь М.", handle: "@igor.live", color: "#9dffa8", initials: "ИМ" },
  mira: { name: "Мира С.", handle: "@mira.stream", color: "#ffd28a", initials: "МС" },
};

const SEED_COMMENTS = [
  { name: "Лена В.", text: "Картинка чёткая с телефона 🔥", color: "#ff9ec7", initials: "ЛВ" },
  { name: "Павел", text: "Запись только после согласия — правильно", color: "#b8a7ff", initials: "П" },
  { name: "Юля", text: "Когда следующий лот?", color: "#ffe08a", initials: "Ю" },
  { name: "Кирилл", text: "В советах проверили безопасность данных", color: "#8ad7c2", initials: "К" },
  { name: "Оля Р.", text: "На 4G держится без рывков", color: "#ffa08a", initials: "ОР" },
];

const TIPS = [
  {
    id: "t1",
    topic: "stream",
    title: "Стабильный эфир на мобильном",
    body: "Закройте фоновые приложения, держите заряд выше 30% и по возможности сидите ближе к роутеру. Авто-качество лучше ручного 1080p на слабом 4G.",
  },
  {
    id: "t2",
    topic: "privacy",
    title: "Не включайте запись «на всякий случай»",
    body: "Разрешайте запись только когда готовы, что эфир попадёт в архив. Без вашего подтверждения запись не стартует.",
  },
  {
    id: "t3",
    topic: "privacy",
    title: "Пароли и аккаунт",
    body: "Не используйте один пароль для почты и Червонца. В демо пароль хранится как хэш; в проде добавьте 2FA и выход на чужих устройствах.",
  },
  {
    id: "t4",
    topic: "money",
    title: "Ставки без спешки",
    body: "Перед ставкой сверьте лот, таймер и комиссию. Не гонитесь за последней секундой, если не уверены в доставке и возврате.",
  },
  {
    id: "t5",
    topic: "coins",
    title: "Монеты: смотрите на сохранность",
    body: "Для нумизматики важны царапины, патина и подлинность. Фото крупным планом и сертификат важнее «красивой картинки» в превью.",
  },
  {
    id: "t6",
    topic: "coins",
    title: "Хранение червонцев и металла",
    body: "Держите монеты в капсулах, без агрессивной чистки. Резкие перепады влажности портят поверхность сильнее, чем аккуратное обращение.",
  },
  {
    id: "t7",
    topic: "life",
    title: "Цифровая гигиена в прямом эфире",
    body: "Не светите в кадре документы, адрес и чужие лица без разрешения. Закройте уведомления на экране телефона.",
  },
  {
    id: "t8",
    topic: "life",
    title: "Пауза для глаз и слуха",
    body: "Каждые 40–50 минут эфира делайте короткую паузу: вода, смена позы, тише громкость наушников — меньше усталости к концу стрима.",
  },
  {
    id: "t9",
    topic: "stream",
    title: "Низкая задержка без жертв",
    body: "Режим Low lat держит короткий буфер. Если сеть скачет — переключитесь на 720p или Авто, а не отключайте буфер полностью.",
  },
  {
    id: "t10",
    topic: "money",
    title: "Чеки и история ставок",
    body: "Сохраняйте подтверждения ставок и переписок. При споре важны время лота, сумма и кто был авторизован в аккаунте.",
  },
  {
    id: "t11",
    topic: "privacy",
    title: "Удаление из архива",
    body: "Запись в архиве можно удалить. В проде удаление должно каскадно чистить CDN-копии и журналы доступа в разумный срок.",
  },
  {
    id: "t12",
    topic: "life",
    title: "Не только коллекционирование",
    body: "Площадка — ещё и полезные привычки: согласие на запись, защита данных, спокойные покупки и бережный стрим, а не только монеты.",
  },
];

const AUCTIONS = [
  {
    id: "lot-1",
    title: "Пластинка «Северный червонец»",
    status: "live",
    bid: 4200,
    bids: 18,
    endsIn: 95,
  },
  {
    id: "lot-2",
    title: "Автограф ведущего",
    status: "live",
    bid: 1900,
    bids: 11,
    endsIn: 140,
  },
  {
    id: "lot-3",
    title: "Сет стикеров студии",
    status: "soon",
    bid: 500,
    bids: 0,
    endsIn: 600,
  },
  {
    id: "lot-4",
    title: "Камера B-roll, вечерний слот",
    status: "soon",
    bid: 8500,
    bids: 3,
    endsIn: 1200,
  },
  {
    id: "lot-5",
    title: "Мерч «Червонец» — худи",
    status: "live",
    bid: 3100,
    bids: 24,
    endsIn: 210,
  },
  {
    id: "lot-6",
    title: "VIP-чат на следующий выпуск",
    status: "soon",
    bid: 2500,
    bids: 1,
    endsIn: 1800,
  },
];

const video = document.querySelector("#stream-video");
const overlay = document.querySelector("#player-overlay");
const playCta = document.querySelector("#play-cta");
const playBtn = document.querySelector("#play-btn");
const muteBtn = document.querySelector("#mute-btn");
const fsBtn = document.querySelector("#fs-btn");
const llBtn = document.querySelector("#ll-btn");
const qualitySelect = document.querySelector("#quality-select");
const bufferToast = document.querySelector("#buffer-toast");
const latencyBadge = document.querySelector("#latency-badge");
const viewersEl = document.querySelector("#viewers");
const statQuality = document.querySelector("#stat-quality");
const statBitrate = document.querySelector("#stat-bitrate");
const statHealth = document.querySelector("#stat-health");
const playerFrame = document.querySelector("#player-frame");

const chatFeed = document.querySelector("#chat-feed");
const chatUser = document.querySelector("#chat-user");
const commentForm = document.querySelector("#comment-form");
const commentInput = document.querySelector("#comment-input");
const charCount = document.querySelector("#char-count");
const chatGate = document.querySelector("#chat-gate");
const vkToggle = document.querySelector("#vk-toggle");
const vkConnect = document.querySelector("#vk-connect");
const registerConnect = document.querySelector("#register-connect");
const authDialog = document.querySelector("#auth-dialog");
const vkForm = document.querySelector("#vk-form");
const registerPane = document.querySelector("#register-pane");
const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");
const registerError = document.querySelector("#register-error");
const loginError = document.querySelector("#login-error");
const authTabs = document.querySelectorAll(".auth-tab");
const authSubtabs = document.querySelectorAll(".auth-subtab");

const ACCOUNTS_KEY = "chervonets_accounts_v1";
const SESSION_KEY = "chervonets_session_v1";
const ARCHIVE_KEY = "chervonets_archive_meta_v1";
const CONSENT_KEY = "chervonets_record_consent_v1";

const tabButtons = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const chromeMeta = document.querySelector("#chrome-meta");
const auctionGrid = document.querySelector("#auction-grid");
const filterChips = document.querySelectorAll("[data-filter]");
const tipFilterChips = document.querySelectorAll("[data-tip-filter]");
const tipsGrid = document.querySelector("#tips-grid");
const archiveList = document.querySelector("#archive-list");
const consentDialog = document.querySelector("#consent-dialog");
const consentForm = document.querySelector("#consent-form");
const consentCheck = document.querySelector("#consent-check");
const consentRecordBtn = document.querySelector("#consent-record-btn");
const endStreamBtn = document.querySelector("#end-stream-btn");
const recIndicator = document.querySelector("#rec-indicator");
const recBanner = document.querySelector("#rec-banner");
const recBannerText = document.querySelector("#rec-banner-text");
const consentNote = document.querySelector("#consent-note");
const revokeConsentBtn = document.querySelector("#revoke-consent-btn");
const wipeLocalBtn = document.querySelector("#wipe-local-btn");

const VALID_TABS = new Set(["stream", "auctions", "archive", "tips", "privacy"]);

const state = {
  tab: "stream",
  playing: false,
  lowLatency: true,
  quality: "1080",
  autoQuality: false,
  user: null,
  viewers: 1284,
  auctionFilter: "all",
  tipFilter: "all",
  lots: AUCTIONS.map((lot) => ({ ...lot })),
  recordConsent: false,
  recording: false,
  mediaRecorder: null,
  recordedChunks: [],
  archiveBlobs: new Map(),
};

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function bufferAhead() {
  if (!video.buffered.length) return 0;
  try {
    return Math.max(0, video.buffered.end(video.buffered.length - 1) - video.currentTime);
  } catch {
    return 0;
  }
}

function setLatencyUI(seconds) {
  latencyBadge.textContent = `~${seconds.toFixed(1)} с`;
  latencyBadge.classList.remove("is-good", "is-warn", "is-bad");
  if (seconds <= 1.2) latencyBadge.classList.add("is-good");
  else if (seconds <= 2.5) latencyBadge.classList.add("is-warn");
  else latencyBadge.classList.add("is-bad");
}

function currentQualityKey() {
  if (!state.autoQuality) return state.quality;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const downlink = connection?.downlink;
  if (downlink != null) {
    if (downlink < 2.5) return "480";
    if (downlink < 6) return "720";
  }
  if (window.matchMedia("(max-width: 700px)").matches) return "720";
  return "1080";
}

function applySource(resetTime = true) {
  const key = currentQualityKey();
  const q = QUALITIES[key];
  const keep = resetTime ? 0 : video.currentTime;
  const wasPlaying = !video.paused || state.playing;
  video.src = q.src;
  video.loop = true;
  video.muted = muteBtn.getAttribute("aria-pressed") === "true";
  video.load();
  const resume = () => {
    if (keep > 0 && Number.isFinite(keep)) video.currentTime = keep;
    if (wasPlaying) {
      video.play().catch(() => {
        overlay.classList.remove("is-hidden");
      });
    }
  };
  if (video.readyState >= 1) resume();
  else video.addEventListener("loadedmetadata", resume, { once: true });
  state.quality = key;
  statQuality.textContent = state.autoQuality ? `Авто · ${q.label}` : q.label;
  statBitrate.textContent = `${q.bitrate.toFixed(1)} Мбит/с`;
}

async function startPlayback() {
  if (!video.src) applySource(true);
  try {
    await video.play();
    state.playing = true;
    overlay.classList.add("is-hidden");
    playBtn.textContent = "❚❚";
    playBtn.setAttribute("aria-label", "Пауза");
    if (state.recordConsent && !state.recording) startRecording();
  } catch {
    // Mobile browsers often require a fresh tap; keep overlay.
    overlay.classList.remove("is-hidden");
  }
}

function togglePlay() {
  if (video.paused) startPlayback();
  else {
    video.pause();
    state.playing = false;
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Смотреть");
  }
}

function chaseLiveEdge() {
  if (!state.lowLatency || video.paused) return;
  const ahead = bufferAhead();
  statHealth.textContent = `буфер ${ahead.toFixed(1)} с`;
  // Keep a short buffer; if it grows, nudge toward the edge without a hard jump.
  if (ahead > 1.6) {
    const target = Math.min(ahead - 0.7, 0.9);
    video.currentTime = Math.min(
      video.buffered.end(video.buffered.length - 1) - 0.55,
      video.currentTime + target * 0.35
    );
  }
  const latency = state.lowLatency ? Math.min(Math.max(ahead * 0.55, 0.4), 1.4) : Math.max(ahead, 2.5);
  setLatencyUI(latency);
}

function showBuffering(isBuffering) {
  bufferToast.hidden = !isBuffering;
}

function appendComment({ name, text, color, initials, self = false }) {
  const row = document.createElement("article");
  row.className = self ? "comment is-self" : "comment";
  const now = new Date();
  const stamp = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  row.innerHTML = `
    <div class="avatar" style="background:${color}">${initials}</div>
    <div>
      <div class="comment-meta"><strong>${name}</strong><time>${stamp}</time></div>
      <p></p>
    </div>
  `;
  row.querySelector("p").textContent = text;
  chatFeed.appendChild(row);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function initialsFromName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function readAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAccounts(list) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

async function hashPassword(password) {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(`chervonets:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return btoa(`chervonets:${password}`);
}

function showAuthError(node, message) {
  if (!node) return;
  if (!message) {
    node.hidden = true;
    node.textContent = "";
    return;
  }
  node.hidden = false;
  node.textContent = message;
}

function applyUser(user, persist = true) {
  state.user = user;
  const badge =
    user.provider === "vk" ? user.handle : user.provider === "local" ? "аккаунт" : "гость";
  chatUser.textContent = `${user.name} · ${badge}`;
  vkToggle.textContent = user.provider === "vk" ? "VK ✓" : "Выйти";
  vkToggle.setAttribute("aria-pressed", "true");
  chatGate.hidden = true;
  commentForm.hidden = false;
  if (persist) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        provider: user.provider,
        key: user.key,
        name: user.name,
        handle: user.handle,
        email: user.email || null,
        color: user.color,
        initials: user.initials,
      })
    );
  }
  renderAuctions();
}

function setVkUser(profileKey) {
  const profile = PROFILES[profileKey];
  applyUser({ key: profileKey, provider: "vk", ...profile });
}

function setLocalUser(account) {
  applyUser({
    key: account.email,
    provider: "local",
    name: account.name,
    handle: account.email,
    email: account.email,
    color: "#e8c56b",
    initials: initialsFromName(account.name),
  });
}

function clearUser() {
  state.user = null;
  localStorage.removeItem(SESSION_KEY);
  chatUser.textContent = "Гость · просмотр";
  vkToggle.textContent = "VK";
  vkToggle.setAttribute("aria-pressed", "false");
  chatGate.hidden = false;
  commentForm.hidden = true;
}

function restoreSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw);
    if (!session?.name || !session?.provider) return;
    applyUser(session, false);
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
}

function switchLocalMode(mode) {
  authSubtabs.forEach((tab) => {
    const on = tab.dataset.localMode === mode;
    tab.classList.toggle("is-on", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
  });
  const isRegister = mode === "register";
  registerForm.hidden = !isRegister;
  loginForm.hidden = isRegister;
  showAuthError(registerError, "");
  showAuthError(loginError, "");
  queueMicrotask(() => {
    if (isRegister) document.querySelector("#reg-name")?.focus();
    else document.querySelector("#login-email")?.focus();
  });
}

function switchAuthTab(mode) {
  authTabs.forEach((tab) => {
    const on = tab.dataset.auth === mode;
    tab.classList.toggle("is-on", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
  });
  const showVk = mode === "vk";
  vkForm.hidden = !showVk;
  registerPane.hidden = showVk;
  vkForm.classList.toggle("is-on", showVk);
  registerPane.classList.toggle("is-on", !showVk);
  if (!showVk) switchLocalMode("register");
}

function openAuthDialog(mode = "vk") {
  showAuthError(registerError, "");
  showAuthError(loginError, "");
  switchAuthTab(mode);
  if (typeof authDialog.showModal === "function") authDialog.showModal();
  else authDialog.setAttribute("open", "");
}

async function registerAccount({ name, email, password, password2, privacyAccepted }) {
  const cleanName = name.trim().replace(/\s+/g, " ").slice(0, 40);
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName) return "Укажите имя.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return "Укажите корректный email.";
  if (password.length < 6) return "Пароль должен быть не короче 6 символов.";
  if (password !== password2) return "Пароли не совпадают.";
  if (!privacyAccepted) return "Нужно согласие на обработку данных.";
  const accounts = readAccounts();
  if (accounts.some((item) => item.email === cleanEmail)) {
    return "Этот email уже зарегистрирован. Войдите во вкладке «Уже есть аккаунт».";
  }
  const passwordHash = await hashPassword(password);
  const account = {
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    createdAt: Date.now(),
    privacyAcceptedAt: Date.now(),
  };
  accounts.push(account);
  writeAccounts(accounts);
  setLocalUser(account);
  return null;
}

async function loginAccount({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const account = accounts.find((item) => item.email === cleanEmail);
  if (!account) return "Аккаунт не найден. Сначала зарегистрируйтесь.";
  const passwordHash = await hashPassword(password);
  if (account.passwordHash !== passwordHash) return "Неверный пароль.";
  setLocalUser(account);
  return null;
}

function switchTab(tab) {
  const next = VALID_TABS.has(tab) ? tab : "stream";
  state.tab = next;
  tabButtons.forEach((btn) => {
    const active = btn.dataset.tab === next;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  panels.forEach((panel) => {
    const active = panel.dataset.panel === next;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
  chromeMeta.style.visibility = next === "stream" ? "visible" : "hidden";
  history.replaceState(null, "", `#${next}`);
  if (next === "archive") renderArchive();
  if (next === "tips") renderTips();
}

function readArchiveMeta() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeArchiveMeta(list) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
}

function updateRecordingUI() {
  const recording = state.recording;
  const consented = state.recordConsent;
  recIndicator.classList.toggle("is-off", !recording);
  recIndicator.classList.toggle("is-on", recording);
  recIndicator.title = recording ? "Идёт запись" : "Запись выключена";
  recBanner.hidden = false;
  endStreamBtn.disabled = !consented;
  if (recording) {
    recBannerText.textContent = "Идёт запись — после эфира файл уйдёт в архив";
    consentRecordBtn.disabled = true;
    consentRecordBtn.textContent = "Запись разрешена";
    consentNote.textContent = "Согласие получено. Завершите эфир, чтобы сохранить видео в архив.";
  } else if (consented) {
    recBannerText.textContent = "Согласие есть — запись стартует с эфиром, завершение сохранит архив";
    consentRecordBtn.disabled = true;
    consentRecordBtn.textContent = "Согласие получено";
    consentNote.textContent =
      "Запись начнётся при воспроизведении. «Завершить эфир» сохранит видео в архив. Отозвать согласие — во вкладке «Защита».";
  } else {
    recBannerText.textContent = "Запись не ведётся — нужно согласие участника";
    consentRecordBtn.disabled = false;
    consentRecordBtn.textContent = "Разрешить запись";
    consentNote.textContent =
      "Видео стрима пишется только после подтверждения участника. Без согласия запись не стартует.";
  }
}

function openConsentDialog() {
  consentCheck.checked = false;
  if (typeof consentDialog.showModal === "function") consentDialog.showModal();
  else consentDialog.setAttribute("open", "");
}

function grantRecordConsent() {
  state.recordConsent = true;
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ grantedAt: Date.now() }));
  updateRecordingUI();
  if (state.playing && !state.recording) startRecording();
}

function revokeRecordConsent() {
  if (state.recording) stopRecording({ save: false });
  state.recordConsent = false;
  localStorage.removeItem(CONSENT_KEY);
  updateRecordingUI();
}

function restoreConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.recordConsent = Boolean(data?.grantedAt);
  } catch {
    localStorage.removeItem(CONSENT_KEY);
  }
}

function pickRecorderMime() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return candidates.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "";
}

function startRecording() {
  if (!state.recordConsent || state.recording || !video) return;
  const capture = video.captureStream?.bind(video) || video.mozCaptureStream?.bind(video);
  if (!capture || typeof MediaRecorder === "undefined") {
    // Fallback demo recorder: mark as recording and archive a reference clip on stop.
    state.recording = true;
    state.recordedChunks = [];
    state._demoRecording = true;
    updateRecordingUI();
    return;
  }
  let stream;
  try {
    stream = capture();
  } catch {
    state.recording = true;
    state.recordedChunks = [];
    state._demoRecording = true;
    updateRecordingUI();
    return;
  }
  if (!stream?.getTracks?.().length) {
    state.recording = true;
    state.recordedChunks = [];
    state._demoRecording = true;
    updateRecordingUI();
    return;
  }
  const mimeType = pickRecorderMime();
  try {
    state.mediaRecorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
  } catch {
    state.recording = true;
    state.recordedChunks = [];
    state._demoRecording = true;
    updateRecordingUI();
    return;
  }
  state.recordedChunks = [];
  state._demoRecording = false;
  state.mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) state.recordedChunks.push(event.data);
  };
  state.mediaRecorder.start(1000);
  state.recording = true;
  updateRecordingUI();
}

function stopRecording({ save }) {
  return new Promise((resolve) => {
    const finishDemo = () => {
      state.recording = false;
      state.mediaRecorder = null;
      if (save) {
        const id = `rec-${Date.now()}`;
        const title = `Эфир «${document.querySelector("#stream-title")?.textContent || "Студия"}»`;
        const entry = {
          id,
          title,
          createdAt: Date.now(),
          durationSec: Math.max(5, Math.floor(video.currentTime || 12)),
          quality: QUALITIES[currentQualityKey()]?.label || state.quality,
          consent: true,
          protected: true,
          src: QUALITIES[currentQualityKey()]?.src || QUALITIES["720"].src,
          demo: true,
        };
        const list = readArchiveMeta();
        list.unshift(entry);
        writeArchiveMeta(list.slice(0, 30));
        renderArchive();
      }
      updateRecordingUI();
      resolve(save);
    };

    if (state._demoRecording || !state.mediaRecorder) {
      finishDemo();
      return;
    }

    const recorder = state.mediaRecorder;
    recorder.onstop = () => {
      state.recording = false;
      state.mediaRecorder = null;
      if (save && state.recordedChunks.length) {
        const blob = new Blob(state.recordedChunks, { type: recorder.mimeType || "video/webm" });
        const id = `rec-${Date.now()}`;
        const url = URL.createObjectURL(blob);
        state.archiveBlobs.set(id, url);
        const entry = {
          id,
          title: `Эфир «${document.querySelector("#stream-title")?.textContent || "Студия"}»`,
          createdAt: Date.now(),
          durationSec: Math.max(5, Math.floor(video.currentTime || 12)),
          quality: QUALITIES[currentQualityKey()]?.label || state.quality,
          consent: true,
          protected: true,
          src: url,
          demo: false,
        };
        const list = readArchiveMeta();
        list.unshift(entry);
        writeArchiveMeta(list.slice(0, 30));
        renderArchive();
      }
      state.recordedChunks = [];
      updateRecordingUI();
      resolve(save);
    };
    try {
      if (recorder.state !== "inactive") recorder.stop();
      else finishDemo();
    } catch {
      finishDemo();
    }
  });
}

async function endStreamToArchive() {
  if (!state.recordConsent) {
    openConsentDialog();
    return;
  }
  if (state.recording) await stopRecording({ save: true });
  else if (state.recordConsent) {
    // Consent was given but recording never attached — still archive a protected stub.
    state._demoRecording = true;
    state.recording = true;
    await stopRecording({ save: true });
  }
  video.pause();
  state.playing = false;
  playBtn.textContent = "▶";
  overlay.classList.remove("is-hidden");
  switchTab("archive");
}

function renderArchive() {
  const list = readArchiveMeta();
  if (!list.length) {
    archiveList.innerHTML = `
      <div class="empty-state">
        <p>Архив пуст. Разрешите запись на вкладке «Стрим», проведите эфир и нажмите «Завершить эфир → архив».</p>
      </div>`;
    return;
  }
  archiveList.innerHTML = list
    .map((item) => {
      const when = new Date(item.createdAt).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      const src = state.archiveBlobs.get(item.id) || item.src || "";
      return `
        <article class="archive-card" data-archive-id="${item.id}">
          <div class="archive-preview">
            ${src ? `<video src="${src}" controls playsinline preload="metadata" controlslist="nodownload"></video>` : `<div class="archive-fallback">Нет превью</div>`}
            <span class="lot-badge is-live">Согласие ✓</span>
          </div>
          <div class="archive-body">
            <h3>${item.title}</h3>
            <p class="archive-meta">${when} · ${formatTime(item.durationSec || 0)} · ${item.quality || "—"}</p>
            <p class="archive-shield">Защищено: запись только после согласия участника${item.protected ? " · локальный архив" : ""}</p>
            <div class="lot-actions">
              <button type="button" class="btn btn-ghost" data-delete-archive="${item.id}">Удалить из архива</button>
            </div>
          </div>
        </article>`;
    })
    .join("");
}

function deleteArchiveItem(id) {
  const url = state.archiveBlobs.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    state.archiveBlobs.delete(id);
  }
  writeArchiveMeta(readArchiveMeta().filter((item) => item.id !== id));
  renderArchive();
}

function renderTips() {
  const tips = TIPS.filter((tip) => (state.tipFilter === "all" ? true : tip.topic === state.tipFilter));
  const labels = {
    stream: "Стрим",
    privacy: "Данные",
    money: "Покупки",
    coins: "Монеты",
    life: "Быт",
  };
  tipsGrid.innerHTML = tips
    .map(
      (tip) => `
      <article class="tip-card tip-${tip.topic}">
        <p class="tip-topic">${labels[tip.topic] || tip.topic}</p>
        <h3>${tip.title}</h3>
        <p>${tip.body}</p>
      </article>`
    )
    .join("");
}

function wipeLocalData() {
  if (state.recording) stopRecording({ save: false });
  localStorage.removeItem(ACCOUNTS_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ARCHIVE_KEY);
  localStorage.removeItem(CONSENT_KEY);
  state.archiveBlobs.forEach((url) => URL.revokeObjectURL(url));
  state.archiveBlobs.clear();
  state.recordConsent = false;
  clearUser();
  updateRecordingUI();
  renderArchive();
  switchTab("privacy");
}

function renderAuctions() {
  const lots = state.lots.filter((lot) =>
    state.auctionFilter === "all" ? true : lot.status === state.auctionFilter
  );
  auctionGrid.innerHTML = lots
    .map((lot) => {
      const live = lot.status === "live";
      return `
        <article class="lot" data-id="${lot.id}">
          <div class="lot-visual" aria-hidden="true">
            <span class="lot-badge ${live ? "is-live" : "is-soon"}">${live ? "Идёт" : "Скоро"}</span>
          </div>
          <div class="lot-body">
            <h3>${lot.title}</h3>
            <div class="lot-meta">
              <span>${lot.bids} ставок</span>
              <span>${live ? "до конца" : "старт через"} ${formatTime(lot.endsIn)}</span>
            </div>
            <p class="lot-price" data-price>${formatMoney(lot.bid)}</p>
            <div class="lot-actions">
              <button type="button" class="btn btn-primary" data-bid="${lot.id}" ${live ? "" : "disabled"}>
                ${live ? "Ставка +100 ₽" : "Ожидание"}
              </button>
              <button type="button" class="btn btn-ghost" data-watch="${lot.id}">К стриму</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function placeBid(lotId) {
  if (!state.user) {
    openAuthDialog("vk");
    return;
  }
  const lot = state.lots.find((item) => item.id === lotId);
  if (!lot || lot.status !== "live") return;
  lot.bid += 100;
  lot.bids += 1;
  const card = auctionGrid.querySelector(`[data-id="${lotId}"]`);
  if (card) {
    const price = card.querySelector("[data-price]");
    price.textContent = formatMoney(lot.bid);
    price.classList.remove("bid-flash");
    void price.offsetWidth;
    price.classList.add("bid-flash");
    const meta = card.querySelector(".lot-meta span");
    if (meta) meta.textContent = `${lot.bids} ставок`;
  }
  appendComment({
    name: state.user.name,
    text: `Ставка на «${lot.title}»: ${formatMoney(lot.bid)}`,
    color: state.user.color,
    initials: state.user.initials,
    self: true,
  });
}

function tickAuctions() {
  state.lots.forEach((lot) => {
    if (lot.endsIn > 0) lot.endsIn -= 1;
    // Demo loop: keep live/soon lots cycling so the tab never empties.
    if (lot.endsIn === 0) {
      if (lot.status === "live") {
        lot.status = "soon";
        lot.endsIn = 90 + Math.floor(Math.random() * 120);
      } else {
        lot.status = "live";
        lot.endsIn = 120 + Math.floor(Math.random() * 180);
      }
    }
  });
  if (state.tab === "auctions") renderAuctions();
}

function seedChat() {
  SEED_COMMENTS.forEach((item, index) => {
    setTimeout(() => appendComment(item), 400 + index * 700);
  });
}

function randomChatTick() {
  const pool = SEED_COMMENTS;
  const item = pool[Math.floor(Math.random() * pool.length)];
  appendComment({
    ...item,
    text: item.text,
  });
  state.viewers += Math.floor(Math.random() * 5) - 1;
  viewersEl.textContent = `${new Intl.NumberFormat("ru-RU").format(Math.max(980, state.viewers))} зрителей`;
}

function enterFullscreen() {
  const node = playerFrame;
  const req =
    node.requestFullscreen ||
    node.webkitRequestFullscreen ||
    video.webkitEnterFullscreen ||
    video.requestFullscreen;
  if (video.webkitEnterFullscreen && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    video.webkitEnterFullscreen();
    return;
  }
  if (req) req.call(node === video ? video : node);
}

function bindPlayer() {
  playCta.addEventListener("click", startPlayback);
  playBtn.addEventListener("click", togglePlay);
  playerFrame.addEventListener("dblclick", togglePlay);
  consentRecordBtn.addEventListener("click", openConsentDialog);
  endStreamBtn.addEventListener("click", () => {
    endStreamToArchive();
  });

  function closeConsentDialog() {
    if (typeof consentDialog.close === "function") consentDialog.close("cancel");
    else consentDialog.removeAttribute("open");
  }

  document.querySelector("#consent-allow-btn").addEventListener("click", () => {
    if (!consentCheck.checked) {
      consentCheck.focus();
      return;
    }
    grantRecordConsent();
    closeConsentDialog();
  });

  muteBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    muteBtn.setAttribute("aria-pressed", video.muted ? "true" : "false");
    muteBtn.textContent = video.muted ? "Тихо" : "Звук";
  });

  fsBtn.addEventListener("click", enterFullscreen);

  llBtn.addEventListener("click", () => {
    state.lowLatency = !state.lowLatency;
    llBtn.classList.toggle("is-on", state.lowLatency);
    llBtn.setAttribute("aria-pressed", state.lowLatency ? "true" : "false");
  });

  qualitySelect.addEventListener("change", () => {
    const value = qualitySelect.value;
    state.autoQuality = value === "auto";
    if (!state.autoQuality) state.quality = value;
    applySource(false);
  });

  video.addEventListener("waiting", () => showBuffering(true));
  video.addEventListener("playing", () => {
    showBuffering(false);
    overlay.classList.add("is-hidden");
    state.playing = true;
    playBtn.textContent = "❚❚";
    if (state.recordConsent && !state.recording) startRecording();
  });
  video.addEventListener("pause", () => {
    if (!video.ended) {
      playBtn.textContent = "▶";
      playBtn.setAttribute("aria-label", "Смотреть");
    }
  });

  // Prefer muted auto-ready on mobile networks after first gesture only.
  if (window.matchMedia("(max-width: 900px)").matches) {
    qualitySelect.value = "auto";
    state.autoQuality = true;
  }

  restoreConsent();
  updateRecordingUI();
  applySource(true);
  setInterval(chaseLiveEdge, 900);
}

function bindChat() {
  function closeAuthDialog() {
    if (typeof authDialog.close === "function") authDialog.close("cancel");
    else authDialog.removeAttribute("open");
  }

  vkToggle.addEventListener("click", () => {
    if (state.user) {
      clearUser();
      return;
    }
    openAuthDialog("vk");
  });
  vkConnect.addEventListener("click", () => openAuthDialog("vk"));
  registerConnect.addEventListener("click", () => openAuthDialog("register"));

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchAuthTab(tab.dataset.auth));
  });
  authSubtabs.forEach((tab) => {
    tab.addEventListener("click", () => switchLocalMode(tab.dataset.localMode));
  });

  document.querySelector("#connect-vk-btn").addEventListener("click", () => {
    const selected = vkForm.querySelector('input[name="profile"]:checked');
    if (selected) setVkUser(selected.value);
    closeAuthDialog();
  });

  document.querySelector("#register-cancel-btn").addEventListener("click", closeAuthDialog);
  document.querySelector("#login-cancel-btn").addEventListener("click", closeAuthDialog);

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = await registerAccount({
      name: document.querySelector("#reg-name").value,
      email: document.querySelector("#reg-email").value,
      password: document.querySelector("#reg-password").value,
      password2: document.querySelector("#reg-password2").value,
      privacyAccepted: document.querySelector("#reg-privacy")?.checked,
    });
    if (error) {
      showAuthError(registerError, error);
      return;
    }
    registerForm.reset();
    closeAuthDialog();
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = await loginAccount({
      email: document.querySelector("#login-email").value,
      password: document.querySelector("#login-password").value,
    });
    if (error) {
      showAuthError(loginError, error);
      return;
    }
    loginForm.reset();
    closeAuthDialog();
  });

  commentInput.addEventListener("input", () => {
    charCount.textContent = `${commentInput.value.length} / 280`;
  });

  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.user) {
      openAuthDialog("register");
      return;
    }
    const text = commentInput.value.trim();
    if (!text) return;
    appendComment({
      name: state.user.name,
      text,
      color: state.user.color,
      initials: state.user.initials,
      self: true,
    });
    commentInput.value = "";
    charCount.textContent = "0 / 280";
  });

  restoreSession();
  seedChat();
  setInterval(randomChatTick, 12000);
}

function bindTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  const hash = location.hash.replace("#", "");
  switchTab(VALID_TABS.has(hash) ? hash : "stream");
  window.addEventListener("hashchange", () => {
    const next = location.hash.replace("#", "");
    switchTab(VALID_TABS.has(next) ? next : "stream");
  });
}

function bindAuctions() {
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.auctionFilter = chip.dataset.filter;
      filterChips.forEach((node) => node.classList.toggle("is-on", node === chip));
      renderAuctions();
    });
  });

  auctionGrid.addEventListener("click", (event) => {
    const bid = event.target.closest("[data-bid]");
    if (bid) {
      placeBid(bid.dataset.bid);
      return;
    }
    const watch = event.target.closest("[data-watch]");
    if (watch) switchTab("stream");
  });

  renderAuctions();
  setInterval(tickAuctions, 1000);
}

function bindArchiveTipsPrivacy() {
  tipFilterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.tipFilter = chip.dataset.tipFilter;
      tipFilterChips.forEach((node) => node.classList.toggle("is-on", node === chip));
      renderTips();
    });
  });

  archiveList.addEventListener("click", (event) => {
    const del = event.target.closest("[data-delete-archive]");
    if (del) deleteArchiveItem(del.dataset.deleteArchive);
  });

  revokeConsentBtn.addEventListener("click", () => {
    revokeRecordConsent();
  });

  wipeLocalBtn.addEventListener("click", () => {
    const ok = window.confirm(
      "Удалить локальные аккаунты, сессию, согласия и архив в этом браузере? Это необратимо для демо-данных."
    );
    if (ok) wipeLocalData();
  });

  renderTips();
  renderArchive();
}

bindPlayer();
bindChat();
bindTabs();
bindAuctions();
bindArchiveTipsPrivacy();
