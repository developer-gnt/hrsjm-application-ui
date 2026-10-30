import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
  UserFontFamilies,
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
import { amountToWords } from '../../../../core/utils/format';
import { navigateToMembershipCategories } from '../../../../core/navigation/appRouter';
import { GlobalPaymentModal, PaymentPayload } from '../../../payments';
import { useAuthStore } from '../../../auth/store/authStore';
import { useMembership } from '../../../membership/context/MembershipContext';
import { causesService } from '../../../member/services/causes.service';
import { MemberCausesContainer } from '../../../member/screens/MemberCausesContainer';
import type { MemberCause } from '../../../member/types/causes.types';
import { recentDonationsStore } from '../../../donations/services/recent-donations.store';

export interface CauseCategoryFilter {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof AppIcon>['name'];
}

export const CAUSE_CATEGORIES: CauseCategoryFilter[] = [
  { key: 'all', label: 'All Causes', icon: 'heart' },
  { key: 'education', label: 'Education Support', icon: 'book-open' },
  { key: 'healthcare', label: 'Medical & Healthcare', icon: 'heart-pulse' },
  { key: 'relief', label: 'Emergency Relief & Food', icon: 'heart-hands' },
  { key: 'women', label: 'Women & Child Welfare', icon: 'users' },
  { key: 'human_rights', label: 'Human Rights & Legal Aid', icon: 'scale' },
  { key: 'environment', label: 'Environment & Welfare', icon: 'globe' },
];

