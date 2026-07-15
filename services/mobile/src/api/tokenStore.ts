/**
 * Persisted auth token.
 *
 * Uses expo-secure-store on native (Keychain / Keystore). SecureStore is not
 * available on web, so there we fall back to localStorage, which is the best
 * option the browser offers for an Expo web build.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'laboptimal.jwt';

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(KEY, token);
    } catch {
      // storage disabled (private mode); token just won't persist
    }
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}

export async function loadToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.removeItem(KEY);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
