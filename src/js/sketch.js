/**
 * Canvas Renderer (p5.js)
 *
 * Draws the 50×50 grid with:
 *  - Per-cell color fills
 *  - Hover preview (ghost dot + pitch row guide)
 *  - Animated playhead column highlight
 *  - Subtle column activity markers
 */

import p5 from 'p5';
import { GRID_COLS, GRID_ROWS } from './grid.js';
import { COLORS } from './colors.js';
import { rowToNote } from './scale.js';
import { currentPlayCol } from './player.js';

export const CELL = 13; // px per cell

/**
 * Hover state shared between sketch and main.js.
 * Updated by sketch mouseMoved, read by main.js.
 */
export const hover = { row: -1, col: -1 };

let _grid = null;
let _selectedColor = 0;

/** @type {((row: number, col: number) => void) | null} */
let _onCellClick = null;

/** Inject current grid reference (updated reference is re-read each frame). */
export function setGrid(grid) {
  _grid = grid;
}
export function setSelectedColor(idx) {
  _selectedColor = idx;
}
export function setOnCellClick(fn) {
  _onCellClick = fn;
}

// ─── Hover info DOM ────────────────────────────────────────
function renderHoverInfo(row, col) {
  const note = rowToNote(row);
  const existing = _grid[row][col];
  const hi = document.getElementById('hover-info');
  hi.classList.add('active');

  if (existing) {
    const c = COLORS[existing.colorIdx];
    hi.innerHTML = `<span class="h-note">${note}</span> · ${c.name} · col ${col + 1}, row ${row + 1} · <em style="color:var(--text-dim)">occupied</em>`;
  } else {
    const c = COLORS[_selectedColor];
    hi.innerHTML = `<span class="h-note">${note}</span> · ${c.name} · col ${col + 1}, row ${row + 1}`;
  }
}

function clearHoverInfo() {
  const hi = document.getElementById('hover-info');
  hi.textContent = 'Move over the grid to preview a cell';
  hi.classList.remove('active');
}

// ─── p5 sketch ─────────────────────────────────────────────
export function createSketch(containerId) {
  new p5((p) => {
    p.setup = () => {
      const cnv = p.createCanvas(GRID_COLS * CELL, GRID_ROWS * CELL);
      cnv.parent(containerId);
      p.frameRate(30);
      p.colorMode(p.RGB, 255);
    };

    p.draw = () => {
      if (!_grid) return;
      p.background(10, 13, 24);

      const playCol = currentPlayCol();

      // ── Grid lines ──
      p.stroke(25, 32, 55);
      p.strokeWeight(0.5);
      for (let c = 0; c <= GRID_COLS; c++)
        p.line(c * CELL, 0, c * CELL, GRID_ROWS * CELL);
      for (let r = 0; r <= GRID_ROWS; r++)
        p.line(0, r * CELL, GRID_COLS * CELL, r * CELL);

      // ── Column activity underlay ──
      p.noStroke();
      for (let c = 0; c < GRID_COLS; c++) {
        if (c === playCol) continue;
        for (let r = 0; r < GRID_ROWS; r++) {
          if (_grid[r][c]) {
            p.fill(201, 168, 76, 8);
            p.rect(c * CELL, 0, CELL, GRID_ROWS * CELL);
            break;
          }
        }
      }

      // ── Placed notes ──
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (!_grid[r][c]) continue;
          const col = COLORS[_grid[r][c].colorIdx];
          const hc = p.color(col.hex);
          const isActive = c === playCol;

          p.noStroke();
          p.fill(p.red(hc), p.green(hc), p.blue(hc), isActive ? 255 : 210);
          p.rect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 1);

          if (isActive) {
            p.fill(p.red(hc), p.green(hc), p.blue(hc), 50);
            p.rect(c * CELL, r * CELL, CELL, CELL, 1);
          }
        }
      }

      // ── Playhead line ──
      if (playCol >= 0) {
        p.stroke(201, 168, 76, 150);
        p.strokeWeight(1.5);
        p.line(playCol * CELL, 0, playCol * CELL, GRID_ROWS * CELL);
        p.line((playCol + 1) * CELL, 0, (playCol + 1) * CELL, GRID_ROWS * CELL);
      }

      // ── Hover ghost ──
      const { row: hr, col: hc } = hover;
      if (hr >= 0 && hc >= 0 && !_grid[hr][hc]) {
        const col = COLORS[_selectedColor];
        const hexC = p.color(col.hex);
        p.noStroke();
        p.fill(p.red(hexC), p.green(hexC), p.blue(hexC), 55);
        p.rect(hc * CELL + 1, hr * CELL + 1, CELL - 2, CELL - 2, 1);

        // Row pitch guide line
        p.stroke(p.red(hexC), p.green(hexC), p.blue(hexC), 35);
        p.strokeWeight(0.5);
        p.line(0, hr * CELL + CELL / 2, GRID_COLS * CELL, hr * CELL + CELL / 2);
      }
    };

    p.mouseMoved = () => {
      const col = Math.floor(p.mouseX / CELL);
      const row = Math.floor(p.mouseY / CELL);
      if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
        hover.row = row;
        hover.col = col;
        renderHoverInfo(row, col);
      } else {
        hover.row = -1;
        hover.col = -1;
        clearHoverInfo();
      }
    };

    p.mouseExited = () => {
      hover.row = -1;
      hover.col = -1;
      clearHoverInfo();
    };

    p.mouseClicked = () => {
      if (
        p.mouseX < 0 ||
        p.mouseX > p.width ||
        p.mouseY < 0 ||
        p.mouseY > p.height
      )
        return;
      const col = Math.floor(p.mouseX / CELL);
      const row = Math.floor(p.mouseY / CELL);
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
      _onCellClick?.(row, col);
    };
  });
}
