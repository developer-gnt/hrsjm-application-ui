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
import type { AppStackParamList } from '../../../core/navigation/types';
import { MembershipTopBar } from '../components/MembershipTopBar';
import { MembershipProgressBar } from '../components/MembershipProgressBar';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export function MembershipIntroScreen() {
  const navigation = useNavigation<NavProp>();

  const perks = [
    'It only takes a few minutes',
    'Keep your documents ready',
    'You can track your application status',
    'Our team will review and notify you',
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header with Back button */}
      <MembershipTopBar showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Apply for Membership</Text>
          <Text style={styles.subtitle}>
            Join our mission for a more just and inclusive society.
          </Text>
        </View>

        {/* 3-Step Progress Indicator */}
        <MembershipProgressBar currentStep={1} />

        {/* "Let's get started" Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Let's get started</Text>
          <Text style={styles.cardSubtitle}>
            Please provide your basic information to apply for membership.
          </Text>

          {/* Graphic Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBadge}>
              <Icon name="users" size={44} color={colors.primary} strokeWidth={1.8} />
            </View>
          </View>

          {/* Perks list */}
          <View style={styles.perksList}>
            {perks.map((perk, index) => (
              <View key={index} style={styles.perkRow}>
                <View style={styles.checkCircle}>
                  <Icon name="check" size={13} color={colors.white} strokeWidth={3} />
                </View>
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Start Application Button */}
        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('MembershipStep1Personal')}
          accessibilityRole="button"
          accessibilityLabel="Start Application">
          <Text style={styles.startBtnText}>Start Application</Text>
          <Icon name="arrow-right" size={18} color={colors.white} strokeWidth={2.4} />
        </TouchableOpacity>
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
    paddingBottom: spacing.xxl * 2,
  },
  titleSection: {
    marginBottom: spacing.xs,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16274B',
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  iconBadge: {
    width: 90,
    height: 74,
    borderRadius: 16,
    backgroundColor: '#EAF1FE',
    borderWidth: 1.5,
    borderColor: '#D4E2FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perksList: {
    gap: 12,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#23A45F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
    borderRadius: radius.md,
    height: 48,
    gap: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});

export default MembershipIntroScreen;
