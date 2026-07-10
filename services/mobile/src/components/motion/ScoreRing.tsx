/**
 * Animated circular progress ring with a mint-to-green gradient stroke that
 * sweeps in on mount. Renders `children` centered inside (the score numeral and
 * label). `progress` is 0..1.
 */

import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  delay?: number;
  trackColor?: string;
  children?: React.ReactNode;
}

export function ScoreRing({
  size = 176,
  strokeWidth = 14,
  progress,
  delay = 250,
  trackColor = 'rgba(255,253,248,0.14)',
  children,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(1, progress));
  const cx = size / 2;
  const cy = size / 2;

  // Start filled on web (reanimated's SVG prop animation is native-first); sweep
  // in on native.
  const p = useSharedValue(Platform.OS === 'web' ? target : 0);
  useEffect(() => {
    if (Platform.OS === 'web') {
      p.value = target;
      return;
    }
    p.value = withDelay(delay, withTiming(target, { duration: 1300, easing: Easing.out(Easing.cubic) }));
  }, [target, delay, p]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - p.value),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="scoreRing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#8FD3B0" />
            <Stop offset="0.55" stopColor="#2E8B5E" />
            <Stop offset="1" stopColor="#1C6B4A" />
          </LinearGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#scoreRing)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
