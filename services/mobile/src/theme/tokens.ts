/**
 * LabOptimal design tokens for React Native.
 *
 * Ported from docs/brand/tokens.css ([data-brand="laboptimal"]). Keep the hex
 * values identical to that file, which is the canonical source of truth. CSS
 * custom properties do not cross into RN, so this is the derived object the app
 * consumes.
 */

export const colors = {
  // Surfaces
  paper: '#F5F1E6',
  surface: '#FFFDF8',
  surfaceInset: '#EDE7D9',
  greenSurface: '#1C6B4A',

  // Text
  ink: '#17231C',
  textMuted: '#5C6B60',
  textFaint: '#8A9389',
  onGreen: '#DDF0E6',
  onGreenFaint: '#8FD3B0',
  avatarText: '#EAF6EF',

  // Brand
  brand: '#1C6B4A',
  brandBright: '#2E8B5E',
  brandOnDark: '#6FBF97',
  brandSoft: '#8FD3B0',
  brandInk: '#12402C',

  // Result status
  statusInRange: '#2E8B5E',
  statusWatch: '#C77A1B',
  statusWatchTrack: '#E8B04A',
  statusLow: '#B4531F',
  statusOptimalTrack: '#3FA773',

  // Lines
  hairline: 'rgba(23, 35, 28, 0.08)',
  hairlineStrong: 'rgba(23, 35, 28, 0.12)',
} as const;

/**
 * Soft background washes used behind status pills and icon tiles. Kept separate
 * because RN has no color-mix; these are the board's rgba() values verbatim.
 */
export const tint = {
  low: 'rgba(180, 83, 31, 0.10)',
  watch: 'rgba(199, 122, 27, 0.12)',
  inRange: 'rgba(46, 139, 94, 0.12)',
  brand: 'rgba(28, 107, 74, 0.10)',
  ember: 'rgba(168, 72, 27, 0.06)',
} as const;

/**
 * Font family names as registered by the @expo-google-fonts packages loaded in
 * App.tsx. Newsreader is the editorial serif, Public Sans the interface voice,
 * IBM Plex Mono for data and labels.
 */
export const font = {
  serif: 'Newsreader_500Medium',
  serifRegular: 'Newsreader_400Regular',
  serifItalic: 'Newsreader_500Medium_Italic',
  sans: 'PublicSans_400Regular',
  sansMedium: 'PublicSans_500Medium',
  sansSemiBold: 'PublicSans_600SemiBold',
  sansBold: 'PublicSans_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
} as const;

export const radius = {
  sm: 6,
  md: 12,
  card: 16,
  button: 13,
  lg: 20,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 24,
} as const;

export const shadow = {
  card: {
    shadowColor: '#17231C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  brand: {
    shadowColor: '#1C6B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
