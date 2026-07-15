/**
 * Navigation: a bottom-tab navigator (custom TabBar) for the five sections,
 * wrapped in a native stack that carries the Upload and Processing modals and
 * the pushed Marker detail. Thin route adapters keep the screens presentational
 * and wire them to navigation + the scan state.
 */

import {
  NavigatorScreenParams,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';

import { TabBar, TabKey } from '@/components/TabBar';
import type { MarkerVM } from '@/data/sample';
import { AccountScreen } from '@/screens/AccountScreen';
import { DeficiencyScreen } from '@/screens/DeficiencyScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { LibraryScreen } from '@/screens/LibraryScreen';
import { MarkerScreen } from '@/screens/MarkerScreen';
import { PlanScreen } from '@/screens/PlanScreen';
import { ProcessingScreen } from '@/screens/ProcessingScreen';
import { UploadScreen } from '@/screens/UploadScreen';
import { useScan } from '@/state/ScanContext';
import { colors } from '@/theme/tokens';

export type TabParamList = {
  Home: undefined;
  Results: undefined;
  Plan: undefined;
  Library: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Upload: undefined;
  Processing: undefined;
  Marker: { marker?: MarkerVM };
  History: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const NAME_TO_KEY: Record<keyof TabParamList, TabKey> = {
  Home: 'home',
  Results: 'results',
  Plan: 'plan',
  Library: 'library',
  Profile: 'profile',
};
const KEY_TO_NAME: Record<TabKey, keyof TabParamList> = {
  home: 'Home',
  results: 'Results',
  plan: 'Plan',
  library: 'Library',
  profile: 'Profile',
};

function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const routeName = state.routes[state.index].name as keyof TabParamList;
  return (
    <TabBar
      active={NAME_TO_KEY[routeName] ?? 'home'}
      onSelect={(key) => navigation.navigate(KEY_TO_NAME[key])}
    />
  );
}

function HomeTab() {
  const nav = useNavigation<Nav>();
  return (
    <HomeScreen
      onScan={() => nav.navigate('Upload')}
      onOpenMarker={(marker) => nav.navigate('Marker', { marker })}
    />
  );
}

function ResultsTab() {
  const nav = useNavigation<Nav>();
  return (
    <DeficiencyScreen
      onOpenMarker={(marker) => nav.navigate('Marker', { marker })}
      onOpenPlan={() => nav.navigate('Tabs', { screen: 'Plan' })}
    />
  );
}

function PlanTab() {
  return <PlanScreen />;
}

function LibraryTab() {
  return <LibraryScreen />;
}

function ProfileTab() {
  const nav = useNavigation<Nav>();
  return <AccountScreen onOpenHistory={() => nav.navigate('History')} />;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeTab} />
      <Tab.Screen name="Results" component={ResultsTab} />
      <Tab.Screen name="Plan" component={PlanTab} />
      <Tab.Screen name="Library" component={LibraryTab} />
      <Tab.Screen name="Profile" component={ProfileTab} />
    </Tab.Navigator>
  );
}

function UploadRoute() {
  const nav = useNavigation<Nav>();
  const { startScan } = useScan();
  return (
    <UploadScreen
      onBack={() => nav.goBack()}
      onPicked={(uri) => {
        startScan(uri);
        nav.replace('Processing');
      }}
    />
  );
}

function ProcessingRoute() {
  const nav = useNavigation<Nav>();
  return <ProcessingScreen onDone={() => nav.navigate('Tabs', { screen: 'Results' })} />;
}

function MarkerRoute() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Marker'>>();
  return <MarkerScreen marker={route.params?.marker} onBack={() => nav.goBack()} />;
}

function HistoryRoute() {
  const nav = useNavigation<Nav>();
  return (
    <HistoryScreen
      onBack={() => nav.goBack()}
      onOpened={() => nav.navigate('Tabs', { screen: 'Results' })}
    />
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Upload" component={UploadRoute} />
        <Stack.Screen name="Processing" component={ProcessingRoute} options={{ gestureEnabled: false }} />
      </Stack.Group>
      <Stack.Screen name="Marker" component={MarkerRoute} />
      <Stack.Screen name="History" component={HistoryRoute} />
    </Stack.Navigator>
  );
}
