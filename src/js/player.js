/**
 * Playback Engine (Tone.js)
 *
 * Schedules melody events on the Tone.js Transport and provides
 * play/pause/stop controls.
 */

import * as Tone from 'tone';
import { buildMelodyEvents, estimateDuration } from './melody.js';

// ─── Synth chain ───────────────────────────────────────────
const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.35 }).toDestination();

export const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.04, decay: 0.2, sustain: 0.5, release: 1.2 },
}).connect(reverb);

Tone.getDestination().volume.value = -10;

// ─── State ─────────────────────────────────────────────────
let _isPlaying = false;
let _currentCol = -1;

export const isPlaying = () => _isPlaying;
export const currentPlayCol = () => _currentCol;

/**
 * Callbacks set by the UI layer.
 * @type {{ onColChange: (col: number, note: string) => void, onStop: () => void }}
 */
const callbacks = {
  onColChange: () => {},
  onStop: () => {},
};

export function onPlaybackColChange(fn) { callbacks.onColChange = fn; }
export function onPlaybackStop(fn)      { callbacks.onStop = fn; }

// ─── Controls ──────────────────────────────────────────────

/** Start (or resume) playback from the beginning. */
export async function startPlayback(grid, bpm) {
  await Tone.start();

  const { events } = buildMelodyEvents(grid);
  const noteEvents = events.filter(e => e.type === 'note');
  if (noteEvents.length === 0) return false; // nothing to play

  Tone.getTransport().cancel();
  Tone.getTransport().bpm.value = bpm;

  _isPlaying = true;
  _currentCol = -1;

  const beatDur = { '8n': 0.5, '4n': 1.0, '2n': 2.0 };
  const bps = bpm / 60;
  let time = 0; // in beats

  for (const ev of events) {
    if (ev.type === 'note') {
      const scheduledTime = time / bps;
      const captured = { ...ev };
      Tone.getTransport().schedule((toneTime) => {
        synth.triggerAttackRelease(
          captured.note,
          captured.duration,
          toneTime,
          captured.velocity
        );
        _currentCol = captured.col;
        callbacks.onColChange(captured.col, captured.note);
      }, scheduledTime);
      time += beatDur[ev.duration] ?? 1;
    } else {
      time += ev.units * 0.5;
    }
  }

  // Schedule end callback
  const totalSec = estimateDuration(events, bpm);
  Tone.getTransport().schedule(() => {
    stopPlayback();
  }, totalSec + 0.1);

  Tone.getTransport().start();
  return true;
}

/** Stop playback and reset state. */
export function stopPlayback() {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  _isPlaying = false;
  _currentCol = -1;
  callbacks.onStop();
}

/** Preview a single note immediately (e.g. on cell placement). */
export function previewNote(note, duration, velocity) {
  Tone.start().then(() => {
    synth.triggerAttackRelease(note, duration, Tone.now(), velocity);
  });
}

/** Update Transport BPM without stopping playback. */
export function setTransportBpm(bpm) {
  Tone.getTransport().bpm.value = bpm;
}

/** Set master volume in dB. */
export function setMasterVolume(db) {
  Tone.getDestination().volume.value = db;
}
