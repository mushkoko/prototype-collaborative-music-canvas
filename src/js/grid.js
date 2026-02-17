/**
 * Grid state and daily-note session management.
 *
 * The grid is a 2D array: grid[row][col] = { colorIdx: number } | null
 * Cells are permanent once placed.
 */

export const GRID_COLS = 50;
export const GRID_ROWS = 50;

/** Create a fresh empty grid */
export function createGrid() {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
}

/**
 * LocalStorage key for today's note placement.
 * Resets automatically each calendar day.
 */
function todayKey() {
  return 'cmc_note_day_' + new Date().toISOString().split('T')[0];
}

export function hasPlacedToday() {
  return !!localStorage.getItem(todayKey());
}

export function markPlacedToday() {
  localStorage.setItem(todayKey(), '1');
}

export function resetTodayToken() {
  localStorage.removeItem(todayKey());
}

/**
 * Seed a small number of random demo notes so the grid
 * isn't completely empty on first load.
 *
 * @param {Array} grid
 * @param {number} [count=18]
 * @param {number} [numColors=12]
 */
export function seedDemoNotes(grid, count = 18, numColors = 12) {
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * GRID_ROWS);
    const c = Math.floor(Math.random() * GRID_COLS);
    if (!grid[r][c]) {
      grid[r][c] = { colorIdx: Math.floor(Math.random() * numColors) };
    }
  }
}

/**
 * Count total placed notes and notes-per-column.
 * @param {Array} grid
 * @returns {{ total: number, activeCols: number }}
 */
export function gridStats(grid) {
  let total = 0;
  let activeCols = 0;
  for (let c = 0; c < GRID_COLS; c++) {
    let colHasNote = false;
    for (let r = 0; r < GRID_ROWS; r++) {
      if (grid[r][c]) { total++; colHasNote = true; }
    }
    if (colHasNote) activeCols++;
  }
  return { total, activeCols };
}
