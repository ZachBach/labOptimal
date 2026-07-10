/**
 * Deficiency dashboard: the priority finding first, then the ranked list, then
 * the plan. Every result routes to an action.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { MarkerRow } from '@/components/MarkerRow';
import { RangeBar } from '@/components/RangeBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import { Body, BodyStrong, Heading, Label, Mono } from '@/components/Text';
import { planTags, priorityMarker, rankedFindings, summary } from '@/data/sample';
import type { MarkerVM } from '@/data/sample';
import { colors, font, space } from '@/theme/tokens';

interface DeficiencyScreenProps {
  onBack?: () => void;
  onOpenMarker?: (marker: MarkerVM) => void;
  onOpenPlan?: () => void;
}

export function DeficiencyScreen({ onBack, onOpenMarker, onOpenPlan }: DeficiencyScreenProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Deficiencies" subtitle={`From labs dated ${summary.labDate}`} onBack={onBack} />

      <View style={styles.body}>
        {/* Priority finding */}
        <Card style={styles.block}>
          <View style={styles.priorityHead}>
            <View>
              <BodyStrong style={styles.priorityName}>{priorityMarker.name}</BodyStrong>
              <View style={styles.priorityValue}>
                <Heading style={styles.bigNumber}>{priorityMarker.value.split(' ')[0]}</Heading>
                <Mono style={styles.bigUnit}>{priorityMarker.value.split(' ').slice(1).join(' ')}</Mono>
              </View>
            </View>
            <StatusPill variant="priority" />
          </View>
          <RangeBar markerPos={priorityMarker.markerPos} bucket={priorityMarker.bucket} size="lg" />
          <View style={styles.scale}>
            <Mono style={[styles.scaleLabel, { color: colors.statusLow, fontFamily: font.monoSemiBold }]}>
              Deficient
            </Mono>
            <Mono style={styles.scaleLabel}>Optimal</Mono>
            <Mono style={styles.scaleLabel}>High</Mono>
          </View>
        </Card>

        {/* Ranked list */}
        <Card flush style={styles.block}>
          {rankedFindings.map((marker, i) => (
            <MarkerRow
              key={marker.name}
              marker={marker}
              inlineValue
              divider={i < rankedFindings.length - 1}
              onPress={() => onOpenMarker?.(marker)}
            />
          ))}
        </Card>

        {/* Plan */}
        <Card tone="green" style={styles.planCard}>
          <View style={styles.planHead}>
            <Label color={colors.onGreenFaint}>Your plan</Label>
            <BodyStrong style={styles.planLink} onPress={onOpenPlan}>
              See full plan
            </BodyStrong>
          </View>
          <View style={styles.planTags}>
            {planTags.map((t) => (
              <Chip key={t} label={t} variant="onGreen" />
            ))}
          </View>
          <Body style={styles.planNote}>
            Meals lean toward more oily fish and leafy greens this week.
          </Body>
        </Card>
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
  priorityHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  priorityName: {
    fontSize: 16,
  },
  priorityValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 3,
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
  planCard: {
    marginBottom: 13,
  },
  planHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  planLink: {
    fontFamily: font.sansSemiBold,
    fontSize: 12,
    color: colors.paper,
  },
  planTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 9,
  },
  planNote: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.onGreen,
  },
});
