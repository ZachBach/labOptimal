/**
 * The deficient / optimal / high range bar: three solid bands (amber, green,
 * amber) with a glowing status dot that springs into position on mount. On web
 * it renders settled (see the motion primitives' web note).
 */

import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/theme/tokens';
import type { StatusBucket } from '@/types/protocol';

const DOT_COLOR: Record<StatusBucket, string> = {
  low: colors.statusLow,
  watch: colors.statusWatch,
  in_range: colors.statusInRange,
};

interface RangeBarProps {
  markerPos: number;
  bucket: StatusBucket;
  size?: 'sm' | 'lg';
  width?: number;
  delay?: number;
}

export function RangeBar({ markerPos, bucket, size = 'sm', width, delay = 260 }: RangeBarProps) {
  const lg = size === 'lg';
  const height = lg ? 12 : 6;
  const dot = lg ? 16 : 9;
  const bands = lg ? [30, 42, 28] : [32, 46, 22];
  const pos = Math.max(0, Math.min(100, markerPos)) / 100;

  const [trackW, setTrackW] = useState(0);
  const progress = useSharedValue(Platform.OS === 'web' ? 1 : 0);

  useEffect(() => {
    if (Platform.OS === 'web') {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 110 }));
  }, [delay, progress]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (trackW - dot) * pos * progress.value },
      { scale: 0.3 + 0.7 * progress.value },
    ],
    opacity: Math.min(1, progress.value * 1.5),
  }));

  return (
    <View
      onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
      style={[styles.track, { height, borderRadius: height / 2, width }]}
    >
      <View style={styles.bands}>
        <View style={{ flex: bands[0], backgroundColor: colors.statusWatchTrack }} />
        <View style={{ flex: bands[1], backgroundColor: colors.statusOptimalTrack }} />
        <View style={{ flex: bands[2], backgroundColor: colors.statusWatchTrack }} />
      </View>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: DOT_COLOR[bucket],
            borderWidth: lg ? 3 : 2,
            top: height / 2 - dot / 2,
            shadowColor: DOT_COLOR[bucket],
            shadowRadius: lg ? 6 : 3,
          },
          dotStyle,
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
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    borderRadius: 999,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    left: 0,
    borderColor: colors.surface,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    elevation: 3,
  },
});
