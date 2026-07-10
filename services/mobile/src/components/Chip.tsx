/**
 * Pill chip. Variants:
 *   filled  active category / brand chip (green text on soft green)
 *   muted   inactive category (muted text on inset cream)
 *   onGreen chip sitting on the green plan card (dark ink on brand-soft)
 *   timing  supplement timing tag (brand text on soft brand tint)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, tint } from '@/theme/tokens';

type Variant = 'filled' | 'muted' | 'onGreen' | 'timing';

const CONFIG: Record<Variant, { bg: string; fg: string; family: string; size: number }> = {
  filled: { bg: tint.brand, fg: colors.brand, family: font.sansSemiBold, size: 12 },
  muted: { bg: colors.surfaceInset, fg: colors.textMuted, family: font.sansMedium, size: 12 },
  onGreen: { bg: colors.brandSoft, fg: colors.brandInk, family: font.sansSemiBold, size: 11.5 },
  timing: { bg: tint.brand, fg: colors.brand, family: font.monoSemiBold, size: 8.5 },
};

interface ChipProps {
  label: string;
  variant?: Variant;
}

export function Chip({ label, variant = 'muted' }: ChipProps) {
  const cfg = CONFIG[variant];
  const timing = variant === 'timing';
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: cfg.bg },
        timing ? styles.timing : styles.regular,
      ]}
    >
      <Text
        style={{
          color: cfg.fg,
          fontFamily: cfg.family,
          fontSize: cfg.size,
          letterSpacing: timing ? 0.4 : 0,
          textTransform: timing ? 'uppercase' : 'none',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
  },
  regular: {
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  timing: {
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
});
