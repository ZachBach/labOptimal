/**
 * Plan: supplements (tap to check off) and this week's meals. Cards cascade in;
 * the meals panel is a glowing green gradient.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PressableScale, Reveal } from '@/components/motion';
import { Body, BodyStrong, Label, Mono } from '@/components/Text';
import type { MealDayVM, SupplementVM } from '@/data/sample';
import { useResults } from '@/state/ScanContext';
import { colors, font, radius, space, tint } from '@/theme/tokens';
import { diagonal, gradients } from '@/theme/gradients';

interface PlanScreenProps {
  onBack?: () => void;
}

export function PlanScreen({ onBack }: PlanScreenProps) {
  const { supplements, mealFocus, mealNote, mealDays, summary } = useResults();
  const [taken, setTaken] = useState<Record<string, boolean>>({});
  const takenCount = useMemo(() => Object.values(taken).filter(Boolean).length, [taken]);

  const toggle = (name: string) => setTaken((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Your plan" subtitle={`Built from labs dated ${summary.labDate}`} onBack={onBack} />

      <View style={styles.body}>
        <Reveal delay={40}>
          <View style={styles.sectionHead}>
            <Label>Supplements</Label>
            <BodyStrong style={styles.link}>
              {takenCount > 0 ? `${takenCount} of ${supplements.length} taken` : `${supplements.length} daily`}
            </BodyStrong>
          </View>
          <Card flush style={styles.block}>
            {supplements.map((s, i) => (
              <SupplementRow
                key={s.name}
                item={s}
                taken={!!taken[s.name]}
                onToggle={() => toggle(s.name)}
                divider={i < supplements.length - 1}
              />
            ))}
          </Card>
        </Reveal>

        <Reveal delay={150}>
          <View style={styles.sectionHead}>
            <Label>This week's meals</Label>
            <BodyStrong style={styles.link}>Swap</BodyStrong>
          </View>
          <LinearGradient
            colors={gradients.brandDeep}
            start={diagonal.start}
            end={diagonal.end}
            style={styles.mealCard}
          >
            <View style={styles.mealTags}>
              {mealFocus.map((m) => (
                <Chip key={m} label={m} variant="onGreen" />
              ))}
            </View>
            <Body style={styles.mealNote}>{mealNote}</Body>
          </LinearGradient>
        </Reveal>

        {mealDays.length > 0 ? (
          <Reveal delay={230}>
            <View style={styles.sectionHead}>
              <Label>The week, day by day</Label>
              <BodyStrong style={styles.link}>{mealDays.length} days</BodyStrong>
            </View>
            <View style={styles.days}>
              {mealDays.map((day) => (
                <DayCard key={day.day} day={day} />
              ))}
            </View>
          </Reveal>
        ) : null}
      </View>
    </ScrollView>
  );
}

function DayCard({ day }: { day: MealDayVM }) {
  return (
    <Card style={styles.dayCard}>
      <Label style={styles.dayLabel}>Day {day.day}</Label>
      <View style={styles.dayMeals}>
        {day.meals.map((meal) => (
          <View key={meal.slot} style={styles.mealRow}>
            <Mono style={styles.mealSlot}>{meal.slot}</Mono>
            <Body style={styles.mealTitle}>{meal.title}</Body>
          </View>
        ))}
      </View>
    </Card>
  );
}

function SupplementRow({
  item,
  taken,
  onToggle,
  divider,
}: {
  item: SupplementVM;
  taken: boolean;
  onToggle: () => void;
  divider: boolean;
}) {
  return (
    <PressableScale style={[styles.row, divider && styles.divider]} scaleTo={0.985} onPress={onToggle}>
      <View style={[styles.iconTile, taken && styles.iconTileDone]}>
        <Icon
          name={taken ? 'check' : 'capsule'}
          size={17}
          color={taken ? colors.paper : colors.brand}
          strokeWidth={taken ? 2.4 : 1.7}
        />
      </View>
      <View style={styles.rowInfo}>
        <BodyStrong style={[styles.rowName, taken && styles.rowNameDone]}>{item.name}</BodyStrong>
        <Mono style={styles.rowDose}>{item.dose}</Mono>
      </View>
      <Chip label={item.timing} variant="timing" />
    </PressableScale>
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
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  link: {
    fontFamily: font.sansSemiBold,
    fontSize: 12,
    color: colors.brand,
  },
  block: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: tint.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileDone: {
    backgroundColor: colors.brand,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 13.5,
  },
  rowNameDone: {
    color: colors.textFaint,
    textDecorationLine: 'line-through',
  },
  rowDose: {
    fontFamily: font.mono,
    fontSize: 9.5,
    color: colors.textFaint,
    marginTop: 1,
  },
  mealCard: {
    borderRadius: radius.card,
    padding: space.lg,
    overflow: 'hidden',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  mealTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  mealNote: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.onGreen,
  },
  days: {
    gap: 10,
  },
  dayCard: {
    paddingVertical: 13,
  },
  dayLabel: {
    marginBottom: 10,
  },
  dayMeals: {
    gap: 9,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealSlot: {
    fontFamily: font.monoMedium,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textFaint,
    width: 62,
  },
  mealTitle: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
});
