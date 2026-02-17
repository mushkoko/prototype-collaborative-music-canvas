/**
 * UI helpers — pure DOM manipulation, no state logic.
 *
 * All functions receive data as arguments; they don't read
 * from any module-level state directly.
 */

import { COLORS, DUR_LABEL, VEL_LABEL } from './colors.js';

// ─── Toast ─────────────────────────────────────────────────

let _toastTimer = null;

/**
 * Show a short notification at the bottom of the screen.
 * @param {string} msg
 * @param {number} [duration=2200]
 */
export function showToast(msg, duration = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// ─── Header stats ──────────────────────────────────────────

export function setHeaderNotes(n) {
  document.getElementById('hdr-notes').textContent = n;
}

export function setHeaderDays(n) {
  document.getElementById('hdr-days').textContent = n;
}

// ─── Fill bar ──────────────────────────────────────────────

export function updateFillBar(total, max = 2500) {
  const pct = (total / max) * 100;
  document.getElementById('fill-pct').textContent = pct.toFixed(2) + '%';
  document.getElementById('fill-bar').style.width = pct + '%';
}

// ─── Stats panel ───────────────────────────────────────────

export function updateMelodyStats({ activeCols, gridCols, compressed, durationStr, bpm }) {
  document.getElementById('active-cols').textContent     = `${activeCols} / ${gridCols}`;
  document.getElementById('compressed-sil').textContent = compressed;
  document.getElementById('melody-duration').textContent = durationStr ?? '—';
  document.getElementById('tempo-val').textContent       = `${bpm} bpm`;
}

export function updateGridStats({ total, gridSize }) {
  document.getElementById('empty-cells').textContent = gridSize - total;
}

// ─── Phase ─────────────────────────────────────────────────

const PHASES = [
  {
    threshold: 0.15,
    name: 'Sparse · Airy',
    desc: 'The canvas is nearly empty. Early notes echo in the silence, each one standing alone.',
  },
  {
    threshold: 0.40,
    name: 'Emergent · Rhythmic',
    desc: 'Patterns begin to form. Columns fill, the melody gains a pulse.',
  },
  {
    threshold: 0.70,
    name: 'Dense · Cohesive',
    desc: 'The grid thickens. Harmony emerges from the collective placement.',
  },
  {
    threshold: 1.01,
    name: 'Full · Ceremonial',
    desc: 'Nearly complete. The canvas approaches its final form. The premiere draws near.',
  },
];

export function updatePhase(fillRatio) {
  const phase = PHASES.find(p => fillRatio < p.threshold) ?? PHASES[PHASES.length - 1];
  document.getElementById('phase-name').textContent = phase.name;
  document.getElementById('phase-desc').textContent = phase.desc;
}

// ─── Day token ─────────────────────────────────────────────

export function updateDayToken(placed) {
  document.getElementById('token-dot').className = `token-dot ${placed ? 'used' : 'available'}`;
  document.getElementById('token-text').innerHTML = placed
    ? 'Note placed today.<br>Come back tomorrow to add another.'
    : 'Your note is available today.<br>Click any empty cell.';
}

// ─── Experiment deadline ───────────────────────────────────

export function setDeadlineDate(date) {
  document.getElementById('deadline-date').textContent =
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Playhead ──────────────────────────────────────────────

export function updatePlayhead(col, note) {
  document.getElementById('playhead-info').innerHTML =
    `Column <span>${col + 1}</span> / 50 · <span>${note}</span>`;
}

export function clearPlayhead() {
  document.getElementById('playhead-info').textContent = 'Column — / 50';
}

// ─── Play button ───────────────────────────────────────────

export function setPlayBtnState(playing) {
  const btn = document.getElementById('btn-play');
  btn.textContent = playing ? '⏸ Pause' : '▶ Play';
  btn.classList.toggle('playing', playing);
}

// ─── Palette ───────────────────────────────────────────────

/**
 * Build the color swatch list in #color-swatches.
 * @param {(idx: number) => void} onSelect
 */
export function buildPalette(onSelect) {
  const container = document.getElementById('color-swatches');
  container.innerHTML = '';

  COLORS.forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'swatch' + (i === 0 ? ' active' : '');
    el.dataset.idx = i;
    el.innerHTML = `
      <div class="swatch-dot" style="background:${c.hex};color:${c.hex}"></div>
      <div class="swatch-info">
        <div class="swatch-name">${c.name}</div>
        <div class="swatch-meta">${DUR_LABEL[c.temp]} · ${VEL_LABEL[c.bright]}</div>
      </div>`;
    el.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      onSelect(i);
    });
    container.appendChild(el);
  });
}
