/**
 * PrimaryButton is the filled green call to action (with optional leading icon).
 * SecondaryButton is the outline variant used for secondary choices.
 */

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, font, radius, shadow } from '@/theme/tokens';
import { Icon, IconName } from './Icon';

interface PrimaryButtonProps {
  label: string;
  icon?: IconName;
  onPress?: () => void;
}

export function PrimaryButton({ label, icon, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
    >
      {icon ? <Icon name={icon} size={19} color={colors.paper} /> : null}
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
    >
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 50,
    borderRadius: radius.button,
    backgroundColor: colors.brand,
    ...shadow.brand,
  },
  secondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  primaryLabel: {
    fontFamily: font.sansSemiBold,
    fontSize: 15,
    color: colors.paper,
  },
  secondaryLabel: {
    fontFamily: font.sansSemiBold,
    fontSize: 13,
    color: colors.ink,
  },
});
