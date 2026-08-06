// Approximated from the CatDex design mock's oklch palette (RN's color
// parser support for oklch() varies by platform/version, so these are
// baked to hex for reliability).
export const colors = {
  background: '#FAF4EC',
  card: '#FFFFFF',
  creamMuted: '#F5EEE4',
  creamMuted2: '#F0E9DE',
  creamMuted3: '#E9E1D4',

  textDark: '#3A342E',
  textMid: '#6B6259',
  textMuted: '#8C8378',
  textLight: '#A79E92',

  coral: '#E8734F',
  coralDark: '#C85A39',
  coralBgSoft: '#F7DCCF',
  coralTextSoft: '#8A3D24',

  teal: '#4E93A8',
  tealDark: '#3D7A8C',
  tealBgSoft: '#DCEAEF',
  tealTextSoft: '#3E6B78',
  tealTextMuted: '#5C8A97',
  tealHeading: '#2F5560',
  tealPercent: '#3E7F8F',
  tealDot: '#6FA6AE',

  mapBg: '#E4E8D9',
  mapPark: '#D9E2C9',
  mapGrid: '#D6D9C7',

  cameraBg: '#33302B',

  white: '#FFFFFF',
  overlayDark: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(255,255,255,0.15)',
  overlayLight85: 'rgba(255,255,255,0.85)',

  danger: '#B3261E',
} as const;

export const achievementColors = [
  colors.coral,
  colors.tealDot,
  '#C9CB7A',
  '#8B87A6',
  '#E8A85C',
  '#D97AA0',
] as const;
