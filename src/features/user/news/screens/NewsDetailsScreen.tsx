import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import { SectionHeader } from '../../home/components/SectionHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { NewsArticleCard } from '../components/NewsArticleCard';
import { USER_NEWS_ARTICLES, type UserNewsArticle } from '../data/user-news';

interface NewsDetailsScreenProps {
  article: UserNewsArticle;
  onBack: () => void;
  onOpenArticle: (article: UserNewsArticle) => void;
  onOpenHome: () => void;
  onOpenAbout: () => void;
  onOpenRights: () => void;
  onOpenEvents: () => void;
  onOpenContact: () => void;
}

interface ShareOption {
  id: string;
  label: string;
  disabled?: boolean;
}

const SHARE_OPTIONS: ShareOption[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'copy', label: 'Copy Link', disabled: true },
];

const formatDateBadge = (publishedAt: string) => {
  const [year, month, day] = publishedAt.split('-');
  const monthLabel = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleString('en', { month: 'short' })
    .toUpperCase();
  return { day, month: monthLabel, year };
};

const locationLines = (location?: string) =>
  location?.replace(', ', ',\n') ?? 'Not specified';

export const NewsDetailsScreen: React.FC<NewsDetailsScreenProps> = ({
  article,
  onBack,
  onOpenArticle,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenEvents,
  onOpenContact,
}) => {
  const { width } = useWindowDimensions();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const dateBadge = useMemo(() => formatDateBadge(article.publishedAt), [article.publishedAt]);
  const relatedArticles = useMemo(
    () => USER_NEWS_ARTICLES.filter(item => item.id !== article.id).slice(0, 2),
    [article.id],
  );

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (galleryOpen) {
        setGalleryOpen(false);
        return true;
      }
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [galleryOpen, handleBack]);

  const handleShare = async () => {
    await Share.share({
      message: `${article.title}\n${article.date}\n${article.excerpt}`,
    });
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome();
    } else if (tab.id === 'about') {
      onOpenAbout();
    } else if (tab.id === 'rights') {
      onOpenRights();
    } else if (tab.id === 'events') {
      onOpenEvents();
    } else if (tab.id === 'contact') {
      onOpenContact();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <HomeHeader onBack={handleBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={article.image}
          style={[styles.hero, { height: Math.min(width * 0.52, 270) }]}
          imageStyle={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel={`${article.category} article image`}
        >
          <View style={styles.heroShade} />
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{dateBadge.day}</Text>
            <Text style={styles.dateMonth}>{dateBadge.month}</Text>
            <Text style={styles.dateYear}>{dateBadge.year}</Text>
          </View>
          <View style={styles.heroCategory}>
            <Text style={styles.heroCategoryText}>{article.category}</Text>
          </View>
        </ImageBackground>

        <View style={styles.articleContent}>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.excerpt}>{article.excerpt.replace(/\.\.\.$/, '.')}</Text>

          <View style={styles.metadataRow}>
            <MetadataCard
              icon="calendar"
              label="Date"
              value={article.date}
            />
            <MetadataCard
              icon="clock"
              label="Time"
              value={article.time ?? 'Not specified'}
            />
            <MetadataCard
              icon="map-pin"
              label="Location"
              value={locationLines(article.location)}
            />
          </View>

          {article.isDemo ? (
            <View style={styles.demoNotice}>
              <Text style={styles.demoNoticeText}>
                Sample content for UI demonstration — not a verified news report.
              </Text>
            </View>
          ) : null}

          {article.highlights.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Highlights</Text>
              <View style={styles.highlightsCard}>
                {article.highlights.map((highlight, index) => (
                  <View key={`${article.id}-highlight-${index}`} style={styles.highlightRow}>
                    <View style={styles.checkCircle}>
                      <AppIcon name="check" size={10} color={AdminColors.textOnDark} />
                    </View>
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This News</Text>
            {article.body.map((paragraph, index) => (
              <Text key={`${article.id}-paragraph-${index}`} style={styles.body}>
                {paragraph}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.gallerySection}>
          <View style={styles.paddedSectionHeader}>
            <SectionHeader
              title="Photo Gallery"
              linkLabel="View All"
              onLinkPress={() => setGalleryOpen(true)}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryRow}
            accessibilityLabel="Article photo gallery"
          >
            {article.galleryImages.map((image, index) => (
              <TouchableOpacity
                key={`${article.id}-gallery-${index}`}
                onPress={() => setGalleryOpen(true)}
                activeOpacity={0.85}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Open photo ${index + 1} from ${article.title}`}
              >
                <Image
                  source={image}
                  style={styles.galleryImage}
                  resizeMode="cover"
                  accessible={false}
                />
                {index === article.galleryImages.length - 1 ? (
                  <View style={styles.galleryMoreOverlay}>
                    <Text style={styles.galleryMoreText}>+5</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.paddedSection}>
          <Text style={styles.sectionTitle}>Related Topics</Text>
          <View style={styles.topicList}>
            {article.relatedTopics.map(topic => (
              <View key={`${article.id}-${topic}`} style={styles.topicChip}>
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.paddedSection}>
          <Text style={styles.sectionTitle}>Share This News</Text>
          <View style={styles.shareOptions}>
            {SHARE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[styles.shareOption, option.disabled && styles.shareOptionDisabled]}
                onPress={option.disabled ? undefined : handleShare}
                disabled={option.disabled}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={option.label === 'Copy Link' ? 'Copy Link unavailable' : `Share via ${option.label}`}
                accessibilityState={{ disabled: Boolean(option.disabled) }}
                accessibilityHint={
                  option.disabled
                    ? 'Copy link will be available when a public article link is provided.'
                    : 'Opens the system share menu.'
                }
              >
                <View style={styles.shareIconCircle}>
                  <AppIcon
                    name={option.id === 'copy' ? 'link' : 'share'}
                    size={19}
                    color={AdminColors.primaryDark}
                  />
                </View>
                <Text style={[styles.shareLabel, option.disabled && styles.shareLabelDisabled]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.moreNewsSection}>
          <View style={styles.paddedSectionHeader}>
            <SectionHeader
              title="More News"
              linkLabel="View All"
              onLinkPress={onBack}
            />
          </View>
          {relatedArticles.map(related => (
            <NewsArticleCard
              key={related.id}
              article={related}
              onPress={onOpenArticle}
            />
          ))}
        </View>
      </ScrollView>

      <UserBottomNavigation activeTab="news" onTabPress={handleTabPress} />

      <Modal
        visible={galleryOpen}
        animationType="slide"
        onRequestClose={() => setGalleryOpen(false)}
      >
        <SafeAreaView style={styles.galleryModal}>
          <View style={styles.galleryModalHeader}>
            <TouchableOpacity
              onPress={() => setGalleryOpen(false)}
              style={styles.galleryClose}
              accessibilityRole="button"
              accessibilityLabel="Close photo gallery"
            >
              <AppIcon name="chevron-left" size={20} color={AdminColors.primaryDark} />
            </TouchableOpacity>
            <Text style={styles.galleryModalTitle}>Photo Gallery</Text>
            <View style={styles.galleryHeaderSpacer} />
          </View>
          <ScrollView contentContainerStyle={styles.galleryModalContent}>
            {article.galleryImages.map((image, index) => (
              <Image
                key={`${article.id}-gallery-modal-${index}`}
                source={image}
                style={styles.galleryModalImage}
                resizeMode="cover"
                accessibilityLabel={`Photo ${index + 1} from ${article.title}`}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

interface MetadataCardProps {
  icon: 'calendar' | 'clock' | 'map-pin';
  label: string;
  value: string;
}

const MetadataCard: React.FC<MetadataCardProps> = ({ icon, label, value }) => (
  <View style={styles.metadataCard}>
    <AppIcon name={icon} size={16} color={AdminColors.primaryDark} />
    <Text style={styles.metadataLabel}>{label}</Text>
    <Text style={styles.metadataValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  hero: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 40, 96, 0.08)',
  },
  dateBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  dateDay: {
    color: AdminColors.primaryDark,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
  },
  dateMonth: {
    color: AdminColors.primaryDark,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
  dateYear: {
    color: AdminColors.textSecondary,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '600',
  },
  heroCategory: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    maxWidth: '55%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGold,
  },
  heroCategoryText: {
    color: AdminColors.primaryDark,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  articleContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  excerpt: {
    color: AdminColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.xs,
  },
  metadataRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    marginHorizontal: -2,
  },
  metadataCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginHorizontal: 2,
  },
  metadataLabel: {
    color: AdminColors.textSecondary,
    fontSize: 10,
    lineHeight: 13,
    marginTop: Spacing.xs,
  },
  metadataValue: {
    color: AdminColors.primaryDark,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  demoNotice: {
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.md,
  },
  demoNoticeText: {
    color: AdminColors.primaryDark,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  highlightsCard: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGoldLight,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
  },
  checkCircle: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.accentGold,
    marginRight: Spacing.xs,
    marginTop: 1,
  },
  highlightText: {
    flex: 1,
    color: AdminColors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  body: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  gallerySection: {
    marginTop: Spacing.lg,
  },
  paddedSectionHeader: {
    paddingHorizontal: Spacing.base,
  },
  galleryRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  galleryImage: {
    width: 132,
    height: 104,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    backgroundColor: AdminColors.primaryLight,
  },
  galleryMoreOverlay: {
    ...StyleSheet.absoluteFill,
    width: 132,
    height: 104,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryMoreText: {
    color: AdminColors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  paddedSection: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.lg,
  },
  topicList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  topicChip: {
    borderColor: AdminColors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  topicText: {
    color: AdminColors.primaryDark,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  shareOption: {
    minWidth: 54,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  shareOptionDisabled: {
    opacity: 0.5,
  },
  shareIconCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AdminColors.primaryLight,
  },
  shareLabel: {
    color: AdminColors.primaryDark,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  shareLabelDisabled: {
    color: AdminColors.textSecondary,
  },
  moreNewsSection: {
    marginTop: Spacing.lg,
  },
  galleryModal: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  galleryModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
  },
  galleryClose: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
  },
  galleryModalTitle: {
    flex: 1,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  galleryHeaderSpacer: {
    width: 38,
  },
  galleryModalContent: {
    padding: Spacing.base,
  },
  galleryModalImage: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    backgroundColor: AdminColors.primaryLight,
  },
});
