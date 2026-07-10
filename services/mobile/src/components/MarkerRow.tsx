/**
 * A single marker line: name + value on the left, a compact range bar, and a
 * status pill. Used in the home "needs attention" list and the dashboard's
 * ranked findings. `onPress` opens the marker detail.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, font, space } from '@/theme/tokens';
import type { MarkerVM } from '@/data/sample';
import { RangeBar } from './RangeBar';
import { StatusPill } from './StatusPill';
import { BodyStrong, Mono } from './Text';

interface MarkerRowProps {
  marker: MarkerVM;
  onPress?: () => void;
  divider?: boolean;
  inlineValue?: boolean;
}

export function MarkerRow({ marker, onPress, divider, inlineValue }: MarkerRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && styles.divider,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={styles.info}>
        {inlineValue ? (
          <View style={styles.inline}>
            <BodyStrong style={styles.name}>{marker.name}</BodyStrong>
            <Mono style={styles.value}>{marker.value}</Mono>
          </View>
        ) : (
          <>
            <BodyStrong style={styles.name}>{marker.name}</BodyStrong>
            <Mono style={styles.value}>{marker.value}</Mono>
          </>
        )}
      </View>
      <RangeBar markerPos={marker.markerPos} bucket={marker.bucket} size="sm" width={52} />
      <StatusPill variant={marker.bucket} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  pressed: {
    backgroundColor: colors.paper,
  },
  info: {
    flex: 1,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  name: {
    fontSize: 13.5,
    color: colors.ink,
  },
  value: {
    fontFamily: font.mono,
    fontSize: 9.5,
    color: colors.textFaint,
    marginTop: 1,
  },
});
