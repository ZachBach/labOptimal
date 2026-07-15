/**
 * The parsing takeover: a dark scan animation over a document mock while the
 * (currently simulated) parse runs, with a live progress bar and marker count.
 * Navigates onward via `onDone` when the scan completes.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Display, Label, Mono } from '@/components/Text';
import { useScan } from '@/state/ScanContext';
import { colors, font } from '@/theme/tokens';
import { diagonal, gradients } from '@/theme/gradients';

const DOC_W = 190;
const DOC_H = 150;

interface ProcessingScreenProps {
  onDone: () => void;
}

export function ProcessingScreen({ onDone }: ProcessingScreenProps) {
  const { status, progress, markersFound } = useScan();

  useEffect(() => {
    if (status === 'complete') onDone();
  }, [status, onDone]);

  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [y]);
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * (DOC_H - 8) }] }));

  return (
    <LinearGradient colors={gradients.hero} start={diagonal.start} end={diagonal.end} style={styles.screen}>
      <View style={styles.doc}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        {[0.82, 0.64, 0.72, 0.5, 0.68, 0.44].map((w, i) => (
          <View key={i} style={[styles.textLine, { width: `${w * 100}%` }]} />
        ))}
        <Animated.View style={[styles.scanLine, lineStyle]} />
      </View>

      <Display style={styles.title}>Reading your labs</Display>
      <Label color={colors.brandOnDark} style={styles.subtitle}>
        Finding your markers
      </Label>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <Mono style={styles.count}>
        {markersFound} markers found
      </Mono>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  doc: {
    width: DOC_W,
    height: DOC_H,
    borderRadius: 14,
    backgroundColor: '#FFFDF8',
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 12,
    overflow: 'hidden',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 14,
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: colors.brandBright,
    zIndex: 2,
  },
  tl: { top: 8, left: 8, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4 },
  tr: { top: 8, right: 8, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4 },
  bl: { bottom: 8, left: 8, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4 },
  br: { bottom: 8, right: 8, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },
  textLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E4DAC7',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    height: 3,
    backgroundColor: colors.brandBright,
    shadowColor: colors.brandBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    color: colors.paper,
    fontSize: 26,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 30,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,253,248,0.14)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.brandBright,
  },
  count: {
    marginTop: 12,
    fontSize: 12,
    color: colors.onGreenFaint,
    fontFamily: font.monoSemiBold,
  },
});
