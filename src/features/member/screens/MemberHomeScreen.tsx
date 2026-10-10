import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../core/components/common/AppHeader';
import { AppCard } from '../../../core/components/common/AppCard';
import { AppButton } from '../../../core/components/common/AppButton';
import { AdminColors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { Spacing } from '../../../core/theme/spacing';
import { useAuthStore } from '../../auth/store/authStore';

export const MemberHomeScreen: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Member Portal" />
      <ScrollView contentContainerStyle={styles.container}>
        <AppCard style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            Welcome back, {user?.full_name || 'Member'}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Human Rights and Social Justice Mission — Member Portal
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE MEMBER</Text>
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Digital Membership Card</Text>
          <Text style={styles.cardBody}>
            Your verified digital ID and membership certificate are accessible here.
          </Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Contributions & Renewals</Text>
          <Text style={styles.cardBody}>
            Track your membership fee payments, history, and receipts.
          </Text>
        </AppCard>

        <View style={styles.actionContainer}>
          <AppButton
            title="Log Out"
            variant="outline"
            onPress={signOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: Spacing.base,
    gap: 14,
  },
  welcomeCard: {
    backgroundColor: AdminColors.primaryLight,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    padding: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.screenTitle,
    color: AdminColors.primary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  card: {
    padding: Spacing.lg,
  },
  cardTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardBody: {
    ...Typography.body,
    color: AdminColors.textSecondary,
  },
  actionContainer: {
    marginTop: Spacing.md,
  },
});

export default MemberHomeScreen;
