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
import { AppAvatar, AppEmptyState, AppLoader } from '../../../../../core/components';
import { RightsCategoryChip, RIGHTS_STATUS_TONES, RIGHTS_STATUS_LABELS, formatRightsViews } from '../components/RightsCard';
import { RightsDetailsActionMenu } from '../components/RightsDetailsActionMenu';
import { AdminShellHeader } from '../../events/preview/AdminShellHeader';
import { AdminShellTabBar } from '../../events/preview/AdminShellTabBar';
import type { RightsArticle } from '../types/rights.types';

const PLACEHOLDER_MESSAGE =
  'This is a UI placeholder. It will be connected after backend integration.';

interface RightArticleDetailsScreenProps {
  /** The article row selected on the Know Your Rights list. */
  article: RightsArticle | null;
  /** Back navigation to the Know Your Rights list (back arrow, Android back). */
  onBack: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; tabs this screen does not handle fall back to the shell's
   * preview notice.
   */
  onTabPress?: (tab: string) => void;
  /**
   * Called when Edit is chosen. When not provided, a placeholder alert is
   * shown instead (the Edit Rights screen does not exist yet).
   */
  onEdit?: (article: RightsArticle) => void;
  /**
   * Prepared for the backend phase: renders AppLoader when true. The UI-only
   * phase never sets it (no fake network delays).
   */
  loading?: boolean;
}

/**
 * Right Article Details screen (UI-only phase).
 *
 * Renders the selected sample article following the reference: page header
 * with back + three-dot anchored action menu, large rounded cover image,
 * navy headline, category/status/date/views metadata row, author block, and
 * the Article Content card with numbered Key Highlights. NO backend —
 * actions are placeholders.
 */
