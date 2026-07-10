/**
 * Marker detail: one marker in depth. Current value, 12-month trend, what a low
 * reading affects, and a link straight to the open dossier.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { RangeBar } from '@/components/RangeBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import { TrendBars } from '@/components/TrendBars';
import { Body, Heading, Label, Mono } from '@/components/Text';
import {
  priorityMarker,
  vitaminDEffects,
  vitaminDSourceCount,
  vitaminDTrend,
  vitaminDTrendMonths,
} from '@/data/sample';
import type { MarkerVM } from '@/data/sample';
import { colors, font, space } from '@/theme/tokens';

interface MarkerScreenProps {
  marker?: MarkerVM;
  onBack?: () => void;
}

export function MarkerScreen({ marker = priorityMarker, onBack }: MarkerScreenProps) {
  const [value, ...unitParts] = marker.value.split(' ');
  const unit = unitParts.join(' ');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title={marker.name} subtitle="Nutrient marker" onBack={onBack} />

      <View style={styles.body}>
        <Card style={styles.block}>
          <View style={styles.currentHead}>
            <View>
              <Label style={styles.currentLabel}>Current</Label>
              <View style={styles.currentValue}>
                <Heading style={styles.bigNumber}>{value}</Heading>
                <Mono style={styles.bigUnit}>{unit}</Mono>
              </View>
            </View>
            <StatusPill variant={marker.bucket} />
          </View>
          <RangeBar markerPos={marker.markerPos} bucket={marker.bucket} size="lg" />
          <View style={styles.scale}>
            <Mono style={[styles.scaleLabel, { color: colors.statusLow, fontFamily: font.monoSemiBold }]}>
              Deficient
            </Mono>
            <Mono style={styles.scaleLabel}>Optimal</Mono>
            <Mono style={styles.scaleLabel}>High</Mono>
          </View>
        </Card>

        <Card style={styles.block}>
          <View style={styles.trendHead}>
            <Label>12-month trend</Label>
            <Mono style={{ color: colors.statusLow }}>Below range</Mono>
          </View>
          <TrendBars values={vitaminDTrend} months={vitaminDTrendMonths} bucket={marker.bucket} />
        </Card>

        <Card style={styles.block}>
          <Label style={styles.effectsLabel}>What low {marker.name.toLowerCase()} affects</Label>
          <View style={styles.effects}>
            {vitaminDEffects.map((effect) => (
              <View key={effect} style={styles.effectRow}>
                <View style={styles.effectDot} />
                <Body style={styles.effectText}>{effect}</Body>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.footer}>
          <Mono style={styles.footerText}>Synthesized from {vitaminDSourceCount} sources</Mono>
          <Mono style={styles.footerLink}>Open dossier ›</Mono>
        </View>
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
    paddingBottom: space.xxl,
  },
  body: {
    paddingHorizontal: space.xl,
  },
  block: {
    marginBottom: 13,
  },
  currentHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  currentLabel: {
    marginBottom: 4,
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  bigNumber: {
    fontFamily: font.serif,
    fontSize: 32,
    lineHeight: 34,
    color: colors.statusLow,
  },
  bigUnit: {
    fontSize: 11,
    color: colors.textFaint,
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleLabel: {
    fontSize: 9,
    color: colors.textFaint,
  },
  trendHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  effectsLabel: {
    marginBottom: 10,
  },
  effects: {
    gap: 9,
  },
  effectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  effectDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: colors.statusLow,
  },
  effectText: {
    fontSize: 12.5,
    color: '#3A4A40',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  footerText: {
    fontSize: 10,
    color: colors.textFaint,
  },
  footerLink: {
    fontFamily: font.monoSemiBold,
    fontSize: 10,
    color: colors.brand,
  },
});
