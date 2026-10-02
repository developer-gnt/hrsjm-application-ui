import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors, StatusTones, StatusToneKey } from '../../../../core/theme/colors';
import { Spacing } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppIconComponent } from '../../../../core/components/icons';
import { SkeletonCard } from '../../../../core/components/feedback/SkeletonCard';

interface MembersStateViewProps {
  Icon: AppIconComponent;
  tone: StatusToneKey;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

const ICON_CONTAINER = 64;

/**
 * Generic empty/no-results/error presentation for the members list —
 * outline icon in a soft tinted circle, clear copy, one recovery action.
 */
export const MembersStateView: React.FC<MembersStateViewProps> = ({
  Icon,
  tone,
  title,
  description,
  actionTitle,
  onAction,
}) => {
  const colors = StatusTones[tone];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
        <Icon size={28} color={colors.solid} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant="outline"
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
        />
      )}
    </View>
  );
};

/** Initial-loading skeleton list (shimmer cards, never a blank screen). */
export const MembersLoadingState: React.FC = () => {
  return (
    <View style={styles.skeletonList}>
      {[0, 1, 2, 3].map(index => (
        <SkeletonCard key={index} height={92} borderRadius={12} style={styles.skeletonItem} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl + Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: ICON_CONTAINER,
    height: ICON_CONTAINER,
    borderRadius: ICON_CONTAINER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.sectionHeader,
    color: BrandColors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: BrandColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
    maxWidth: 300,
  },
  actionButton: {
    minHeight: 42,
    paddingHorizontal: Spacing.xl,
    borderColor: BrandColors.navy,
    borderWidth: 1.5,
  },
  actionButtonText: {
    color: BrandColors.navy,
  },
  skeletonList: {
    gap: Spacing.sm + 2,
  },
  skeletonItem: {
    width: '100%',
  },
});

export default MembersStateView;
