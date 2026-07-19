/**
 * A compact confidence meter: a filled track plus a percentage, colored by how
 * trustworthy the reading is (green high, amber medium, rust low). Pairs with a
 * list of drivers so a number is always explained, not just shown.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, font, radius } from '@/theme/tokens';
import { Mono } from './Text';

function toneFor(pct: number): string {
  if (pct >= 85) return colors.statusInRange;
  if (pct >= 65) return colors.statusWatch;
  return colors.statusLow;
}

export function ConfidenceMeter({ confidence }: { confidence: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, confidence)) * 100);
  const tone = toneFor(pct);
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: tone }]} />
      </View>
      <Mono style={[styles.pct, { color: tone }]}>{pct}%</Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceInset,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  pct: {
    fontFamily: font.monoSemiBold,
    fontSize: 11,
    minWidth: 34,
    textAlign: 'right',
  },
});
