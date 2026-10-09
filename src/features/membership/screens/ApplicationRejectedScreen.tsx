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
import { NeedHelpSheet } from '../components/MembershipInfoSheets';

type RouteProps = NativeStackScreenProps<AppStackParamList, 'ApplicationRejected'>['route'];
type NavProp = NativeStackNavigationProp<AppStackParamList>;

export function ApplicationRejectedScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { applications, activeApplication, reapply } = useMembership();

  const [supportVisible, setSupportVisible] = useState(false);

  const record =
    applications.find(a => a.applicationId === route.params?.applicationId) ||
    activeApplication ||
    applications[0];

  const handleReapply = () => {
    reapply();
    navigation.navigate('MembershipStep1Personal');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Rejection Graphic Circle */}
        <View style={styles.illustrationContainer}>
          <View style={styles.rejectGraphicCircle}>
            <Icon name="x-circle" size={40} color={colors.white} strokeWidth={2.4} />
          </View>
          <View style={[styles.sparkle, styles.sparkle1]} />
          <View style={[styles.sparkle, styles.sparkle2]} />
        </View>

        {/* Headline & Subtitle */}
        <View style={styles.messageSection}>
          <Text style={styles.title}>Application Rejected</Text>
          <Text style={styles.subtitle}>
            We regret to inform you that your membership application could not be approved at this time.
          </Text>
        </View>

        {/* Rejection Details Card */}
        <View style={styles.rejectCard}>
          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Application ID</Text>
            <Text style={[styles.rowValue, styles.idValue]}>
              {record?.applicationId || 'APP20260914023'}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Rejected On</Text>
            <Text style={styles.rowValue}>{record?.rejectedAt || '16 Sep 2026, 02:40 PM'}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowLast]}>
            <Text style={styles.rowLabel}>Reason</Text>
            <Text style={[styles.rowValue, styles.reasonValue]}>
              {record?.rejectionReason ||
                'Documents are not clear. Please upload a valid address proof and clear photograph.'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleReapply}
            accessibilityRole="button"
            accessibilityLabel="Reapply Now">
            <Text style={styles.primaryBtnText}>Reapply Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={() => setSupportVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Contact Support">
            <Text style={styles.secondaryBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Support Helpline Modal */}
      <NeedHelpSheet
        visible={supportVisible}
        onClose={() => setSupportVisible(false)}
      />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 3,
    alignItems: 'center',
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  rejectGraphicCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5484D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E5484D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 999,
  },
  sparkle1: {
    top: -4,
    left: -12,
    width: 8,
    height: 8,
    backgroundColor: '#FCA5A5',
  },
  sparkle2: {
    top: 6,
    right: -14,
    width: 9,
    height: 9,
    backgroundColor: '#F87171',
  },
  messageSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...serif,
    fontSize: 24,
    fontWeight: '700',
    color: '#991B1B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  rejectCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tableRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFD',
  },
  tableRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  rowLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#16274B',
    marginTop: 3,
  },
  idValue: {
    fontWeight: '700',
    color: colors.primary,
  },
  reasonValue: {
    color: '#991B1B',
    lineHeight: 18,
  },
  actionsWrap: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
    borderRadius: radius.md,
    height: 48,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D4DEF0',
  },
  secondaryBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default ApplicationRejectedScreen;
