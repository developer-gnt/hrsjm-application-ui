import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSerif, serif, spacing } from '../../../core/theme/theme';

const HRSJM_LOGO = require('../../../assets/hrsjm_logo.png');

interface IneligibleAgeScreenProps {
  onBackToRegistration: () => void;
  calculatedAge?: number | null;
}

export const IneligibleAgeScreen: React.FC<IneligibleAgeScreenProps> = ({
  onBackToRegistration,
  calculatedAge,
}) => {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 460 : width;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
          {/* HRSJM Official Logo */}
          <View style={styles.logoRow}>
            <Image
              source={HRSJM_LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="HRSJM Logo"
            />
            <View style={styles.logoTextGroup}>
              <Text style={styles.logoTitle}>HRSJM</Text>
              <Text style={styles.logoSubtitle}>
                Human Rights &amp; Social Justice Mission
              </Text>
            </View>
          </View>

          {/* Alert Card with Restrained Red Accent */}
          <View style={styles.card}>
            {/* Restrained Red Restriction Badge */}
            <View style={styles.iconCircleOuter}>
              <View style={styles.iconCircleInner}>
                <Text style={styles.restrictionNumber}>18+</Text>
              </View>
            </View>

            {/* Heading */}
            <Text style={styles.heading}>You Are Not Eligible</Text>

            {/* Subheading */}
            <Text style={styles.subheading}>
              Sorry, you cannot register with HRSJM.
            </Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Detailed Explanatory Message */}
            <Text style={styles.message}>
              You must be at least 18 years old to register. Based on the date of
              birth provided, you do not meet the minimum age requirement.
            </Text>

            {/* Age Requirement Highlight Box */}
            <View style={styles.ageBadgeBox}>
              <View style={styles.ageBadgeLeft}>
                <View style={styles.redDot} />
                <Text style={styles.ageBadgeLabel}>Minimum Age:</Text>
              </View>
              <Text style={styles.ageBadgeValue}>18 Years</Text>
            </View>

            {typeof calculatedAge === 'number' && calculatedAge >= 0 && (
              <Text style={styles.calculatedAgeNote}>
                Current calculated age based on entry: {calculatedAge}{' '}
                {calculatedAge === 1 ? 'year' : 'years'}
              </Text>
            )}

            {/* Back to Registration CTA */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackToRegistration}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Back to Registration"
            >
              <Text style={styles.backButtonText}>Back to Registration</Text>
            </TouchableOpacity>

            <Text style={styles.helperNote}>
              If you entered your date of birth by mistake, tap above to return
              and correct it.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, // Ivory #FAF7F0
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: spacing.sm,
  },
  logoTextGroup: {
    justifyContent: 'center',
  },
  logoTitle: {
    ...serif,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary, // Navy #06294D
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircleOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2', // Restrained soft red
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircleInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DC2626', // Restrained solid red
    justifyContent: 'center',
    alignItems: 'center',
  },
  restrictionNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heading: {
    ...serif,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary, // Navy #06294D
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#991B1B', // Restrained dark red text
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ageBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  ageBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: spacing.sm,
  },
  ageBadgeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  ageBadgeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
  },
  calculatedAgeNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    width: '100%',
    backgroundColor: colors.primary, // Navy #06294D
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  helperNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 17,
  },
});

export default IneligibleAgeScreen;

