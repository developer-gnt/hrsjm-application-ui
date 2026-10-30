import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { findRightById, RIGHTS_DETAILS } from '../data/rights-content';
import type { RightDetailsContent, RightsContentCard } from '../types/rights.types';

type SectionId = 'overview' | 'keyAreas' | 'support' | 'work';

export interface RightDetailsScreenProps {
  rightId: string;
  topicsOnly?: boolean;
  onBack: () => void;
  onOpenRights: () => void;
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
  { id: 'support', label: 'Support and Help' },
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
}> = ({ name, tint = AdminColors.accentGoldLight, size = 42 }) => (
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

const CardArrow: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
  <View style={[styles.cardArrow, style]}>
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
      { backgroundColor: item.color ?? AdminColors.primaryLight },
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
    <IconBubble name={item.icon} tint={AdminColors.primaryLight} size={32} />
    <View style={styles.topicCopy}>
      <Text style={styles.topicTitle}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.topicDescription}>{item.description}</Text>
      ) : null}
    </View>
    <AppIcon
      name="arrow-right"
      size={14}
      color={AdminColors.primaryDark}
    />
  </TouchableOpacity>
);

const CompactCard: React.FC<{
  item: RightsContentCard;
  onPress: () => void;
  variant: 'support' | 'resource' | 'related' | 'protection' | 'help';
}> = ({ item, onPress, variant }) => {
  const isTripleCol = variant === 'resource' || variant === 'related';
  const iconSize = isTripleCol ? 32 : 36;
  const bubbleTint =
    item.iconColor ??
    (variant === 'help'
      ? AdminColors.primaryLight
      : variant === 'resource'
        ? '#DBE5EE'
        : AdminColors.accentGoldLight);

  return (
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
      <View style={styles.cardHeaderRow}>
        <IconBubble
          name={item.icon}
          tint={bubbleTint}
          size={iconSize}
        />
        <CardArrow />
      </View>
      <View style={styles.compactCardCopy}>
        <Text
          style={[
            styles.cardTitle,
            isTripleCol && styles.resourceTitle,
            variant === 'support' && styles.supportTitle,
            variant === 'help' && styles.helpTitle,
          ]}
          numberOfLines={isTripleCol ? 3 : 2}
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
            numberOfLines={variant === 'protection' ? 3 : 2}
          >
            {item.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};


interface RightCardDetailData {
  title: string;
  description: string;
  icon?: any;
  iconColor?: string;
  legalBasis: string;
  safeguards: string[];
}

const getCardDetailInfo = (item: RightsContentCard, rightTitle: string): RightCardDetailData => {
  const titleLower = item.title.toLowerCase();
  let legalBasis = 'Constitution of India • Protection of Human Rights Act 1993';
  let safeguards = [
    'Direct standing to report violations before competent judicial and human rights forums.',
    'Access to district legal aid authorities and state commission grievance cells.',
    'HRSJM verified legal advocacy intervention and non-discrimination protection.',
  ];

  if (titleLower.includes('safety') || titleLower.includes('violence') || titleLower.includes('protection') || titleLower.includes('pocso') || titleLower.includes('abuse')) {
    legalBasis = 'Protection of Women from Domestic Violence Act 2005 • POCSO Act 2012 • IPC/BNS Section 354, 509';
    safeguards = [
      'Immediate Right to Reside in shared household without threat of forceful dispossession.',
      'Protection Orders enforceable through Protection Officers, CWCs & Judicial Magistrates.',
      '24x7 HRSJM Legal Support Desk & National Helpline 1091 / 1098 / 112 emergency escalation.',
    ];
  } else if (titleLower.includes('education') || titleLower.includes('school') || titleLower.includes('rte') || titleLower.includes('learning')) {
    legalBasis = 'Right of Children to Free and Compulsory Education (RTE) Act 2009 • Article 21A';
    safeguards = [
      'Mandatory free education for children 6 to 14 years in recognized neighbourhood schools.',
      '25% reservation for economically weaker and disadvantaged sections in private schools.',
      'Zero capitation fee, physical screening or documentation rejection during admission.',
    ];
  } else if (titleLower.includes('child') || titleLower.includes('minor') || titleLower.includes('labour')) {
    legalBasis = 'Child Labour (Prohibition) Act 1986 • Juvenile Justice Act 2015 • POCSO Act 2012';
    safeguards = [
      'Absolute prohibition of hazardous and non-hazardous commercial child employment.',
      'Mandatory child welfare committee rehabilitation and state-funded foster shelter aid.',
      'Statutory legal representation for minors with complete privacy & identity confidentiality.',
    ];
  } else if (titleLower.includes('work') || titleLower.includes('employment') || titleLower.includes('pay') || titleLower.includes('wage') || titleLower.includes('pf')) {
    legalBasis = 'Code on Wages 2019 • Equal Remuneration Act 1976 • POSH Act 2013 • Articles 16 & 39(d)';
    safeguards = [
      'Equal floor wage payment for equal work with zero gender or background disparity.',
      'Mandatory Internal Complaints Committee (ICC) in every establishment with 10+ employees.',
      'Right to safe, dignified workplace conditions, overtime pay and statutory PF/ESI benefits.',
    ];
  } else if (titleLower.includes('health') || titleLower.includes('nutrition') || titleLower.includes('medical') || titleLower.includes('geriatric')) {
    legalBasis = 'Article 21 (Right to Health & Dignity) • National Food Security Act • Maintenance of Parents Act';
    safeguards = [
      'Universal access to public primary healthcare, senior hospital priority and maternal services.',
      'Nutritional entitlements through Anganwadi centers and government supplementary nutrition schemes.',
      'Confidential medical examination and emergency stabilization care in all public & private hospitals.',
    ];
  } else if (titleLower.includes('elder') || titleLower.includes('senior') || titleLower.includes('maintenance') || titleLower.includes('parent')) {
    legalBasis = 'Maintenance and Welfare of Parents and Senior Citizens Act 2007 • Article 41';
    safeguards = [
      'Right to claim monthly maintenance from children or legal heirs through Sub-Divisional Tribunals.',
      'Section 23 revocation of property gift deeds if children refuse basic amenities and care.',
      'Severe criminal penalties for abandonment of senior citizens in public or healthcare facilities.',
    ];
  } else if (titleLower.includes('information') || titleLower.includes('rti') || titleLower.includes('transparency') || titleLower.includes('record')) {
    legalBasis = 'Right to Information Act 2005 • Article 19(1)(a) Constitutional Transparency';
    safeguards = [
      'Mandatory 30-day timeline for public authorities to provide certified records and documents.',
      'Strict daily financial penalty up to ₹25,000 on Public Information Officers refusing disclosure.',
      'Two-tier independent appeal mechanism to First Appellate Authority and State/Central Information Commission.',
    ];
  } else if (titleLower.includes('speech') || titleLower.includes('expression') || titleLower.includes('press') || titleLower.includes('assembly') || titleLower.includes('protest')) {
    legalBasis = 'Article 19(1)(a) & 19(1)(b) of the Constitution of India • Landmark Supreme Court Precedents';
    safeguards = [
      'Freedom of thought, expression, journalistic investigation and peaceful public assembly without weapons.',
      'High constitutional bar on executive censorship or pre-publication restraints.',
      'Judicial protection against frivolous police harassment or unlawful protest dispersal.',
    ];
  } else if (titleLower.includes('privacy') || titleLower.includes('arrest') || titleLower.includes('custody') || titleLower.includes('liberty') || titleLower.includes('bail')) {
    legalBasis = 'Article 21 (Right to Life & Personal Liberty) • Supreme Court D.K. Basu Directives • BNSS / CrPC';
    safeguards = [
      'Mandatory prepared arrest memo, immediate family notification and medical checkup every 48 hours.',
      'Compulsory production before nearest Judicial Magistrate within 24 hours of detention.',
      'Constitutional right to privacy against unauthorized surveillance, data extraction and wiretapping.',
    ];
  } else if (titleLower.includes('minority') || titleLower.includes('religion') || titleLower.includes('faith') || titleLower.includes('language')) {
    legalBasis = 'Articles 25, 26, 29 & 30 of the Constitution • National Commission for Minorities Act 1992';
    safeguards = [
      'Right of religious and linguistic minorities to establish and administer educational institutions.',
      'Constitutional parity in government grants and financial aid without minority prejudice.',
      'Complete freedom of conscience and protection against hate crimes and discriminatory slurs.',
    ];
  } else if (titleLower.includes('property') || titleLower.includes('inheritance')) {
    legalBasis = 'Hindu Succession (Amendment) Act 2005 • Indian Succession Act 1925 • Article 300A';
    safeguards = [
      'Equal coparcenary rights by birth in ancestral property for all daughters and sons.',
      'Unrestricted ownership and testamentary disposition rights over self-acquired assets.',
      'Direct judicial injunctions against fraudulent property transfer or unlawful eviction.',
    ];
  } else if (titleLower.includes('equality') || titleLower.includes('discrimination') || titleLower.includes('human') || titleLower.includes('fundamental') || titleLower.includes('remedy') || titleLower.includes('writ')) {
    legalBasis = 'Article 14 (Equality Before Law) • Article 15 (Prohibition of Discrimination) • Article 32 Writs';
    safeguards = [
      'Constitutional guarantee against discrimination on grounds of religion, race, caste, sex or birth.',
      'Direct standing to move Supreme Court (Article 32) or High Court (Article 226) via prerogative writs.',
      'Statutory legal aid through National Legal Services Authority (NALSA) and state grievance cells.',
    ];
  }

  return {
    title: item.title,
    description: item.description || ("Statutory and constitutional legal rights guaranteed under " + rightTitle + "."),
    icon: item.icon,
    iconColor: item.iconColor,
    legalBasis,
    safeguards,
  };
};

const RightCardDetailModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  data: RightCardDetailData | null;
  onFileComplaint: () => void;
  onOpenContact: () => void;
  onSelectCard: (data: RightCardDetailData) => void;
}> = ({ visible, onClose, data, onFileComplaint, onOpenContact }) => {
  if (!data) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={modalStyles.card}>
          <View style={modalStyles.header}>
            <View style={modalStyles.iconWrap}>
              <AppIcon name={data.icon || 'scale'} size={20} color={AdminColors.primaryDark} />
            </View>
            <View style={modalStyles.headerTitleWrap}>
              <Text style={modalStyles.badge}>LEGAL SAFEGUARD & STATUTORY RIGHT</Text>
              <Text style={modalStyles.title} numberOfLines={2}>{data.title}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={modalStyles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <AppIcon name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} showsVerticalScrollIndicator={false}>
            <Text style={modalStyles.description}>{data.description}</Text>

            <View style={modalStyles.sectionBox}>
              <Text style={modalStyles.sectionBoxTitle}>Statutory & Constitutional Basis</Text>
              <Text style={modalStyles.sectionBoxText}>{data.legalBasis}</Text>
            </View>

            <View style={modalStyles.sectionBox}>
              <Text style={modalStyles.sectionBoxTitle}>Citizen Rights & Protections</Text>
              {data.safeguards.map((item, idx) => (
                <View key={idx} style={modalStyles.bulletRow}>
                  <Text style={modalStyles.bulletDot}>•</Text>
                  <Text style={modalStyles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={modalStyles.actionRow}>
              <TouchableOpacity
                style={modalStyles.complaintBtn}
                onPress={() => {
                  onClose();
                  onFileComplaint();
                }}
                activeOpacity={0.8}
              >
                <Text style={modalStyles.complaintBtnText}>File a Grievance / Complaint</Text>
                <AppIcon name="arrow-right" size={13} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={modalStyles.contactBtn}
                onPress={() => {
                  onClose();
                  onOpenContact();
                }}
                activeOpacity={0.8}
              >
                <Text style={modalStyles.contactBtnText}>Contact HRSJM Legal Cell</Text>
                <AppIcon name="arrow-right" size={13} color="#06294D" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const RightsDetailsContentView: React.FC<{
  content: RightDetailsContent;
  compactTopics: boolean;
  scrollTo: (id: SectionId) => void;
  setSectionLayout: (id: SectionId, event: LayoutChangeEvent) => void;
  activeSection: SectionId;
  onOpenRight: (rightId: string) => void;
  onFileComplaint: () => void;
  onOpenContact: () => void;
  onSelectCard: (data: RightCardDetailData) => void;
}> = ({
  content,
  compactTopics,
  scrollTo,
  setSectionLayout,
  activeSection,
  onOpenRight,
  onFileComplaint,
  onOpenContact,
  onSelectCard,
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
    onSelectCard(getCardDetailInfo(item, content.title));
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
              <AppIcon name="users" size={58} color={AdminColors.accentGold} />
            </View>
          </View>
        ) : null}

        {!compactTopics && content.keyAreas?.length ? (
          <View onLayout={event => setSectionLayout('keyAreas', event)}>
            <SectionTitle
              title="Key Areas"
              onViewAll={() => {
                onSelectCard({
                  title: `All Key Areas & Protections - ${content.title}`,
                  description: `Comprehensive guide to all statutory and constitutional legal rights under ${content.title}.`,
                  icon: 'scale',
                  iconColor: AdminColors.accentGoldLight,
                  legalBasis: content.legalFramework?.title || 'Constitution of India • Fundamental Rights & Judicial Safeguards',
                  safeguards: (content.keyAreas || []).map(ka => `${ka.title}: ${ka.description}`),
                });
              }}
            />
            <Text style={styles.sectionIntro}>
              {content.title} cover many important areas, including:
            </Text>
            <View style={styles.keyAreaGrid}>
              {content.keyAreas.map(item => (
                <InfoCard
                  key={item.id}
                  item={item}
                  onPress={() => onSelectCard(getCardDetailInfo(item, content.title))}
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
                  onPress={() => onSelectCard(getCardDetailInfo(item, content.title))}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!compactTopics && content.legalFramework ? (
          <View>
            <SectionTitle title="Legal Framework" />
            <TouchableOpacity
              style={styles.frameworkCard}
              onPress={() => onSelectCard(getCardDetailInfo({
                id: 'legal-framework',
                title: content.legalFramework!.title,
                description: content.legalFramework!.description,
                icon: 'scale',
              }, content.title))}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={content.legalFramework.title}
            >
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
              <IconBubble name="file-text" size={36} />
              <View style={styles.frameworkCopy}>
                <Text style={styles.frameworkTitle}>
                  {content.legalFramework.title}
                </Text>
                <Text style={styles.frameworkDescription}>
                  {content.legalFramework.description}
                </Text>
              </View>
              <CardArrow />
            </TouchableOpacity>
          </View>
        ) : null}

        {!compactTopics && content.supportAreas?.length ? (
          <View onLayout={event => setSectionLayout('work', event)}>
            <SectionTitle title={`How HRSJM Supports ${content.title.replace(/^Right to\s+/i, '')}`} />
            <View style={styles.supportGrid}>
              {content.supportAreas.map(item => (
                <CompactCard
                  key={item.id}
                  item={item}
                  variant="support"
                  onPress={() => onSelectCard(getCardDetailInfo(item, content.title))}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!compactTopics && content.resources?.length ? (
          <View>
            <SectionTitle
              title="Useful Resources"
              onViewAll={() => scrollTo('support')}
            />
            <View style={styles.resourceGrid}>
              {content.resources.map(item => (
                <CompactCard
                  key={item.id}
                  item={item}
                  variant="resource"
                  onPress={() => onSelectCard(getCardDetailInfo(item, content.title))}
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
                      color: AdminColors.cardSurface,
                      iconColor: AdminColors.accentGoldLight,
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
                  onPress={() => onSelectCard(getCardDetailInfo(item, content.title))}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!compactTopics && content.helpOptions?.length ? (
          <View onLayout={event => setSectionLayout('support', event)}>
            <SectionTitle title="Get Help and Support" />
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
              onPress={onFileComplaint}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="File a complaint"
            >
              <Text style={styles.ctaButtonText}>File a Complaint</Text>
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
  onOpenHome,
  onOpenAbout,
  onOpenContact,
  onOpenEvents,
  onOpenNews,
  onOpenRight,
  onFileComplaint,
  showBottomNav = false,
}) => {
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const sectionOffsets = useRef<Record<SectionId, number>>({
    overview: 0,
    keyAreas: 0,
    support: 0,
    work: 0,
  });
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [selectedCardData, setSelectedCardData] = useState<RightCardDetailData | null>(null);

  const [activeRightId, setActiveRightId] = useState<string>(rightId);

  React.useEffect(() => {
    setActiveRightId(rightId);
    setActiveSection('overview');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [rightId]);

  const handleSelectRight = (targetRightId: string) => {
    setActiveRightId(targetRightId);
    setActiveSection('overview');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    onOpenRight?.(targetRightId);
  };

  const content = RIGHTS_DETAILS[activeRightId] || RIGHTS_DETAILS[rightId] || RIGHTS_DETAILS['human-rights'];
  const indexItem = findRightById(activeRightId) || findRightById(rightId);
  const compactTopics = Boolean(topicsOnly);

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
        activeNav="rights"
        onNavigateNav={(id: string) => {
          if (id === 'home') onOpenHome?.();
          else if (id === 'about') onOpenAbout?.();
          else if (id === 'rights') onOpenRights();
          else if (id === 'events') onOpenEvents?.();
          else if (id === 'news') onOpenNews?.();
          else if (id === 'contact') onOpenContact?.();
        }}
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
            onOpenRight={handleSelectRight}
            onFileComplaint={onFileComplaint ?? (() => notifyComingSoon('File a Complaint'))}
            onOpenContact={onOpenContact ?? (() => notifyComingSoon('Contact HRSJM'))}
            onSelectCard={setSelectedCardData}
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
      {showBottomNav && (
        <UserBottomNavigation activeTab="rights" onTabPress={handleTabPress} />
      )}
      <RightCardDetailModal
        visible={Boolean(selectedCardData)}
        onClose={() => setSelectedCardData(null)}
        data={selectedCardData}
        onFileComplaint={onFileComplaint ?? (() => notifyComingSoon('File a Complaint'))}
        onOpenContact={onOpenContact ?? (() => notifyComingSoon('Contact HRSJM'))}
        onSelectCard={setSelectedCardData}
      />
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
    paddingBottom: Spacing.lg,
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
    width: '54%',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: AdminColors.accentGoldLight,
    color: AdminColors.primaryDark,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: AdminColors.textOnDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 29,
    lineHeight: 33,
    fontWeight: '700',
  },
  heroTitleAccent: {
    color: AdminColors.accentGold,
  },
  heroDescription: {
    marginTop: Spacing.xs,
    color: AdminColors.textOnDark,
    fontSize: 13,
    lineHeight: 18.5,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: Spacing.sm,
    paddingBottom: 2,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
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
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  overviewTitle: {
    marginTop: Spacing.md,
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  titleUnderline: {
    width: 32,
    height: 2.5,
    marginTop: 3,
    backgroundColor: AdminColors.accentGold,
    borderRadius: 1,
  },
  overviewDescription: {
    marginTop: Spacing.sm,
    color: AdminColors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19.5,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  viewAllLabel: {
    color: AdminColors.primaryDark,
    fontSize: 13.5,
    fontWeight: '700',
  },
  quoteCard: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGoldLight,
    position: 'relative',
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  quoteCopy: {
    flex: 1,
    marginLeft: Spacing.xs,
    zIndex: 1,
  },
  quoteText: {
    color: AdminColors.primaryDark,
    fontFamily: UserFontFamilies.quote,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
  },
  quoteUnderline: {
    width: 40,
    height: 2,
    marginTop: 4,
    backgroundColor: AdminColors.accentGold,
  },
  quoteArtwork: {
    position: 'absolute',
    right: 2,
    bottom: -8,
    opacity: 0.25,
  },
  sectionIntro: {
    marginTop: 4,
    marginBottom: 2,
    color: AdminColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  topicSection: {
    marginTop: Spacing.sm,
  },
  topicList: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  topicRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
  },
  topicCopy: {
    flex: 1,
    minWidth: 0,
  },
  topicTitle: {
    color: AdminColors.primaryDark,
    fontSize: 13.5,
    lineHeight: 17.5,
    fontWeight: '700',
  },
  topicDescription: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 15.5,
  },
  keyAreaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: Spacing.sm,
  },
  infoCard: {
    width: '48.5%',
    minHeight: 124,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(7, 31, 76, 0.06)',
    justifyContent: 'flex-start',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  iconBubble: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardCopy: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  cardTitle: {
    color: AdminColors.primaryDark,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'left',
  },
  cardDescription: {
    marginTop: 4,
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 16.5,
  },
  cardArrow: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  frameworkCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.sm,
    padding: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.primaryLight,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  frameworkImage: {
    width: 80,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.primaryDark,
  },
  frameworkImageAsset: {
    width: '100%',
    height: '100%',
  },
  frameworkCopy: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 4,
  },
  frameworkTitle: {
    color: AdminColors.primaryDark,
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: '700',
  },
  frameworkDescription: {
    marginTop: 3,
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 16.5,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: Spacing.sm,
  },
  compactCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    justifyContent: 'flex-start',
  },
  compactCardCopy: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
  },
  supportCard: {
    width: '48.5%',
    minHeight: 104,
    padding: 12,
  },
  supportTitle: {
    fontSize: 13.5,
    lineHeight: 17.5,
    fontWeight: '700',
    textAlign: 'left',
  },
  resourceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: Spacing.sm,
  },
  resourceCard: {
    width: '31.5%',
    minHeight: 96,
    padding: 10,
  },
  resourceTitle: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'left',
  },
  relatedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: Spacing.sm,
  },
  relatedCard: {
    width: '31.5%',
    minHeight: 96,
    padding: 10,
  },
  protectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: Spacing.sm,
  },
  protectionCard: {
    width: '48.5%',
    minHeight: 124,
    padding: 12,
  },
  protectionDescription: {
    fontSize: 12,
    lineHeight: 16.5,
  },
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: Spacing.sm,
  },
  helpCard: {
    width: '48.5%',
    minHeight: 116,
    padding: 12,
  },
  helpTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'left',
  },
  helpDescription: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'left',
  },
  ctaCard: {
    alignSelf: 'stretch',
    minHeight: 180,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: Spacing.lg,
    marginHorizontal: -Spacing.base,
    marginBottom: -Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl + 8,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
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
    paddingRight: Spacing.sm,
    zIndex: 1,
  },
  ctaTitle: {
    color: AdminColors.textOnDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
  },
  ctaTitleAccent: {
    color: AdminColors.accentGold,
  },
  ctaDescription: {
    marginTop: 6,
    color: AdminColors.textOnDark,
    fontSize: 13.5,
    lineHeight: 19,
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGold,
    zIndex: 1,
    minWidth: 144,
  },
  ctaButtonText: {
    color: AdminColors.primaryDark,
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: '700',
  },
  genericDetails: {
    paddingBottom: Spacing.xl,
  },
  genericHero: {
    minHeight: 204,
    justifyContent: 'center',
    backgroundColor: AdminColors.primaryDark,
    paddingHorizontal: Spacing.base,
  },
  genericTitle: {
    color: AdminColors.textOnDark,
    fontFamily: UserFontFamilies.heading,
    fontSize: 28,
    fontWeight: '700',
  },
  unavailableMessage: {
    margin: Spacing.base,
    padding: Spacing.md,
    color: AdminColors.textSecondary,
    backgroundColor: AdminColors.background,
    borderRadius: BorderRadius.md,
    fontSize: 13,
    lineHeight: 18,
  },
});


const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 23, 44, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    elevation: 6,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF8E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleWrap: {
    flex: 1,
  },
  badge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    marginTop: 6,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
    color: '#334155',
  },
  sectionBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
  },
  sectionBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginBottom: 5,
  },
  sectionBoxText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#475569',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 12,
    color: AdminColors.accentGold,
    marginRight: 6,
    lineHeight: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: '#475569',
  },
  actionRow: {
    marginTop: 16,
    gap: 8,
  },
  complaintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06294D',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  complaintBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAD465',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06294D',
  },
});
