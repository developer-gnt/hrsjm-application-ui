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
import { useAuthStore } from '../../auth/store/authStore';

type RouteProps = NativeStackScreenProps<AppStackParamList, 'MembershipSubmitted'>['route'];
type NavProp = NativeStackNavigationProp<AppStackParamList>;

export function MembershipSubmittedScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { applications, activeApplication, personalInfo } = useMembership();

  const [copied, setCopied] = useState(false);

  // Retrieve submitted application
  const applicationId =
    route.params?.applicationId ||
    activeApplication?.applicationId ||
    applications[0]?.applicationId ||
    'APP20260914023';

  // Strict payment validation check:
  // Application successful is only visible when payment has been completed.
  const targetApp =
    applications.find(a => a.applicationId === applicationId || a.id === applicationId) ||
    activeApplication;

  const isStoredPaymentDone =
    typeof window !== 'undefined' && window.sessionStorage
      ? window.sessionStorage.getItem(`hrsjm_payment_done_${applicationId}`) === 'true'
      : false;

  const isPaymentDone =
    route.params?.paymentCompleted === true ||
    Boolean(route.params?.paymentId) ||
    Boolean(route.params?.receipt) ||
    targetApp?.paymentStatus === 'Completed' ||
    isStoredPaymentDone;

  const handleCopyId = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleGoToMyApplication = () => {
    const navAny = navigation as any;
    const currentAuthUser = useAuthStore.getState().user;

    // Ensure session profile is active
    if (!currentAuthUser) {
      const targetAny = targetApp as any;
      const applicantName =
        targetAny?.applicantName ||
        targetApp?.personalInfo?.fullName ||
        personalInfo?.fullName?.trim() ||
        'Member Applicant';
      const applicantEmail =
        targetAny?.email ||
        targetApp?.personalInfo?.email ||
        personalInfo?.email?.trim() ||
        'member@hrsjm.org';
      const applicantPhone =
        targetAny?.phone ||
        targetAny?.mobileNumber ||
        targetApp?.personalInfo?.mobileNumber ||
        personalInfo?.mobileNumber?.trim() ||
        '';

      useAuthStore.getState().setUser({
        id: targetAny?.userId || targetApp?.id || `user_${Date.now()}`,
        full_name: applicantName,
        email: applicantEmail,
        mobile_number: applicantPhone,
        roles: [{ id: 'role-user', name: 'USER' }],
        account_type: 'member',
        status: 'ACTIVE',
        membership_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);
    }

    const state = navAny.getState?.();
    const routeNames: string[] = state?.routeNames || [];

    if (routeNames.includes('MyApplication')) {
      navAny.navigate('MyApplication', { applicationId });
      return;
    }

    const parentNav = navigation.getParent?.();
    if (parentNav) {
      const parentState = (parentNav as any).getState?.();
      const parentRoutes: string[] = parentState?.routeNames || [];
      if (parentRoutes.includes('MyApplication')) {
        (parentNav as any).navigate('MyApplication', { applicationId });
        return;
      }
    }

    try {
      navAny.navigate('MyApplication', { applicationId });
    } catch {
      useAuthStore.getState().completeRegistration();
    }
  };

  const handleCompletePayment = () => {
    navigation.navigate('MembershipStep3Documents' as any);
  };

  const handleGoToDashboard = () => {
    const navAny = navigation as any;
    const currentAuthUser = useAuthStore.getState().user;
    const targetAny = targetApp as any;
    const applicantName =
      targetAny?.applicantName ||
      targetApp?.personalInfo?.fullName ||
      personalInfo?.fullName?.trim() ||
      'Member Applicant';
    const applicantEmail =
      targetAny?.email ||
      targetApp?.personalInfo?.email ||
      personalInfo?.email?.trim() ||
      'member@hrsjm.org';
    const applicantPhone =
      targetAny?.phone ||
      targetAny?.mobileNumber ||
      targetApp?.personalInfo?.mobileNumber ||
      personalInfo?.mobileNumber?.trim() ||
      '';

    // 1. Establish session user in authStore with role USER so RootNavigator routes to UserTabNavigator
    const resolvedUser = {
      id: targetAny?.userId || targetApp?.id || currentAuthUser?.id || `user_${Date.now()}`,
      full_name: applicantName,
      email: applicantEmail,
      mobile_number: applicantPhone,
      roles: [{ id: 'role-user', name: 'USER' }],
      account_type: 'member',
      status: 'ACTIVE',
      membership_status: 'PENDING',
      created_at: currentAuthUser?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    useAuthStore.getState().setUser(resolvedUser as any);

    // 2. Activate session so RootNavigator mounts RoleBasedHomeNavigator (UserTabNavigator -> UserHome)
    useAuthStore.getState().completeRegistration();

    // 3. If already nested inside UserTabNavigator, switch tab to UserHome
    const state = navAny.getState?.();
    const routeNames: string[] = state?.routeNames || [];
    if (routeNames.includes('UserHome')) {
      navAny.navigate('UserHome');
      return;
    }
    const parentNav = navigation.getParent?.();
    if (parentNav) {
      const parentState = (parentNav as any).getState?.();
      const parentRoutes: string[] = parentState?.routeNames || [];
      if (parentRoutes.includes('UserHome')) {
        (parentNav as any).navigate('UserHome');
        return;
      }
    }
  };

  const handleBackToHome = handleGoToDashboard;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar showBack={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {!isPaymentDone ? (
          /* Payment Required State - Shown when payment has NOT been done */
          <>
            <View style={styles.illustrationContainer}>
              <View style={[styles.docGraphicBox, styles.paymentRequiredGraphicBox]}>
                <Icon name="lock" size={44} color="#D97706" strokeWidth={1.9} />
                <View style={[styles.checkBadge, styles.warningBadge]}>
                  <Icon name="clock" size={14} color={colors.white} strokeWidth={2.8} />
                </View>
              </View>
            </View>

            <View style={styles.messageSection}>
              <Text style={[styles.title, styles.paymentRequiredTitle]}>Payment Required</Text>
              <Text style={styles.subtitle}>
                Your membership registration is incomplete.{'\n'}Payment of the registration fee is required to submit your application.
              </Text>
            </View>

            <View style={[styles.idCard, styles.paymentRequiredCard]}>
              <Text style={styles.idCardLabel}>Application Status</Text>
              <View style={styles.statusPillPending}>
                <Icon name="clock" size={14} color="#B45309" strokeWidth={2.2} />
                <Text style={styles.statusPillPendingText}>Payment Pending</Text>
              </View>
              <Text style={styles.idHint}>
                Please complete your payment to finalize your registration and receive your official member ID.
              </Text>
            </View>

            <View style={styles.actionsWrap}>
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={handleCompletePayment}
                accessibilityRole="button"
                accessibilityLabel="Complete Payment Now">
                <Text style={styles.primaryBtnText}>Complete Payment Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.7}
                onPress={handleGoToDashboard}
                accessibilityRole="button"
                accessibilityLabel="Go to Dashboard (user)">
                <Text style={styles.secondaryBtnText}>Go to Dashboard (user)</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* Success State - ONLY visible when payment was completed */
          <>
            <View style={styles.illustrationContainer}>
              <View style={styles.docGraphicBox}>
                <Icon name="file-text" size={48} color={colors.primary} strokeWidth={1.8} />
                <View style={styles.checkBadge}>
                  <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
                </View>
              </View>

              {/* Confetti dot accents */}
              <View style={[styles.sparkle, styles.sparkle1]} />
              <View style={[styles.sparkle, styles.sparkle2]} />
              <View style={[styles.sparkle, styles.sparkle3]} />
            </View>

            <View style={styles.messageSection}>
              <Text style={styles.title}>Application Submitted!</Text>
              <Text style={styles.subtitle}>
                Thank you for applying for membership.{'\n'}Your application has been submitted successfully.
              </Text>
            </View>

            {/* Verified Payment Status Pill */}
            <View style={styles.verifiedPaymentPill}>
              <Icon name="shield-check" size={15} color="#15803D" strokeWidth={2.4} />
              <Text style={styles.verifiedPaymentText}>Registration Payment Verified</Text>
            </View>

            {/* Application ID Card */}
            <View style={styles.idCard}>
              <Text style={styles.idCardLabel}>Application ID</Text>

              <TouchableOpacity
                style={styles.idRow}
                activeOpacity={0.7}
                onPress={handleCopyId}
                accessibilityRole="button"
                accessibilityLabel={`Application ID ${applicationId}, tap to copy`}>
                <Text style={styles.idNumber}>{applicationId}</Text>
                <View style={styles.copyBtn}>
                  <Icon
                    name={copied ? 'check' : 'copy'}
                    size={18}
                    color={copied ? colors.active : colors.primary}
                    strokeWidth={2.2}
                  />
                </View>
              </TouchableOpacity>

              {copied ? (
                <Text style={styles.copiedHint}>✓ Copied to clipboard</Text>
              ) : (
                <Text style={styles.idHint}>
                  You can check the status of your application in the 'My Application' section.
                </Text>
              )}
            </View>

            {/* Bottom Action Buttons */}
            <View style={styles.actionsWrap}>
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={handleGoToMyApplication}
                accessibilityRole="button"
                accessibilityLabel="Go to My Application">
                <Text style={styles.primaryBtnText}>Go to My Application</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.7}
                onPress={handleGoToDashboard}
                accessibilityRole="button"
                accessibilityLabel="Go to Dashboard (user)">
                <Text style={styles.secondaryBtnText}>Go to Dashboard (user)</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl * 3,
    alignItems: 'center',
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  docGraphicBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#EAF1FE',
    borderWidth: 1.5,
    borderColor: '#D4E2FC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.active,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 999,
  },
  sparkle1: {
    top: -8,
    left: -16,
    width: 10,
    height: 10,
    backgroundColor: '#F5A623',
  },
  sparkle2: {
    top: 6,
    right: -20,
    width: 12,
    height: 12,
    backgroundColor: '#3D6FE8',
  },
  sparkle3: {
    bottom: -6,
    left: -14,
    width: 8,
    height: 8,
    backgroundColor: '#23A45F',
  },
  messageSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...serif,
    fontSize: 24,
    fontWeight: '700',
    color: '#16274B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs + 2,
    lineHeight: 19,
  },
  idCard: {
    width: '100%',
    backgroundColor: '#F3F6FD',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#D4DEF0',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  idCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: spacing.sm,
  },
  idNumber: {
    ...serif,
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  copyBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EAF1FE',
  },
  copiedHint: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.active,
    marginTop: 2,
  },
  idHint: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
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
  paymentRequiredGraphicBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  warningBadge: {
    backgroundColor: '#D97706',
  },
  paymentRequiredTitle: {
    color: '#92400E',
  },
  paymentRequiredCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusPillPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusPillPendingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  verifiedPaymentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  verifiedPaymentText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
});

export default MembershipSubmittedScreen;
