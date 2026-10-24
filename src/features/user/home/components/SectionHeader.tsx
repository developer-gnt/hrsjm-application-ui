import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, Spacing, UserFontFamilies } from '../../../../core/theme';
import { AppIcon } from '../../components';

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  linkLabel?: string;
  onLinkPress?: () => void;
  /** White treatment for sections on dark navy surfaces (Our Impact). */
  light?: boolean;
}

/**
 * Editorial section heading with uppercase eyebrow (docs/design.md §10)
 * and the right-aligned "View All / View More / View Details" link.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  eyebrow,
  linkLabel,
  onLinkPress,
  light = false,
}) => (
  <View style={styles.container}>
    <View style={styles.titleCol}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, light && styles.eyebrowLight]}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
    </View>
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
          color={light ? '#FAD465' : AdminColors.primaryDark}
        />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleCol: {
    flexShrink: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C9971A', // color-gold-700
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 3,
    fontFamily: 'Inter',
  },
  eyebrowLight: {
    color: '#FAD465', // color-gold-500
  },
  title: {
    fontFamily: UserFontFamilies.heading,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: -0.2,
  },
  titleLight: {
    color: '#FFFFFF',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  linkLabel: {
    fontFamily: UserFontFamilies.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#06294D',
    marginRight: 4,
  },
  linkLabelLight: {
    fontFamily: UserFontFamilies.sans,
    color: AdminColors.textOnDark,
  },
});
