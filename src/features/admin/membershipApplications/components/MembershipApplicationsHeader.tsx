import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import {
  AdminColors,
  Spacing,
  BorderRadius,
  FontFamilies,
  Typography,
} from '../../../../core';

export interface MembershipApplicationsHeaderProps {
  paddingTop?: number;
  title?: string;
  subtitle?: string;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onSignupPress?: () => void;
  onNavigate?: (target: string) => void;
}

/**
 * Standardized MembershipApplicationsHeader per docs/design.md:
 * - Standardized primary navigation header with #FFFFFF background, 56px height,
 *   subtle lower border #DCE4EC, official brand emblem, notifications with unread badge,
 *   and profile avatar with dropdown actions.
 * - Warm ivory #FAF7F0 editorial page title section directly below.
 */
export const MembershipApplicationsHeader: React.FC<MembershipApplicationsHeaderProps> = ({
  title = 'Membership Applications',
  subtitle = 'Review, verify and manage membership applications.',
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
  onSignupPress,
  onNavigate,
}) => {
  return (
    <View style={styles.container}>
      {/* Standardized Primary Navigation Header per docs/design.md */}
      <AdminHeader
        onOpenMore={onMenuPress}
        onPressNotifications={onNotificationsPress}
        onPressProfile={onProfilePress}
        onNavigate={onNavigate}
      />

      {/* Editorial Content Title Section */}
      <View style={styles.titleSectionWrapper}>
        <View style={styles.titleRow}>
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>{title}</Text>
            {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
          </View>
          {onSignupPress ? (
            <TouchableOpacity
              style={styles.signupButton}
              onPress={onSignupPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Test Sign Up flow"
            >
              <Text style={styles.signupButtonIcon}>👤+</Text>
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF7F0',
  },
  titleSectionWrapper: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleSection: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  pageTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#0B2F52',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: '#718096',
    marginTop: 3,
    lineHeight: 18,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAD465',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.button,
    gap: 5,
    marginTop: 2,
    elevation: 2,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  signupButtonIcon: {
    fontSize: 12,
    color: '#011F39',
  },
  signupButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#011F39',
  },
});

export default MembershipApplicationsHeader;
