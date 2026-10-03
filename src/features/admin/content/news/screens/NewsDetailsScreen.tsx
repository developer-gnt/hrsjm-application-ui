import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import {
  AppBadge,
  AppButton,
  AppEmptyState,
  AppLoader,
} from '../../../../../core/components';
import {
  CategoryChip,
  STATUS_BADGE_TONES,
  STATUS_LABELS,
  formatViews,
} from '../components/NewsCard';
import {
  NewsDeleteConfirmDialog,
  NewsDetailsActionMenu,
} from '../components/NewsDetailsActionMenu';
import { AdminShellHeader } from '../../events/preview/AdminShellHeader';
import { AdminShellTabBar } from '../../events/preview/AdminShellTabBar';
import type { NewsListItem } from '../types/news.types';

interface NewsDetailsScreenProps {
  /** The news row selected on the News list. */
  news: NewsListItem | null;
  /** Back navigation to the News list (back arrow, Android hardware back). */
  onBack: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; tabs this screen does not handle fall back to the shell's
   * preview notice.
   */
  onTabPress?: (tab: string) => void;
  /**
   * TEMPORARY (UI-only phase): called when the user taps Edit (action button
   * or menu). When not provided, a placeholder alert is shown instead.
   */
  onEdit?: (news: NewsListItem) => void;
  /**
   * Prepared for the backend phase: renders AppLoader when true. The UI-only
   * phase never sets it (no fake network delays).
   */
  loading?: boolean;
}

const PLACEHOLDER_MESSAGE =
  'This is a UI placeholder. It will be connected after backend integration.';

/**
 * News Details screen (UI-only phase).
 *
 * Renders the selected sample news item following the reference: featured
 * image, category/status chips, headline, metadata, summary card, article
 * content, key highlights, image gallery, tags, additional information and a
 * fixed Edit News + actions bar above the existing bottom navigation. NO
 * backend — all actions are placeholders.
 */
