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

export const DonorHomeScreen: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="HRSJM Public & Donor Portal" />
      <ScrollView contentContainerStyle={styles.container}>
        <AppCard style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            {user ? `Welcome, ${user.full_name}` : 'Welcome to HRSJM'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Human Rights and Social Justice Mission
          </Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Active Campaigns</Text>
          <Text style={styles.cardBody}>
            Explore ongoing social welfare causes and relief funds.
          </Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>My Donations & 80G Receipts</Text>
          <Text style={styles.cardBody}>
            Download tax-exemption certificates for your contributions.
          </Text>
        </AppCard>

        {user ? (
          <View style={styles.actionContainer}>
            <AppButton
              title="Log Out"
              variant="outline"
              onPress={signOut}
            />
          </View>
        ) : null}
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
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    padding: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.screenTitle,
    color: '#047857',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
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

export default DonorHomeScreen;
