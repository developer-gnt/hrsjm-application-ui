import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AdminColors, BorderRadius } from '../../../core/theme';
import { AppIcon } from './icons';

interface ImageSlotProps {
  /**
   * Name of the required brand asset that belongs here (e.g.
   * 'home/hero-portrait.png'). Shown to screen readers and used to document
   * missing assets — no unrelated stock image is substituted.
   */
  assetName: string;
  height?: number;
  width?: number;
  radius?: number;
  /** 'navy' for slots sitting inside dark navy surfaces (hero, banner). */
  tone?: 'neutral' | 'navy';
  style?: ViewStyle;
}

/**
 * Placeholder for photography assets that are not bundled with the app yet.
 * Renders a quiet, intentional surface with an image glyph so layouts can be
 * reviewed without inventing unrelated stock imagery. Replace with an
 * <Image source={require(...)} /> once the approved asset lands in
 * src/assets/images/.
 */
export const ImageSlot: React.FC<ImageSlotProps> = ({
  assetName,
  height,
  width,
  radius = BorderRadius.lg,
  tone = 'neutral',
  style,
}) => (
  <View
    style={[
      styles.slot,
      tone === 'navy' ? styles.slotNavy : styles.slotNeutral,
      { borderRadius: radius, height, width },
      style,
    ]}
    accessible
    accessibilityRole="image"
    accessibilityLabel={`Image placeholder — required asset: ${assetName}`}
  >
    <View style={styles.glyph}>
      <AppIcon
        name="image"
        size={22}
        color={tone === 'navy' ? AdminColors.textOnDark : AdminColors.textMuted}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotNeutral: {
    backgroundColor: AdminColors.primaryLight,
  },
  slotNavy: {
    backgroundColor: AdminColors.primaryDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  glyph: {
    opacity: 0.55,
  },
});
