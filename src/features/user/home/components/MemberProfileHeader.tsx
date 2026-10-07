import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { MemberGreeting } from '../types/home.types';

interface MemberProfileHeaderProps {
  greeting: MemberGreeting;
  onViewProfile?: () => void;
}

/**
 * Reference-locked member greeting row: circular avatar, "Assalamu Alaikum,"
 * member name, gold Member badge and the "View Profile →" pill. The avatar
 * photo is a pending asset — an initials disc is shown meanwhile.
 */
export const MemberProfileHeader: React.FC<MemberProfileHeaderProps> = ({
  greeting,
  onViewProfile,
}) => (
  <View style={styles.container}>
    <View
      style={styles.avatar}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Profile photo placeholder — required asset: home/member-avatar.png`}
    >
      <Text style={styles.avatarInitials}>{greeting.initials}</Text>
    </View>

    <View style={styles.identity}>
      <Text style={styles.salutation}>{greeting.salutation}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {greeting.memberName}
      </Text>
      <View style={styles.badge}>
        <AppIcon name="check" size={10} color={AdminColors.textOnDark} strokeWidth={2.4} />
        <Text style={styles.badgeLabel}>{greeting.badgeLabel}</Text>
      </View>
    </View>

    <TouchableOpacity
      style={styles.profileButton}
      onPress={onViewProfile}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="View profile"
    >
      <Text style={styles.profileButtonText}>View Profile</Text>
      <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: AdminColors.primaryLight,
    borderWidth: 1.5,
    borderColor: AdminColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  identity: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: Spacing.md,
  },
  salutation: {
    fontSize: 12,
    lineHeight: 16,
    color: AdminColors.textSecondary,
  },
  name: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: AdminColors.accentGold,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginTop: 5,
    gap: 4,
  },
  badgeLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    color: AdminColors.textOnDark,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.cardSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  profileButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    marginRight: 5,
  },
});
