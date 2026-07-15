/**
 * Scan history: the signed-in user's past scans (GET /scans). Pull to refresh;
 * tap a completed scan to load its protocol into Results.
 */

import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import { Body, BodyStrong, Mono } from '@/components/Text';
import type { ScanStatusValue } from '@/api/apiClient';
import { useScan } from '@/state/ScanContext';
import { colors, space } from '@/theme/tokens';
import type { StatusBucket } from '@/types/protocol';

interface HistoryScreenProps {
  onBack?: () => void;
  onOpened?: () => void;
}

const STATUS_PILL: Record<ScanStatusValue, { variant: StatusBucket; label: string }> = {
  complete: { variant: 'in_range', label: 'Ready' },
  processing: { variant: 'watch', label: 'Processing' },
  failed: { variant: 'low', label: 'Failed' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function HistoryScreen({ onBack, onOpened }: HistoryScreenProps) {
  const { history, refreshHistory, openScan } = useScan();
  const [refreshing, setRefreshing] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  };

  const open = async (id: string, status: ScanStatusValue) => {
    if (status !== 'complete' || opening) return;
    setOpening(id);
    try {
      await openScan(id);
      onOpened?.();
    } finally {
      setOpening(null);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="History" subtitle={`${history.length} scans`} onBack={onBack} />

      <View style={styles.list}>
        {history.length === 0 ? (
          <Card style={styles.empty}>
            <Icon name="file-text" size={26} color={colors.textFaint} strokeWidth={1.6} />
            <BodyStrong style={styles.emptyTitle}>No scans yet</BodyStrong>
            <Body style={styles.emptySub}>Scan a lab report and it will show up here.</Body>
          </Card>
        ) : (
          history.map((scan) => {
            const pill = STATUS_PILL[scan.status];
            const tappable = scan.status === 'complete';
            return (
              <Pressable
                key={scan.id}
                onPress={() => open(scan.id, scan.status)}
                disabled={!tappable}
                style={({ pressed }) => (pressed && tappable ? styles.pressed : null)}
              >
                <Card style={styles.row}>
                  <View style={styles.rowMain}>
                    <BodyStrong>{formatDate(scan.createdAt)}</BodyStrong>
                    <Mono style={styles.id}>#{scan.id.slice(0, 8)}</Mono>
                  </View>
                  <View style={styles.rowRight}>
                    <StatusPill variant={pill.variant} label={opening === scan.id ? 'Opening' : pill.label} />
                    {tappable ? <Icon name="chevron-right" size={18} color={colors.textFaint} /> : null}
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: space.xxl },
  list: { paddingHorizontal: space.xl, gap: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowMain: { gap: 3 },
  id: { color: colors.textFaint },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pressed: { opacity: 0.6 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: space.xxl },
  emptyTitle: { marginTop: 4 },
  emptySub: { color: colors.textMuted, textAlign: 'center' },
});
