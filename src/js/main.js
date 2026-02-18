/**
 * main.js — Application entry point
 *
 * Wires together: grid state, p5 sketch, melody engine,
 * Tone.js player, and the DOM/UI layer.
 */

import '../css/style.css';

import {
  GRID_COLS,
  GRID_ROWS,
  createGrid,
  // hasPlacedToday,
  markPlacedToday,
  // resetTodayToken,
  seedDemoNotes,
  gridStats,
} from './grid.js';

import { COLORS, getDuration, getVelocity } from './colors.js';

import { rowToNote } from './scale.js';

import { buildMelodyEvents, estimateDuration } from './melody.js';

import {
  startPlayback,
  stopPlayback,
  previewNote,
  setTransportBpm,
  setMasterVolume,
  isPlaying,
  onPlaybackColChange,
  onPlaybackStop,
} from './player.js';

import {
  createSketch,
  setGrid,
  setSelectedColor,
  setOnCellClick,
} from './sketch.js';

import {
  showToast,
  buildPalette,
  setHeaderNotes,
  setHeaderDays,
  updateFillBar,
  updateMelodyStats,
  updateGridStats,
  updatePhase,
  updateDayToken,
  setDeadlineDate,
  updatePlayhead,
  clearPlayhead,
  setPlayBtnState,
} from './ui.js';

// ═══════════════════════════════════════════════════════════
// EXPERIMENT CONFIG
// ═══════════════════════════════════════════════════════════
const EXPERIMENT_DAYS = 28;
/** Demo: pretend the experiment started 2 days ago */
const EXPERIMENT_START = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
let grid = createGrid();
let selectedColor = 0;
let tempo = 90;

// Seed demo notes so the grid isn't empty on first run
seedDemoNotes(grid, 218, COLORS.length);

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════

// Palette
buildPalette((idx) => {
  selectedColor = idx;
  setSelectedColor(idx);
});

// p5 sketch
setGrid(grid);
setSelectedColor(selectedColor);
setOnCellClick(handleCellClick);
createSketch('canvas-container');

// Playback callbacks
onPlaybackColChange((col, note) => {
  updatePlayhead(col, note);
});
onPlaybackStop(() => {
  setPlayBtnState(false);
  clearPlayhead();
});

// Footer controls
document.getElementById('btn-play').addEventListener('click', handlePlayPause);
document.getElementById('btn-stop').addEventListener('click', handleStop);
document.getElementById('btn-clear').addEventListener('click', handleClear);

document.getElementById('tempo-slider').addEventListener('input', (e) => {
  tempo = parseInt(e.target.value);
  document.getElementById('tempo-disp').textContent = tempo;
  setTransportBpm(tempo);
  refreshStats();
});

document.getElementById('vol-slider').addEventListener('input', (e) => {
  setMasterVolume(parseInt(e.target.value));
});

// Deadline display
const deadline = new Date(
  EXPERIMENT_START.getTime() + EXPERIMENT_DAYS * 86400000,
);
setDeadlineDate(deadline);

// Initial stats render
refreshStats();

// ═══════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════

function handleCellClick(row, col) {
  if (grid[row][col]) {
    showToast('This cell is already occupied.');
    return;
  }
  // if (hasPlacedToday()) {
  //   showToast("You've already placed your note today. Come back tomorrow!");
  //   return;
  // }

  grid[row][col] = { colorIdx: selectedColor };
  markPlacedToday();

  const color = COLORS[selectedColor];
  const note = rowToNote(row);
  previewNote(note, getDuration(color), getVelocity(color));
  showToast(`♩ ${note} placed — ${color.name}`);

  refreshStats();
}

async function handlePlayPause() {
  if (isPlaying()) {
    stopPlayback();
    return;
  }
  const started = await startPlayback(grid, tempo);
  if (!started) {
    showToast('Place some notes on the grid first!');
    return;
  }
  setPlayBtnState(true);
}

function handleStop() {
  stopPlayback();
}

function handleClear() {
  if (!confirm('Clear the entire grid? This is irreversible.')) return;
  grid = createGrid();
  // resetTodayToken();
  stopPlayback();
  seedDemoNotes(grid, 218, COLORS.length);
  setGrid(grid); // give sketch the new reference
  refreshStats();
  showToast('Grid cleared. Demo notes restored.');
}

// ═══════════════════════════════════════════════════════════
// STATS REFRESH
// ═══════════════════════════════════════════════════════════

function refreshStats() {
  const { total, activeCols } = gridStats(grid);
  const { events, compressed } = buildMelodyEvents(grid);
  const gridSize = GRID_COLS * GRID_ROWS;
  const fillRatio = total / gridSize;

  // Duration string
  const durSec = estimateDuration(events, tempo);
  let durationStr = '—';
  if (durSec >= 1) {
    const m = Math.floor(durSec / 60);
    const s = Math.floor(durSec % 60)
      .toString()
      .padStart(2, '0');
    durationStr = `~${m}:${s}`;
  }

  // Days left
  const daysLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 86400000));

  setHeaderNotes(total);
  setHeaderDays(daysLeft);
  updateFillBar(total, gridSize);
  updateMelodyStats({
    activeCols,
    gridCols: GRID_COLS,
    compressed,
    durationStr,
    bpm: tempo,
  });
  updateGridStats({ total, gridSize });
  updatePhase(fillRatio);
  // updateDayToken(hasPlacedToday());
}
