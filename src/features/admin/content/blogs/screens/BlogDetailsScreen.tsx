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
import { AppBadge, AppEmptyState, AppLoader } from '../../../../../core/components';
import { feedback } from '../../../../../core';
import { Calendar, Eye, User } from '../../../../../core/components/icons';
import {
  BlogCategoryChip,
  BLOG_STATUS_LABELS,
  BLOG_STATUS_TONES,
  formatBlogViews,
} from '../components/BlogCard';
import { BlogActionMenu } from '../components/BlogActionMenu';
import { AdminHeader } from '../../../../../app/navigation/AdminHeader';
import {
  updateBlogApi,
  deleteBlogApi,
  incrementBlogViewsApi,
} from '../services/blogs.service';
import type { BlogListItem } from '../types/blog.types';

const splitAuthor = (author: string): { name: string; role: string | null } => {
  const separator = author.indexOf(' ');
  if (separator <= 0) {
    return { name: author, role: null };
  }
  return { name: author.slice(0, separator), role: author.slice(separator + 1) };
};

interface BlogDetailsScreenProps {
  /** The blog row selected on the Blogs list. */
  blog: BlogListItem | null;
  /** Back navigation to the Blogs list (back arrow, Android hardware back). */
  onBack: () => void;
  /**
   * TEMPORARY (UI-only phase): called when a bottom tab is pressed on the
   * preview shell; tabs this screen does not handle fall back to the shell's
   * preview notice.
   */
  onTabPress?: (tab: string) => void;
  /**
   * TEMPORARY (UI-only phase): called when Edit is chosen. When not provided,
   * a placeholder alert is shown instead (Edit Blog is a later phase).
   */
  onEdit?: (blog: BlogListItem) => void;
  onDelete?: (blog: BlogListItem) => void;
  /**
   * Prepared for the backend phase: renders AppLoader when true. The UI-only
   * phase never sets it (no fake network delays).
   */
  loading?: boolean;
}

