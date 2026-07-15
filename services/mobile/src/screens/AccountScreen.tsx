/**
 * Account tab: who you're signed in as, a shortcut into scan history, and sign
 * out. For a guest it invites creating an account instead.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon, IconName } from '@/components/Icon';
import { Body, BodyStrong, Display, Label, Mono } from '@/components/Text';
import { useAuth } from '@/state/AuthContext';
import { colors, radius, space, tint } from '@/theme/tokens';

interface AccountScreenProps {
  onOpenHistory?: () => void;
}

function Row({
  icon,
  label,
  sub,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const color = danger ? colors.statusLow : colors.ink;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressed : null)}>
      <Card style={styles.row}>
        <View style={[styles.rowIcon, { backgroundColor: danger ? tint.low : tint.brand }]}>
          <Icon name={icon} size={18} color={danger ? colors.statusLow : colors.brand} strokeWidth={1.8} />
        </View>
        <View style={styles.rowText}>
          <BodyStrong style={{ color }}>{label}</BodyStrong>
          {sub ? <Body style={styles.rowSub}>{sub}</Body> : null}
        </View>
        <Icon name="chevron-right" size={18} color={colors.textFaint} />
      </Card>
    </Pressable>
  );
}

export function AccountScreen({ onOpenHistory }: AccountScreenProps) {
  const { status, user, signOut } = useAuth();
  const isGuest = status === 'guest';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Label style={styles.kicker}>Account</Label>
        <Display style={styles.title}>{isGuest ? 'Guest' : (user?.email ?? 'You')}</Display>
        {isGuest ? (
          <Body style={styles.sub}>You're browsing as a guest. Scans aren't saved.</Body>
        ) : (
          <Mono style={styles.sub}>Signed in</Mono>
        )}
      </View>

      <View style={styles.rows}>
        {!isGuest ? (
          <Row icon="clock" label="Scan history" sub="Your past lab scans" onPress={onOpenHistory} />
        ) : null}
        <Row
          icon="log-out"
          label={isGuest ? 'Sign in or create account' : 'Sign out'}
          sub={isGuest ? 'Save your scans across devices' : undefined}
          onPress={signOut}
          danger={!isGuest}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: space.xl, paddingTop: space.xxl, paddingBottom: space.xxl, gap: space.xxl },
  header: { gap: 6 },
  kicker: { color: colors.brand, letterSpacing: 2 },
  title: { fontSize: 26, lineHeight: 30 },
  sub: { color: colors.textMuted },
  rows: { gap: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowSub: { color: colors.textMuted, fontSize: 12.5 },
  pressed: { opacity: 0.6 },
});
