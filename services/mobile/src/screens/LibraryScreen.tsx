/**
 * Nutrient library: the public evidence library, with a working search filter.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Reveal } from '@/components/motion';
import { Body, BodyStrong, Label, Mono } from '@/components/Text';
import { dossiers } from '@/data/sample';
import type { DossierVM } from '@/data/sample';
import { colors, font, radius, space, tint } from '@/theme/tokens';

interface LibraryScreenProps {
  onBack?: () => void;
}

export function LibraryScreen({ onBack }: LibraryScreenProps) {
  const [query, setQuery] = useState('');
  const filtered = dossiers.filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Nutrient library" subtitle="Open evidence, updated weekly" onBack={onBack} />

      <View style={styles.body}>
        <Reveal delay={40}>
          <View style={styles.search}>
            <Icon name="search" size={16} color={colors.textFaint} strokeWidth={1.8} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search nutrients and markers"
              placeholderTextColor={colors.textFaint}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Reveal>

        <Reveal delay={120}>
          <View style={styles.sectionHead}>
            <Label>Dossiers</Label>
            <BodyStrong style={styles.link}>{query ? `${filtered.length} found` : 'A to Z'}</BodyStrong>
          </View>
          {filtered.length > 0 ? (
            <Card flush>
              {filtered.map((d, i) => (
                <DossierRow key={d.name} item={d} divider={i < filtered.length - 1} />
              ))}
            </Card>
          ) : (
            <Card style={styles.empty}>
              <Mono style={styles.emptyText}>No dossiers match "{query}"</Mono>
            </Card>
          )}
        </Reveal>

        <Reveal delay={220}>
          <View style={styles.publicNote}>
            <Icon name="globe" size={16} color="#A8481B" strokeWidth={1.7} />
            <Body style={styles.publicText}>
              Every dossier is also public at groundwork.science
            </Body>
          </View>
        </Reveal>
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
  searchInput: {
    flex: 1,
    padding: 0,
    fontFamily: font.sans,
    fontSize: 13,
    color: colors.ink,
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
  empty: {
    alignItems: 'center',
    paddingVertical: 22,
  },
  emptyText: {
    fontSize: 11,
    color: colors.textFaint,
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
