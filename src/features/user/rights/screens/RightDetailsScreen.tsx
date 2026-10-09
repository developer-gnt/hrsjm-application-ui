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
import { AppIcon } from '../../components';
import { HomeHeader } from '../../home/components/HomeHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { findRightById, RIGHTS_DETAILS } from '../data/rights-content';
import type { RightDetailsContent, RightsContentCard } from '../types/rights.types';

type SectionId = 'overview' | 'keyAreas' | 'support' | 'work';

export interface RightDetailsScreenProps {
  rightId: string;
  topicsOnly?: boolean;
  onBack: () => void;
  onOpenRights: () => void;
  onOpenRightsIndex: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
  onOpenRight?: (rightId: string) => void;
  onFileComplaint?: () => void;
}

const TABS: { id: SectionId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'keyAreas', label: 'Key Areas' },
  { id: 'support', label: 'Support & Help' },
  { id: 'work', label: "HRSJM's Work" },
];

const HERO_HEIGHT = 196;

const notifyComingSoon = (title: string) => {
  Alert.alert(title, 'More information is coming soon.');
};

const SectionTitle: React.FC<{
  title: string;
  onViewAll?: () => void;
}> = ({ title, onViewAll }) => (
  <View style={styles.sectionTitleRow}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.titleUnderline} />
    </View>
    {onViewAll ? (
      <TouchableOpacity
        style={styles.viewAll}
        onPress={onViewAll}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`View all ${title.toLowerCase()}`}
      >
        <Text style={styles.viewAllLabel}>View All</Text>
        <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const IconBubble: React.FC<{
  name: RightsContentCard['icon'];
  tint?: string;
  size?: number;
}> = ({ name, tint = '#FCEFC9', size = 42 }) => (
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
    <AppIcon name={name} size={size * 0.52} color={AdminColors.primaryDark} />
  </View>
);

const CardArrow: React.FC = () => (
  <View style={styles.cardArrow}>
    <AppIcon name="arrow-right" size={12} color={AdminColors.primaryDark} />
  </View>
);

const InfoCard: React.FC<{
  item: RightsContentCard;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={[
      styles.infoCard,
      { backgroundColor: item.color ?? '#EEF4FF' },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={
      item.description ? `${item.title}. ${item.description}` : item.title
    }
  >
    <IconBubble name={item.icon} tint={item.iconColor} size={36} />
    <View style={styles.infoCardCopy}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.description ? (
        <Text style={styles.cardDescription} numberOfLines={4}>
          {item.description}
        </Text>
      ) : null}
    </View>
    <CardArrow />
  </TouchableOpacity>
);

const TopicRow: React.FC<{
  item: RightsContentCard;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.topicRow}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={
      item.description ? `${item.title}. ${item.description}` : item.title
    }
  >
    <IconBubble name={item.icon} tint="#EEF4FF" size={28} />
    <View style={styles.topicCopy}>
      <Text style={styles.topicTitle}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.topicDescription}>{item.description}</Text>
      ) : null}
    </View>
    <AppIcon
      name="arrow-right"
      size={12}
      color={AdminColors.primaryDark}
    />
  </TouchableOpacity>
);

