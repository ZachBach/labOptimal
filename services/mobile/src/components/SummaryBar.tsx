/**
 * The home "overall" segmented bar plus its legend: proportion of markers in
 * range / on watch / low. Segments are sized by count.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { Mono } from './Text';

interface SummaryBarProps {
  inRange: number;
  watch: number;
  low: number;
}

export function SummaryBar({ inRange, watch, low }: SummaryBarProps) {
  return (
    <View>
      <View style={styles.bar}>
        <View style={{ flex: inRange, backgroundColor: colors.statusInRange }} />
        <View style={{ flex: watch, backgroundColor: colors.statusWatch, marginHorizontal: 1.5 }} />
        <View style={{ flex: low, backgroundColor: colors.statusLow }} />
      </View>
      <View style={styles.legend}>
        <LegendItem color={colors.statusInRange} label={`${inRange} in range`} />
        <LegendItem color={colors.statusWatch} label={`${watch} watch`} />
        <LegendItem color={colors.statusLow} label={`${low} low`} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Mono style={styles.legendText}>{label}</Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 9,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swatch: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 9.5,
    color: colors.textMuted,
  },
});
