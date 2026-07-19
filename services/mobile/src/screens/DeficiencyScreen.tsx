/**
 * Deficiency dashboard: the priority finding, the ranked list, then the plan.
 * Cards cascade in; the plan panel is a glowing green gradient.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { MarkerRow } from '@/components/MarkerRow';
import { RangeBar } from '@/components/RangeBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import { Reveal } from '@/components/motion';
import { Body, BodyStrong, Heading, Label, Mono } from '@/components/Text';
import type { MarkerVM } from '@/data/sample';
import { useScan } from '@/state/ScanContext';
import { colors, font, space, tint } from '@/theme/tokens';
import { diagonal, gradients } from '@/theme/gradients';

interface DeficiencyScreenProps {
  onBack?: () => void;
  onOpenMarker?: (marker: MarkerVM) => void;
  onOpenPlan?: () => void;
}

export function DeficiencyScreen({ onBack, onOpenMarker, onOpenPlan }: DeficiencyScreenProps) {
  const { results, usedFallback } = useScan();
  const { priorityMarker, rankedFindings, planTags, mealNote, summary } = results;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Deficiencies" subtitle={`From labs dated ${summary.labDate}`} onBack={onBack} />

      <View style={styles.body}>
        {usedFallback ? (
          <Reveal delay={20}>
            <View style={styles.fallback}>
              <Mono style={styles.fallbackText}>
                Showing sample data — we couldn't reach the analyzer. Scan again when it's back.
              </Mono>
            </View>
          </Reveal>
        ) : null}

        {/* Priority finding */}
        <Reveal delay={40}>
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
            <RangeBar markerPos={priorityMarker.markerPos} bucket={priorityMarker.bucket} size="lg" delay={320} />
            <View style={styles.scale}>
              <Mono style={[styles.scaleLabel, { color: colors.statusLow, fontFamily: font.monoSemiBold }]}>
                Deficient
              </Mono>
              <Mono style={styles.scaleLabel}>Optimal</Mono>
              <Mono style={styles.scaleLabel}>High</Mono>
            </View>
            {priorityMarker.confidence != null ? (
              <View style={styles.confRow}>
                <Mono style={styles.confLabel}>Confidence</Mono>
                <View style={styles.confMeter}>
                  <ConfidenceMeter confidence={priorityMarker.confidence} />
                </View>
              </View>
            ) : null}
          </Card>
        </Reveal>

        {/* Ranked list */}
        <Reveal delay={130}>
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
        </Reveal>

        {/* Plan */}
        <Reveal delay={220}>
          <LinearGradient
            colors={gradients.brandDeep}
            start={diagonal.start}
            end={diagonal.end}
            style={styles.planCard}
          >
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
            <Body style={styles.planNote}>{mealNote}</Body>
          </LinearGradient>
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
  fallback: {
    marginBottom: 13,
    padding: 11,
    borderRadius: 11,
    backgroundColor: tint.watch,
  },
  fallbackText: {
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.statusWatch,
  },
  confRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  confLabel: {
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  confMeter: {
    flex: 1,
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
    fontSize: 34,
    lineHeight: 36,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    overflow: 'hidden',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 8,
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
