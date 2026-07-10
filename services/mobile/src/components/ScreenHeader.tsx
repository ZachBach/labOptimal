/**
 * Detail-screen header: a back chevron with a serif title and optional mono
 * subtitle. Home uses its own greeting header instead of this.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme/tokens';
import { Icon } from './Icon';
import { Heading, Mono } from './Text';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={10} style={({ pressed }) => (pressed ? styles.pressed : null)}>
        <Icon name="chevron-left" size={22} color={colors.ink} />
      </Pressable>
      <View style={styles.titles}>
        <Heading>{title}</Heading>
        {subtitle ? <Mono style={styles.subtitle}>{subtitle}</Mono> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  titles: {
    flex: 1,
  },
  subtitle: {
    fontSize: 9.5,
    color: colors.textFaint,
    marginTop: 1,
  },
  pressed: {
    opacity: 0.5,
  },
});
