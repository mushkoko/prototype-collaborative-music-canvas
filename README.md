# Collaborative Musical Canvas Prototype

> A live, time-bound social experiment — one note per person per day.

Participants place a single colored note on a shared 50×50 grid each day. The grid generates an evolving melody, scanned left-to-right. When the grid fills (or the deadline arrives), the experiment ends with a collective premiere.

---

## Features

- **50×50 permanent grid** — cells lock once placed
- **Melody engine** — column scan with median-pitch rule and silence compression
- **12 curated colors** — temperature → note duration, brightness → velocity
- **Tone.js playback** — triangle synth with reverb, BPM + volume controls
- **p5.js renderer** — live playhead, hover pitch preview, row pitch guide
- **1-note-per-day gate** — enforced via localStorage (cookie-based, simple)
- **Phase arc** — Sparse → Emergent → Dense → Ceremonial
- **Demo mode** — unlimited note placement for easy experimentation (daily limit removed)

---

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## GitHub Pages demo deploy

```bash
npm run gh-pages:deploy"
```

---

## Project Structure

```
src/
  js/
    colors.js   — 12 color definitions + duration/velocity mappings
    scale.js    — Row → pitch mapping (C natural minor, 3 octaves)
    grid.js     — Grid state, session storage, demo seed
    melody.js   — Column scan, median-pitch rule, silence compression
    player.js   — Tone.js playback engine
    sketch.js   — p5.js canvas renderer
    ui.js       — DOM update helpers
    main.js     — Entry point, wires all modules together
  css/
    style.css   — All styles
index.html    — HTML shell
vite.config.js
```

---

## Roadmap

- [ ] **Supabase backend** — real-time grid sync across all participants
- [ ] **Contributor presence** — live count, recent placements feed
- [ ] **Experiment config** — admin panel for deadline, grid size, scale
- [ ] **Finale mode** — locked grid + scheduled premiere playback event
- [ ] **Export** — render melody to WAV / MIDI

---

## Tech Stack

| Tool                                         | Role                        |
| -------------------------------------------- | --------------------------- |
| [Vite](https://vitejs.dev)                   | Dev server & bundler        |
| [p5.js](https://p5js.org)                    | Grid canvas rendering       |
| [Tone.js](https://tonejs.github.io)          | Web Audio / melody playback |
| [Supabase](https://supabase.com) _(planned)_ | Real-time backend           |

---

## License

MIT
