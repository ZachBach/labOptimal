/**
 * Typographic primitives. Thin wrappers over RN Text that bind the brand fonts
 * and default colors so screens stay declarative. Use these instead of raw
 * <Text> so type stays consistent.
 */

import React from 'react';
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';

import { colors, font } from '@/theme/tokens';

type Props = RNTextProps & { color?: string };

export function Display({ style, color, ...rest }: Props) {
  return <RNText {...rest} style={[styles.display, color ? { color } : null, style]} />;
}

export function Heading({ style, color, ...rest }: Props) {
  return <RNText {...rest} style={[styles.heading, color ? { color } : null, style]} />;
}

export function Body({ style, color, ...rest }: Props) {
  return <RNText {...rest} style={[styles.body, color ? { color } : null, style]} />;
}

export function BodyStrong({ style, color, ...rest }: Props) {
  return <RNText {...rest} style={[styles.bodyStrong, color ? { color } : null, style]} />;
}

/** Monospace uppercase label ("NEEDS ATTENTION", "OVERALL"). */
export function Label({ style, color, ...rest }: Props) {
  return <RNText {...rest} style={[styles.label, color ? { color } : null, style]} />;
}

/** Monospace data/metadata ("18 ng/mL", "42 sources"). */
export function Mono({ style, color, ...rest }: Props) {
  return <RNText {...rest} style={[styles.mono, color ? { color } : null, style]} />;
}

const styles = StyleSheet.create({
  display: {
    fontFamily: font.serif,
    fontSize: 23,
    lineHeight: 26,
    color: colors.ink,
  },
  heading: {
    fontFamily: font.serif,
    fontSize: 20,
    lineHeight: 22,
    color: colors.ink,
  },
  body: {
    fontFamily: font.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  bodyStrong: {
    fontFamily: font.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  label: {
    fontFamily: font.monoMedium,
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  mono: {
    fontFamily: font.mono,
    fontSize: 10,
    color: colors.textFaint,
  },
});
