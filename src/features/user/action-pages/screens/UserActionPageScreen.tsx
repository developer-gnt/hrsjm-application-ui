import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import {
  ACTION_PAGE_CONTENT,
  JOIN_STEPS,
  MEMBERSHIP_CATEGORIES,
} from '../data/action-page-content';
import type { ActionPageId } from '../types/action-page.types';
import {
  formatRupees,
  parseCustomDonationAmount,
  SUGGESTED_DONATION_AMOUNTS,
} from '../utils/donation-amount';

export interface UserActionPageScreenProps {
  pageId: ActionPageId;
  onBack: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentProps<typeof AppIcon>['name'];
  compact?: boolean;
}> = ({ title, description, icon, compact = false }) => (
  <View style={[styles.featureCard, compact && styles.compactFeatureCard]}>
    <View style={styles.featureIcon}>
      <AppIcon name={icon} size={20} color={AdminColors.primaryDark} />
    </View>
    <View style={styles.featureCopy}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

export const UserActionPageScreen: React.FC<UserActionPageScreenProps> = ({
  pageId,
  onBack,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenEvents,
  onOpenNews,
  onOpenContact,
}) => {
  const content = ACTION_PAGE_CONTENT[pageId];
  const { width } = useWindowDimensions();
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(500);
  const [customAmountInput, setCustomAmountInput] = useState('');
  const customAmount =
    selectedAmount === 'custom'
      ? parseCustomDonationAmount(customAmountInput)
      : undefined;
  const donationAmount =
    pageId !== 'donate'
      ? undefined
      : selectedAmount === 'custom'
        ? customAmount
        : selectedAmount;
  const gridCardWidth =
    (width -
      Spacing.base * 2 -
      Spacing.sm * (pageId === 'membership' ? 1 : 3)) /
    2;

  const showPendingAction = (action: string) => {
    Alert.alert(
      action,
      `${action} is not connected yet. No information has been submitted and no payment has been processed.`,
    );
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    } else if (tab.id === 'rights') {
      onOpenRights?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={onBack}
        onPressSearch={() => showPendingAction('Search')}
        onPressNotifications={() => showPendingAction('Notifications')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {pageId !== 'membership' ? (
          <View style={styles.hero}>
            <Image
              source={content.heroImage}
              style={styles.heroImage}
              resizeMode="cover"
              accessible={false}
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroCopy}>
              <View style={styles.goldLine} />
              <Text style={styles.heroTitle}>{content.title}</Text>
              <Text style={styles.heroDescription}>{content.description}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionTitle title={content.overviewTitle} />
          <Text style={styles.overviewDescription}>
            {content.overviewDescription}
          </Text>
        </View>

        {pageId === 'membership' ? (
          <View style={styles.palePanel}>
            <SectionTitle title="Member Categories" />
            <View style={styles.categoryList}>
              {MEMBERSHIP_CATEGORIES.map(category => (
                <View key={category.title} style={styles.categoryCard}>
                  <View style={styles.categoryIcon}>
                    <AppIcon
                      name={category.icon}
                      size={21}
                      color={AdminColors.primaryDark}
                    />
                  </View>
                  <View style={styles.categoryCopy}>
                    <Text style={styles.featureTitle}>{category.title}</Text>
                    <Text style={styles.featureDescription}>
                      {category.description}
                    </Text>
                  </View>
                  <AppIcon
                    name="chevron-right"
                    size={18}
                    color={AdminColors.accentGold}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.palePanel}>
            <SectionTitle title={content.cardsTitle} />
            <View style={styles.featureGrid}>
              {content.cards.map(card => (
                <View
                  key={card.title}
                  style={[styles.gridCell, { width: gridCardWidth }]}
                >
                  <FeatureCard
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {pageId === 'join' ? (
          <View style={styles.section}>
            <SectionTitle title="How to Join?" />
            <View style={styles.steps}>
              {JOIN_STEPS.map((step, index) => (
                <View key={step.title} style={styles.stepRow}>
                  <View style={styles.stepIcon}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepCopy}>
                    <Text style={styles.featureTitle}>{step.title}</Text>
                    <Text style={styles.featureDescription}>
                      {step.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {pageId === 'membership' ? (
          <View style={styles.section}>
            <SectionTitle title={content.cardsTitle} />
            <View style={styles.featureGrid}>
              {content.cards.map(card => (
                <View
                  key={card.title}
                  style={[styles.gridCell, { width: gridCardWidth }]}
                >
                  <FeatureCard
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                    compact
                  />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {pageId === 'donate' ? (
          <View style={styles.section}>
            <SectionTitle title="Choose Donation Amount" />
            <View style={styles.amountGrid}>
              {SUGGESTED_DONATION_AMOUNTS.map(amount => {
                const selected = selectedAmount === amount;
                return (
                  <Pressable
                    key={amount}
                    style={[
                      styles.amountButton,
                      selected && styles.amountButtonSelected,
                    ]}
                    onPress={() => setSelectedAmount(amount)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.amountText,
                        selected && styles.amountTextSelected,
                      ]}
                    >
                      {formatRupees(amount)}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                style={[
                  styles.amountButton,
                  selectedAmount === 'custom' && styles.amountButtonSelected,
                ]}
                onPress={() => setSelectedAmount('custom')}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedAmount === 'custom' }}
              >
                <Text
                  style={[
                    styles.amountText,
                    selectedAmount === 'custom' && styles.amountTextSelected,
                  ]}
                >
                  Custom
                </Text>
              </Pressable>
            </View>
            {selectedAmount === 'custom' ? (
              <View>
                <TextInput
                  style={styles.customInput}
                  value={customAmountInput}
                  onChangeText={setCustomAmountInput}
                  keyboardType="decimal-pad"
                  placeholder="Enter amount in ₹"
                  placeholderTextColor={AdminColors.textMuted}
                  accessibilityLabel="Custom donation amount in rupees"
                />
                {customAmountInput.length > 0 && !customAmount ? (
                  <Text style={styles.validationText}>
                    Enter a positive amount with up to two decimal places.
                  </Text>
                ) : null}
              </View>
            ) : null}
            <Pressable
              style={[
                styles.donateButton,
                selectedAmount === 'custom' && !customAmount
                  ? styles.donateButtonDisabled
                  : null,
              ]}
              disabled={selectedAmount === 'custom' && !customAmount}
              onPress={() => showPendingAction('Donation payment')}
              accessibilityRole="button"
            >
              <Text style={styles.donateButtonText}>
                Donate Now{donationAmount ? ` · ${formatRupees(donationAmount)}` : ''}
              </Text>
              <AppIcon
                name="arrow-right"
                size={17}
                color={AdminColors.primaryDark}
              />
            </Pressable>
            <View style={styles.secureNote}>
              <AppIcon name="lock" size={13} color={AdminColors.textSecondary} />
              <Text style={styles.secureNoteText}>
                Payment setup is pending. No payment will be processed.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.ctaBanner}>
          <Image
            source={content.ctaImage}
            style={styles.ctaImage}
            resizeMode="cover"
            accessible={false}
          />
          <View style={styles.ctaOverlay} />
          <View style={styles.ctaCopy}>
            <Text style={styles.ctaTitle}>{content.ctaTitle}</Text>
            <Text style={styles.ctaDescription}>{content.ctaDescription}</Text>
            <Pressable
              style={styles.ctaButton}
              onPress={() => showPendingAction(content.ctaLabel)}
              accessibilityRole="button"
              accessibilityLabel={content.ctaLabel}
            >
              <Text style={styles.ctaButtonText}>{content.ctaLabel}</Text>
              <AppIcon
                name="arrow-right"
                size={15}
                color={AdminColors.primaryDark}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  hero: {
    height: 190,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.68)',
  },
  heroCopy: {
    width: '67%',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  goldLine: {
    width: 30,
    height: 3,
    backgroundColor: AdminColors.accentGold,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 29,
  },
  heroDescription: {
    color: AdminColors.textOnDark,
    fontSize: 12,
    lineHeight: 16,
    marginTop: Spacing.sm,
  },
  section: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  overviewDescription: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  palePanel: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.base,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.accentGoldLight,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  gridCell: {
    minHeight: 102,
  },
  featureCard: {
    flex: 1,
    minHeight: 102,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
  },
  compactFeatureCard: {
    minHeight: 118,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
  },
  featureDescription: {
    color: AdminColors.textSecondary,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 3,
  },
  categoryList: {
    gap: Spacing.xs,
  },
  categoryCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.cardSurface,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCopy: {
    flex: 1,
  },
  steps: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.accentGoldLight,
  },
  stepNumber: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  stepCopy: {
    flex: 1,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  amountButton: {
    minWidth: '18%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: AdminColors.accentGold,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
  },
  amountButtonSelected: {
    backgroundColor: AdminColors.primaryDark,
    borderColor: AdminColors.primaryDark,
  },
  amountText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  amountTextSelected: {
    color: AdminColors.textOnDark,
  },
  customInput: {
    marginTop: Spacing.sm,
    minHeight: 44,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    color: AdminColors.textPrimary,
  },
  validationText: {
    color: AdminColors.error,
    fontSize: 11,
    marginTop: 4,
  },
  donateButton: {
    minHeight: 46,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGold,
  },
  donateButtonDisabled: {
    opacity: 0.5,
  },
  donateButtonText: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: Spacing.xs,
  },
  secureNoteText: {
    color: AdminColors.textSecondary,
    fontSize: 10,
  },
  ctaBanner: {
    minHeight: 150,
    marginTop: Spacing.lg,
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
  },
  ctaImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  ctaOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 39, 77, 0.72)',
  },
  ctaCopy: {
    width: '76%',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  ctaTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  ctaDescription: {
    color: AdminColors.textOnDark,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGold,
  },
  ctaButtonText: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
});
