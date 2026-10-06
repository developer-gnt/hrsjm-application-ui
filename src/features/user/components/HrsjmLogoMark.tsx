import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AdminColors, BorderRadius } from '../../../core/theme';
import HrsjmLogoSource from '../../../assets/images/hrsjm-logo.png';

interface HrsjmLogoMarkProps {
  /** Rendered height in dp; width follows the artwork's aspect ratio. */
  height?: number;
  /**
   * On dark navy surfaces the artwork's white background is presented inside
   * a small rounded plate so the lockup stays crisp and legible.
   */
  variant?: 'default' | 'onDark';
}

/**
 * Official HRSJM logo lockup (shield emblem + wordmark + English and Hindi
 * taglines) used consistently across the user app. The full artwork is
 * always visible: the image keeps the source aspect ratio and scales with
 * `height`, so it is never stretched or cropped.
 */
export const HrsjmLogoMark: React.FC<HrsjmLogoMarkProps> = ({
  height = 44,
  variant = 'default',
}) => {
  const logo = (
    <Image
      source={HrsjmLogoSource}
      style={{ height, aspectRatio: 4.161 }}
      resizeMode="contain"
    />
  );

  if (variant === 'onDark') {
    return (
      <View
        style={[styles.plate, { padding: height * 0.12 }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel="HRSJM logo"
      >
        {logo}
      </View>
    );
  }

  return (
    <View accessible accessibilityRole="image" accessibilityLabel="HRSJM logo">
      {logo}
    </View>
  );
};

const styles = StyleSheet.create({
  plate: {
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
