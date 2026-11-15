import assert from "node:assert/strict";
import test from "node:test";
import { createSnake } from "./snake-logic.js";

const right = { x: 1, y: 0 };
const left = { x: -1, y: 0 };
const up = { x: 0, y: -1 };
const down = { x: 0, y: 1 };

test("does not move until a direction is chosen", () => {
  const game = createSnake({
    snake: [
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
    ],
    dir: right,
    food: { x: 0, y: 0 },
  });
  const before = game.tick();
  assert.equal(before.moved, false);
  assert.equal(game.state.snake[0].x, 4);
  assert.equal(game.turn(left), false);
  assert.equal(game.state.started, false);
});

test("eats food, grows, and refuses to reverse", () => {
  const game = createSnake({
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    dir: right,
    food: { x: 3, y: 2 },
    random: () => 0,
  });
  assert.equal(game.turn(right), true);
  const ate = game.tick();
  assert.equal(ate.ate, true);
  assert.equal(ate.score, 1);
  assert.equal(game.state.snake.length, 4);
  assert.deepEqual(game.state.snake[0], { x: 3, y: 2 });
  game.tick();
  game.turn(up);
  game.turn(left);
  const turned = game.tick();
  assert.equal(turned.moved, true);
  assert.equal(game.state.snake[0].y, 1);
});

test("replaces a queued turn when the new one is still legal", () => {
  const game = createSnake({
    snake: [
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
    ],
    dir: right,
    food: { x: 0, y: 0 },
  });
  game.turn(right);
  game.tick();
  game.turn(up);
  game.turn(down);
  game.tick();
  assert.equal(game.state.snake[0].y, 5);
});

test("dies on a wall and on its body, but may step into the vacated tail", () => {
  const wall = createSnake({
    snake: [
      { x: 15, y: 5 },
      { x: 14, y: 5 },
      { x: 13, y: 5 },
    ],
    dir: right,
    food: { x: 0, y: 0 },
  });
  wall.turn(right);
  assert.equal(wall.tick().alive, false);

  const body = createSnake({
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
    ],
    dir: down,
    food: { x: 0, y: 0 },
  });
  body.turn(left);
  assert.equal(body.tick().alive, false);

  const tail = createSnake({
    snake: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
    ],
    dir: up,
    food: { x: 0, y: 0 },
  });
  tail.turn(right);
  const moved = tail.tick();
  assert.equal(moved.alive, true);
  assert.equal(tail.state.snake.length, 4);
  assert.deepEqual(tail.state.snake[0], { x: 2, y: 1 });
});

test("wins when the last cell is eaten and reset clears the score", () => {
  const game = createSnake({
    cols: 2,
    rows: 2,
    snake: [
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
    dir: down,
    food: { x: 1, y: 1 },
  });
  game.turn(right);
  const result = game.tick();
  assert.equal(result.won, true);
  assert.equal(result.score, 1);
  game.reset();
  assert.equal(game.state.started, false);
  assert.equal(game.state.score, 0);
  assert.equal(game.state.won, false);
  assert.equal(game.state.snake.length, 3);
});