const CompactCard: React.FC<{
  item: RightsContentCard;
  onPress: () => void;
  variant: 'support' | 'resource' | 'related' | 'protection' | 'help';
}> = ({ item, onPress, variant }) => (
  <TouchableOpacity
    style={[
      styles.compactCard,
    {
      support: styles.supportCard,
      resource: styles.resourceCard,
      related: styles.relatedCard,
      protection: styles.protectionCard,
      help: styles.helpCard,
    }[variant],
      { backgroundColor: item.color ?? '#FFFFFF' },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={
      item.description ? `${item.title}. ${item.description}` : item.title
    }
  >
    <IconBubble
      name={item.icon}
      tint={item.iconColor ?? '#E9F0FF'}
    size={
      variant === 'support'
        ? 26
        : variant === 'help'
          ? 26
          : variant === 'resource'
            ? 30
            : 34
    }
    />
    <View style={styles.compactCardCopy}>
      <Text
        style={[
          styles.cardTitle,
          variant === 'support' && styles.supportTitle,
          variant === 'help' && styles.helpTitle,
        ]}
        numberOfLines={
          variant === 'support' || variant === 'resource' ? 3 : 2
        }
      >
        {item.title}
      </Text>
      {item.description ? (
        <Text
          style={[
            styles.cardDescription,
            variant === 'help' && styles.helpDescription,
            variant === 'protection' && styles.protectionDescription,
          ]}
          numberOfLines={variant === 'protection' ? 4 : 3}
        >
          {item.description}
        </Text>
      ) : null}
    </View>
    <CardArrow />
  </TouchableOpacity>
);

const RightsDetailsContentView: React.FC<{
  content: RightDetailsContent;
  compactTopics: boolean;
  scrollTo: (id: SectionId) => void;
  setSectionLayout: (id: SectionId, event: LayoutChangeEvent) => void;
  activeSection: SectionId;
  onOpenRightsIndex: () => void;
  onOpenRight: (rightId: string) => void;
  onFileComplaint: () => void;
  onOpenContact: () => void;
}> = ({
  content,
  compactTopics,
  scrollTo,
  setSectionLayout,
  activeSection,
  onOpenRightsIndex,
  onOpenRight,
  onFileComplaint,
  onOpenContact,
}) => {
  const titleWords = content.title.split(' ');
  const titleAccent = titleWords.pop() ?? '';
  const titleLead = titleWords.join(' ');

  const handleHelpPress = (item: RightsContentCard) => {
    if (item.id === 'file-complaint') {
      onFileComplaint();
      return;
    }
    if (item.id === 'contact-hrsjm') {
      onOpenContact();
      return;
    }
    notifyComingSoon(item.title);
  };

  return (
    <>
      <View style={styles.hero}>
        <Image
          source={content.heroImage}
          style={styles.heroImage}
          resizeMode="cover"
          accessible={false}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroBadge}>{content.badge}</Text>
          <Text style={styles.heroTitle}>
            {titleLead}
            {'\n'}
            <Text style={styles.heroTitleAccent}>{titleAccent}</Text>
          </Text>
          <Text style={styles.heroDescription}>{content.description}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {!compactTopics ? (
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
        ) : null}

        <View onLayout={event => setSectionLayout('overview', event)}>
          <Text style={styles.overviewTitle}>
            {compactTopics ? 'Overview' : content.overview.title}
          </Text>
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
            <View style={styles.quoteArtwork} pointerEvents="none">
              <AppIcon name="users" size={58} color="#E9C97B" />
            </View>
          </View>
        ) : null}

        {!compactTopics && content.keyAreas?.length ? (
          <View onLayout={event => setSectionLayout('keyAreas', event)}>
            <SectionTitle
              title="Key Areas"
              onViewAll={() => scrollTo('keyAreas')}
            />
            <Text style={styles.sectionIntro}>
              {content.title} cover many important areas, including:
            </Text>
            <View style={styles.keyAreaGrid}>
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

        {compactTopics && content.keyTopics?.length ? (
          <View style={styles.topicSection}>
            <SectionTitle title="Key Topics" />
            <View style={styles.topicList}>
              {content.keyTopics.map(item => (
                <TopicRow
                  key={item.id}
                  item={item}
                  onPress={() => notifyComingSoon(item.title)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!compactTopics && content.legalFramework ? (
          <View>
            <SectionTitle title="Legal Framework" />
            <View style={styles.frameworkCard}>
              <View style={styles.frameworkImage}>
                {content.legalFramework.image ? (
                  <Image
                    source={content.legalFramework.image}
                    style={styles.frameworkImageAsset}
                    resizeMode="cover"
                    accessible={false}
                  />
                ) : (
                  <AppIcon
                    name="scale"
                    size={58}
                    color={AdminColors.accentGold}
                  />
                )}
              </View>
              <IconBubble name="file-text" size={40} />
              <View style={styles.frameworkCopy}>
                <Text style={styles.cardTitle}>
                  {content.legalFramework.title}
                </Text>
                <Text style={styles.cardDescription}>
                  {content.legalFramework.description}
                </Text>
              </View>
              <CardArrow />
            </View>
          </View>
        ) : null}

        {!compactTopics && content.supportAreas?.length ? (
          <View onLayout={event => setSectionLayout('work', event)}>
            <SectionTitle title="How HRSJM Supports Women" />
            <View style={styles.supportGrid}>
              {content.supportAreas.map(item => (
                <CompactCard
                  key={item.id}
                  item={item}
                  variant="support"
                  onPress={() => notifyComingSoon(item.title)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!compactTopics && content.resources?.length ? (
          <View>
            <SectionTitle
              title="Useful Resources"
              onViewAll={() => notifyComingSoon('Useful Resources')}
            />
            <View style={styles.resourceGrid}>
              {content.resources.map(item => (
                <CompactCard
                  key={item.id}
                  item={item}
                  variant="resource"
                  onPress={() => notifyComingSoon(item.title)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!compactTopics && content.relatedRights?.length ? (
          <View>
            <SectionTitle title="Related Rights" />
            <View style={styles.relatedGrid}>
              {content.relatedRights.map(rightId => {
                const right = findRightById(rightId);
                if (!right) {
                  return null;
                }
                return (
                  <CompactCard
                    key={right.id}
                    item={{
                      id: right.id,
                      title: right.title,
                      icon: right.icon,
                      color: '#FFFFFF',
                      iconColor: '#FCEFC9',
                    }}
                    variant="related"
                    onPress={() => onOpenRight(right.id)}
                  />
                );
              })}
            </View>
          </View>
        ) : null}

        {!compactTopics && content.legalProtections?.length ? (
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

        {!compactTopics && content.helpOptions?.length ? (
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

        {!compactTopics ? (
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
              onPress={onOpenRightsIndex}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Explore more rights"
            >
              <Text style={styles.ctaButtonText}>Explore More Rights</Text>
              <AppIcon name="arrow-right" size={13} color={AdminColors.primaryDark} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </>
  );
};

export const RightDetailsScreen: React.FC<RightDetailsScreenProps> = ({
  rightId,
  topicsOnly = false,
  onBack,
  onOpenRights,
  onOpenRightsIndex,
  onOpenHome,
  onOpenAbout,
  onOpenContact,
  onOpenEvents,
  onOpenNews,
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
  const content = RIGHTS_DETAILS[rightId];
  const indexItem = findRightById(rightId);
  const compactTopics =
    Boolean(content?.keyTopics?.length) &&
    (rightId !== 'womens-rights' || topicsOnly);

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

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
    } else if (tab.id === 'about') {
      onOpenAbout?.();
    } else if (tab.id === 'rights') {
      onOpenRights();
    } else if (tab.id === 'contact') {
      onOpenContact?.();
    } else if (tab.id === 'events') {
      onOpenEvents?.();
    } else if (tab.id === 'news') {
      onOpenNews?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader
        onBack={onBack}
        onPressSearch={onOpenRightsIndex}
        onPressNotifications={() => undefined}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content ? (
          <RightsDetailsContentView
            content={content}
            compactTopics={compactTopics}
            scrollTo={scrollTo}
            setSectionLayout={setSectionLayout}
            activeSection={activeSection}
            onOpenRightsIndex={onOpenRightsIndex}
            onOpenRight={onOpenRight ?? onOpenRights}
            onFileComplaint={onFileComplaint ?? (() => notifyComingSoon('File a Complaint'))}
            onOpenContact={onOpenContact ?? (() => notifyComingSoon('Contact HRSJM'))}
          />
        ) : (
          <View style={styles.genericDetails}>
            <View style={styles.genericHero}>
              <Text style={styles.heroBadge}>{indexItem?.title ?? 'RIGHTS'}</Text>
              <Text style={styles.genericTitle}>
                {indexItem?.title ?? 'Rights information'}
              </Text>
              <Text style={styles.heroDescription}>
                {indexItem?.description ??
                  'Information for this right is not available yet.'}
              </Text>
            </View>
            <Text style={styles.overviewTitle}>
              {indexItem?.title ?? 'Rights information'}
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.overviewDescription}>
              {indexItem?.description ??
                'Information for this right is not available yet.'}
            </Text>
            <Text style={styles.unavailableMessage}>
              Detailed information for this right is not available yet.
            </Text>
          </View>
        )}
      </ScrollView>
      <UserBottomNavigation activeTab="rights" onTabPress={handleTabPress} />
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
    paddingBottom: Spacing.md,
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
    backgroundColor: 'rgba(7, 31, 76, 0.22)',
  },
  heroCopy: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.base,
    width: '49%',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: AdminColors.accentGoldLight,
    color: AdminColors.primaryDark,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
  },
  heroTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 29,
    lineHeight: 32,
    fontWeight: '700',
  },
  heroTitleAccent: {
    color: AdminColors.accentGold,
  },
  heroDescription: {
    marginTop: Spacing.xs,
    color: AdminColors.textOnDark,
    fontSize: 10.5,
    lineHeight: 15,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F2F4F8',
  },
  activeTab: {
    backgroundColor: AdminColors.accentGold,
  },
  activeTabText: {
    color: AdminColors.primaryDark,
  },
  tabText: {
    color: AdminColors.primaryDark,
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '700',
  },
  overviewTitle: {
    marginTop: Spacing.sm,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '700',
  },
  titleUnderline: {
    width: 28,
    height: 2,
    marginTop: 2,
    backgroundColor: AdminColors.accentGold,
  },
  overviewDescription: {
    marginTop: Spacing.xs,
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllLabel: {
    color: AdminColors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  quoteCard: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF8E8',
    position: 'relative',
  },
  quoteCopy: {
    flex: 1,
    marginLeft: Spacing.xs,
    zIndex: 1,
  },
  quoteText: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  quoteUnderline: {
    width: 36,
    height: 2,
    marginTop: 4,
    backgroundColor: AdminColors.accentGold,
  },
  quoteArtwork: {
    position: 'absolute',
    right: 2,
    bottom: -8,
    opacity: 0.3,
  },
  sectionIntro: {
    marginTop: 1,
    color: AdminColors.textSecondary,
    fontSize: 10,
    lineHeight: 13,
  },
  topicSection: {
    marginTop: Spacing.xs,
  },
  topicList: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  topicRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  topicCopy: {
    flex: 1,
    minWidth: 0,
  },
  topicTitle: {
    color: AdminColors.primaryDark,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
  },
  topicDescription: {
    marginTop: 1,
    color: AdminColors.textSecondary,
    fontSize: 8,
    lineHeight: 10,
  },
  keyAreaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  infoCard: {
    width: '32%',
    minHeight: 98,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 5,
    borderRadius: BorderRadius.md,
    position: 'relative',
  },
  iconBubble: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardCopy: {
    flex: 1,
    paddingRight: 2,
    paddingBottom: 14,
  },
  cardTitle: {
    color: AdminColors.primaryDark,
    fontSize: 8.5,
    lineHeight: 10,
    fontWeight: '700',
  },
  cardDescription: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 7,
    lineHeight: 9,
  },
  cardArrow: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  frameworkCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F2F4F8',
    position: 'relative',
  },
  frameworkImage: {
    width: '36%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: BorderRadius.sm,
    backgroundColor: '#263A55',
  },
  frameworkImageAsset: {
    width: '100%',
    height: '100%',
  },
  frameworkCopy: {
    flex: 1,
    paddingRight: 16,
  },
  supportGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  compactCard: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    borderRadius: BorderRadius.md,
    position: 'relative',
  },
  compactCardCopy: {
    flex: 1,
    paddingRight: 7,
    paddingBottom: 14,
  },
  supportCard: {
    width: '24%',
    minHeight: 66,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 7.2,
    lineHeight: 9,
  },
  resourceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  resourceCard: {
    width: '32%',
    minHeight: 66,
  },
  relatedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  relatedCard: {
    width: '32%',
    minHeight: 58,
  },
  protectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  protectionCard: {
    width: '24%',
    minHeight: 112,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: Spacing.xs,
  },
  helpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  helpCard: {
    width: '24%',
    minHeight: 84,
    alignItems: 'center',
    padding: 3,
  },
  helpTitle: {
    fontSize: 7.3,
    lineHeight: 9,
  },
  helpDescription: {
    fontSize: 6.4,
    lineHeight: 8,
  },
  protectionDescription: {
    fontSize: 6.7,
    lineHeight: 8.2,
  },
  ctaCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryDark,
    position: 'relative',
    ...Shadows.card,
  },
  ctaImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.2,
  },
  ctaOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 40, 96, 0.68)',
  },
  ctaCopy: {
    flex: 1,
    paddingRight: Spacing.xs,
    zIndex: 1,
  },
  ctaTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  ctaTitleAccent: {
    color: AdminColors.accentGold,
  },
  ctaDescription: {
    marginTop: 3,
    color: AdminColors.textOnDark,
    fontSize: 9.5,
    lineHeight: 13,
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGold,
    zIndex: 1,
  },
  ctaButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
  },
  genericDetails: {
    paddingBottom: Spacing.xl,
  },
  genericHero: {
    minHeight: 196,
    justifyContent: 'center',
    backgroundColor: AdminColors.primaryDark,
    paddingHorizontal: Spacing.base,
  },
  genericTitle: {
    color: AdminColors.textOnDark,
    fontFamily: FontFamilies.serif,
    fontSize: 28,
    fontWeight: '700',
  },
  unavailableMessage: {
    margin: Spacing.base,
    padding: Spacing.md,
    color: AdminColors.textSecondary,
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.md,
    fontSize: 12,
    lineHeight: 17,
  },
});
