/**
 * Marker detail: one marker in depth, driven by the real finding. Current value
 * and range, how confident the reading is (with the reasons why), the engine's
 * clinical note / interaction insight, and the best food sources for the
 * nutrient with their amounts.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { RangeBar } from '@/components/RangeBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import { Reveal } from '@/components/motion';
import { Body, Heading, Label, Mono } from '@/components/Text';
import { priorityMarker } from '@/data/sample';
import type { MarkerVM } from '@/data/sample';
import { colors, font, space } from '@/theme/tokens';

interface MarkerScreenProps {
  marker?: MarkerVM;
  onBack?: () => void;
}

function whyItMatters(marker: MarkerVM): string {
  if (marker.notes) return marker.notes;
  switch (marker.bucket) {
    case 'low':
      return `${marker.name} is outside its reference range — raising it is the priority here.`;
    case 'watch':
      return `${marker.name} is within range but below the optimal band, so it's worth nudging up.`;
    default:
      return `${marker.name} is within its optimal band.`;
  }
}

export function MarkerScreen({ marker = priorityMarker, onBack }: MarkerScreenProps) {
  const [value, ...unitParts] = marker.value.split(' ');
  const unit = unitParts.join(' ');
  const drivers = marker.confidenceDrivers ?? [];
  const foods = marker.foods ?? [];
  const numberColor = marker.bucket === 'in_range' ? colors.statusInRange : colors.statusLow;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title={marker.name} subtitle="Nutrient marker" onBack={onBack} />

      <View style={styles.body}>
        <Reveal delay={40}>
          <Card style={styles.block}>
            <View style={styles.currentHead}>
              <View>
                <Label style={styles.currentLabel}>Current</Label>
                <View style={styles.currentValue}>
                  <Heading style={[styles.bigNumber, { color: numberColor }]}>{value}</Heading>
                  <Mono style={styles.bigUnit}>{unit}</Mono>
                </View>
              </View>
              <StatusPill variant={marker.bucket} label={marker.statusLabel} />
            </View>
            <RangeBar markerPos={marker.markerPos} bucket={marker.bucket} size="lg" delay={320} />
            <View style={styles.scale}>
              <Mono style={[styles.scaleLabel, { color: colors.statusLow, fontFamily: font.monoSemiBold }]}>
                Deficient
              </Mono>
              <Mono style={styles.scaleLabel}>Optimal</Mono>
              <Mono style={styles.scaleLabel}>High</Mono>
            </View>
          </Card>
        </Reveal>

        {marker.confidence != null ? (
          <Reveal delay={110}>
            <Card style={styles.block}>
              <Label style={styles.cardLabel}>Reading confidence</Label>
              <ConfidenceMeter confidence={marker.confidence} />
              {drivers.length > 0 ? (
                <View style={styles.drivers}>
                  {drivers.map((d) => (
                    <View key={d} style={styles.driverRow}>
                      <View style={styles.driverDot} />
                      <Body style={styles.driverText}>{d}</Body>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          </Reveal>
        ) : null}

        <Reveal delay={190}>
          <Card style={styles.block}>
            <Label style={styles.cardLabel}>Why it matters</Label>
            <Body style={styles.note}>{whyItMatters(marker)}</Body>
          </Card>
        </Reveal>

        {foods.length > 0 ? (
          <Reveal delay={270}>
            <Card style={styles.block}>
              <Label style={styles.cardLabel}>Best foods{marker.nutrient ? ` for ${marker.name.toLowerCase()}` : ''}</Label>
              <View style={styles.foods}>
                {foods.map((f) => (
                  <View key={f.name} style={styles.foodRow}>
                    <Body style={styles.foodName}>{f.name}</Body>
                    {f.amount ? <Mono style={styles.foodAmount}>{f.amount}</Mono> : null}
                  </View>
                ))}
              </View>
            </Card>
          </Reveal>
        ) : null}

        <Reveal delay={340}>
          <View style={styles.footer}>
            <Mono style={styles.footerText}>Ranges cited · foods from USDA FoodData Central</Mono>
          </View>
        </Reveal>
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
  cardLabel: {
    marginBottom: 11,
  },
  drivers: {
    gap: 8,
    marginTop: 13,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  driverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    backgroundColor: colors.brand,
  },
  driverText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#3A4A40',
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
    color: '#3A4A40',
  },
  foods: {
    gap: 10,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 13.5,
    color: colors.ink,
  },
  foodAmount: {
    fontFamily: font.monoSemiBold,
    fontSize: 10,
    color: colors.brand,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
});
