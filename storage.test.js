import assert from "node:assert/strict";
import test from "node:test";

function installStore() {
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
  return store;
}

test("records, plays, and ideas stay in localStorage", async () => {
  const store = installStore();
  const { commitBest, readBest, rememberPlay, readPlays, saveIdea, readIdeas } = await import(`./storage.js?t=${Date.now()}`);

  assert.equal(readBest("snake"), 0);
  assert.equal(commitBest("snake", 3, "max").improved, true);
  assert.equal(commitBest("snake", 2, "max").improved, false);
  assert.equal(readBest("snake"), 3);
  assert.equal(commitBest("snake", 5, "max").best, 5);

  assert.equal(commitBest("memory", 12, "min").best, 12);
  assert.equal(commitBest("memory", 14, "min").improved, false);
  assert.equal(commitBest("memory", 9, "min").best, 9);

  rememberPlay("snake");
  rememberPlay("snake");
  assert.equal(readPlays().snake, 2);

  saveIdea("  Гонки  ", "  Короткие заезды на три круга. ");
  saveIdea("ок", "мало");
  const ideas = readIdeas();
  assert.equal(ideas.length, 1);
  assert.equal(ideas[0].title, "Гонки");
  assert.equal(ideas[0].idea, "Короткие заезды на три круга.");

  store.set("fmg.best", "{");
  assert.equal(readBest("snake"), 0);
});
