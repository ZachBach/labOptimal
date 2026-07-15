/**
 * Circular initials avatar used in the home greeting header.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme/tokens';

export function Avatar({ initials }: { initials: string }) {
  return (
    <View style={styles.circle}>
      <Text style={styles.text}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: font.sansSemiBold,
    fontSize: 14,
    color: colors.avatarText,
  },
});
