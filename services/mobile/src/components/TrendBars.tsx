/**
 * The marker-detail 12-month trend chart: a row of bars with the most recent
 * one highlighted in the status color, plus month labels underneath.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';
import type { StatusBucket } from '@/types/protocol';
import { Mono } from './Text';

const BUCKET_COLOR: Record<StatusBucket, string> = {
  low: colors.statusLow,
  watch: colors.statusWatch,
  in_range: colors.statusInRange,
};

interface TrendBarsProps {
  /** Relative heights 0..100; the last bar is the current reading. */
  values: number[];
  months: string[];
  bucket: StatusBucket;
}

export function TrendBars({ values, months, bucket }: TrendBarsProps) {
  const last = values.length - 1;
  return (
    <View>
      <View style={styles.bars}>
        {values.map((v, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: `${v}%`,
                backgroundColor: i === last ? BUCKET_COLOR[bucket] : colors.surfaceInset,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.months}>
        {months.map((m) => (
          <Mono key={m} style={styles.month}>
            {m}
          </Mono>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 52,
    marginBottom: 7,
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  months: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  month: {
    fontSize: 8.5,
    color: colors.textFaint,
  },
});
