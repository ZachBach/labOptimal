/**
 * Home: a dramatic hero with an animated health-score ring over the umbrella
 * dark-green gradient, then the scan CTA and a revealed needs-attention list.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { MarkerRow } from '@/components/MarkerRow';
import { PrimaryButton } from '@/components/Button';
import { AnimatedNumber, PressableScale, Reveal, ScoreRing } from '@/components/motion';
import { BodyStrong, Display, Label, Mono } from '@/components/Text';
import { categories, user } from '@/data/sample';
import type { MarkerVM } from '@/data/sample';
import { useResults } from '@/state/ScanContext';
import { colors, font, space } from '@/theme/tokens';
import { diagonal, gradients } from '@/theme/gradients';

interface HomeScreenProps {
  onScan?: () => void;
  onOpenMarker?: (marker: MarkerVM) => void;
}

export function HomeScreen({ onScan, onOpenMarker }: HomeScreenProps) {
  const { summary, needsAttention } = useResults();
  const score = Math.round((summary.inRange / summary.markersTracked) * 100);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const shown = needsAttention.filter((m) => m.category === activeCategory);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <Reveal delay={0} distance={10}>
        <LinearGradient
          colors={gradients.hero}
          start={diagonal.start}
          end={diagonal.end}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Label color={colors.brandOnDark}>{user.weekday}</Label>
              <Display style={styles.greeting}>Good evening, {user.name}</Display>
            </View>
            <Avatar initials={user.initials} />
          </View>

          <View style={styles.ringWrap}>
            <View style={styles.glow} />
            <ScoreRing progress={score / 100} size={188} strokeWidth={15}>
              <AnimatedNumber value={score} style={styles.scoreNumber} />
              <Label color={colors.brandOnDark} style={styles.scoreLabel}>
                Health score
              </Label>
            </ScoreRing>
          </View>

          <View style={styles.heroBar}>
            <View style={{ flex: summary.inRange, backgroundColor: colors.statusInRange }} />
            <View style={[styles.barMid, { flex: summary.watch }]} />
            <View style={{ flex: summary.low, backgroundColor: colors.statusLow }} />
          </View>
          <View style={styles.legend}>
            <Legend color={colors.statusInRange} label={`${summary.inRange} in range`} />
            <Legend color={colors.statusWatch} label={`${summary.watch} watch`} />
            <Legend color={colors.statusLow} label={`${summary.low} low`} />
          </View>
        </LinearGradient>
      </Reveal>

      <View style={styles.body}>
        <Reveal delay={120}>
          <PrimaryButton label="Scan a new lab report" icon="camera" onPress={onScan} />
        </Reveal>

        <View style={styles.sectionHead}>
          <Label>Needs attention</Label>
          <BodyStrong style={styles.link}>See all 6</BodyStrong>
        </View>
        <Reveal delay={200}>
          <Card flush style={styles.attentionCard}>
            {shown.length > 0 ? (
              shown.map((marker, i) => (
                <MarkerRow
                  key={marker.name}
                  marker={marker}
                  divider={i < shown.length - 1}
                  onPress={() => onOpenMarker?.(marker)}
                />
              ))
            ) : (
              <View style={styles.allClear}>
                <Mono style={styles.allClearText}>All clear in {activeCategory}</Mono>
              </View>
            )}
          </Card>
        </Reveal>

        <Reveal delay={280}>
          <View style={styles.chips}>
            {categories.map((c) => (
              <PressableScale key={c} scaleTo={0.94} onPress={() => setActiveCategory(c)}>
                <Chip label={c} variant={c === activeCategory ? 'filled' : 'muted'} />
              </PressableScale>
            ))}
          </View>
        </Reveal>
      </View>
    </ScrollView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Mono style={styles.legendText}>{label}</Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: space.xxl,
  },
  hero: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
    overflow: 'hidden',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 26,
    elevation: 10,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    color: colors.paper,
    marginTop: 3,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(111,191,151,0.16)',
    shadowColor: '#2E8B5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 44,
    elevation: 12,
  },
  scoreNumber: {
    fontFamily: font.serif,
    fontSize: 56,
    lineHeight: 60,
    color: colors.paper,
  },
  scoreLabel: {
    marginTop: 2,
  },
  heroBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  barMid: {
    backgroundColor: colors.statusWatch,
    marginHorizontal: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 11,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: colors.onGreen,
  },
  body: {
    marginTop: 16,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 9,
  },
  link: {
    fontFamily: font.sansSemiBold,
    fontSize: 12,
    color: colors.brand,
  },
  attentionCard: {
    shadowColor: '#17231C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  allClear: {
    paddingVertical: 22,
    alignItems: 'center',
  },
  allClearText: {
    fontSize: 11,
    color: colors.statusInRange,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
});
