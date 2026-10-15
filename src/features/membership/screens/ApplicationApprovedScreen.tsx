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
import { MembershipCardModal } from '../components/MembershipCardModal';

type RouteProps = NativeStackScreenProps<AppStackParamList, 'ApplicationApproved'>['route'];
type NavProp = NativeStackNavigationProp<AppStackParamList>;

export function ApplicationApprovedScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { applications, activeApplication } = useMembership();

  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const record =
    applications.find(a => a.applicationId === route.params?.applicationId) ||
    activeApplication ||
    applications[0];

  const membershipId = record?.membershipId || 'MEM2026001283';

  const handleCopyId = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleGoToDashboard = () => {
    navigation.navigate('Tabs', { screen: 'MembersTab' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Success Illustration Badge */}
        <View style={styles.illustrationContainer}>
          <View style={styles.checkGraphicCircle}>
            <Icon name="check" size={36} color={colors.white} strokeWidth={3.5} />
          </View>
          <View style={[styles.sparkle, styles.sparkle1]} />
          <View style={[styles.sparkle, styles.sparkle2]} />
          <View style={[styles.sparkle, styles.sparkle3]} />
        </View>

        {/* Headline & Subtitle */}
        <View style={styles.messageSection}>
          <Text style={styles.title}>Application Approved!</Text>
          <Text style={styles.subtitle}>
            Your membership application has been approved.{'\n'}Welcome to HRSJM!
          </Text>
        </View>

        {/* Approved Membership Info Card */}
        <View style={styles.approvedCard}>
          <Text style={styles.idLabel}>MEMBERSHIP ID</Text>

          <TouchableOpacity
            style={styles.idRow}
            activeOpacity={0.7}
            onPress={handleCopyId}
            accessibilityRole="button"
            accessibilityLabel={`Membership ID ${membershipId}, tap to copy`}>
            <Text style={styles.idNumber}>{membershipId}</Text>
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
            <Text style={styles.copiedText}>✓ Copied to clipboard</Text>
          ) : null}

          {/* Details Table */}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.rowLabel}>Membership Type</Text>
              <Text style={styles.rowValue}>{record?.membershipType || 'Individual Membership'}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.rowLabel}>Valid Till</Text>
              <Text style={styles.rowValue}>{record?.validTill || '14 Sep 2027'}</Text>
            </View>

            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={styles.rowLabel}>Approved On</Text>
              <Text style={styles.rowValue}>{record?.approvedAt || '18 Sep 2026, 10:30 AM'}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => setCardModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="View Membership Card">
            <Text style={styles.primaryBtnText}>View Membership Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={handleGoToDashboard}
            accessibilityRole="button"
            accessibilityLabel="Go to Dashboard">
            <Text style={styles.secondaryBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Digital Membership Card Modal */}
      {record ? (
        <MembershipCardModal
          visible={cardModalVisible}
          onClose={() => setCardModalVisible(false)}
          record={record}
        />
      ) : null}
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
  checkGraphicCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#047857',
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
    top: -6,
    left: -12,
    width: 8,
    height: 8,
    backgroundColor: '#F5A623',
  },
  sparkle2: {
    top: 4,
    right: -16,
    width: 10,
    height: 10,
    backgroundColor: '#3D6FE8',
  },
  sparkle3: {
    bottom: -4,
    left: -10,
    width: 7,
    height: 7,
    backgroundColor: '#23A45F',
  },
  messageSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...serif,
    fontSize: 24,
    fontWeight: '700',
    color: '#16274B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  approvedCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#D4DEF0',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: spacing.sm,
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
  copiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.active,
    marginBottom: spacing.xs,
  },
  table: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16274B',
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

export default ApplicationApprovedScreen;
