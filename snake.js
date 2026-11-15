import { createSnake } from "./snake-logic.js";
import { commitBest, readBest, rememberPlay } from "./storage.js";
import "./site.js";

const VIEW = 480;
const COLS = 16;
const cell = VIEW / COLS;
const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const CODES = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyA: "left",
  KeyS: "down",
  KeyD: "right",
};

const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
const stage = document.querySelector("#stage");
const statusEl = document.querySelector("#status");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const restartBtn = document.querySelector("#restart");
const storeNote = document.querySelector("#store-note");
const game = createSnake({ cols: COLS, rows: COLS });

let step = 150;
let acc = 0;
let last = 0;
let raf = 0;
let loopOn = false;
let mark = readBest("snake");
let warned = false;

rememberPlay("snake");

function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = VIEW * dpr;
  canvas.height = VIEW * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function fillRoundRect(x, y, width, height, radius) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, width, height, radius);
  else ctx.rect(x, y, width, height);
  ctx.fill();
}

function paint() {
  const state = game.state;
  ctx.fillStyle = "#123c2c";
  ctx.fillRect(0, 0, VIEW, VIEW);
  ctx.strokeStyle = "rgba(255, 249, 239, 0.06)";
  ctx.lineWidth = 1;
  for (let i = 1; i < COLS; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, VIEW);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(VIEW, i * cell);
    ctx.stroke();
  }
  if (state.food) {
    const cx = state.food.x * cell + cell / 2;
    const cy = state.food.y * cell + cell / 2;
    ctx.fillStyle = "#ff4b3e";
    ctx.beginPath();
    ctx.arc(cx, cy + 1, cell * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d6f25c";
    ctx.fillRect(cx - 1, cy - cell * 0.28, cell * 0.16, cell * 0.14);
  }
  state.snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#fff4c2" : "#d2ef4a";
    fillRoundRect(part.x * cell + 3, part.y * cell + 3, cell - 6, cell - 6, 6);
  });
  const head = state.snake[0];
  if (head) {
    const cx = head.x * cell + cell / 2;
    const cy = head.y * cell + cell / 2;
    const px = -state.dir.y;
    const py = state.dir.x;
    ctx.fillStyle = "#1c1612";
    const eyes = [
      [cx + state.dir.x * 5 + px * 4, cy + state.dir.y * 5 + py * 4],
      [cx + state.dir.x * 5 - px * 4, cy + state.dir.y * 5 - py * 4],
    ];
    eyes.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  if (!state.alive || state.won) {
    ctx.fillStyle = state.won ? "rgba(20, 108, 67, 0.38)" : "rgba(28, 22, 18, 0.5)";
    ctx.fillRect(0, 0, VIEW, VIEW);
  }
  stage.classList.toggle("is-over", !state.alive);
  stage.classList.toggle("is-won", state.won);
}

function setStatus(text) {
  if (statusEl.textContent !== text) statusEl.textContent = text;
}

function showBest(value) {
  bestEl.textContent = value ? String(value) : "—";
}

function noteStore() {
  if (warned || !storeNote) return;
  warned = true;
  storeNote.textContent = "Браузер не дал записать рекорд в localStorage.";
}

function render() {
  const state = game.state;
  scoreEl.textContent = String(state.score);
  if (state.score > 0) {
    const saved = commitBest("snake", state.score, "max");
    if (saved.best) showBest(saved.best);
    if (!saved.saved) noteStore();
  }
  paint();
  if (!state.alive) {
    const record = state.score > mark && state.score > 0 ? " Новый рекорд." : "";
    setStatus(`Столкновение. Счёт ${state.score}.${record}`);
  } else if (state.won) {
    const record = state.score > mark && state.score > 0 ? " Новый рекорд." : "";
    setStatus(`Поле собрано. Счёт ${state.score}.${record}`);
  } else if (state.started) {
    setStatus("Игра идёт.");
  }
}

function stopLoop() {
  loopOn = false;
  cancelAnimationFrame(raf);
}

function loop(now) {
  if (!loopOn) return;
  if (document.hidden || document.querySelector("dialog[open]")) {
    last = now;
    raf = requestAnimationFrame(loop);
    return;
  }
  if (!last) last = now;
  acc += Math.min(now - last, step);
  last = now;
  if (acc >= step) {
    acc -= step;
    const result = game.tick();
    if (result.ate) step = Math.max(72, step - 8);
    render();
    if (!result.alive || result.won) {
      stopLoop();
      return;
    }
  }
  raf = requestAnimationFrame(loop);
}

function ensureLoop() {
  if (loopOn) return;
  loopOn = true;
  last = 0;
  raf = requestAnimationFrame(loop);
}

function steer(name) {
  if (document.querySelector("dialog[open]")) return;
  const next = DIRS[name];
  if (!next) return;
  const wasStarted = game.state.started;
  if (!game.turn(next)) return;
  if (!wasStarted) {
    const result = game.tick();
    acc = 0;
    render();
    if (result.alive && !result.won) ensureLoop();
    return;
  }
  ensureLoop();
}

function fresh(message) {
  stopLoop();
  game.reset();
  step = 150;
  acc = 0;
  last = 0;
  mark = readBest("snake");
  scoreEl.textContent = "0";
  showBest(mark);
  setStatus(message);
  paint();
}

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (document.querySelector("dialog[open]")) return;
  const name = CODES[event.code];
  if (!name) return;
  event.preventDefault();
  steer(name);
});

document.querySelector("#pad").addEventListener("click", (event) => {
  const button = event.target.closest("[data-dir]");
  if (!button) return;
  steer(button.dataset.dir);
});

let swipe = null;
canvas.addEventListener("pointerdown", (event) => {
  swipe = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener("pointerup", (event) => {
  if (!swipe) return;
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  swipe = null;
  if (Math.hypot(dx, dy) < 18) return;
  if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? "right" : "left");
  else steer(dy > 0 ? "down" : "up");
});

restartBtn.addEventListener("click", () => {
  fresh("Новая партия. Нажмите стрелку, WASD или кнопку на поле.");
});
window.addEventListener("resize", () => {
  fitCanvas();
  paint();
});

fitCanvas();
fresh("Нажмите стрелку, WASD или кнопку на поле.");
