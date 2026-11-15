import { createTwenty48 } from "./twenty48-logic.js";
import { commitBest, readBest, rememberPlay } from "./storage.js";
import "./site.js";

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

const board = document.querySelector("#board");
const stage = document.querySelector("#stage");
const statusEl = document.querySelector("#status");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const storeNote = document.querySelector("#store-note");
const game = createTwenty48();
const cells = [];
let warned = false;

rememberPlay("twenty");

for (let index = 0; index < 16; index += 1) {
  const cell = document.createElement("div");
  cell.className = "tile";
  board.append(cell);
  cells.push(cell);
}

function showBest() {
  const best = readBest("twenty");
  bestEl.textContent = best ? String(best) : "—";
}

function noteStore() {
  if (warned || !storeNote) return;
  warned = true;
  storeNote.textContent = "Браузер не дал записать рекорд в localStorage.";
}

function setStatus(text) {
  if (statusEl.textContent !== text) statusEl.textContent = text;
}

function paint() {
  const grid = game.grid;
  grid.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = cells[rowIndex * 4 + colIndex];
      cell.dataset.v = String(value || 0);
      cell.textContent = value ? String(value) : "";
    });
  });
  stage.classList.toggle("is-over", game.over);
  stage.classList.toggle("is-won", game.won && !game.over);
}

function sync(result) {
  scoreEl.textContent = String(game.score);
  if (game.score > 0) {
    const saved = commitBest("twenty", game.score, "max");
    if (saved.best) bestEl.textContent = String(saved.best);
    if (!saved.saved) noteStore();
  }
  paint();
  if (result.over && result.won) setStatus(`Ходов нет. Плитка 2048 собрана. Счёт ${game.score}.`);
  else if (result.over) setStatus(`Ходов больше нет. Счёт ${game.score}.`);
  else if (result.won) setStatus("Плитка 2048 есть. Можно продолжать.");
  else if (result.moved) setStatus("Игра идёт.");
}

function play(dir) {
  if (document.querySelector("dialog[open]")) return;
  sync(game.move(dir));
}

function fresh() {
  game.reset();
  scoreEl.textContent = "0";
  showBest();
  setStatus("Стрелки, WASD или свайп. Одинаковые плитки сливаются.");
  paint();
}

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (document.querySelector("dialog[open]")) return;
  const dir = CODES[event.code];
  if (!dir) return;
  event.preventDefault();
  play(dir);
});

document.querySelector("#pad").addEventListener("click", (event) => {
  const button = event.target.closest("[data-dir]");
  if (!button) return;
  play(button.dataset.dir);
});

let origin = null;
board.addEventListener("pointerdown", (event) => {
  origin = { x: event.clientX, y: event.clientY };
});
board.addEventListener("pointerup", (event) => {
  if (!origin) return;
  const dx = event.clientX - origin.x;
  const dy = event.clientY - origin.y;
  origin = null;
  if (Math.hypot(dx, dy) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) play(dx > 0 ? "right" : "left");
  else play(dy > 0 ? "down" : "up");
});
board.addEventListener("pointercancel", () => {
  origin = null;
});

document.querySelector("#restart").addEventListener("click", fresh);
showBest();
fresh();