export const NewsDetailsScreen: React.FC<NewsDetailsScreenProps> = ({
  news,
  onBack,
  onTabPress,
  onEdit,
  loading = false,
}) => {
  const [coverFailed, setCoverFailed] = useState(false);
  const [galleryFailed, setGalleryFailed] = useState<Record<string, boolean>>({});
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // Android hardware back returns to the News list. Modal sheets/dialogs sit
  // above this screen and consume back via onRequestClose first, so the screen
  // never navigates away while an overlay is open.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  // Reset the image fallbacks whenever a different news item is opened.
  useEffect(() => {
    setCoverFailed(false);
    setGalleryFailed({});
  }, [news?.id]);

  const handleShellTabPress = (tab: string) => {
    if (tab === 'news') {
      return;
    }
    if ((tab === 'events' || tab === 'blogs') && onTabPress) {
      onTabPress(tab);
      return;
    }
    Alert.alert(
      'Preview shell',
      'Global navigation is owned by the app-level architecture. This bar is a temporary visual preview only.',
    );
  };

  const handleAction = (action: string) => {
    setActionSheetVisible(false);
    if (action === 'delete') {
      setDeleteDialogVisible(true);
      return;
    }
    if (action === 'edit') {
      if (onEdit && news) {
        onEdit(news);
        return;
      }
      Alert.alert('Edit News', PLACEHOLDER_MESSAGE);
      return;
    }
    if (action === 'share' || action === 'copyLink' || action === 'view') {
      Alert.alert(
        action === 'view' ? 'View News' : action === 'share' ? 'Share' : 'Copy Link',
        PLACEHOLDER_MESSAGE,
      );
      return;
    }
    Alert.alert(
      action.charAt(0).toUpperCase() + action.slice(1),
      `UI-only confirmation. "${action}" will be connected after backend integration.`,
    );
  };

  const handleDeleteConfirmed = () => {
    setDeleteDialogVisible(false);
    // UI-only confirmation — no backend call, nothing is deleted.
    Alert.alert(
      'Delete News',
      'UI-only confirmation. Deletion will be connected after backend integration.',
    );
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <AdminShellHeader leading="back" onBack={onBack} />
        <AppLoader fullScreen message="Loading news..." />
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.root}>
        <AdminShellHeader leading="back" onBack={onBack} />
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <AppEmptyState
            icon="📰"
            title="News not found"
            description="The selected news could not be loaded. Please go back and try again."
            actionTitle="Try Again"
            onAction={onBack}
            style={styles.notFoundState}
          />
        </SafeAreaView>
      </View>
    );
  }

  const badgeTone = STATUS_BADGE_TONES[news.status];
  const coverUri = news.thumbnailUrl && !coverFailed ? news.thumbnailUrl : undefined;
  const summaryText = news.summaryDetailed ?? news.summary;
  const visibleGallery = (news.gallery ?? []).slice(0, 3);
  const galleryRemainder = (news.gallery ?? []).length - visibleGallery.length;

  return (
    <View style={styles.root}>
      {/* TEMPORARY preview shell: real global header is owned by the app-level architecture. */}
      <AdminShellHeader leading="back" onBack={onBack} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Featured image */}
          <View style={styles.coverWrapper}>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                style={styles.coverImage}
                resizeMode="cover"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <View style={[styles.coverImage, styles.coverFallback]}>
                <Text style={styles.coverFallbackIcon}>📰</Text>
              </View>
            )}
          </View>

          {/* Category + status */}
          <View style={styles.badgesRow}>
            <CategoryChip category={news.category} />
            <AppBadge
              label={STATUS_LABELS[news.status]}
              customBg={badgeTone.bg}
              customTextColor={badgeTone.text}
              style={styles.statusBadge}
              textStyle={styles.statusText}
            />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{news.title}</Text>

          {/* Metadata: date / time / views, then author */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>📅</Text>
              <Text style={styles.metadataText}>{news.date}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>🕐</Text>
              <Text style={styles.metadataText}>{news.time}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>👁</Text>
              <Text style={styles.metadataText}>{formatViews(news.views)}</Text>
            </View>
          </View>
          {news.author ? (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>👤</Text>
              <Text style={styles.metadataText}>{news.author}</Text>
            </View>
          ) : null}

          {/* Summary card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{summaryText}</Text>
          </View>

          {/* News content */}
          {news.content && news.content.length > 0 ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>News Content</Text>
                <TouchableOpacity
                  style={styles.textSizeButton}
                  onPress={() => Alert.alert('Text Size', PLACEHOLDER_MESSAGE)}
                  accessibilityRole="button"
                  accessibilityLabel="Text size options"
                >
                  <Text style={styles.textSizeIcon}>Aa</Text>
                </TouchableOpacity>
              </View>
              {news.content.map((paragraph, index) => (
                <Text key={index} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </>
          ) : null}

          {/* Key highlights */}
          {news.highlights && news.highlights.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Key Highlights</Text>
              {news.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightRow}>
                  <View style={styles.highlightBullet} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </>
          ) : null}

          {/* Images gallery */}
          {visibleGallery.length > 0 ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Images</Text>
                <TouchableOpacity
                  style={styles.galleryCountButton}
                  onPress={() => Alert.alert('News Images', PLACEHOLDER_MESSAGE)}
                  accessibilityRole="button"
                  accessibilityLabel={`View all ${news.gallery?.length ?? 0} images`}
                >
                  <Text style={styles.galleryCount}>{news.gallery?.length ?? 0}</Text>
                  <Text style={styles.galleryChevron}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.galleryRow}>
                {visibleGallery.map(uri => (
                  <View key={uri} style={styles.galleryThumbWrapper}>
                    {galleryFailed[uri] ? (
                      <View style={[styles.galleryThumb, styles.galleryFallback]}>
                        <Text style={styles.galleryFallbackIcon}>🖼️</Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri }}
                        style={styles.galleryThumb}
                        resizeMode="cover"
                        onError={() =>
                          setGalleryFailed(previous => ({ ...previous, [uri]: true }))
                        }
                      />
                    )}
                  </View>
                ))}
                {galleryRemainder > 0 ? (
                  <View style={styles.galleryMoreTile}>
                    <Text style={styles.galleryMoreText}>+{galleryRemainder}</Text>
                  </View>
                ) : null}
              </View>
            </>
          ) : null}

          {/* Tags */}
          {news.tags && news.tags.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagWrap}>
                {news.tags.map(tag => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText} numberOfLines={1}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Additional information */}
          <View style={styles.additionalCard}>
            <Text style={styles.additionalTitle}>Additional Information</Text>
            <View style={styles.additionalRow}>
              <View style={styles.additionalLabel}>
                <Text style={styles.additionalIcon}>🏷️</Text>
                <Text style={styles.additionalLabelText}>Category</Text>
              </View>
              <Text style={styles.additionalValue}>{news.category}</Text>
            </View>
            <View style={styles.additionalRow}>
              <View style={styles.additionalLabel}>
                <Text style={styles.additionalIcon}>✅</Text>
                <Text style={styles.additionalLabelText}>Status</Text>
              </View>
              <AppBadge
                label={STATUS_LABELS[news.status]}
                customBg={badgeTone.bg}
                customTextColor={badgeTone.text}
                style={styles.additionalStatusBadge}
                textStyle={styles.additionalStatusText}
              />
            </View>
            {news.author ? (
              <View style={styles.additionalRow}>
                <View style={styles.additionalLabel}>
                  <Text style={styles.additionalIcon}>👤</Text>
                  <Text style={styles.additionalLabelText}>Author</Text>
                </View>
                <Text style={styles.additionalValue}>{news.author}</Text>
              </View>
            ) : null}
            <View style={styles.additionalRow}>
              <View style={styles.additionalLabel}>
                <Text style={styles.additionalIcon}>📅</Text>
                <Text style={styles.additionalLabelText}>Published Date</Text>
              </View>
              <Text style={styles.additionalValue}>
                {news.date}, {news.time}
              </Text>
            </View>
            <View style={[styles.additionalRow, styles.additionalRowLast]}>
              <View style={styles.additionalLabel}>
                <Text style={styles.additionalIcon}>👁</Text>
                <Text style={styles.additionalLabelText}>Views</Text>
              </View>
              <Text style={styles.additionalValue}>{news.views.toLocaleString('en-IN')} Views</Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed bottom action bar (reference: Edit News + three-dot) */}
        <View style={styles.bottomActionBar}>
          <AppButton
            title="Edit News"
            variant="primary"
            size="md"
            onPress={() => {
              if (onEdit && news) {
                onEdit(news);
                return;
              }
              Alert.alert('Edit News', PLACEHOLDER_MESSAGE);
            }}
            icon={<Text style={styles.editIcon}>✏️</Text>}
            style={styles.editButton}
          />
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setActionSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="More actions"
          >
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* TEMPORARY preview shell: real bottom navigation is owned by the app-level architecture. */}
      <AdminShellTabBar activeTab="news" onTabPress={handleShellTabPress} />

      <NewsDetailsActionMenu
        visible={actionSheetVisible}
        news={news}
        onAction={handleAction}
        onClose={() => setActionSheetVisible(false)}
      />
      <NewsDeleteConfirmDialog
        visible={deleteDialogVisible}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteConfirmed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
  },
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  notFoundState: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },

  coverWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.xl,
    backgroundColor: AdminColors.background,
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackIcon: {
    fontSize: 40,
  },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'none',
  },

  headline: {
    ...Typography.screenTitle,
    fontSize: 21,
    lineHeight: 27,
    color: AdminColors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },

  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.base,
    paddingLeft: 0,
  },
  metadataIcon: {
    fontSize: 12,
  },
  metadataText: {
    ...Typography.secondaryMedium,
    fontSize: 12,
    lineHeight: 16,
    color: AdminColors.textSecondary,
  },

  summaryCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.primaryLight,
  },
  summaryText: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: AdminColors.textPrimary,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    fontSize: 16,
    lineHeight: 21,
    color: AdminColors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  textSizeButton: {
    minHeight: 30,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  textSizeIcon: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
  },
  paragraph: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: AdminColors.textPrimary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },

  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  highlightBullet: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primary,
    marginTop: 7,
  },
  highlightText: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: AdminColors.textPrimary,
    flex: 1,
  },

  galleryCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  galleryCount: {
    ...Typography.secondaryMedium,
    color: AdminColors.textSecondary,
  },
  galleryChevron: {
    fontSize: 14,
    lineHeight: 16,
    color: AdminColors.textSecondary,
    fontWeight: '700',
  },
  galleryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  galleryThumbWrapper: {
    flex: 1,
    aspectRatio: 1,
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.background,
  },
  galleryFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryFallbackIcon: {
    fontSize: 18,
  },
  galleryMoreTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryMoreText: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: AdminColors.textOnDark,
  },

  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  tagChip: {
    maxWidth: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
  },
  tagText: {
    ...Typography.secondaryMedium,
    fontSize: 11,
    color: AdminColors.primary,
  },

  additionalCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.background,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  additionalTitle: {
    ...Typography.sectionHeader,
    fontSize: 16,
    lineHeight: 21,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  additionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
  },
  additionalRowLast: {
    borderBottomWidth: 0,
  },
  additionalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  additionalIcon: {
    fontSize: 12,
  },
  additionalLabelText: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  additionalValue: {
    ...Typography.bodyMedium,
    fontSize: 12.5,
    color: AdminColors.textPrimary,
    textAlign: 'right',
    flexShrink: 1,
  },
  additionalStatusBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  additionalStatusText: {
    fontSize: 9.5,
    lineHeight: 12,
    textTransform: 'none',
  },

  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: AdminColors.cardSurface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AdminColors.border,
  },
  editButton: {
    flex: 1,
  },
  editIcon: {
    fontSize: 13,
  },
  moreButton: {
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  moreIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.textPrimary,
  },
});
