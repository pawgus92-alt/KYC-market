import { commitBest, readBest, rememberPlay } from "./storage.js";
import "./site.js";

const ROUND_MS = 30000;
const tap = document.querySelector("#tap");
const stage = document.querySelector("#stage");
const statusEl = document.querySelector("#status");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const timeEl = document.querySelector("#time");
const storeNote = document.querySelector("#store-note");

let phase = "idle";
let score = 0;
let endsAt = 0;
let lastNow = 0;
let raf = 0;
let warned = false;

rememberPlay("clicker");

function showBest() {
  const best = readBest("clicker");
  bestEl.textContent = best ? String(best) : "—";
}

function setStatus(text) {
  if (statusEl.textContent !== text) statusEl.textContent = text;
}

function noteStore() {
  if (warned || !storeNote) return;
  warned = true;
  storeNote.textContent = "Браузер не дал записать рекорд в localStorage.";
}

function paintTime(left) {
  timeEl.textContent = (Math.max(0, left) / 1000).toFixed(1);
  tap.style.setProperty("--p", String(Math.max(0, Math.min(100, (left / ROUND_MS) * 100))));
}

function finish() {
  phase = "done";
  cancelAnimationFrame(raf);
  paintTime(0);
  tap.textContent = String(score);
  stage.classList.add("is-over");
  const mark = readBest("clicker");
  if (score > 0) {
    const saved = commitBest("clicker", score, "max");
    if (saved.best) bestEl.textContent = String(saved.best);
    if (!saved.saved) noteStore();
  }
  const record = score > mark && score > 0 ? " Новый рекорд." : "";
  setStatus(`Время. Счёт ${score}.${record}`);
}

function frame() {
  if (phase !== "run") return;
  const now = performance.now();
  if (document.hidden || document.querySelector("dialog[open]")) {
    endsAt += now - lastNow;
  }
  lastNow = now;
  const left = endsAt - now;
  paintTime(left);
  if (left <= 0) {
    finish();
    return;
  }
  raf = requestAnimationFrame(frame);
}

function hit() {
  if (phase === "done") {
    setStatus("Раунд окончен. Нажмите «Начать заново».");
    return;
  }
  if (phase === "idle") {
    phase = "run";
    endsAt = performance.now() + ROUND_MS;
    lastNow = performance.now();
    stage.classList.remove("is-over");
    setStatus("Раунд идёт.");
    raf = requestAnimationFrame(frame);
  }
  score += 1;
  scoreEl.textContent = String(score);
  tap.textContent = String(score);
}

function fresh() {
  cancelAnimationFrame(raf);
  phase = "idle";
  score = 0;
  scoreEl.textContent = "0";
  tap.textContent = "Жми";
  paintTime(ROUND_MS);
  stage.classList.remove("is-over", "is-won");
  showBest();
  setStatus("Нажмите «Жми». Раунд длится 30 секунд.");
}

tap.addEventListener("click", hit);
window.addEventListener("keydown", (event) => {
  if (event.target.closest("input, textarea, button, dialog")) return;
  if (document.querySelector("dialog[open]")) return;
  if (event.code !== "Space" && event.code !== "Enter") return;
  event.preventDefault();
  hit();
});
document.querySelector("#restart").addEventListener("click", fresh);
fresh();
