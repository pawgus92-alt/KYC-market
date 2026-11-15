export function slideLine(line) {
  const nums = line.filter((value) => value !== 0);
  const out = [];
  let gained = 0;
  for (let i = 0; i < nums.length; i += 1) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const value = nums[i] * 2;
      out.push(value);
      gained += value;
      i += 1;
    } else {
      out.push(nums[i]);
    }
  }
  while (out.length < 4) out.push(0);
  return { line: out, gained };
}

function emptyGrid() {
  return [0, 1, 2, 3].map(() => [0, 0, 0, 0]);
}

function canMove(grid) {
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const value = grid[row][col];
      if (value === 0) return true;
      if (col + 1 < 4 && value === grid[row][col + 1]) return true;
      if (row + 1 < 4 && value === grid[row + 1][col]) return true;
    }
  }
  return false;
}

export function createTwenty48(options = {}) {
  const random = options.random ?? Math.random;
  let grid = emptyGrid();
  let score = 0;
  let won = false;
  let over = false;

  function spawn() {
    const open = [];
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        if (grid[row][col] === 0) open.push([row, col]);
      }
    }
    if (!open.length) return false;
    const [row, col] = open[Math.floor(random() * open.length)];
    grid[row][col] = random() < 0.9 ? 2 : 4;
    return true;
  }

  function reset() {
    score = 0;
    won = false;
    over = false;
    if (options.grid) {
      grid = options.grid.map((row) => row.slice());
      won = grid.some((row) => row.some((value) => value >= 2048));
      over = !canMove(grid);
      return;
    }
    grid = emptyGrid();
    spawn();
    spawn();
    over = !canMove(grid);
  }

  function readLine(dir, index) {
    const line = [];
    for (let step = 0; step < 4; step += 1) {
      if (dir === "left") line.push(grid[index][step]);
      else if (dir === "right") line.push(grid[index][3 - step]);
      else if (dir === "up") line.push(grid[step][index]);
      else line.push(grid[3 - step][index]);
    }
    return line;
  }

  function writeLine(dir, index, line, next) {
    for (let step = 0; step < 4; step += 1) {
      const value = line[step];
      if (dir === "left") next[index][step] = value;
      else if (dir === "right") next[index][3 - step] = value;
      else if (dir === "up") next[step][index] = value;
      else next[3 - step][index] = value;
    }
  }

  function move(dir) {
    if (over || !["left", "right", "up", "down"].includes(dir)) {
      return { moved: false, score, won, over };
    }
    const next = emptyGrid();
    let gained = 0;
    for (let index = 0; index < 4; index += 1) {
      const slid = slideLine(readLine(dir, index));
      gained += slid.gained;
      writeLine(dir, index, slid.line, next);
    }
    const moved = next.some((row, rowIndex) => row.some((value, colIndex) => value !== grid[rowIndex][colIndex]));
    if (!moved) return { moved: false, score, won, over };
    grid = next;
    score += gained;
    if (grid.some((row) => row.some((value) => value >= 2048))) won = true;
    const spawned = spawn();
    if (!spawned || !canMove(grid)) over = true;
    return { moved: true, score, won, over };
  }

  reset();

  return {
    reset,
    move,
    get score() {
      return score;
    },
    get won() {
      return won;
    },
    get over() {
      return over;
    },
    get grid() {
      return grid.map((row) => row.slice());
    },
  };
}
