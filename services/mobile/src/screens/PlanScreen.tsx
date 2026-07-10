/**
 * Plan: supplements and meals in one place, the destination behind
 * "See full plan".
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Body, BodyStrong, Label, Mono } from '@/components/Text';
import { mealFocus, summary, supplements } from '@/data/sample';
import type { SupplementVM } from '@/data/sample';
import { colors, font, radius, space, tint } from '@/theme/tokens';

interface PlanScreenProps {
  onBack?: () => void;
}

export function PlanScreen({ onBack }: PlanScreenProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Your plan" subtitle={`Built from labs dated ${summary.labDate}`} onBack={onBack} />

      <View style={styles.body}>
        <View style={styles.sectionHead}>
          <Label>Supplements</Label>
          <BodyStrong style={styles.link}>3 daily</BodyStrong>
        </View>
        <Card flush style={styles.block}>
          {supplements.map((s, i) => (
            <SupplementRow key={s.name} item={s} divider={i < supplements.length - 1} />
          ))}
        </Card>

        <View style={styles.sectionHead}>
          <Label>This week's meals</Label>
          <BodyStrong style={styles.link}>Swap</BodyStrong>
        </View>
        <Card tone="green">
          <View style={styles.mealTags}>
            {mealFocus.map((m) => (
              <Chip key={m} label={m} variant="onGreen" />
            ))}
          </View>
          <Body style={styles.mealNote}>
            Chosen to raise vitamin D, magnesium, and omega-3 over the next month.
          </Body>
        </Card>
      </View>
    </ScrollView>
  );
}

function SupplementRow({ item, divider }: { item: SupplementVM; divider: boolean }) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={styles.iconTile}>
        <Icon name="capsule" size={17} color={colors.brand} strokeWidth={1.7} />
      </View>
      <View style={styles.rowInfo}>
        <BodyStrong style={styles.rowName}>{item.name}</BodyStrong>
        <Mono style={styles.rowDose}>{item.dose}</Mono>
      </View>
      <Chip label={item.timing} variant="timing" />
    </View>
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
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 13.5,
  },
  rowDose: {
    fontFamily: font.mono,
    fontSize: 9.5,
    color: colors.textFaint,
    marginTop: 1,
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
});
