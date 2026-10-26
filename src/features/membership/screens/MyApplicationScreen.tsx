import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import { AppEmptyState } from '../../../core/components/common/AppEmptyState';
import type { AppStackParamList } from '../../../core/navigation/types';
import { useMembership } from '../context/MembershipContext';
import { MembershipTopBar } from '../components/MembershipTopBar';
import type { MembershipApplicationRecord, MembershipStatus } from '../types/membership.types';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

const STATUS_CONFIG: Record<
  MembershipStatus,
  { label: string; bg: string; fg: string; icon: 'clock' | 'check-circle' | 'x-circle' }
> = {
  Applied: {
    label: 'Applied',
    bg: '#ECFDF5',
    fg: '#059669',
    icon: 'check-circle',
  },
  'Under Review': {
    label: 'Under Review',
    bg: colors.goldSoft,
    fg: colors.goldText,
    icon: 'clock',
  },
  Approved: {
    label: 'Approved',
    bg: colors.greenSoft,
    fg: colors.active,
    icon: 'check-circle',
  },
  Rejected: {
    label: 'Rejected',
    bg: colors.redSoft,
    fg: colors.danger,
    icon: 'x-circle',
  },
  Draft: {
    label: 'Draft',
    bg: '#F1F5F9',
    fg: '#64748B',
    icon: 'clock',
  },
};

export function MyApplicationScreen() {
  const navigation = useNavigation<NavProp>();
  const { applications, setActiveApplication, reapply, removeApplication } = useMembership();

  const handleOpenStatus = (
    statusKey: 'applied' | 'under_review' | 'approved' | 'rejected',
    app?: MembershipApplicationRecord,
  ) => {
    if (app) setActiveApplication(app);
    const appId =
      app?.applicationId ||
      applications[0]?.applicationId ||
      'APP-20261012-001';

    if (statusKey === 'applied') {
      (navigation as any).navigate('ApplicationApplied', {
        applicationId: appId,
        status: 'applied',
      });
    } else if (statusKey === 'approved') {
      (navigation as any).navigate('ApplicationApproved', {
        applicationId: appId,
        status: 'approved',
      });
    } else if (statusKey === 'rejected') {
      (navigation as any).navigate('ApplicationRejected', {
        applicationId: appId,
        status: 'rejected',
      });
    } else {
      (navigation as any).navigate('ApplicationDetails', {
        applicationId: appId,
        status: 'under_review',
      });
    }
  };

  const handleOpenDetails = (app: MembershipApplicationRecord) => {
    setActiveApplication(app);
    const s = (app.status || '').toLowerCase();
    if (s.includes('approve')) {
      handleOpenStatus('approved', app);
    } else if (s.includes('reject')) {
      handleOpenStatus('rejected', app);
    } else if (s.includes('review')) {
      handleOpenStatus('under_review', app);
    } else {
      handleOpenStatus('applied', app);
    }
  };

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
          <Text style={styles.screenTitle}>My Application</Text>
          <Text style={styles.subtitle}>
            View the status and details of your membership application.
          </Text>
        </View>

        {/* Applications List */}
        {applications.length > 0 ? (
          <View style={styles.listContainer}>
            {applications.map(item => {
              const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.Rejected;

              return (
                <View key={item.id} style={styles.appCard}>
                  {/* Status Banner Row */}
                  <View style={styles.statusRow}>
                    <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
                      <Icon
                        name={statusMeta.icon}
                        size={13}
                        color={statusMeta.fg}
                        strokeWidth={2.4}
                      />
                      <Text style={[styles.statusText, { color: statusMeta.fg }]}>
                        {statusMeta.label}
                      </Text>
                    </View>

                    <Text style={styles.submittedDate}>
                      Submitted on {item.submittedAt}
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Application Info Row */}
                  <TouchableOpacity
                    style={styles.infoRow}
                    activeOpacity={0.7}
                    onPress={() => handleOpenDetails(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`View details for application ${item.applicationId}`}
                  >
                    <View style={styles.infoCol}>
                      <View style={styles.fieldItem}>
                        <Text style={styles.fieldLabel}>Application ID</Text>
                        <Text style={styles.fieldValueId}>{item.applicationId}</Text>
                      </View>

                      <View style={styles.fieldItem}>
                        <Text style={styles.fieldLabel}>
                          {item.membershipType?.toLowerCase().includes('seeker')
                            ? 'Application Type'
                            : 'Membership Type'}
                        </Text>
                        <Text style={styles.fieldValue}>{item.membershipType}</Text>
                      </View>
                    </View>

                    <View style={styles.chevronWrap}>
                      <Icon name="chevron-right" size={20} color="#94A3B8" strokeWidth={2.4} />
                    </View>
                  </TouchableOpacity>

                  {/* Rejection notice box if Rejected */}
                  {item.status === 'Rejected' && (
                    <View style={styles.rejectionNoticeBox}>
                      <Icon name="alert-circle" size={16} color="#DC2626" strokeWidth={2.2} />
                      <View style={styles.rejectionNoticeContent}>
                        <Text style={styles.rejectionNoticeTitle}>Application Rejected</Text>
                        <Text style={styles.rejectionNoticeDesc}>
                          {item.rejectionReason || 'Application returned for re-submission. Please re-apply to complete payment verification.'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Action buttons row: Re-apply button + Remove Card button */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.reapplyPrimaryBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        reapply();
                        navigation.navigate('MembershipCategories' as any);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Re-apply for Membership"
                    >
                      <Icon name="refresh-cw" size={14} color="#011F39" strokeWidth={2.4} />
                      <Text style={styles.reapplyPrimaryBtnText}>Re-apply for Membership</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeCardBtn}
                      activeOpacity={0.7}
                      onPress={() => removeApplication(item.id || item.applicationId)}
                      accessibilityRole="button"
                      accessibilityLabel="Remove this application card"
                    >
                      <Icon name="trash-2" size={14} color="#EF4444" strokeWidth={2.2} />
                      <Text style={styles.removeCardBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <AppEmptyState
              title="No Applications Found"
              message="You haven't submitted any membership applications yet."
              actionLabel="Apply for Membership"
              onAction={() => {
                reapply();
                navigation.navigate('MembershipCategories' as any);
              }}
            />
          </View>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 3,
  },
  titleSection: {
    marginBottom: spacing.lg,
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

  listContainer: {
    gap: spacing.md,
  },
  appCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardReapplyWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardReapplyButton: {
    backgroundColor: '#1B3F8F',
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardReapplyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  submittedDate: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    gap: spacing.sm,
  },
  fieldItem: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  fieldValueId: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  fieldValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#16274B',
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  rejectionNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  rejectionNoticeContent: {
    flex: 1,
  },
  rejectionNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  rejectionNoticeDesc: {
    fontSize: 11.5,
    color: '#B91C1C',
    lineHeight: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  reapplyPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAD465',
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reapplyPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
  removeCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeCardBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#E11D48',
  },
});

export default MyApplicationScreen;
