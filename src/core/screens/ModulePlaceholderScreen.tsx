import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminTopBar from '../components/admin/AdminTopBar';
import { AppEmptyState } from '../components/common/AppEmptyState';
import { colors, spacing, typography } from '../theme/theme';

const MODULE_META: Record<string, { title: string; subtitle: string }> = {
  DashboardTab: {
    title: 'Dashboard',
    subtitle: 'Platform overview and key metrics.',
  },
  MembersTab: {
    title: 'Members',
    subtitle: 'Membership directory and member management.',
  },
  ApplicationsTab: {
    title: 'Applications',
    subtitle: 'Membership applications and renewals.',
  },
};

// Holding screens for modules scheduled in later phases of the development
// plan. Tab chrome (top bar + bottom navigation) matches the approved design.
export function ModulePlaceholderScreen({ route }: { route: { name: string } }) {
  const meta = MODULE_META[route.name] ?? {
    title: 'Coming Soon',
    subtitle: 'This module is planned for a later phase.',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminTopBar />
      <View style={styles.body}>
        <Text style={styles.title}>{meta.title}</Text>
        <Text style={styles.subtitle}>{meta.subtitle}</Text>
        <AppEmptyState
          title="Module in progress"
          message="This module is scheduled for a later phase of the development plan."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'Georgia',
  },
  subtitle: {
    ...typography.body,
    color: colors.periwinkle,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
});

export default ModulePlaceholderScreen;
