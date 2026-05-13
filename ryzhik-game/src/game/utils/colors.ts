import type { TimeOfDay, Season, Weather } from '../../store/gameStore';

export interface SkyColors {
  top: number;
  bottom: number;
  sunMoonColor: number;
  sunMoonY: number;
  ambientAlpha: number;
  ambientColor: number;
  shadowAlpha: number;
  fogAlpha: number;
  starAlpha: number;
}

const SKY_PALETTES: Record<TimeOfDay, SkyColors> = {
  morning: {
    top: 0x87CEEB,
    bottom: 0xFAD6A5,
    sunMoonColor: 0xFFD700,
    sunMoonY: 0.7,
    ambientAlpha: 0.05,
    ambientColor: 0xFFE4B5,
    shadowAlpha: 0.15,
    fogAlpha: 0.08,
    starAlpha: 0,
  },
  day: {
    top: 0x4AA3DF,
    bottom: 0x87CEEB,
    sunMoonColor: 0xFFF8DC,
    sunMoonY: 0.2,
    ambientAlpha: 0,
    ambientColor: 0xFFFFFF,
    shadowAlpha: 0.2,
    fogAlpha: 0,
    starAlpha: 0,
  },
  evening: {
    top: 0x2C1654,
    bottom: 0xFF6B35,
    sunMoonColor: 0xFF4500,
    sunMoonY: 0.75,
    ambientAlpha: 0.15,
    ambientColor: 0xFF8C00,
    shadowAlpha: 0.25,
    fogAlpha: 0.05,
    starAlpha: 0.3,
  },
  night: {
    top: 0x0B0B2A,
    bottom: 0x1A1A4E,
    sunMoonColor: 0xE8E8F0,
    sunMoonY: 0.25,
    ambientAlpha: 0.35,
    ambientColor: 0x1A1A4E,
    shadowAlpha: 0.4,
    fogAlpha: 0.12,
    starAlpha: 1,
  },
};

export function getSkyColors(timeOfDay: TimeOfDay, _season: Season): SkyColors {
  return SKY_PALETTES[timeOfDay];
}

export function getWeatherOverlay(weather: Weather): { color: number; alpha: number } {
  switch (weather) {
    case 'rain': return { color: 0x3a4a5a, alpha: 0.2 };
    case 'storm': return { color: 0x1a2a3a, alpha: 0.35 };
    case 'fog': return { color: 0xd0d0d0, alpha: 0.3 };
    case 'cloudy': return { color: 0x8a8a8a, alpha: 0.1 };
    default: return { color: 0x000000, alpha: 0 };
  }
}

export function lerpColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return (rr << 16) | (rg << 8) | rb;
}

export function hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff,
  };
}
