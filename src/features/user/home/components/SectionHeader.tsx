import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, Spacing, FontFamilies } from '../../../../core/theme';
import { AppIcon } from '../../components';

interface SectionHeaderProps {
  title: string;
  linkLabel?: string;
  onLinkPress?: () => void;
  /** White treatment for sections on dark navy surfaces (Our Impact). */
  light?: boolean;
}

/**
 * Serif section heading with the right-aligned "View All / View More /
 * View Details" link, exactly as in the Home reference.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  linkLabel,
  onLinkPress,
  light = false,
}) => (
  <View style={styles.container}>
    <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
    {linkLabel && (
      <TouchableOpacity
        style={styles.link}
        onPress={onLinkPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${linkLabel} — ${title}`}
      >
        <Text style={[styles.linkLabel, light && styles.linkLabelLight]}>
          {linkLabel}
        </Text>
        <AppIcon
          name="arrow-right"
          size={14}
          color={light ? AdminColors.textOnDark : AdminColors.primaryDark}
        />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    flexShrink: 1,
  },
  titleLight: {
    color: AdminColors.textOnDark,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  linkLabel: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    marginRight: 4,
  },
  linkLabelLight: {
    color: AdminColors.textOnDark,
  },
});