export const BlogDetailsScreen: React.FC<BlogDetailsScreenProps> = ({
  blog: initialBlog,
  onBack,
  onTabPress,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [blog, setBlog] = useState<BlogListItem | null>(initialBlog);
  const [coverFailed, setCoverFailed] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  useEffect(() => {
    setBlog(initialBlog);
  }, [initialBlog]);

  // Android hardware back returns to the Blogs list.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  // Reset the cover fallback and increment view count on mount
  useEffect(() => {
    setCoverFailed(false);
    if (blog?.id) {
      incrementBlogViewsApi(blog.id)
        .then(newViews => {
          if (newViews > 0) {
            setBlog(prev => (prev ? { ...prev, views: newViews } : null));
          }
        })
        .catch(() => {});
    }
  }, [blog?.id]);

  const handleAction = async (action: string) => {
    if (!blog) return;

    if (action === 'edit') {
      if (onEdit) {
        onEdit(blog);
        return;
      }
      feedback.info('Edit Blog', 'Edit navigation is not configured.');
      return;
    }

    try {
      if (action === 'publish') {
        const updated = await updateBlogApi(blog.id, { status: 'PUBLISHED' });
        setBlog(updated);
        feedback.success('Published', 'Article has been published successfully.');
      } else if (action === 'unpublish') {
        const updated = await updateBlogApi(blog.id, { status: 'DRAFT' });
        setBlog(updated);
        feedback.warning('Unpublished', 'Article reverted to draft mode.');
      } else if (action === 'archive') {
        const updated = await updateBlogApi(blog.id, { status: 'ARCHIVED' });
        setBlog(updated);
        feedback.info('Archived', 'Article has been archived.');
      } else if (action === 'restore') {
        const updated = await updateBlogApi(blog.id, { status: 'PUBLISHED' });
        setBlog(updated);
        feedback.success('Restored', 'Article restored to published.');
      } else if (action === 'delete') {
        Alert.alert(
          'Delete Blog',
          `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteBlogApi(blog.id);
                  feedback.success('Deleted', 'Article has been removed.');
                  if (onDelete) {
                    onDelete(blog);
                  } else {
                    onBack();
                  }
                } catch (err: any) {
                  feedback.error('Error', err?.message || 'Delete failed.');
                }
              },
            },
          ],
        );
      }
    } catch (err: any) {
      feedback.error('Error', err?.message || 'Action failed.');
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <AdminHeader showBack onBack={onBack} />
        <AppLoader fullScreen message="Loading blog..." />
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.root}>
        <AdminHeader showBack onBack={onBack} />
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <AppEmptyState
            icon="📝"
            title="Blog not found"
            description="The selected blog could not be loaded. Please go back and try again."
            actionTitle="Try Again"
            onAction={onBack}
            style={styles.notFoundState}
          />
        </SafeAreaView>
      </View>
    );
  }

  const badgeTone = BLOG_STATUS_TONES[blog.status];
  const badgeLabel =
    blog.status === 'PUBLISHED'
      ? `✓ ${BLOG_STATUS_LABELS[blog.status]}`
      : BLOG_STATUS_LABELS[blog.status];
  const coverUri = blog.thumbnailUrl && !coverFailed ? blog.thumbnailUrl : undefined;
  const author = blog.author ? splitAuthor(blog.author) : null;
  // Keep the content section ready for the backend: paragraphs render when
  // present, otherwise the existing excerpt fills the section.
  const paragraphs =
    blog.content && blog.content.length > 0 ? blog.content : [blog.excerpt];

  return (
    <View style={styles.root}>
      {/* Unified HRSJM Admin Header with back button */}
      <AdminHeader showBack onBack={onBack} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Page title row: heading + three-dot actions (reference) */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Blog Details</Text>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => setActionSheetVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="More actions"
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
              />
            ) : (
              <View style={[styles.coverImage, styles.coverFallback]}>
                <Text style={styles.coverFallbackIcon}>📝</Text>
              </View>
            )}
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{blog.title}</Text>

          {/* Category + status badges (adjacent, per the reference) */}
          <View style={styles.badgesRow}>
            <BlogCategoryChip category={blog.category} />
            <AppBadge
              label={badgeLabel}
              customBg={badgeTone.bg}
              customTextColor={badgeTone.text}
              style={styles.statusBadge}
              textStyle={styles.statusText}
            />
          </View>

          {/* Metadata: date/time / views / author groups with dividers */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataGroup}>
              <Calendar size={15} color={AdminColors.primary} />
              <View style={styles.metadataTextCol}>
                <Text style={styles.metadataValue}>{blog.date}</Text>
                <Text style={styles.metadataLabel}>{blog.time}</Text>
              </View>
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataGroup}>
              <Eye size={15} color={AdminColors.primary} />
              <View style={styles.metadataTextCol}>
                <Text style={styles.metadataValue}>{formatBlogViews(blog.views)}</Text>
                <Text style={styles.metadataLabel}>Views</Text>
              </View>
            </View>
            {author ? (
              <>
                <View style={styles.metadataDivider} />
                <View style={styles.metadataGroup}>
                  <User size={15} color={AdminColors.primary} />
                  <View style={styles.metadataTextCol}>
                    <Text style={styles.metadataValue}>{author.name}</Text>
                    {author.role ? (
                      <Text style={styles.metadataLabel}>{author.role}</Text>
                    ) : null}
                  </View>
                </View>
              </>
            ) : null}
          </View>

          {/* Divider + content */}
          <View style={styles.contentDivider} />
          <Text style={styles.sectionTitle}>Blog Content</Text>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </ScrollView>
      </SafeAreaView>

      <BlogActionMenu
        visible={actionSheetVisible}
        blog={blog}
        onAction={handleAction}
        onClose={() => setActionSheetVisible(false)}
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
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  pageTitle: {
    ...Typography.screenTitle,
    fontSize: 20,
    lineHeight: 25,
    color: AdminColors.primaryDark,
  },
  moreButton: {
    width: 44,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
  },
  moreIcon: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.textPrimary,
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
    color: AdminColors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
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

  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  metadataGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 1,
  },
  metadataIcon: {
    fontSize: 14,
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
  metadataDivider: {
    width: 1,
    height: 30,
    backgroundColor: AdminColors.border,
  },

  contentDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AdminColors.border,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    fontSize: 16,
    lineHeight: 21,
    color: AdminColors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  paragraph: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: AdminColors.textPrimary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
});
