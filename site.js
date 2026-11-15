import { readBest, readIdeas, readPlays, saveIdea } from "./storage.js";

const dialogState = { ready: false };

function playsLabel(count) {
  if (!count) return "ещё не открывали";
  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = "открытий";
  if (mod10 === 1 && mod100 !== 11) word = "открытие";
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = "открытия";
  return `${count} ${word}`;
}

function refreshBests() {
  document.querySelectorAll("[data-best]").forEach((node) => {
    const value = readBest(node.dataset.best);
    const unit = node.dataset.unit || "";
    node.textContent = value ? `Рекорд: ${value}${unit ? ` ${unit}` : ""}` : "Рекорд: —";
  });
}

function rankPopular() {
  const list = document.querySelector("#popular-list");
  if (!list) return;
  const plays = readPlays();
  const items = [...list.querySelectorAll("[data-game]")];
  const any = items.some((item) => Number(plays[item.dataset.game]) > 0);
  items.sort((a, b) => {
    const diff = (Number(plays[b.dataset.game]) || 0) - (Number(plays[a.dataset.game]) || 0);
    if (diff) return diff;
    return Number(a.dataset.order) - Number(b.dataset.order);
  });
  items.forEach((item, index) => {
    item.hidden = index > 2;
    const rank = item.querySelector(".rank");
    const playsNode = item.querySelector(".plays");
    if (rank) rank.textContent = String(index + 1);
    if (playsNode) playsNode.textContent = playsLabel(Number(plays[item.dataset.game]) || 0);
    list.append(item);
  });
  const note = document.querySelector("#popular-note");
  if (note) {
    note.textContent = any
      ? "Порядок по открытиям в этом браузере."
      : "Пока открытий нет — ниже игры, с которых проще начать.";
  }
}

function renderIdeas(list) {
  if (!list) return;
  const ideas = readIdeas();
  list.replaceChildren();
  if (!ideas.length) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = "Пока пусто. Идея останется только в этом браузере.";
    list.append(item);
    return;
  }
  ideas.forEach((idea) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = idea.title;
    const body = document.createElement("p");
    body.textContent = idea.idea;
    item.append(title, body);
    list.append(item);
  });
}

function ensureDialog() {
  if (dialogState.ready) return;
  const buttons = document.querySelectorAll("[data-suggest]");
  if (!buttons.length) return;
  dialogState.ready = true;

  const dialog = document.createElement("dialog");
  dialog.id = "suggest-dialog";
  const form = document.createElement("form");
  form.className = "dialog-body";
  form.noValidate = true;

  const heading = document.createElement("h2");
  heading.id = "suggest-title";
  heading.textContent = "Предложить игру";
  const intro = document.createElement("p");
  intro.textContent = "Идея сохранится только в этом браузере. На сервер ничего не отправляется.";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Название";
  const titleInput = document.createElement("input");
  titleInput.name = "title";
  titleInput.type = "text";
  titleInput.maxLength = 60;
  titleInput.autocomplete = "off";
  titleInput.required = true;
  titleLabel.append(titleInput);

  const ideaLabel = document.createElement("label");
  ideaLabel.textContent = "Как в неё играть";
  const ideaInput = document.createElement("textarea");
  ideaInput.name = "idea";
  ideaInput.maxLength = 280;
  ideaInput.required = true;
  ideaLabel.append(ideaInput);

  const error = document.createElement("p");
  error.className = "form-error";
  error.setAttribute("role", "alert");
  const ok = document.createElement("p");
  ok.className = "form-ok";
  ok.setAttribute("role", "status");

  const actions = document.createElement("div");
  actions.className = "dialog-actions";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "btn";
  cancel.textContent = "Закрыть";
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "btn btn-primary";
  submit.textContent = "Сохранить идею";
  actions.append(cancel, submit);

  const saved = document.createElement("ul");
  saved.className = "ideas dialog-ideas";
  saved.setAttribute("aria-label", "Уже сохранённые идеи");

  form.append(heading, intro, titleLabel, ideaLabel, error, ok, actions, saved);
  dialog.append(form);
  dialog.setAttribute("aria-labelledby", "suggest-title");
  document.body.append(dialog);

  cancel.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const idea = ideaInput.value.trim();
    if (title.length < 2 || idea.length < 8) {
      error.textContent = "Добавьте название (от 2 символов) и описание (от 8).";
      ok.textContent = "";
      return;
    }
    const result = saveIdea(title, idea);
    if (!result.saved) {
      error.textContent = "Браузер не дал сохранить идею в localStorage.";
      return;
    }
    titleInput.value = "";
    ideaInput.value = "";
    error.textContent = "";
    ok.textContent = "Идея сохранена в этом браузере.";
    renderIdeas(saved);
    renderIdeas(document.querySelector("#idea-list"));
  });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      error.textContent = "";
      ok.textContent = "";
      renderIdeas(saved);
      dialog.showModal();
      titleInput.focus();
    });
  });
}

function refresh() {
  refreshBests();
  rankPopular();
  renderIdeas(document.querySelector("#idea-list"));
}

function boot() {
  ensureDialog();
  refresh();
  window.addEventListener("pageshow", refresh);
}

if (typeof document !== "undefined") boot();
