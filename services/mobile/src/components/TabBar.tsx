/**
 * Bottom tab bar. Presentational only: it reports the selected tab through
 * onSelect. The Copilot lane will replace this with a real navigator
 * (react-navigation bottom tabs) and drop this in as the tabBar renderer.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme/tokens';
import { Icon, IconName } from './Icon';

export type TabKey = 'home' | 'results' | 'plan' | 'library' | 'profile';

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'results', label: 'Results', icon: 'bar-chart' },
  { key: 'plan', label: 'Plan', icon: 'check-circle' },
  { key: 'library', label: 'Library', icon: 'book' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

interface TabBarProps {
  active: TabKey;
  onSelect: (key: TabKey) => void;
}

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        const color = selected ? colors.brand : '#9AA39A';
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onSelect(tab.key)}>
            <Icon name={tab.icon} size={20} color={color} strokeWidth={1.7} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  tab: {
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontFamily: font.mono,
    fontSize: 8,
    letterSpacing: 0.4,
  },
});
