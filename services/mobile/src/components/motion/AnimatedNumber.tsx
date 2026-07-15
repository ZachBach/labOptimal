/**
 * Counts a number up from 0 to `value` on mount with an ease-out curve. Driven
 * on the JS thread (rAF) so it renders identically on web and native. `format`
 * lets callers control rounding/units.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleProp, Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  style?: StyleProp<TextStyle>;
}

export function AnimatedNumber({ value, duration = 1100, format, style }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(Platform.OS === 'web' ? value : 0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setDisplay(value);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  const text = format ? format(display) : String(Math.round(display));
  return <Text style={style}>{text}</Text>;
}
