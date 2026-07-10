/**
 * PrimaryButton: a gradient-filled green CTA with a colored glow and a spring
 * press. SecondaryButton: a soft outline that also springs on press.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors, font, radius } from '@/theme/tokens';
import { diagonal, gradients } from '@/theme/gradients';
import { Icon, IconName } from './Icon';
import { PressableScale } from './motion/PressableScale';

interface PrimaryButtonProps {
  label: string;
  icon?: IconName;
  onPress?: () => void;
}

export function PrimaryButton({ label, icon, onPress }: PrimaryButtonProps) {
  return (
    <PressableScale onPress={onPress} style={styles.glow} scaleTo={0.97}>
      <LinearGradient
        colors={gradients.brand}
        start={diagonal.start}
        end={diagonal.end}
        style={styles.primary}
      >
        {icon ? <Icon name={icon} size={19} color={colors.paper} /> : null}
        <Text style={styles.primaryLabel}>{label}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.secondary} scaleTo={0.97}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  glow: {
    borderRadius: radius.button,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 54,
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  secondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surface,
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
