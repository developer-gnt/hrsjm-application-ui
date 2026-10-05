/**
 * Reusable white rounded section card for the My Profile page: pastel
 * header row (icon + title + Edit action) followed by arbitrary
 * content rows — matching the approved reference layout.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AdminColors } from '../../../../core';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';

interface ProfileSectionCardProps {
  icon: React.ReactNode;
  title: string;
  backgroundColor: string;
  onEdit?: () => void;
  editLabel?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ProfileSectionCard: React.FC<ProfileSectionCardProps> = ({
  icon,
  title,
  backgroundColor,
  onEdit,
  editLabel = 'Edit',
  children,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.headerRow, { backgroundColor }]}>
        <View style={styles.headerLeft}>
          {icon}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {onEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${title}`}
          >
            <Text style={styles.editGlyph}>✎</Text>
            <Text style={styles.editLabel}>{editLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    overflow: 'hidden',
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md - 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    ...Typography.bodyBold,
    color: AdminColors.primaryDark,
    marginLeft: Spacing.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(27, 63, 143, 0.18)',
  },
  editGlyph: {
    fontSize: 11,
    color: AdminColors.primary,
    marginRight: 4,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  body: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
  },
});

export default ProfileSectionCard;
