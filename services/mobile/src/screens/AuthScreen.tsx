/**
 * Sign in / create account. Talks to the Node API through AuthContext. Offers a
 * "Continue as guest" path so the app is usable without an account (guest scans
 * hit the engine directly / fall back to sample data).
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/components/Button';
import { Body, BodyStrong, Display, Label, Mono } from '@/components/Text';
import { useAuth } from '@/state/AuthContext';
import { colors, font, radius, space, tint } from '@/theme/tokens';

type Mode = 'login' | 'signup';

export function AuthScreen() {
  const { signIn, signUp, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const canSubmit = emailValid && password.length >= 8 && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <Label style={styles.kicker}>LabOptimal</Label>
          <Display style={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </Display>
          <Body style={styles.sub}>
            {mode === 'login'
              ? 'Sign in to see your scans and history.'
              : 'Track your lab work over time, privately.'}
          </Body>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Label style={styles.fieldLabel}>Email</Label>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              editable={!busy}
            />
          </View>

          <View style={styles.field}>
            <Label style={styles.fieldLabel}>Password</Label>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textFaint}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              editable={!busy}
              onSubmitEditing={submit}
            />
          </View>

          {error ? <Mono style={styles.error}>{error}</Mono> : null}

          <View style={styles.submit}>
            {busy ? (
              <View style={styles.busy}>
                <ActivityIndicator color={colors.brand} />
              </View>
            ) : (
              <PrimaryButton
                label={mode === 'login' ? 'Sign in' : 'Create account'}
                onPress={submit}
              />
            )}
          </View>

          <Pressable
            onPress={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            disabled={busy}
            hitSlop={8}
          >
            <Body style={styles.switch}>
              {mode === 'login' ? (
                <>
                  New here? <BodyStrong style={styles.switchStrong}>Create an account</BodyStrong>
                </>
              ) : (
                <>
                  Have an account? <BodyStrong style={styles.switchStrong}>Sign in</BodyStrong>
                </>
              )}
            </Body>
          </Pressable>
        </View>

        <View style={styles.guestWrap}>
          <View style={styles.divider} />
          <Pressable onPress={continueAsGuest} disabled={busy} hitSlop={8}>
            <Body style={styles.guest}>Continue as guest</Body>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl,
    gap: space.xxl,
  },
  brand: { gap: 8 },
  kicker: { color: colors.brand, letterSpacing: 2 },
  title: { fontSize: 28, lineHeight: 32 },
  sub: { color: colors.textMuted },
  form: { gap: space.lg },
  field: { gap: 6 },
  fieldLabel: { color: colors.textMuted },
  input: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: font.sans,
    fontSize: 15,
    color: colors.ink,
  },
  error: {
    color: colors.statusLow,
    fontSize: 12,
    backgroundColor: tint.low,
    padding: 10,
    borderRadius: radius.sm,
  },
  submit: { marginTop: 4 },
  busy: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: { textAlign: 'center', color: colors.textMuted },
  switchStrong: { color: colors.brand },
  guestWrap: { alignItems: 'center', gap: space.lg },
  divider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.hairline,
  },
  guest: { color: colors.textMuted, textDecorationLine: 'underline' },
});
