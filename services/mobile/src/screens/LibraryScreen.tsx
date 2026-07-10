/**
 * Nutrient library: the public evidence library inside the app, the same
 * dossiers the umbrella site serves.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Body, BodyStrong, Label, Mono } from '@/components/Text';
import { dossiers } from '@/data/sample';
import type { DossierVM } from '@/data/sample';
import { colors, font, radius, space, tint } from '@/theme/tokens';

interface LibraryScreenProps {
  onBack?: () => void;
}

export function LibraryScreen({ onBack }: LibraryScreenProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Nutrient library" subtitle="Open evidence, updated weekly" onBack={onBack} />

      <View style={styles.body}>
        <View style={styles.search}>
          <Icon name="search" size={16} color={colors.textFaint} strokeWidth={1.8} />
          <Body style={styles.searchText}>Search nutrients and markers</Body>
        </View>

        <View style={styles.sectionHead}>
          <Label>Dossiers</Label>
          <BodyStrong style={styles.link}>A to Z</BodyStrong>
        </View>

        <Card flush>
          {dossiers.map((d, i) => (
            <DossierRow key={d.name} item={d} divider={i < dossiers.length - 1} />
          ))}
        </Card>

        <View style={styles.publicNote}>
          <Icon name="globe" size={16} color="#A8481B" strokeWidth={1.7} />
          <Body style={styles.publicText}>
            Every dossier is also public at groundwork.science
          </Body>
        </View>
      </View>
    </ScrollView>
  );
}

function DossierRow({ item, divider }: { item: DossierVM; divider: boolean }) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={styles.rowInfo}>
        <BodyStrong style={styles.rowName}>{item.name}</BodyStrong>
        <Mono style={styles.rowMeta}>
          {item.sources} sources · {item.updated}
        </Mono>
      </View>
      <Mono style={styles.chevron}>›</Mono>
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 14,
  },
  searchText: {
    fontSize: 13,
    color: colors.textFaint,
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
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 13.5,
  },
  rowMeta: {
    fontFamily: font.mono,
    fontSize: 9.5,
    color: colors.textFaint,
    marginTop: 2,
  },
  chevron: {
    fontSize: 12,
    color: colors.textFaint,
  },
  publicNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    backgroundColor: tint.ember,
    borderRadius: 11,
  },
  publicText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#6B4A38',
  },
});
