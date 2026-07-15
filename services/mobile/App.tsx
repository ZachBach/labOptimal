/**
 * App root: load the brand fonts, provide auth + scan state, and mount the
 * navigator. Routing is gated on auth: a loading splash while the session is
 * restored, the Auth screen when signed out, and the main app once signed in or
 * continuing as a guest. Web deep-link paths are wired through the linking
 * config.
 */

import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { RootNavigator, RootStackParamList } from '@/navigation/RootNavigator';
import { AuthScreen } from '@/screens/AuthScreen';
import { AuthProvider, useAuth } from '@/state/AuthContext';
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
      History: 'history',
    },
  },
};

function Splash() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.brand} />
    </View>
  );
}

/** Chooses the auth screen or the main app based on session state. */
function Gate() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <Splash />;
  }

  if (status === 'signedOut') {
    return <AuthScreen />;
  }

  // signedIn | guest -> full app, with scan state scoped to the session.
  return (
    <ScanProvider>
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </ScanProvider>
  );
}

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return <Splash />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <Gate />
        </SafeAreaView>
      </AuthProvider>
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
