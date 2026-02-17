/**
 * Pitch mapping: vertical row position → musical note.
 *
 * Row 0  = top  = highest pitch
 * Row 49 = bottom = lowest pitch
 *
 * Uses a natural minor scale (Aeolian mode on C) spread across 3 octaves.
 * Resonant and expressive for a collective ambient composition.
 */

const SCALE = [
  'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4',
  'C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3',
];

const GRID_ROWS = 50;

/**
 * Map a grid row index (0 = top/high, GRID_ROWS-1 = bottom/low)
 * to a note name string suitable for Tone.js.
 *
 * @param {number} row
 * @returns {string} e.g. "A4"
 */
export function rowToNote(row) {
  const idx = Math.floor((row / GRID_ROWS) * SCALE.length);
  return SCALE[Math.min(idx, SCALE.length - 1)];
}
