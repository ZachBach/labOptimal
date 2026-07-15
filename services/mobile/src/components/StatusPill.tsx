/**
 * Small monospace status chip. Colors come straight from the result-status
 * tokens: low (rust), watch (amber), in range (green). `priority` uses the low
 * palette with a "Priority" label, matching the dashboard's lead finding.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, font, radius, tint } from '@/theme/tokens';
import type { StatusBucket } from '@/types/protocol';
import { Mono } from './Text';

type Variant = StatusBucket | 'priority';

const CONFIG: Record<Variant, { fg: string; bg: string; label: string }> = {
  low: { fg: colors.statusLow, bg: tint.low, label: 'Low' },
  watch: { fg: colors.statusWatch, bg: tint.watch, label: 'Watch' },
  in_range: { fg: colors.statusInRange, bg: tint.inRange, label: 'In range' },
  priority: { fg: colors.statusLow, bg: tint.low, label: 'Priority' },
};

export function StatusPill({ variant, label }: { variant: Variant; label?: string }) {
  const cfg = CONFIG[variant];
  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
      <Mono style={styles.text} color={cfg.fg}>
        {label ?? cfg.label}
      </Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: font.monoSemiBold,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
