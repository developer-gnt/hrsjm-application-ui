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

export const SeekerHomeScreen: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="Donation Assistance Portal" />
      <ScrollView contentContainerStyle={styles.container}>
        <AppCard style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            Hello, {user?.full_name || 'Friend'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Human Rights and Social Justice Mission — Assistance Portal
          </Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>My Assistance Requests</Text>
          <Text style={styles.cardBody}>
            View status, officer feedback, and approval updates for your requests.
          </Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Upload Documents</Text>
          <Text style={styles.cardBody}>
            Upload verification documents, hospital bills, and income certificates.
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
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.screenTitle,
    color: '#B45309',
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

export default SeekerHomeScreen;
