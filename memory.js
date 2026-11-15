import { commitBest, readBest, rememberPlay } from "./storage.js";
import "./site.js";

const FACES = [
  { id: "lime", label: "лаймовый круг" },
  { id: "red", label: "красный квадрат" },
  { id: "gold", label: "жёлтый ромб" },
  { id: "blue", label: "синий треугольник" },
  { id: "ring", label: "зелёное кольцо" },
  { id: "stripe", label: "полосатый квадрат" },
  { id: "cross", label: "красный крест" },
  { id: "split", label: "сине-жёлтый квадрат" },
];

const board = document.querySelector("#board");
const stage = document.querySelector("#stage");
const statusEl = document.querySelector("#status");
const movesEl = document.querySelector("#moves");
const bestEl = document.querySelector("#best");
const storeNote = document.querySelector("#store-note");

let opened = [];
let moves = 0;
let lock = false;
let timer = 0;
let matched = 0;
let warned = false;

rememberPlay("memory");

function shuffle(list) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function showBest() {
  const best = readBest("memory");
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

function deal() {
  window.clearTimeout(timer);
  opened = [];
  moves = 0;
  lock = false;
  matched = 0;
  movesEl.textContent = "0";
  stage.classList.remove("is-over", "is-won");
  showBest();
  setStatus("Откройте две карты. Одинаковые останутся лежать.");
  board.replaceChildren();
  shuffle([...FACES, ...FACES]).forEach((face, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-card";
    button.dataset.symbol = face.id;
    button.dataset.index = String(index + 1);
    button.setAttribute("aria-label", `Карта ${index + 1}, закрыта`);
    const back = document.createElement("span");
    back.className = "back";
    back.textContent = "5";
    back.setAttribute("aria-hidden", "true");
    const mark = document.createElement("span");
    mark.className = `face face-${face.id}`;
    mark.setAttribute("aria-hidden", "true");
    button.append(back, mark);
    button.addEventListener("click", () => flip(button, face));
    board.append(button);
  });
}

function flip(button, face) {
  if (lock || button.classList.contains("is-open") || button.classList.contains("is-matched")) return;
  button.classList.add("is-open");
  button.setAttribute("aria-label", `${face.label}, открыта`);
  opened.push(button);
  if (opened.length < 2) return;
  moves += 1;
  movesEl.textContent = String(moves);
  const [first, second] = opened;
  opened = [];
  if (first.dataset.symbol === second.dataset.symbol) {
    first.classList.add("is-matched");
    second.classList.add("is-matched");
    first.disabled = true;
    second.disabled = true;
    first.setAttribute("aria-label", `${face.label}, пара найдена`);
    second.setAttribute("aria-label", `${face.label}, пара найдена`);
    matched += 2;
    if (matched === FACES.length * 2) win();
    return;
  }
  lock = true;
  timer = window.setTimeout(() => {
    [first, second].forEach((card) => {
      card.classList.remove("is-open");
      card.setAttribute("aria-label", `Карта ${card.dataset.index}, закрыта`);
    });
    lock = false;
  }, 700);
}

function win() {
  stage.classList.add("is-won");
  const mark = readBest("memory");
  const saved = commitBest("memory", moves, "min");
  if (saved.best) bestEl.textContent = String(saved.best);
  if (!saved.saved) noteStore();
  const record = !mark || moves < mark ? " Новый рекорд." : "";
  setStatus(`Все пары найдены за ${moves} ходов.${record}`);
}

document.querySelector("#restart").addEventListener("click", deal);
deal();
