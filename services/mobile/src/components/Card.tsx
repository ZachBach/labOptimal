/**
 * Surface card: the raised cream panel used throughout the app. `tone="green"`
 * switches to the brand-green plan card. `flush` removes inner padding for
 * list-style cards whose rows manage their own padding.
 */

import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, shadow, space } from '@/theme/tokens';

interface CardProps extends ViewProps {
  tone?: 'surface' | 'green';
  flush?: boolean;
}

export function Card({ tone = 'surface', flush = false, style, children, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        tone === 'green' ? styles.green : styles.surface,
        flush ? styles.flush : styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    ...shadow.card,
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  green: {
    backgroundColor: colors.greenSurface,
  },
  padded: {
    padding: space.lg,
  },
  flush: {
    overflow: 'hidden',
  },
});
