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
  { name: "Павел", text: "Задержка реально маленькая", color: "#b8a7ff", initials: "П" },
  { name: "Юля", text: "Когда следующий лот?", color: "#ffe08a", initials: "Ю" },
  { name: "Кирилл", text: "VK-чат удобнее отдельного аккаунта", color: "#8ad7c2", initials: "К" },
  { name: "Оля Р.", text: "На 4G держится без рывков", color: "#ffa08a", initials: "ОР" },
];

const AUCTIONS = [
  {
    id: "lot-1",
    title: "Пластинка «Северный эфир»",
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
    title: "Мерч «Эфир» — худи",
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
const vkDialog = document.querySelector("#vk-dialog");

const tabButtons = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const chromeMeta = document.querySelector("#chrome-meta");
const auctionGrid = document.querySelector("#auction-grid");
const filterChips = document.querySelectorAll("[data-filter]");

const state = {
  tab: "stream",
  playing: false,
  lowLatency: true,
  quality: "1080",
  autoQuality: false,
  user: null,
  viewers: 1284,
  auctionFilter: "all",
  lots: AUCTIONS.map((lot) => ({ ...lot })),
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

function setUser(profileKey) {
  const profile = PROFILES[profileKey];
  state.user = { key: profileKey, ...profile };
  chatUser.textContent = `${profile.name} · ${profile.handle}`;
  vkToggle.textContent = "VK ✓";
  vkToggle.setAttribute("aria-pressed", "true");
  chatGate.hidden = true;
  commentForm.hidden = false;
  renderAuctions();
}

function openVkDialog() {
  if (typeof vkDialog.showModal === "function") vkDialog.showModal();
  else vkDialog.setAttribute("open", "");
}

function onVkDialogClose() {
  if (vkDialog.returnValue !== "connect") return;
  const selected = vkDialog.querySelector('input[name="profile"]:checked');
  if (selected) setUser(selected.value);
}

function switchTab(tab) {
  state.tab = tab;
  tabButtons.forEach((btn) => {
    const active = btn.dataset.tab === tab;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  panels.forEach((panel) => {
    const active = panel.dataset.panel === tab;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
  chromeMeta.style.visibility = tab === "stream" ? "visible" : "hidden";
  if (tab === "stream") history.replaceState(null, "", "#stream");
  else history.replaceState(null, "", "#auctions");
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
              <button type="button" class="btn btn-ghost" data-watch="${lot.id}">К эфиру</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function placeBid(lotId) {
  if (!state.user) {
    openVkDialog();
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

  applySource(true);
  setInterval(chaseLiveEdge, 900);
}

function bindChat() {
  vkToggle.addEventListener("click", () => {
    if (state.user) {
      state.user = null;
      chatUser.textContent = "Гость · просмотр";
      vkToggle.textContent = "VK";
      vkToggle.setAttribute("aria-pressed", "false");
      chatGate.hidden = false;
      commentForm.hidden = true;
      return;
    }
    openVkDialog();
  });
  vkConnect.addEventListener("click", openVkDialog);
  vkDialog.addEventListener("close", onVkDialogClose);

  commentInput.addEventListener("input", () => {
    charCount.textContent = `${commentInput.value.length} / 280`;
  });

  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.user) {
      openVkDialog();
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

  seedChat();
  setInterval(randomChatTick, 12000);
}

function bindTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  const hash = location.hash.replace("#", "");
  if (hash === "auctions") switchTab("auctions");
  else switchTab("stream");
  window.addEventListener("hashchange", () => {
    const next = location.hash.replace("#", "");
    switchTab(next === "auctions" ? "auctions" : "stream");
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

bindPlayer();
bindChat();
bindTabs();
bindAuctions();
