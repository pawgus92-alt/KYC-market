const parties = {
  casp: {
    title: "Северная биржа",
    role: "Обязанное лицо",
    basis: "Основание обработки — правовая обязанность AML, не согласие в оферте. Отказ останавливает открытие счёта. Архив, который закон велит хранить, эта страница не удаляет.",
    mode: "dossier",
    items: [
      "Документ и результат живости — в досье этой биржи",
      "Страна проживания — в досье этой биржи",
      "Скрининг санкций и PEP — только MLRO биржи, приложению причина не показывается",
    ],
  },
  wallet: {
    title: "Кошелёк «Порог»",
    role: "Не обязанное лицо",
    basis: "Каждая строка — отдельное согласие на один предикат. Это не допуск AML и биржу не открывает. Паспорт, селфи и адрес в набор не входят.",
    mode: "predicate",
    items: [
      { id: "age", label: "Старше 18 лет, без даты рождения" },
      { id: "region", label: "Страна входит в разрешённый список, без названия страны" },
    ],
  },
  open: {
    title: "Протокол без программы AML",
    role: "Выдача закрыта",
    basis: "Приложению, которое хочет значок вместо собственной проверки, досье и статус не отдаются. Обход чужого отказа здесь тоже не делается.",
    mode: "blocked",
    items: [],
  },
};

const requestEl = document.querySelector("#request");
const journalEl = document.querySelector("#journal");
const form = document.querySelector("#pilot-form");
const formError = document.querySelector("#form-error");
const formResult = document.querySelector("#form-result");

const state = {
  party: "casp",
  picked: new Set(),
  decision: null,
  log: [],
};

function withheldAlways() {
  return ["Скан паспорта другим приложениям", "Селфи", "Адрес и налоговый номер", "Причина совпадения со списком санкций"];
}

function render() {
  const party = parties[state.party];
  const pieces = [
    `<p class="eyebrow">${party.role}</p>`,
    `<h3>${party.title}</h3>`,
    `<p class="basis">${party.basis}</p>`,
  ];

  if (party.mode === "dossier") {
    pieces.push(`<ul class="attr-list">${party.items.map((item) => `<li class="attr-static">${item}</li>`).join("")}</ul>`);
    pieces.push(`<div class="actions">
      <button type="button" class="btn btn-primary" data-act="allow">Передать досье этой бирже</button>
      <button type="button" class="btn btn-ghost" data-act="refuse">Отказаться</button>
    </div>`);
  }

  if (party.mode === "predicate") {
    pieces.push(`<ul class="attr-list">${party.items.map((item) => `
      <li>
        <label>
          <input type="checkbox" data-attr="${item.id}" ${state.picked.has(item.id) ? "checked" : ""} />
          <span>${item.label}</span>
        </label>
      </li>`).join("")}</ul>`);
    pieces.push(`<div class="actions">
      <button type="button" class="btn btn-primary" data-act="allow" ${state.picked.size ? "" : "disabled"}>Разрешить отмеченное</button>
      <button type="button" class="btn btn-ghost" data-act="refuse">Ничего не отдавать</button>
      ${state.decision === "allowed" ? `<button type="button" class="btn btn-ghost" data-act="revoke">Снять согласие на будущие выдачи</button>` : ""}
    </div>`);
  }

  if (party.mode === "blocked") {
    pieces.push(`<div class="actions"><button type="button" class="btn btn-ghost" data-act="block">Оставить выдачу закрытой</button></div>`);
  }

  pieces.push(resultMarkup(party));
  requestEl.innerHTML = pieces.join("");
  renderJournal();
}

