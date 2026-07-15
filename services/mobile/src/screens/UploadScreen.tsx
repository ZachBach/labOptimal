/**
 * Upload: the core gesture. Frame a report, capture or import it, with privacy
 * stated up front and a live parsing progress card. Content eases in.
 */

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PrimaryButton, SecondaryButton } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Reveal } from '@/components/motion';
import { Body, BodyStrong, Label, Mono } from '@/components/Text';
import { colors, font, radius, space, tint } from '@/theme/tokens';

interface UploadScreenProps {
  onBack?: () => void;
  /** Called with the picked image uri (or undefined for a demo import) once the
   *  user has chosen a source; the navigator starts the scan and pushes on. */
  onPicked?: (uri?: string) => void;
}

export function UploadScreen({ onBack, onPicked }: UploadScreenProps) {
  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!res.canceled) onPicked?.(res.assets[0]?.uri);
    } catch {
      // Camera unavailable (e.g. web) — fall back to a demo import.
      onPicked?.();
    }
  };

  const uploadFile = async () => {
    try {
      // Accept a PDF export or an image file from the device's document store.
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled) onPicked?.(res.assets[0]?.uri);
    } catch {
      onPicked?.();
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="New lab report" onBack={onBack} />

      <View style={styles.body}>
        <Reveal delay={40}>
          <View style={styles.dropzone}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <View style={styles.cameraCircle}>
              <Icon name="camera" size={30} color={colors.brand} strokeWidth={1.7} />
            </View>
            <View style={styles.dropzoneText}>
              <BodyStrong style={styles.dropTitle}>Position your report in the frame</BodyStrong>
              <Body style={styles.dropSub}>PDF, photo, or portal import</Body>
            </View>
          </View>
        </Reveal>

        <Reveal delay={140}>
          <View style={styles.primaryWrap}>
            <PrimaryButton label="Take photo" icon="aperture" onPress={takePhoto} />
          </View>
          <View style={styles.secondaryRow}>
            <SecondaryButton label="Upload file" onPress={uploadFile} />
            <SecondaryButton label="Connect portal" onPress={() => onPicked?.()} />
          </View>

          <View style={styles.privacy}>
            <Icon name="lock" size={16} color={colors.brand} strokeWidth={1.9} />
            <Body style={styles.privacyText}>
              Processed on your device. Nothing shared without your say.
            </Body>
          </View>

          <Card style={styles.progress}>
            <View style={styles.progressHead}>
              <Label>Reading 3 pages</Label>
              <Mono style={styles.progressCount}>24 markers found</Mono>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </Card>
        </Reveal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingBottom: space.xxl,
  },
  body: {
    paddingHorizontal: space.xl,
  },
  dropzone: {
    minHeight: 250,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(28, 107, 74, 0.4)',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 20,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.brand,
  },
  tl: { top: 14, left: 14, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4 },
  tr: { top: 14, right: 14, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4 },
  bl: { bottom: 14, left: 14, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4 },
  br: { bottom: 14, right: 14, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: tint.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneText: {
    alignItems: 'center',
  },
  dropTitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  dropSub: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 4,
  },
  primaryWrap: {
    marginTop: 16,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 16,
    padding: 12,
    backgroundColor: tint.brand,
    borderRadius: 11,
  },
  privacyText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#3A4A40',
  },
  progress: {
    marginTop: 12,
    paddingVertical: 12,
  },
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCount: {
    fontFamily: font.monoSemiBold,
    fontSize: 10,
    color: colors.brand,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceInset,
    overflow: 'hidden',
  },
  progressFill: {
    width: '68%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.brandBright,
  },
});
