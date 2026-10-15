import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import type { AppStackParamList } from '../../../core/navigation/types';
import { useMembership } from '../context/MembershipContext';
import { MembershipTopBar } from '../components/MembershipTopBar';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import type { MembershipStatus } from '../types/membership.types';

type RouteProps = NativeStackScreenProps<AppStackParamList, 'ApplicationDetails'>['route'];
type NavProp = NativeStackNavigationProp<AppStackParamList>;

export function ApplicationDetailsScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { applications, activeApplication, updateApplicationStatus } = useMembership();

  const currentApp =
    applications.find(a => a.applicationId === route.params?.applicationId) ||
    activeApplication ||
    applications[0];

  const handleSwitchOutcome = (status: MembershipStatus) => {
    if (!currentApp) return;
    updateApplicationStatus(currentApp.applicationId, status);
    if (status === 'Approved') {
      navigation.navigate('ApplicationApproved', { applicationId: currentApp.applicationId });
    } else if (status === 'Rejected') {
      navigation.navigate('ApplicationRejected', { applicationId: currentApp.applicationId });
    }
  };

  if (!currentApp) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <MembershipTopBar showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No application details found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Application Details</Text>
          <Text style={styles.subtitle}>
            Complete details of your membership application.
          </Text>
        </View>

        {/* Status Notice Box */}
        <View style={styles.statusNoticeBox}>
          <View style={styles.noticeIconCircle}>
            <Icon name="clock" size={22} color="#C08A00" strokeWidth={2.2} />
          </View>
          <View style={styles.noticeTextWrap}>
            <Text style={styles.noticeTitle}>Under Review</Text>
            <Text style={styles.noticeDesc}>
              Your application is being reviewed by our team. This usually takes 5–7 working days.
            </Text>
          </View>
        </View>

        {/* Metadata Card */}
        <View style={styles.metaCard}>
          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Application ID</Text>
            <Text style={[styles.rowValue, styles.idValue]}>{currentApp.applicationId}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Submitted On</Text>
            <Text style={styles.rowValue}>{currentApp.submittedAt}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Membership Type</Text>
            <Text style={styles.rowValue}>{currentApp.membershipType}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowLast]}>
            <Text style={styles.rowLabel}>Current Status</Text>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>{currentApp.status}</Text>
            </View>
          </View>
        </View>

        {/* Timeline Section */}
        <ApplicationTimeline events={currentApp.timeline} />

        {/* Outcome Testing Panel */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Test Alternative Outcomes</Text>
          <Text style={styles.demoSubtitle}>
            Switch between alternative mock outcomes to inspect approved and rejected states:
          </Text>

          <View style={styles.demoBtnRow}>
            <TouchableOpacity
              style={styles.approvedDemoBtn}
              onPress={() => handleSwitchOutcome('Approved')}
              accessibilityRole="button"
              accessibilityLabel="View Approved outcome">
              <Icon name="check-circle" size={16} color={colors.white} strokeWidth={2.2} />
              <Text style={styles.approvedDemoBtnText}>View Approved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectedDemoBtn}
              onPress={() => handleSwitchOutcome('Rejected')}
              accessibilityRole="button"
              accessibilityLabel="View Rejected outcome">
              <Icon name="x-circle" size={16} color={colors.white} strokeWidth={2.2} />
              <Text style={styles.rejectedDemoBtnText}>View Rejected</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 3,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  screenTitle: {
    ...serif,
    fontSize: 26,
    fontWeight: '700',
    color: '#16274B',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  statusNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FDF7E7',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F9E2A8',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  noticeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF0CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTextWrap: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#8A5D00',
  },
  noticeDesc: {
    fontSize: 12,
    color: '#714B00',
    marginTop: 2,
    lineHeight: 16,
  },
  metaCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  rowLabel: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16274B',
    textAlign: 'right',
    flex: 1.4,
  },
  idValue: {
    fontWeight: '700',
    color: colors.primary,
  },
  statusChip: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.goldText,
  },
  demoCard: {
    backgroundColor: '#F8FAFD',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#D4DEF0',
  },
  demoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16274B',
  },
  demoSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  approvedDemoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#047857',
    borderRadius: radius.md,
    height: 40,
    gap: 6,
  },
  approvedDemoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  rejectedDemoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#991B1B',
    borderRadius: radius.md,
    height: 40,
    gap: 6,
  },
  rejectedDemoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default ApplicationDetailsScreen;