function resultMarkup(party) {
  if (!state.decision) return "";
  if (state.decision === "refused" || state.decision === "blocked") {
    return `<div class="result no"><strong>Ничего не передано.</strong><p>Получатель не увидел ни статуса, ни документов. Обход проверки не предлагается.</p></div>`;
  }
  if (state.decision === "revoked") {
    return `<div class="result wait"><strong>Будущие выдачи кошельку остановлены.</strong><p>Если у биржи уже есть AML-архив, эта кнопка его не стирает: срок задаёт закон.</p></div>`;
  }
  if (party.mode === "dossier") {
    return `<div class="result ok"><strong>Биржа получила только своё досье.</strong><ul>${party.items.map((item) => `<li>${item}</li>`).join("")}</ul><p>Другие приложения в этой выдаче не участвовали.</p></div>`;
  }
  const given = party.items.filter((item) => state.picked.has(item.id));
  return `<div class="result ok"><strong>Кошелёк получил только отмеченные ответы.</strong><ul>${given.map((item) => `<li>${item.label}</li>`).join("")}</ul><p>Не передано: ${withheldAlways().join("; ")}.</p></div>`;
}

function renderJournal() {
  if (!state.log.length) {
    journalEl.innerHTML = `<li class="empty">Решений пока нет.</li>`;
    return;
  }
  journalEl.innerHTML = state.log.map((line) => `<li>${line}</li>`).join("");
}

function stamp(text) {
  const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  state.log.unshift(`${time} · ${text}`);
  state.log = state.log.slice(0, 6);
}

if (requestEl && journalEl) {
document.querySelectorAll('input[name="party"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    state.party = input.value;
    state.picked.clear();
    state.decision = null;
    render();
  });
});

requestEl.addEventListener("change", (event) => {
  const box = event.target.closest("[data-attr]");
  if (!box) return;
  if (box.checked) state.picked.add(box.dataset.attr);
  else state.picked.delete(box.dataset.attr);
  state.decision = null;
  render();
});

requestEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-act]");
  if (!button || button.disabled) return;
  const party = parties[state.party];
  const act = button.dataset.act;
  if (act === "allow" && party.mode === "predicate" && state.picked.size === 0) return;
  state.decision = act === "allow" ? "allowed" : act === "revoke" ? "revoked" : act === "block" ? "blocked" : "refused";
  if (state.decision === "allowed" && party.mode === "dossier") {
    stamp(`${party.title}: передано досье этой биржи. Другим приложениям ничего не отдано.`);
  } else if (state.decision === "allowed") {
    const names = party.items.filter((item) => state.picked.has(item.id)).map((item) => item.label).join("; ");
    stamp(`${party.title}: отданы только предикаты — ${names}.`);
  } else if (state.decision === "revoked") {
    stamp(`${party.title}: согласие на будущие выдачи снято. AML-архив биржи, если он есть, не удалён.`);
  } else if (state.decision === "blocked") {
    stamp(`${party.title}: выдача не открывалась.`);
  } else {
    stamp(`${party.title}: отказ. Данные не переданы.`);
  }
  render();
});
render();
}

if (form && formError && formResult) {
form.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.textContent = "";
  formResult.hidden = true;
  const data = new FormData(form);
  const org = String(data.get("org") || "").trim();
  const country = String(data.get("country") || "").trim();
  const role = String(data.get("role") || "");
  const email = String(data.get("email") || "").trim();
  const ack = data.get("ack");
  if (!org || !country || !role || !email || !ack || !email.includes("@")) {
    formError.textContent = "Заполните организацию, страну, роль и рабочую почту, затем подтвердите, что это макет.";
    return;
  }
  const next = {
    casp: "Следующий настоящий шаг — DPIA, договор процессора и письменный вывод counsel страны «" + country + "». Документы людей на этом шаге ещё не собираются.",
    wallet: "Кошелёк может просить только предикат и только после того, как досье уже ведёт лицензированная фирма. Значок вместо её программы здесь не выдаётся.",
    other: "Сначала нужно назвать обязанное лицо, которое останется контролёром досье. Без него пилот с документами не начинается.",
  };
  formResult.hidden = false;
  formResult.replaceChildren();
  const heading = document.createElement("h3");
  heading.textContent = "Заявка осталась в этой вкладке";
  const sent = document.createElement("p");
  sent.textContent = `${org}, ${country}. Письмо на ${email} не отправлено: у макета нет сервера заявок и нет приёма документов.`;
  const step = document.createElement("p");
  step.textContent = next[role];
  formResult.append(heading, sent, step);
  formResult.scrollIntoView({ block: "nearest" });
});
}
