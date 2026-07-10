/**
 * App root. Loads the brand fonts, then renders a lightweight preview shell:
 * a bottom tab bar plus two pushable detail screens (upload, marker).
 *
 * This navigation is intentionally minimal and stands in for react-navigation.
 * It exists so the screens and components can be exercised as a running app.
 * The Copilot lane replaces this shell with a real navigator and real data
 * (see services/mobile/README.md).
 */

import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TabBar, TabKey } from '@/components/TabBar';
import { Display, Mono } from '@/components/Text';
import { DeficiencyScreen } from '@/screens/DeficiencyScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { LibraryScreen } from '@/screens/LibraryScreen';
import { MarkerScreen } from '@/screens/MarkerScreen';
import { PlanScreen } from '@/screens/PlanScreen';
import { UploadScreen } from '@/screens/UploadScreen';
import { priorityMarker } from '@/data/sample';
import type { MarkerVM } from '@/data/sample';
import { colors } from '@/theme/tokens';
import { useAppFonts } from '@/theme/useAppFonts';

type Overlay = { kind: 'upload' } | { kind: 'marker'; marker: MarkerVM } | null;

/**
 * Preview aid: on web, `?screen=<key>` picks the initial screen so every screen
 * can be linked or screenshotted from a single build. No effect on native.
 */
function initialScreen(): { tab: TabKey; overlay: Overlay } {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const s = new URLSearchParams(window.location.search).get('screen');
    if (s === 'upload') return { tab: 'home', overlay: { kind: 'upload' } };
    if (s === 'marker') return { tab: 'home', overlay: { kind: 'marker', marker: priorityMarker } };
    if (s === 'results' || s === 'plan' || s === 'library' || s === 'profile') {
      return { tab: s, overlay: null };
    }
  }
  return { tab: 'home', overlay: null };
}

export default function App() {
  const fontsLoaded = useAppFonts();
  const start = initialScreen();
  const [tab, setTab] = useState<TabKey>(start.tab);
  const [overlay, setOverlay] = useState<Overlay>(start.overlay);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  const openMarker = (marker: MarkerVM) => setOverlay({ kind: 'marker', marker });
  const closeOverlay = () => setOverlay(null);

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return <HomeScreen onScan={() => setOverlay({ kind: 'upload' })} onOpenMarker={openMarker} />;
      case 'results':
        return (
          <DeficiencyScreen
            onBack={() => setTab('home')}
            onOpenMarker={openMarker}
            onOpenPlan={() => setTab('plan')}
          />
        );
      case 'plan':
        return <PlanScreen onBack={() => setTab('home')} />;
      case 'library':
        return <LibraryScreen onBack={() => setTab('home')} />;
      case 'profile':
        return <ProfilePlaceholder />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {overlay ? (
          overlay.kind === 'upload' ? (
            <UploadScreen onBack={closeOverlay} />
          ) : (
            <MarkerScreen marker={overlay.marker} onBack={closeOverlay} />
          )
        ) : (
          <>
            <View style={styles.flex}>{renderTab()}</View>
            <TabBar active={tab} onSelect={setTab} />
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function ProfilePlaceholder() {
  return (
    <View style={styles.placeholder}>
      <Display>Profile</Display>
      <Mono style={styles.placeholderNote}>Wired by the app lane</Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.paper,
  },
  placeholderNote: {
    color: colors.textFaint,
  },
});
