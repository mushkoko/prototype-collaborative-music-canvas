/**
 * Melody Engine
 *
 * Scans the grid left-to-right (column = time unit).
 *
 * Rules:
 *  - Each column with notes → one melody event using the median-row note.
 *  - Empty columns → rest events, compressed per the spec:
 *      1–2 consecutive empty  → 1 unit each  (natural pause)
 *      3–5 consecutive empty  → 2 units total (compressed)
 *      6+  consecutive empty  → 3 units total (hard cap)
 *
 * Color of the median-row cell drives duration and velocity (not pitch).
 */

import { GRID_COLS, GRID_ROWS } from './grid.js';
import { COLORS, getDuration, getVelocity } from './colors.js';
import { rowToNote } from './scale.js';

/**
 * @typedef {{ type: 'note', col: number, note: string, duration: string, velocity: number, colorHex: string, noteCount: number }} NoteEvent
 * @typedef {{ type: 'rest', col: number, units: number }} RestEvent
 * @typedef {NoteEvent | RestEvent} MelodyEvent
 */

/**
 * Build the full sequence of melody events from the current grid state.
 *
 * @param {Array} grid
 * @returns {{ events: MelodyEvent[], compressed: number }}
 */
export function buildMelodyEvents(grid) {
  const events = [];
  let compressed = 0;
  let emptyRun = 0;
  let emptyStartCol = 0;

  const flushEmptyRun = (upToCol) => {
    if (emptyRun === 0) return;
    let units;
    if (emptyRun <= 2) {
      units = emptyRun;
    } else if (emptyRun <= 5) {
      units = 2;
      compressed++;
    } else {
      units = 3;
      compressed++;
    }
    events.push({ type: 'rest', col: emptyStartCol, units });
    emptyRun = 0;
  };

  for (let c = 0; c < GRID_COLS; c++) {
    /** @type {{ r: number, colorIdx: number }[]} */
    const filledRows = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      if (grid[r][c]) filledRows.push({ r, colorIdx: grid[r][c].colorIdx });
    }

    if (filledRows.length === 0) {
      if (emptyRun === 0) emptyStartCol = c;
      emptyRun++;
      continue;
    }

    flushEmptyRun(c);

    // Median-row rule: sort by row, pick the center element
    filledRows.sort((a, b) => a.r - b.r);
    const medianEntry = filledRows[Math.floor(filledRows.length / 2)];
    const color = COLORS[medianEntry.colorIdx];

    events.push({
      type: 'note',
      col: c,
      note: rowToNote(medianEntry.r),
      duration: getDuration(color),
      velocity: getVelocity(color),
      colorHex: color.hex,
      noteCount: filledRows.length,
    });
  }

  // Flush any trailing empty run
  flushEmptyRun(GRID_COLS);

  return { events, compressed };
}

/**
 * Estimate total melody duration in seconds at a given BPM.
 *
 * @param {MelodyEvent[]} events
 * @param {number} bpm
 * @returns {number} seconds
 */
export function estimateDuration(events, bpm) {
  const beatDur = { '8n': 0.5, '4n': 1.0, '2n': 2.0 };
  const bps = bpm / 60;
  let beats = 0;
  for (const ev of events) {
    if (ev.type === 'note') beats += beatDur[ev.duration] ?? 1;
    else beats += ev.units * 0.5;
  }
  return beats / bps;
}
