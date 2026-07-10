/**
 * Loads the three brand fonts (Newsreader, Public Sans, IBM Plex Mono) via
 * @expo-google-fonts. Returns a boolean the app root uses to hold rendering
 * until type is ready, so the UI never flashes in a fallback face.
 */

import { useFonts } from 'expo-font';
import {
  Newsreader_400Regular,
  Newsreader_500Medium,
  Newsreader_500Medium_Italic,
} from '@expo-google-fonts/newsreader';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_500Medium,
    Newsreader_500Medium_Italic,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  return loaded;
}
