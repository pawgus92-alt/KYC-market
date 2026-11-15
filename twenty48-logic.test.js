import assert from "node:assert/strict";
import test from "node:test";
import { createTwenty48, slideLine } from "./twenty48-logic.js";

test("a line merges each pair once", () => {
  assert.deepEqual(slideLine([2, 2, 2, 0]), { line: [4, 2, 0, 0], gained: 4 });
  assert.deepEqual(slideLine([2, 2, 2, 2]), { line: [4, 4, 0, 0], gained: 8 });
  assert.deepEqual(slideLine([4, 4, 8, 0]), { line: [8, 8, 0, 0], gained: 8 });
  assert.deepEqual(slideLine([2, 0, 0, 2]), { line: [4, 0, 0, 0], gained: 4 });
  assert.deepEqual(slideLine([2, 4, 8, 16]), { line: [2, 4, 8, 16], gained: 0 });
});

test("moves slide to the wall and spawn one tile", () => {
  const game = createTwenty48({
    random: () => 0,
    grid: [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  });
  const left = game.move("left");
  assert.equal(left.moved, true);
  assert.equal(left.score, 4);
  assert.equal(game.grid[0][0], 4);
  assert.equal(game.grid[0][1], 2);

  game.reset();
  const right = game.move("right");
  assert.equal(right.score, 4);
  assert.equal(game.grid[0][3], 4);
  assert.equal(game.grid[0][0], 2);

  game.reset();
  const upGame = createTwenty48({
    random: () => 0,
    grid: [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  });
  upGame.move("up");
  assert.equal(upGame.grid[0][0], 4);
  assert.equal(upGame.score, 4);
});

test("a packed row does not spawn, and a stuck board is over", () => {
  const packed = createTwenty48({
    random: () => 0,
    grid: [
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  });
  const stayed = packed.move("left");
  assert.equal(stayed.moved, false);
  assert.equal(stayed.over, false);
  assert.equal(packed.grid[0][0], 2);
  assert.equal(packed.grid[0][1], 4);

  const stuck = createTwenty48({
    random: () => 0,
    grid: [
      [2, 4, 8, 16],
      [4, 2, 4, 8],
      [2, 4, 8, 16],
      [16, 8, 4, 2],
    ],
  });
  assert.equal(stuck.over, true);
  assert.equal(stuck.move("left").moved, false);
});
