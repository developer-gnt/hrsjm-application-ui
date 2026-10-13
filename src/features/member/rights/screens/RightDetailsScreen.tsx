import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../../user/components';
import { HomeHeader } from '../../../user/home/components/HomeHeader';
import { findRightById, RIGHTS_DETAILS, getRightDetails } from '../data/rights-content';
import type { RightDetailsContent, RightsContentCard } from '../types/rights.types';

type SectionId = 'overview' | 'keyAreas' | 'support' | 'work';

export interface RightDetailsScreenProps {
  rightId?: string;
  topicsOnly?: boolean;
  onBack: () => void;
  onOpenRights?: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenRight?: (rightId: string) => void;
  onFileComplaint?: () => void;
  showBottomNav?: boolean;
}

const TABS: { id: SectionId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'keyAreas', label: 'Key Areas' },
  { id: 'support', label: 'Support & Help' },
  { id: 'work', label: "HRSJM's Work" },
];

const HERO_HEIGHT = 204;

const notifyComingSoon = (title: string) => {
  Alert.alert(title, 'More information is coming soon.');
};

const SectionTitle: React.FC<{
  title: string;
  onViewAll?: () => void;
}> = ({ title, onViewAll }) => (
  <View style={styles.sectionHeaderRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onViewAll ? (
      <TouchableOpacity
        onPress={onViewAll}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`View all ${title}`}
      >
        <Text style={styles.viewAllText}>View All</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const CardArrow: React.FC = () => (
  <View style={styles.arrowBubble}>
    <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
  </View>
);

const IconBubble: React.FC<{
  name: React.ComponentProps<typeof AppIcon>['name'];
  tint?: string;
  size?: number;
}> = ({ name, tint = '#EEF4FF', size = 32 }) => (
  <View
    style={[
      styles.iconBubble,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tint,
      },
    ]}
  >
    <AppIcon name={name} size={size * 0.55} color={AdminColors.primaryDark} />
  </View>
);

const CompactCard: React.FC<{
  item: RightsContentCard;
  variant: 'protection' | 'help';
  onPress: () => void;
}> = ({ item, variant, onPress }) => (
  <TouchableOpacity
    style={[
      styles.compactCard,
      variant === 'protection' && styles.protectionCard,
      variant === 'help' && styles.helpCard,
      item.color ? { backgroundColor: item.color } : null,
    ]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={
      item.description ? `${item.title}. ${item.description}` : item.title
    }
  >
    <View style={styles.compactHeaderRow}>
      <IconBubble name={item.icon} tint={item.iconColor} size={30} />
      <CardArrow />
    </View>
    <Text style={styles.compactTitle} numberOfLines={2}>
      {item.title}
    </Text>
    {item.description ? (
      <Text style={styles.compactDescription} numberOfLines={2}>
        {item.description}
      </Text>
    ) : null}
  </TouchableOpacity>
);

const InfoCard: React.FC<{
  item: RightsContentCard;
  variant?: 'standard' | 'related';
  onPress: () => void;
}> = ({ item, variant = 'standard', onPress }) => (
  <TouchableOpacity
    style={[
      styles.infoCard,
      variant === 'related' && styles.relatedCard,
      { backgroundColor: item.color ?? '#EEF4FF' },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={
      item.description ? `${item.title}. ${item.description}` : item.title
    }
  >
    <View style={styles.cardHeaderRow}>
      <IconBubble name={item.icon} tint={item.iconColor} size={36} />
      <CardArrow />
    </View>
    <View style={styles.infoCardCopy}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.description ? (
        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.description}
        </Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const SupportRow: React.FC<{
  item: RightsContentCard;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.supportRow}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={item.title}
  >
    <View style={styles.supportLeft}>
      <IconBubble name={item.icon} tint="#FFF8E8" size={32} />
      <Text style={styles.supportTitle}>{item.title}</Text>
    </View>
    <AppIcon name="arrow-right" size={14} color="#64748B" />
  </TouchableOpacity>
);

export const RightDetailsScreen: React.FC<RightDetailsScreenProps> = ({
  rightId = 'human-rights',
  topicsOnly = false,
  onBack,
  onOpenRights,
  onOpenRight,
  onFileComplaint,
}) => {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const sectionOffsets = useRef<Record<SectionId, number>>({
    overview: 0,
    keyAreas: 0,
    support: 0,
    work: 0,
  });
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  const resolvedRightId = rightId || 'human-rights';
  const content = getRightDetails(resolvedRightId);
  const indexItem = findRightById(resolvedRightId) ?? findRightById('human-rights')!;

  const setSectionLayout = (id: SectionId, event: LayoutChangeEvent) => {
    sectionOffsets.current[id] = event.nativeEvent.layout.y;
  };

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    scrollRef.current?.scrollTo({
      y: Math.max(0, HERO_HEIGHT + sectionOffsets.current[id] - Spacing.sm),
      animated: true,
    });
  };

  const handleHelpPress = (item: RightsContentCard) => {
    if (item.id === 'file-complaint' && onFileComplaint) {
      onFileComplaint();
      return;
    }
    notifyComingSoon(item.title);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={onBack}
        onPressNotifications={() => undefined}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={content.heroImage}
            style={styles.heroImage}
            resizeMode="cover"
            accessible={false}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroCopy}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{content.badge}</Text>
            </View>
            <Text style={styles.heroTitle}>{content.title}</Text>
            <Text style={styles.heroDescription}>{content.description}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {!topicsOnly && (
            <View style={styles.tabs} accessibilityRole="tablist">
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeSection === tab.id && styles.activeTab,
                  ]}
                  onPress={() => scrollTo(tab.id)}
                  activeOpacity={0.8}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeSection === tab.id }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeSection === tab.id && styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Overview */}
          <View onLayout={event => setSectionLayout('overview', event)}>
            <Text style={styles.overviewTitle}>{content.overview.title}</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.overviewDescription}>
              {content.overview.description}
            </Text>
          </View>

          {content.overview.quote ? (
            <View style={styles.quoteCard}>
              <AppIcon
                name="quote"
                size={22}
                color={AdminColors.accentGold}
              />
              <View style={styles.quoteCopy}>
                <Text style={styles.quoteText}>{content.overview.quote}</Text>
                <View style={styles.quoteUnderline} />
              </View>
            </View>
          ) : null}

          {/* Key Areas */}
          {content.keyAreas?.length ? (
            <View onLayout={event => setSectionLayout('keyAreas', event)}>
              <SectionTitle
                title="Key Areas"
                onViewAll={() => scrollTo('keyAreas')}
              />
              <Text style={styles.sectionIntro}>
                {content.title} cover many vital areas, including:
              </Text>
              <View style={styles.twoColumnGrid}>
                {content.keyAreas.map(item => (
                  <InfoCard
                    key={item.id}
                    item={item}
                    onPress={() => notifyComingSoon(item.title)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Legal Framework */}
          {content.legalFramework ? (
            <View style={styles.frameworkCard}>
              <View style={styles.frameworkLeft}>
                <IconBubble name="scale" tint="#FFF8E8" size={36} />
                <View style={styles.frameworkCopy}>
                  <Text style={styles.frameworkTitle}>
                    {content.legalFramework.title}
                  </Text>
                  <Text style={styles.frameworkDescription}>
                    {content.legalFramework.description}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Legal Protections */}
          {content.legalProtections?.length ? (
            <View>
              <SectionTitle title="Know Your Legal Protections" />
              <View style={styles.protectionGrid}>
                {content.legalProtections.map(item => (
                  <CompactCard
                    key={item.id}
                    item={item}
                    variant="protection"
                    onPress={() => notifyComingSoon(item.title)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Support & Help */}
          {content.supportAreas?.length ? (
            <View onLayout={event => setSectionLayout('work', event)}>
              <SectionTitle title="How HRSJM Supports" />
              <View style={styles.supportList}>
                {content.supportAreas.map(item => (
                  <SupportRow
                    key={item.id}
                    item={item}
                    onPress={() => notifyComingSoon(item.title)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Resources */}
          {content.resources?.length ? (
            <View>
              <SectionTitle title="Resources & Downloads" />
              <View style={styles.supportList}>
                {content.resources.map(item => (
                  <SupportRow
                    key={item.id}
                    item={item}
                    onPress={() => notifyComingSoon(item.title)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Get Help & Support */}
          {content.helpOptions?.length ? (
            <View onLayout={event => setSectionLayout('support', event)}>
              <SectionTitle title="Get Help & Support" />
              <View style={styles.helpGrid}>
                {content.helpOptions.map(item => (
                  <CompactCard
                    key={item.id}
                    item={item}
                    variant="help"
                    onPress={() => handleHelpPress(item)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Call to action */}
          <View style={styles.ctaCard}>
            <Image
              source={require('../../../../assets/images/contact-cta-hands.jpg')}
              style={styles.ctaImage}
              resizeMode="cover"
              accessible={false}
            />
            <View style={styles.ctaOverlay} />
            <View style={styles.ctaCopy}>
              <Text style={styles.ctaTitle}>
                Know Your Rights.{' '}
                <Text style={styles.ctaTitleAccent}>Know Your Voice.</Text>
              </Text>
              <Text style={styles.ctaDescription}>
                Awareness today. A safer, fairer and more equal tomorrow.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={onFileComplaint}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="File a complaint"
            >
              <Text style={styles.ctaButtonText}>File a Complaint</Text>
              <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: AdminColors.cardSurface,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  hero: {
    height: HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 24, 60, 0.72)',
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: FontFamilies.serif,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  heroDescription: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 17,
  },
  body: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  tabText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabText: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
  },
  overviewTitle: {
    fontSize: 19,
    fontFamily: FontFamilies.serif,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  titleUnderline: {
    width: 32,
    height: 3,
    backgroundColor: AdminColors.accentGold,
    borderRadius: 2,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  overviewDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: AdminColors.accentGold,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  quoteCopy: {
    flex: 1,
  },
  quoteText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#78350F',
    fontStyle: 'italic',
  },
  quoteUnderline: {
    marginTop: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.serif,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminColors.accentGold,
  },
  sectionIntro: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: Spacing.sm,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  infoCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    justifyContent: 'space-between',
    minHeight: 110,
    ...Shadows.card,
  },
  relatedCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  arrowBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardCopy: {
    gap: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  cardDescription: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  frameworkCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
  },
  frameworkLeft: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  frameworkCopy: {
    flex: 1,
    gap: 4,
  },
  frameworkTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  frameworkDescription: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#475569',
  },
  protectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  compactCard: {
    width: '48%',
    borderRadius: BorderRadius.base,
    padding: Spacing.sm,
    gap: 4,
    ...Shadows.card,
  },
  protectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  compactDescription: {
    fontSize: 10.5,
    lineHeight: 14,
    color: '#64748B',
  },
  supportList: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  supportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  supportTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ctaCard: {
    position: 'relative',
    height: 150,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  ctaImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  ctaOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 24, 60, 0.78)',
  },
  ctaCopy: {
    gap: 3,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FontFamilies.serif,
    fontWeight: '700',
  },
  ctaTitleAccent: {
    color: AdminColors.accentGold,
  },
  ctaDescription: {
    color: '#CBD5E1',
    fontSize: 11.5,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AdminColors.accentGold,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  ctaButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
