/**
 * Gradient stops for the "max drama" visual layer, built on the brand palette in
 * tokens.ts. Each is an array of colors for expo-linear-gradient, plus a default
 * start/end where a specific angle matters.
 */

import { colors } from './tokens';

type Stops = readonly [string, string, ...string[]];

export const gradients = {
  /** Primary CTA + brand surfaces: bright green into deep green. */
  brand: [colors.brandBright, colors.brand] as Stops,
  /** Deeper, moodier brand fill for large cards. */
  brandDeep: ['#2E8B5E', '#1C6B4A', '#12402C'] as Stops,
  /** The hero score ring stroke: mint to clinical green. */
  score: ['#8FD3B0', '#2E8B5E', '#1C6B4A'] as Stops,
  /** Dark hero / ambient ground behind premium sections. */
  hero: ['#1B3327', '#14251C', '#0C1712'] as Stops,
  /** Warm ember accent gradient. */
  ember: ['#C25A2A', '#A8481B'] as Stops,
  /** Subtle glow wash used behind the ring and hero numerals. */
  glow: ['rgba(46,139,94,0.28)', 'rgba(46,139,94,0)'] as Stops,
} as const;

/** Diagonal top-left to bottom-right, the default for CTAs and cards. */
export const diagonal = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
/** Left to right, for horizontal fills. */
export const horizontal = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
/** Top to bottom, for ambient washes. */
export const vertical = { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
