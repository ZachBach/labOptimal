/**
 * App root: load the brand fonts, provide scan state, and mount the navigator.
 * Web deep-link paths (/results, /plan, /marker, ...) are wired through the
 * linking config.
 */

import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { RootNavigator, RootStackParamList } from '@/navigation/RootNavigator';
import { ScanProvider } from '@/state/ScanContext';
import { colors } from '@/theme/tokens';
import { useAppFonts } from '@/theme/useAppFonts';

const linking: LinkingOptions<RootStackParamList> = {
  enabled: true,
  prefixes: [],
  config: {
    screens: {
      Tabs: {
        screens: {
          Home: '',
          Results: 'results',
          Plan: 'plan',
          Library: 'library',
          Profile: 'profile',
        },
      },
      Upload: 'upload',
      Processing: 'processing',
      Marker: 'marker',
    },
  },
};

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ScanProvider>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </ScanProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
});
