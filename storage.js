const BEST_KEY = "fmg.best";
const PLAYS_KEY = "fmg.plays";
const IDEAS_KEY = "fmg.ideas";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readBest(id) {
  const all = readJson(BEST_KEY, {});
  const numeric = Number(all[id]);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

export function commitBest(id, value, kind = "max") {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { best: readBest(id), improved: false, saved: true };
  }
  const all = readJson(BEST_KEY, {});
  const prev = Number(all[id]);
  const has = Number.isFinite(prev) && prev > 0;
  const improved = kind === "min" ? !has || numeric < prev : !has || numeric > prev;
  if (!improved) return { best: has ? prev : 0, improved: false, saved: true };
  all[id] = numeric;
  const saved = writeJson(BEST_KEY, all);
  return { best: saved ? numeric : has ? prev : 0, improved: saved, saved };
}

export function readPlays() {
  const all = readJson(PLAYS_KEY, {});
  return all && !Array.isArray(all) ? all : {};
}

export function rememberPlay(id) {
  const all = readPlays();
  const next = (Number(all[id]) || 0) + 1;
  all[id] = next;
  writeJson(PLAYS_KEY, all);
  return next;
}

export function readIdeas() {
  const list = readJson(IDEAS_KEY, []);
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item && typeof item.title === "string" && typeof item.idea === "string");
}

export function saveIdea(title, idea) {
  const cleanTitle = String(title ?? "").trim().slice(0, 60);
  const cleanIdea = String(idea ?? "").trim().slice(0, 280);
  const current = readIdeas();
  if (cleanTitle.length < 2 || cleanIdea.length < 8) return { ideas: current, saved: false };
  const next = [{ title: cleanTitle, idea: cleanIdea, at: new Date().toISOString() }, ...current].slice(0, 20);
  const saved = writeJson(IDEAS_KEY, next);
  return { ideas: saved ? next : current, saved };
}
