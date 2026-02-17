/**
 * 12 curated colors, each carrying musical expression metadata.
 *
 * temp   → Duration mapping:  cool=long(2n)  neutral=med(4n)  warm=short(8n)
 * bright → Velocity mapping:  dark=soft(0.28) medium=med(0.62) bright=loud(0.92)
 *
 * Pitch is determined exclusively by grid row position (see scale.js).
 */
export const COLORS = [
  { name: 'Crimson',    hex: '#E63946', temp: 'warm',    bright: 'bright'  },
  { name: 'Ember',      hex: '#F4722B', temp: 'warm',    bright: 'bright'  },
  { name: 'Amber',      hex: '#F7B731', temp: 'warm',    bright: 'bright'  },
  { name: 'Chartreuse', hex: '#9BC53D', temp: 'neutral', bright: 'medium'  },
  { name: 'Forest',     hex: '#2D9E5C', temp: 'neutral', bright: 'medium'  },
  { name: 'Jade',       hex: '#40BCD8', temp: 'neutral', bright: 'bright'  },
  { name: 'Cerulean',   hex: '#3A7BD5', temp: 'cool',    bright: 'bright'  },
  { name: 'Navy',       hex: '#1A3A6C', temp: 'cool',    bright: 'dark'    },
  { name: 'Indigo',     hex: '#6C63FF', temp: 'cool',    bright: 'bright'  },
  { name: 'Violet',     hex: '#B44FE8', temp: 'cool',    bright: 'bright'  },
  { name: 'Rose',       hex: '#F472B6', temp: 'warm',    bright: 'bright'  },
  { name: 'Pearl',      hex: '#D4C9B0', temp: 'neutral', bright: 'bright'  },
];

/** @param {{ temp: string }} color @returns {string} Tone.js duration string */
export function getDuration(color) {
  return { warm: '8n', neutral: '4n', cool: '2n' }[color.temp];
}

/** @param {{ bright: string }} color @returns {number} velocity 0–1 */
export function getVelocity(color) {
  return { dark: 0.28, medium: 0.62, bright: 0.92 }[color.bright];
}

/** Human-readable display helpers */
export const DUR_LABEL = { warm: 'short', neutral: 'med', cool: 'long' };
export const VEL_LABEL = { dark: 'soft', medium: 'med', bright: 'loud' };
