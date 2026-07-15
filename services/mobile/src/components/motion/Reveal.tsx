/**
 * Entrance animation: fades and lifts its children into place on mount. Give
 * siblings increasing `delay` values for a staggered cascade.
 */

import React, { useEffect } from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  /** How far (px) it travels up into place. */
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

export function Reveal({ children, delay = 0, distance = 18, style }: RevealProps) {
  const progress = useSharedValue(Platform.OS === 'web' ? 1 : 0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
