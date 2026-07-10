/**
 * The deficient / optimal / high range bar. The board uses hard-stop gradients,
 * so this renders three solid bands (amber, green, amber) plus a marker dot
 * whose color reflects the reading's status bucket. `size="lg"` is the detailed
 * bar on the marker and dashboard hero; `size="sm"` is the inline row bar.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';
import type { StatusBucket } from '@/types/protocol';

const DOT_COLOR: Record<StatusBucket, string> = {
  low: colors.statusLow,
  watch: colors.statusWatch,
  in_range: colors.statusInRange,
};

interface RangeBarProps {
  /** 0..100 position of the dot along the bar. */
  markerPos: number;
  bucket: StatusBucket;
  size?: 'sm' | 'lg';
  width?: number;
}

export function RangeBar({ markerPos, bucket, size = 'sm', width }: RangeBarProps) {
  const lg = size === 'lg';
  const height = lg ? 12 : 6;
  const dot = lg ? 15 : 8;
  // Band proportions: amber | green | amber. Large bar 30/42/28, small 32/46/22.
  const bands = lg ? [30, 42, 28] : [32, 46, 22];
  const pos = Math.max(0, Math.min(100, markerPos));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, width }]}>
      <View style={styles.bands}>
        <View style={{ flex: bands[0], backgroundColor: colors.statusWatchTrack }} />
        <View style={{ flex: bands[1], backgroundColor: colors.statusOptimalTrack }} />
        <View style={{ flex: bands[2], backgroundColor: colors.statusWatchTrack }} />
      </View>
      <View
        style={[
          styles.dot,
          {
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: DOT_COLOR[bucket],
            borderWidth: lg ? 3 : 2,
            left: `${pos}%`,
            marginLeft: -dot / 2,
            top: height / 2 - dot / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'visible',
    justifyContent: 'center',
  },
  bands: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    borderRadius: 999,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    borderColor: colors.surface,
  },
});