export const RightArticleDetailsScreen: React.FC<RightArticleDetailsScreenProps> = ({
  article,
  onBack,
  onTabPress,
  onEdit,
  loading = false,
}) => {
  const [coverFailed, setCoverFailed] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  // Android hardware back returns to the Know Your Rights list. The action
  // menu sits above this screen and consumes back via onRequestClose first,
  // so the screen never navigates away while the menu is open.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  // Reset the cover fallback whenever a different article is opened.
  useEffect(() => {
    setCoverFailed(false);
  }, [article?.id]);

  const handleShellTabPress = (tab: string) => {
    if (tab === 'rights') {
      return;
    }
    if ((tab === 'events' || tab === 'news' || tab === 'blogs') && onTabPress) {
      onTabPress(tab);
      return;
    }
    Alert.alert(
      'Preview shell',
      'Global navigation is owned by the app-level architecture. This bar is a temporary visual preview only.',
    );
  };

  // The dropdown menu closes itself before calling this; all actions are
  // UI-only placeholders until the backend contract lands.
  const handleAction = (action: string) => {
    if (action === 'edit') {
      if (onEdit && article) {
        onEdit(article);
        return;
      }
      Alert.alert('Edit Article', PLACEHOLDER_MESSAGE);
      return;
    }
    if (action === 'delete') {
      Alert.alert('Delete', PLACEHOLDER_MESSAGE);
      return;
    }
    Alert.alert(
      action.charAt(0).toUpperCase() + action.slice(1),
      `UI-only confirmation. "${action}" will be connected after backend integration.`,
    );
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <AdminShellHeader leading="back" onBack={onBack} />
        <AppLoader fullScreen message="Loading article..." />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.root}>
        <AdminShellHeader leading="back" onBack={onBack} />
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <AppEmptyState
            icon="⚖️"
            title="Article not found"
            description="The selected article could not be loaded. Please go back and try again."
            actionTitle="Try Again"
            onAction={onBack}
            style={styles.notFoundState}
          />
        </SafeAreaView>
      </View>
    );
  }

  const badgeTone = RIGHTS_STATUS_TONES[article.status];
  const badgeLabel = RIGHTS_STATUS_LABELS[article.status];
  const coverUri = article.thumbnailUrl && !coverFailed ? article.thumbnailUrl : undefined;

  return (
    <View style={styles.root}>
      {/* TEMPORARY preview shell: real global header is owned by the app-level architecture. */}
      <AdminShellHeader leading="back" onBack={onBack} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Page header row: back button + heading + three-dot actions */}
          <View style={styles.pageHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back to Know Your Rights"
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Right Article Details</Text>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => setActionMenuVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Article actions"
            >
              <Text style={styles.moreIcon}>⋮</Text>
            </TouchableOpacity>
          </View>

          {/* Cover image */}
          <View style={styles.coverWrapper}>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                style={styles.coverImage}
                resizeMode="cover"
                onError={() => setCoverFailed(true)}
                accessibilityLabel={`Cover image for ${article.title}`}
              />
            ) : (
              <View style={[styles.coverImage, styles.coverFallback]}>
                <Text style={styles.coverFallbackIcon}>⚖️</Text>
              </View>
            )}
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{article.title}</Text>

          {/* Metadata: category / status / date / views with separators */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataGroup}>
              <RightsCategoryChip category={article.category} />
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataGroup}>
              <View style={[styles.statusBadge, { backgroundColor: badgeTone.bg }]}>
                <Text style={[styles.statusText, { color: badgeTone.text }]}>
                  {badgeLabel}
                </Text>
              </View>
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataGroup}>
              <Text style={styles.metadataIcon}>📅</Text>
              <View style={styles.metadataTextCol}>
                <Text style={styles.metadataValue}>{article.lastUpdatedDate}</Text>
                <Text style={styles.metadataLabel}>{article.lastUpdatedTime}</Text>
              </View>
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataGroup}>
              <Text style={styles.metadataIcon}>👁</Text>
              <View style={styles.metadataTextCol}>
                <Text style={styles.metadataValue}>{formatRightsViews(article.views)}</Text>
                <Text style={styles.metadataLabel}>Views</Text>
              </View>
            </View>
          </View>

          {/* Author */}
          <View style={styles.authorRow}>
            <AppAvatar name={article.author} size={44} />
            <View style={styles.authorText}>
              <Text style={styles.authorName}>By {article.author}</Text>
              <Text style={styles.authorRole}>{article.authorRole}</Text>
              <Text style={styles.authorOrg}>{article.organization}</Text>
            </View>
          </View>

          {/* Article content card */}
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Article Content</Text>
            {article.content.map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}

            {/* Divider + Key Highlights (inside the same card per the reference) */}
            <View style={styles.contentDivider} />
            <Text style={styles.sectionTitle}>Key Highlights</Text>
            <View style={styles.highlightsList}>
              {article.highlights.map((highlight, index) => (
                <View key={highlight.title} style={styles.highlightRow}>
                  <View style={styles.highlightNumberCircle}>
                    <Text style={styles.highlightNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.highlightText}>
                    <Text style={styles.highlightTitle}>{highlight.title}</Text>
                    <Text style={styles.highlightDescription}>
                      {' — '}
                      {highlight.description}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* TEMPORARY preview shell: real bottom navigation is owned by the app-level architecture. */}
      <AdminShellTabBar activeTab="rights" onTabPress={handleShellTabPress} />

      <RightsDetailsActionMenu
        visible={actionMenuVisible}
        status={article.status}
        onAction={handleAction}
        onClose={() => setActionMenuVisible(false)}
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

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.primaryLight,
  },
  backIcon: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  pageTitle: {
    ...Typography.screenTitle,
    fontSize: 20,
    lineHeight: 25,
    color: AdminColors.primaryDark,
    flex: 1,
  },
  moreButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.primaryLight,
  },
  moreIcon: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.primary,
  },

  coverWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
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

  headline: {
    ...Typography.screenTitle,
    fontSize: 21,
    lineHeight: 27,
    color: AdminColors.primaryDark,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },

  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  metadataGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metadataTextCol: {
    gap: 1,
  },
  metadataValue: {
    ...Typography.secondaryMedium,
    fontSize: 12.5,
    lineHeight: 16,
    color: AdminColors.textPrimary,
  },
  metadataLabel: {
    ...Typography.caption,
    fontSize: 10.5,
    lineHeight: 13,
    color: AdminColors.textSecondary,
  },
  metadataIcon: {
    fontSize: 14,
  },
  metadataDivider: {
    width: 1,
    height: 30,
    backgroundColor: AdminColors.border,
  },

  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '600',
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  authorText: {
    gap: 1,
  },
  authorName: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: AdminColors.primaryDark,
  },
  authorRole: {
    ...Typography.secondary,
    fontSize: 12,
    lineHeight: 16,
    color: AdminColors.textSecondary,
  },
  authorOrg: {
    ...Typography.caption,
    color: AdminColors.textMuted,
  },

  contentCard: {
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    fontSize: 16,
    lineHeight: 21,
    color: AdminColors.primaryDark,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  contentDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AdminColors.border,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },

  highlightsList: {
    gap: Spacing.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  highlightNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  highlightNumber: {
    ...Typography.badge,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  highlightText: {
    flex: 1,
    minWidth: 0,
    ...Typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: AdminColors.textPrimary,
  },
  highlightTitle: {
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  highlightDescription: {
    color: AdminColors.textPrimary,
  },
});
