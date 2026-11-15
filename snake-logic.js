export function createSnake(options = {}) {
  const cols = options.cols ?? 16;
  const rows = options.rows ?? 16;
  const random = options.random ?? Math.random;
  let snake;
  let dir;
  let queued;
  let food;
  let score;
  let alive;
  let started;
  let won;

  function placeFood(blocked) {
    const free = [];
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (!blocked.some((part) => part.x === x && part.y === y)) free.push({ x, y });
      }
    }
    if (!free.length) return null;
    return free[Math.floor(random() * free.length)];
  }

  function reset() {
    if (options.snake) snake = options.snake.map((part) => ({ x: part.x, y: part.y }));
    else {
      const y = Math.floor(rows / 2);
      const x = Math.floor(cols / 2);
      snake = [
        { x, y },
        { x: x - 1, y },
        { x: x - 2, y },
      ];
    }
    dir = options.dir ? { x: options.dir.x, y: options.dir.y } : { x: 1, y: 0 };
    queued = null;
    score = 0;
    alive = true;
    started = false;
    won = false;
    food = options.food ? { x: options.food.x, y: options.food.y } : placeFood(snake);
  }

  function turn(next) {
    if (!next || !alive || won) return false;
    if (next.x === -dir.x && next.y === -dir.y) return false;
    if (!started) {
      dir = { x: next.x, y: next.y };
      started = true;
      queued = null;
      return true;
    }
    queued = { x: next.x, y: next.y };
    return true;
  }

  function tick() {
    if (!alive || !started || won) {
      return { score, alive, started, won, ate: false, moved: false };
    }
    if (queued) {
      dir = queued;
      queued = null;
    }
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
      alive = false;
      return { score, alive, started, won, ate: false, moved: false };
    }
    const ate = Boolean(food && food.x === head.x && food.y === head.y);
    const trail = ate ? snake : snake.slice(0, -1);
    if (trail.some((part) => part.x === head.x && part.y === head.y)) {
      alive = false;
      return { score, alive, started, won, ate: false, moved: false };
    }
    snake = [head, ...trail];
    if (ate) {
      score += 1;
      food = placeFood(snake);
      if (!food) won = true;
    }
    return { score, alive, started, won, ate, moved: true };
  }

  reset();

  return {
    cols,
    rows,
    reset,
    turn,
    tick,
    get state() {
      return {
        snake: snake.map((part) => ({ x: part.x, y: part.y })),
        dir: { x: dir.x, y: dir.y },
        food: food ? { x: food.x, y: food.y } : null,
        score,
        alive,
        started,
        won,
      };
    },
  };
}
