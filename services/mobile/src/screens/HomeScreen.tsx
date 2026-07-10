/**
 * Home: status at a glance with one clear action. Greeting, overall summary,
 * "scan a new lab report", the needs-attention list, and category filters.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { MarkerRow } from '@/components/MarkerRow';
import { PrimaryButton } from '@/components/Button';
import { SummaryBar } from '@/components/SummaryBar';
import { BodyStrong, Display, Heading, Label } from '@/components/Text';
import { categories, needsAttention, summary, user } from '@/data/sample';
import type { MarkerVM } from '@/data/sample';
import { colors, font, space } from '@/theme/tokens';

interface HomeScreenProps {
  onScan?: () => void;
  onOpenMarker?: (marker: MarkerVM) => void;
}

export function HomeScreen({ onScan, onOpenMarker }: HomeScreenProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.greeting}>
        <View>
          <Label>{user.weekday}</Label>
          <Display style={styles.greetingText}>Good evening, {user.name}</Display>
        </View>
        <Avatar initials={user.initials} />
      </View>

      <Card style={styles.block}>
        <View style={styles.cardHead}>
          <Label>Overall</Label>
          <BodyStrong style={styles.link}>Details</BodyStrong>
        </View>
        <View style={styles.metric}>
          <Heading style={styles.metricNumber}>{summary.markersTracked}</Heading>
          <BodyStrong style={styles.metricUnit}>markers tracked</BodyStrong>
        </View>
        <SummaryBar inRange={summary.inRange} watch={summary.watch} low={summary.low} />
      </Card>

      <View style={styles.block}>
        <PrimaryButton label="Scan a new lab report" icon="camera" onPress={onScan} />
      </View>

      <View style={[styles.cardHead, styles.sectionHead]}>
        <Label>Needs attention</Label>
        <BodyStrong style={styles.link}>See all 6</BodyStrong>
      </View>
      <Card flush style={styles.block}>
        {needsAttention.map((marker, i) => (
          <MarkerRow
            key={marker.name}
            marker={marker}
            divider={i < needsAttention.length - 1}
            onPress={() => onOpenMarker?.(marker)}
          />
        ))}
      </Card>

      <View style={styles.chips}>
        {categories.map((c, i) => (
          <Chip key={c} label={c} variant={i === 0 ? 'filled' : 'muted'} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.xxl,
  },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  greetingText: {
    marginTop: 2,
  },
  block: {
    marginBottom: 14,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHead: {
    marginBottom: 9,
  },
  link: {
    fontFamily: font.sansSemiBold,
    fontSize: 12,
    color: colors.brand,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
    marginBottom: 12,
  },
  metricNumber: {
    fontFamily: font.serif,
    fontSize: 40,
    lineHeight: 42,
    color: colors.ink,
  },
  metricUnit: {
    fontFamily: font.sansMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
});
