import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminColors } from '../../../core/theme/colors';
import { FontFamilies } from '../../../core/theme/typography';
import { Spacing, BorderRadius } from '../../../core/theme/spacing';
import { Icon, type IconName } from '../../../core/components/common/Icon';
import { appPreferences } from '../../../core/storage/app-storage';
import { AuthLogo } from '../components/AuthLogo';
import { AuthStackParamList } from '../../../app/navigation/NavigationTypes';

type OnboardingScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Onboarding'
>;

interface OnboardingSlide {
  id: string;
  badge: string;
  iconName: IconName;
  titleLead: string;
  titleAccent: string;
  titleTail?: string;
  description: string;
  chips: string[];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'community',
    badge: 'EXECUTIVE DIRECTORY',
    iconName: 'users',
    titleLead: 'Community at a ',
    titleAccent: 'Glance',
    description:
      'Seamlessly oversee members, expiring certifications, and district operations through a unified executive command center.',
    chips: ['Member Registry', 'Real-time Verification', 'Chapter Oversight'],
  },
  {
    id: 'receipts',
    badge: 'FINANCIAL INTEGRITY',
    iconName: 'shield-check',
    titleLead: 'Verify ',
    titleAccent: 'Contributions',
    titleTail: ' & Receipts',
    description:
      'Reconcile offline collections and gateway donations instantly. Issue tamper-evident official receipts with a single tap.',
    chips: ['Instant Receipts', 'Payment Matching', 'Tamper-Proof Audit'],
  },
  {
    id: 'accounting',
    badge: 'GOVERNANCE & AUDIT',
    iconName: 'file-text',
    titleLead: 'Transparent ',
    titleAccent: 'Ledgers',
    titleTail: ' & Reports',
    description:
      'Maintain compliant double-entry journals, track cost-center allocations, and generate balance sheets with confidence.',
    chips: ['Double-Entry Journals', 'Fiscal Statements', 'One-Click Export'],
  },
];

/**
 * High-end, editorial onboarding screen aligned with the HRSJM visual identity:
 * - Deep royal navy backdrop with subtle geometric ambient glow
 * - Official brand crest & step counter
 * - Elegant editorial card with Playfair Display typography & gold accents
 * - Crisp vector iconography (no amateur emojis)
 * - Tactile gold primary action button with smooth navigation
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  // Onboarding screens (all 3 pages) commented out / bypassed:
  useEffect(() => {
    appPreferences.setOnboardingCompleted(true);
    navigation.replace('Login');
  }, [navigation]);

  return null;

  // Original onboarding code preserved below (disabled):
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (false as boolean) {
    const insets = useSafeAreaInsets();
    const [index, setIndex] = useState(0);
    const isLast = index === SLIDES.length - 1;

    const complete = () => {
      appPreferences.setOnboardingCompleted(true);
      navigation.replace('Login');
    };

    const next = () => (isLast ? complete() : setIndex(curr => curr + 1));
    const prev = () => setIndex(curr => Math.max(0, curr - 1));
    const skip = () => complete();

    const slide = SLIDES[index];

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Decorative ambient background rings for subtle depth */}
        <View style={styles.ambientGlowTop} pointerEvents="none" />
        <View style={styles.ambientGlowBottom} pointerEvents="none" />

        {/* Top Navigation Bar with safe top padding */}
        <View
          style={[
            styles.headerRow,
            { paddingTop: Math.max(insets.top, 14) + 10 },
          ]}
        >
          <View style={styles.brandRow}>
            <AuthLogo size="xs" variant="light" showWordmark={false} showSubtitle={false} />
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                STEP {index + 1} OF {SLIDES.length}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={skip}
            style={styles.skipButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipText}>Skip Intro</Text>
          </TouchableOpacity>
        </View>

        {/* Center Carousel Area */}
        <View style={styles.mainContent}>
          {/* Emblem Vector Icon with Dual-Tone Glow */}
          <View style={styles.emblemContainer}>
            <View style={styles.emblemHalo}>
              <View style={styles.emblemCore}>
                <Icon name={slide.iconName} size={36} color="#FAD465" />
              </View>
            </View>
          </View>

          {/* Floating Editorial Card */}
          <View style={styles.card}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{slide.badge}</Text>
            </View>

            <Text style={styles.headline}>
              {slide.titleLead}
              <Text style={styles.headlineAccent}>{slide.titleAccent}</Text>
              {slide.titleTail || ''}
            </Text>

            <Text style={styles.description}>{slide.description}</Text>

            {/* Feature Highlights Pills */}
            <View style={styles.chipsContainer}>
              {slide.chips.map((chip, chipIndex) => (
                <View key={chipIndex} style={styles.chip}>
                  <View style={styles.chipDot} />
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sleek Pagination Dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, dotIndex) => {
              const isActive = dotIndex === index;
              return (
                <TouchableOpacity
                  key={dotIndex}
                  onPress={() => setIndex(dotIndex)}
                  activeOpacity={0.8}
                  style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
                  accessibilityLabel={`Go to slide ${dotIndex + 1}`}
                />
              );
            })}
          </View>
        </View>

        {/* Bottom Actions Row */}
        <View
          style={[
            styles.actionArea,
            { paddingBottom: Math.max(insets.bottom, 12) + 10 },
          ]}
        >
          <View style={styles.actionButtonsRow}>
            {index > 0 && (
              <TouchableOpacity
                onPress={prev}
                style={styles.backButton}
                activeOpacity={0.75}
                accessibilityLabel="Previous slide"
              >
                <Icon name="chevron-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={next}
              style={styles.primaryButton}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'Get Started' : 'Continue'}
            >
              <Text style={styles.primaryButtonText}>
                {isLast ? 'Get Started' : 'Continue'}
              </Text>
              <View style={styles.buttonIconWrap}>
                <Icon name="arrow-right" size={16} color="#0B2F52" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Dignified Organization Trustmark */}
          <View style={styles.trustFooter}>
            <Text style={styles.trustTitle}>
              मानव अधिकार एवं सामाजिक न्याय मिशन
            </Text>
            <Text style={styles.trustSub}>
              Human Rights & Social Justice Mission • National Portal
            </Text>
          </View>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011F39',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(250, 212, 101, 0.08)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(18, 63, 104, 0.45)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    backgroundColor: 'rgba(250, 212, 101, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(250, 212, 101, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    color: '#FAD465',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skipText: {
    color: '#EDF2F7',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    zIndex: 5,
  },
  emblemContainer: {
    alignItems: 'center',
    marginBottom: -28,
    zIndex: 12,
  },
  emblemHalo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(250, 212, 101, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(250, 212, 101, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FAD465',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  emblemCore: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#06294D',
    borderWidth: 1.5,
    borderColor: '#EAA224',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingTop: 42,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  badgePill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 12,
  },
  badgeText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B2F52',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 28,
    fontFamily: FontFamilies.serif,
  },
  headlineAccent: {
    color: '#C9971A',
  },
  description: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    fontFamily: FontFamilies.sans,
    paddingHorizontal: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EAA224',
    marginRight: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#FAD465',
    shadowColor: '#FAD465',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  actionArea: {
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 48,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FAD465',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FAD465',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0B2F52',
    letterSpacing: 0.3,
  },
  buttonIconWrap: {
    marginLeft: 8,
    backgroundColor: 'rgba(11, 47, 82, 0.1)',
    borderRadius: 10,
    padding: 3,
  },
  trustFooter: {
    alignItems: 'center',
    marginTop: 14,
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DCE4EC',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  trustSub: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});