export interface UserActionPageScreenProps {
  pageId: ActionPageId;
  onBack: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenContact?: () => void;
  onOpenMembershipCategories?: () => void;
  onOpenDonations?: () => void;
  onOpenStatus?: () => void;
  showBottomNav?: boolean;
  hideBottomNav?: boolean;
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentProps<typeof AppIcon>['name'];
  compact?: boolean;
  selected?: boolean;
  selectable?: boolean;
  onPress?: () => void;
}> = ({
  title,
  description,
  icon,
  compact = false,
  selected = false,
  selectable = false,
  onPress,
}) => {
  const cardContent = (
    <View
      style={[
        styles.featureCard,
        compact && styles.compactFeatureCard,
        selected && styles.featureCardSelected,
      ]}
    >
      <View style={[styles.featureIcon, selected && styles.featureIconSelected]}>
        <AppIcon name={icon} size={20} color={AdminColors.primaryDark} />
      </View>
      <View style={styles.featureCopy}>
        <Text
          style={[styles.featureTitle, selected && styles.featureTitleSelected]}
        >
          {title}
        </Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      {selected ? (
        <View style={styles.selectedBadge}>
          <AppIcon name="check" size={13} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );

  if (selectable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={`Cause: ${title}`}
        style={styles.featureCardPressable}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

export const UserActionPageScreen: React.FC<UserActionPageScreenProps> = ({
  pageId,
  onBack,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenEvents,
  onOpenNews,
  onOpenContact,
  onOpenMembershipCategories,
  onOpenStatus,
  showBottomNav = false,
  hideBottomNav = true,
}) => {
  let hasApplied = false;
  let isReapplying = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const membershipCtx = useMembership();
    hasApplied = Boolean(membershipCtx?.hasApplied);
    isReapplying = Boolean(membershipCtx?.isReapplying);
  } catch {}

  const content = ACTION_PAGE_CONTENT[pageId];
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [dynamicCauses, setDynamicCauses] = useState<MemberCause[]>([]);
  const [showCauseDirectory, setShowCauseDirectory] = useState<boolean>(false);
  const [activePaymentPayload, setActivePaymentPayload] = useState<PaymentPayload | null>(null);

  useEffect(() => {
    let mounted = true;
    if (pageId === 'donate') {
      causesService
        .getCauses()
        .then(res => {
          if (mounted && Array.isArray(res)) {
            // Strictly real, verified causes without mock/test/complaint data
            setDynamicCauses(res);
          }
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [pageId]);

  // Filter verified causes by active category key
  const categoryCauses = useMemo(() => {
    if (pageId !== 'donate') return [];
    if (selectedCategoryKey === 'all') return dynamicCauses;
    return dynamicCauses.filter(cause => {
      const keyMatch = cause.categoryKey === selectedCategoryKey;
      const catMatch = (cause.category || '').toLowerCase().includes(selectedCategoryKey.toLowerCase());
      const textMatch = (cause.title || '').toLowerCase().includes(selectedCategoryKey.toLowerCase());
      return keyMatch || catMatch || textMatch;
    });
  }, [pageId, dynamicCauses, selectedCategoryKey]);

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

  const authUser = useAuthStore(state => state.user);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const resolvedDonationAmount =
    typeof donationAmount === 'number' && donationAmount > 0
      ? donationAmount
      : 500;

  // 1. Direct NGO Donation from Choose Donation Amount
  const handleNgoDonatePress = () => {
    const payload: PaymentPayload = {
      userId: authUser?.id,
      purpose: 'donation',
      category: 'NGO Donation',
      title: 'HRSJM NGO Donation - General Fund',
      subtitle: 'Human Rights & Social Justice Mission',
      amount: resolvedDonationAmount,
      donorName: authUser?.full_name || 'Donor',
      donorMobile: authUser?.mobile_number || (authUser as any)?.phone || '',
      donorEmail: authUser?.email || '',
      location: 'National / All India',
      entityId: `don-ngo-${Date.now()}`,
    };
    setActivePaymentPayload(payload);
    setPaymentModalVisible(true);
  };

  // 2. Specific Cause Donation from Cause Card
  const handleCauseDonatePress = (cause: MemberCause) => {
    const payload: PaymentPayload = {
      userId: authUser?.id,
      purpose: 'donation',
      category: 'Cause Donation',
      title: `HRSJM Cause Donation - ${cause.title}`,
      subtitle: `Verified Cause: ${cause.category}`,
      amount: resolvedDonationAmount,
      donorName: authUser?.full_name || 'Donor',
      donorMobile: authUser?.mobile_number || (authUser as any)?.phone || '',
      donorEmail: authUser?.email || '',
      location: cause.location || 'National / All India',
      entityId: `don-cause-${cause.id.slice(0, 8)}-${Date.now()}`,
    };
    setActivePaymentPayload(payload);
    setPaymentModalVisible(true);
  };

  const showPendingAction = (action: string) => {
    Alert.alert(
      action,
      `${action} is not connected yet. No information has been submitted and no payment has been processed.`,
    );
  };

  const handleCtaPress = () => {
    if (
      pageId === 'join' ||
      pageId === 'membership' ||
      content.ctaLabel === 'Apply for Membership' ||
      content.ctaLabel === 'Become a Member'
    ) {
      if (hasApplied && !isReapplying) {
        if (onOpenStatus) {
          onOpenStatus();
          return;
        }
        if (onOpenMembershipCategories) {
          onOpenMembershipCategories();
          return;
        }
      }
      if (onOpenMembershipCategories) {
        onOpenMembershipCategories();
      } else {
        navigateToMembershipCategories();
      }
      return;
    }
    if (pageId === 'donate' || content.ctaLabel === 'Donate Now') {
      handleNgoDonatePress();
      return;
    }
    showPendingAction(content.ctaLabel);
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
        activeNav={pageId === 'join' ? 'join' : undefined}
        onBack={onBack}
        onPressSearch={() => showPendingAction('Search')}
        onPressNotifications={() => navigation.navigate('Notifications')}
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

        {/* Donation Amount section (UP for donate page) */}
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
              <View style={styles.customAmountContainer}>
                <Text style={styles.customAmountTitle}>Enter Custom Donation Amount</Text>
                <View style={styles.customInputRow}>
                  <Text style={styles.customRupeeSign}>₹</Text>
                  <TextInput
                    style={styles.customNumberInput}
                    value={customAmountInput}
                    onChangeText={val => {
                      const clean = val.replace(/[^0-9]/g, '');
                      setCustomAmountInput(clean);
                    }}
                    keyboardType="number-pad"
                    placeholder="Enter amount (e.g. 1000)"
                    placeholderTextColor={AdminColors.textMuted}
                    accessibilityLabel="Custom donation amount in rupees"
                  />
                  {customAmountInput.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => setCustomAmountInput('')}
                      style={styles.clearAmountBtn}
                      accessibilityLabel="Clear amount"
                    >
                      <AppIcon name="close" size={14} color="#64748B" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Quick Add Increment Chips */}
                <View style={styles.quickAddRow}>
                  {[500, 1000, 2000, 5000].map(addAmt => (
                    <TouchableOpacity
                      key={addAmt}
                      style={styles.quickAddChip}
                      onPress={() => {
                        const cur = customAmount || 0;
                        setCustomAmountInput(String(cur + addAmt));
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickAddChipText}>+ ₹{addAmt.toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* In words & validation */}
                {customAmount && customAmount > 0 ? (
                  <View style={styles.wordsPreviewBox}>
                    <Text style={styles.wordsPreviewLabel}>Amount in Words:</Text>
                    <Text style={styles.wordsPreviewValue}>{amountToWords(customAmount)}</Text>
                  </View>
                ) : customAmountInput.length > 0 ? (
                  <Text style={styles.validationText}>
                    Please enter a valid donation amount (at least ₹1).
                  </Text>
                ) : (
                  <Text style={styles.customHintText}>
                    Enter any custom amount you would like to contribute.
                  </Text>
                )}
              </View>
            ) : null}
            <Pressable
              style={[
                styles.donateButton,
                selectedAmount === 'custom' && (!customAmount || customAmount <= 0)
                  ? styles.donateButtonDisabled
                  : null,
              ]}
              disabled={selectedAmount === 'custom' && (!customAmount || customAmount <= 0)}
              onPress={handleNgoDonatePress}
              accessibilityRole="button"
              accessibilityLabel={`Donate to NGO${donationAmount ? ` ${formatRupees(donationAmount)}` : ''}`}
            >
              <Text style={styles.donateButtonText}>
                Donate to NGO{donationAmount && donationAmount > 0 ? ` · ${formatRupees(donationAmount)}` : ''}
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
                Direct contribution to HRSJM NGO General Fund · 256-bit encrypted · Eligible for 80G benefit.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Cause / Cards section (BELOW donation section for donate page) */}
        {pageId === 'membership' ? (
          <View style={styles.palePanel}>
            <SectionTitle title="Member Categories" />
            <View style={styles.categoryList}>
              {MEMBERSHIP_CATEGORIES.map(category => (
                <Pressable
                  key={category.title}
                  style={styles.categoryCard}
                  onPress={() => {
                    if (onOpenMembershipCategories) {
                      onOpenMembershipCategories();
                    } else {
                      navigateToMembershipCategories();
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${category.title} category`}
                >
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
                </Pressable>
              ))}
            </View>
          </View>
        ) : pageId === 'donate' ? (
          <View style={styles.palePanel}>
            <View style={styles.causesHeaderRow}>
              <View style={styles.causesHeaderCopy}>
                <SectionTitle title="Select a Cause to Support" />
                <Text style={styles.causesSectionSubtitle}>
                  Choose a verified cause or browse categories below
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewAllCausesBtn}
                onPress={() => setShowCauseDirectory(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="View all causes directory"
              >
                <Text style={styles.viewAllCausesText}>View All Causes</Text>
                <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
              </TouchableOpacity>
            </View>

            {/* Horizontal Cause Categories Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabsScroll}
              style={styles.categoryTabsWrapper}
            >
              {CAUSE_CATEGORIES.map(cat => {
                const isCatActive = selectedCategoryKey === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => setSelectedCategoryKey(cat.key)}
                    activeOpacity={0.75}
                    style={[
                      styles.categoryTabChip,
                      isCatActive && styles.categoryTabChipActive,
                    ]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isCatActive }}
                  >
                    <AppIcon
                      name={cat.icon}
                      size={14}
                      color={isCatActive ? AdminColors.primaryDark : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.categoryTabLabel,
                        isCatActive && styles.categoryTabLabelActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Render Causes in the Selected Category or Empty State */}
            {categoryCauses.length > 0 ? (
              <View style={styles.causeCardList}>
                {categoryCauses.map(cause => {
                  const progressPct =
                    cause.targetAmount > 0
                      ? Math.min(100, Math.round(((cause.raisedAmount || 0) / cause.targetAmount) * 100))
                      : 0;
                  return (
                    <View key={cause.id} style={styles.causeRowCard}>
                      <View style={styles.causeCardHeader}>
                        <View style={styles.causeCategoryBadge}>
                          <Text style={styles.causeCategoryBadgeText}>
                            {cause.category}
                          </Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                          <AppIcon name="check" size={12} color="#059669" />
                          <Text style={styles.verifiedBadgeText}>Verified Cause</Text>
                        </View>
                      </View>

                      <Text style={styles.causeCardTitle} numberOfLines={2}>
                        {cause.title}
                      </Text>
                      <Text style={styles.causeCardDesc} numberOfLines={3}>
                        {cause.description}
                      </Text>

                      {/* Progress Bar and Stats */}
                      <View style={styles.causeProgressRow}>
                        <Text style={styles.causeRaisedText}>
                          ₹{(cause.raisedAmount || 0).toLocaleString('en-IN')} raised
                        </Text>
                        <Text style={styles.causeTargetText}>
                          Goal: ₹{cause.targetAmount.toLocaleString('en-IN')} ({progressPct}%)
                        </Text>
                      </View>
                      <View style={styles.causeProgressBarBg}>
                        <View style={[styles.causeProgressBarFill, { width: `${progressPct}%` }]} />
                      </View>

                      {/* Cause Donation Button */}
                      <TouchableOpacity
                        style={styles.causeDonateBtn}
                        onPress={() => handleCauseDonatePress(cause)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`Donate to cause: ${cause.title}`}
                      >
                        <Text style={styles.causeDonateBtnText}>
                          Donate to this Cause{donationAmount && donationAmount > 0 ? ` · ${formatRupees(donationAmount)}` : ''}
                        </Text>
                        <AppIcon name="arrow-right" size={14} color="#011F39" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.categoryEmptyBox}>
                <View style={styles.categoryEmptyIconWrap}>
                  <AppIcon
                    name={
                      CAUSE_CATEGORIES.find(c => c.key === selectedCategoryKey)?.icon || 'heart'
                    }
                    size={28}
                    color={AdminColors.primaryDark}
                  />
                </View>
                <Text style={styles.categoryEmptyTitle}>
                  No Active Causes in {CAUSE_CATEGORIES.find(c => c.key === selectedCategoryKey)?.label || 'Category'}
                </Text>
                <Text style={styles.categoryEmptyDesc}>
                  There are currently no urgent donation requests listed under this category. Every cause undergoes strict background verification by HRSJM before approval.
                </Text>
                <TouchableOpacity
                  style={styles.categoryEmptyCtaBtn}
                  onPress={handleNgoDonatePress}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Donate to HRSJM NGO General Fund"
                >
                  <AppIcon name="heart" size={14} color="#011F39" />
                  <Text style={styles.categoryEmptyCtaText}>
                    Donate to HRSJM NGO General Fund
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
              onPress={handleCtaPress}
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
      {showBottomNav && !hideBottomNav && (
        <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
      )}
      <GlobalPaymentModal
        visible={paymentModalVisible}
        payload={
          activePaymentPayload || {
            userId: authUser?.id,
            purpose: 'donation',
            category: 'NGO Donation',
            title: 'HRSJM NGO Donation - General Fund',
            subtitle: 'Human Rights and Social Justice Mission',
            amount: resolvedDonationAmount,
            donorName: authUser?.full_name || 'Donor',
            donorMobile: authUser?.mobile_number || (authUser as any)?.phone || '',
            donorEmail: authUser?.email || '',
            location: 'National / All India',
            entityId: `don-ngo-${Date.now()}`,
          }
        }
        initialStage="checkout"
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={(receipt) => {
          const isNgo = activePaymentPayload?.category === 'NGO Donation';
          const donatedAmount = receipt?.amount || activePaymentPayload?.amount || resolvedDonationAmount;
          const causeTitle = isNgo
            ? 'NGO Donation'
            : activePaymentPayload?.title?.replace('HRSJM Cause Donation - ', '') || 'Cause Donation';
          const title = isNgo
            ? 'HRSJM NGO Donation - General Fund'
            : activePaymentPayload?.title || `HRSJM Cause Donation - ${causeTitle}`;

          const now = new Date();
          const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          const timeStr = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

          recentDonationsStore.addDonation({
            id: receipt?.paymentId || `rec-don-${Date.now()}`,
            receiptNo: receipt?.receiptNumber || receipt?.orderId || `REC-${Date.now().toString().slice(-6)}`,
            type: 'Donation',
            title,
            cause: causeTitle,
            category: isNgo ? 'NGO Donation' : 'Cause Donation',
            description: isNgo
              ? `Direct contribution of ₹${donatedAmount.toLocaleString('en-IN')} to HRSJM General NGO Fund`
              : `Cause donation of ₹${donatedAmount.toLocaleString('en-IN')} for ${causeTitle}`,
            amount: donatedAmount,
            amountInWords: formatRupees(donatedAmount),
            date: dateStr,
            time: timeStr,
            dateTime: `${dateStr}, ${timeStr}`,
            isoDate: now.toISOString().split('T')[0],
            status: 'Completed',
            paymentMethod: receipt?.paymentMethod || 'Cashfree Online',
            transactionId: receipt?.paymentId || receipt?.orderId || `TRX-${Date.now()}`,
            donorName: authUser?.full_name || 'Donor',
            donorEmail: authUser?.email || undefined,
            donorPhone: authUser?.mobile_number || undefined,
            imageType: (isNgo ? 'medical' : 'education') as any,
          });

          if (!isNgo) {
            causesService.recordDonation(causeTitle, donatedAmount, receipt?.paymentId);
          }
        }}
        onNavigateHome={onBack}
      />

      {/* Full Cause Directory Modal */}
      <Modal
        visible={showCauseDirectory}
        animationType="slide"
        onRequestClose={() => setShowCauseDirectory(false)}
      >
        <SafeAreaView style={styles.directoryModalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.directoryModalHeader}>
            <TouchableOpacity
              style={styles.directoryBackBtn}
              onPress={() => setShowCauseDirectory(false)}
              accessibilityRole="button"
              accessibilityLabel="Back to donation page"
            >
              <AppIcon name="chevron-left" size={20} color={AdminColors.primaryDark} />
            </TouchableOpacity>
            <View style={styles.directoryTitleBox}>
              <Text style={styles.directoryHeaderTitle}>All Approved Causes & Programs</Text>
              <Text style={styles.directoryHeaderSubtitle}>Tap any cause to support or donate</Text>
            </View>
            <TouchableOpacity
              style={styles.directoryCloseBtn}
              onPress={() => setShowCauseDirectory(false)}
              accessibilityRole="button"
              accessibilityLabel="Close directory"
            >
              <AppIcon name="close" size={18} color={AdminColors.textSecondary} />
            </TouchableOpacity>
          </View>
          <MemberCausesContainer
            hideHeader={true}
            onSelectCause={(cause) => {
              setShowCauseDirectory(false);
              handleCauseDonatePress(cause);
            }}
            onClose={() => setShowCauseDirectory(false)}
          />
        </SafeAreaView>
      </Modal>
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
    fontFamily: UserFontFamilies.heading,
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
    fontFamily: UserFontFamilies.heading,
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
  featureCardPressable: {
    flex: 1,
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
  featureCardSelected: {
    borderColor: AdminColors.accentGold,
    borderWidth: 2,
    backgroundColor: '#FFFDF6',
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
  featureIconSelected: {
    backgroundColor: AdminColors.accentGoldLight,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
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
  featureTitleSelected: {
    color: AdminColors.primaryDark,
    fontWeight: '800',
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
    fontFamily: UserFontFamilies.heading,
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
  causesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  viewAllCausesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: AdminColors.accentGold,
  },
  viewAllCausesText: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  customAmountContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  customAmountTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: AdminColors.accentGold,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  customRupeeSign: {
    fontSize: 20,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginRight: 6,
  },
  customNumberInput: {
    flex: 1,
    height: 44,
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  clearAmountBtn: {
    padding: 6,
  },
  quickAddRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  quickAddChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  quickAddChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
  wordsPreviewBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: AdminColors.accentGold,
  },
  wordsPreviewLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: AdminColors.textMuted,
    textTransform: 'uppercase',
  },
  wordsPreviewValue: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminColors.primaryDark,
    marginTop: 2,
  },
  customHintText: {
    fontSize: 11,
    color: AdminColors.textSecondary,
    marginTop: 6,
  },
  directoryModalContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  directoryModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  directoryBackBtn: {
    padding: 6,
    marginRight: 8,
  },
  directoryTitleBox: {
    flex: 1,
  },
  directoryHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
  },
  directoryHeaderSubtitle: {
    fontSize: 11,
    color: AdminColors.textSecondary,
  },
  directoryCloseBtn: {
    padding: 6,
  },
  causesHeaderCopy: {
    flex: 1,
    marginRight: 12,
  },
  causesSectionSubtitle: {
    fontSize: 12,
    color: AdminColors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  categoryTabsWrapper: {
    marginTop: 6,
    marginBottom: 14,
  },
  categoryTabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  categoryTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTabChipActive: {
    backgroundColor: '#FAD465',
    borderColor: '#FAD465',
  },
  categoryTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTabLabelActive: {
    color: '#011F39',
    fontWeight: '700',
  },
  causeCardList: {
    gap: 12,
  },
  causeRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  causeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  causeCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.sm,
  },
  causeCategoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.sm,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  causeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    lineHeight: 19,
    marginBottom: 4,
  },
  causeCardDesc: {
    fontSize: 12,
    color: AdminColors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  causeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  causeRaisedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  causeTargetText: {
    fontSize: 11,
    color: AdminColors.textMuted,
    fontWeight: '600',
  },
  causeProgressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: 12,
  },
  causeProgressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: BorderRadius.full,
  },
  causeDonateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FAD465',
  },
  causeDonateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
  categoryEmptyBox: {
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  categoryEmptyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  categoryEmptyDesc: {
    fontSize: 12,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  categoryEmptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    backgroundColor: '#FAD465',
    borderRadius: BorderRadius.md,
  },
  categoryEmptyCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#011F39',
  },

});
