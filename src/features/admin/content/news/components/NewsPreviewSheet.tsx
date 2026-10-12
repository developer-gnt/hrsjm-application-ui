import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import { CategoryChip, STATUS_LABELS } from './NewsCard';
import type { NewsListItem, NewsStatus } from '../types/news.types';

interface NewsPreviewSheetProps {
  visible: boolean;
  news: NewsListItem;
  onClose: () => void;
}

const StatusBadgeLike: React.FC<{ status: NewsStatus }> = ({ status }) => {
  const tones: Record<NewsStatus, { bg: string; text: string; dot: string }> = {
    PUBLISHED: {
      bg: '#ECFDF5',
      text: '#059669',
      dot: '#10B981',
    },
    DRAFT: {
      bg: '#FFFBEB',
      text: '#D97706',
      dot: '#F59E0B',
    },
    ARCHIVED: {
      bg: '#F3F4F6',
      text: '#6B7280',
      dot: '#9CA3AF',
    },
  };
  const tone = tones[status] || tones.DRAFT;

  return (
    <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: tone.dot }]} />
      <Text style={[styles.statusText, { color: tone.text }]}>
        {STATUS_LABELS[status] || status}
      </Text>
    </View>
  );
};

/**
 * Parses inline formatting tags (**bold**, *italic*, <u>underline</u>, [text](url))
 * and renders formatted React Native Text elements.
 */
const renderInlineFormatted = (text: string, baseStyle?: any) => {
  if (!text) return null;

  // Regex to match **bold**, *italic*, <u>underline</u>, or [label](url)
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|\[.*?\]\(.*?\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // **Bold**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const content = part.slice(2, -2);
      return (
        <Text key={index} style={[baseStyle, styles.inlineBold]}>
          {content}
        </Text>
      );
    }

    // *Italic*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const content = part.slice(1, -1);
      return (
        <Text key={index} style={[baseStyle, styles.inlineItalic]}>
          {content}
        </Text>
      );
    }

    // <u>Underline</u>
    if (part.startsWith('<u>') && part.endsWith('</u>') && part.length >= 7) {
      const content = part.slice(3, -4);
      return (
        <Text key={index} style={[baseStyle, styles.inlineUnderline]}>
          {content}
        </Text>
      );
    }

    // [Link](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <Text key={index} style={[baseStyle, styles.inlineLink]}>
          {linkMatch[1]}
        </Text>
      );
    }

    // Regular text
    return (
      <Text key={index} style={baseStyle}>
        {part}
      </Text>
    );
  });
};

/**
 * Renders rich content block supporting markdown headings, bullet lists, numbered lists, and inline formatting.
 */
const renderRichContent = (content?: string[] | string) => {
  if (!content) return null;

  const rawLines = Array.isArray(content) ? content : content.split('\n');

  return (
    <View style={styles.contentBody}>
      {rawLines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={index} style={styles.emptyLineSpacer} />;
        }

        // Heading 2 (## Heading)
        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^##\s+/, '');
          return (
            <View key={index} style={styles.headingContainer}>
              <View style={styles.headingAccent} />
              <Text style={styles.headingText}>
                {renderInlineFormatted(headingText, styles.headingText)}
              </Text>
            </View>
          );
        }

        // Heading 1 (# Heading)
        if (trimmed.startsWith('# ')) {
          const headingText = trimmed.replace(/^#\s+/, '');
          return (
            <Text key={index} style={styles.heading1Text}>
              {renderInlineFormatted(headingText, styles.heading1Text)}
            </Text>
          );
        }

        // Bullet list item
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^(•|-|\*)\s+/, '');
          return (
            <View key={index} style={styles.listItemRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.listItemText}>
                {renderInlineFormatted(itemText, styles.listItemText)}
              </Text>
            </View>
          );
        }

        // Numbered list item (1. Item)
        const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberMatch) {
          const num = numberMatch[1];
          const itemText = numberMatch[2];
          return (
            <View key={index} style={styles.numberedItemRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{num}</Text>
              </View>
              <Text style={styles.listItemText}>
                {renderInlineFormatted(itemText, styles.listItemText)}
              </Text>
            </View>
          );
        }

        // Standard paragraph
        return (
          <Text key={index} style={styles.paragraph}>
            {renderInlineFormatted(trimmed, styles.paragraph)}
          </Text>
        );
      })}
    </View>
  );
};

export const NewsPreviewSheet: React.FC<NewsPreviewSheetProps> = ({
  visible,
  news,
  onClose,
}) => {
  const tags = news.tags ?? [];

  // Estimate read time
  const totalWords = `${news.title} ${news.summary} ${Array.isArray(news.content) ? news.content.join(' ') : news.content || ''}`
    .split(/\s+/)
    .filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(totalWords / 180));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={onClose}
          accessibilityLabel="Close preview"
        />
        <SafeAreaView style={styles.sheetContainer} edges={['bottom', 'left', 'right']}>
          <View style={styles.sheet}>
            {/* Grabber bar */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.previewLiveBadge}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.liveBadgeText}>PREVIEW MODE</Text>
                </View>
                <Text style={styles.sheetTitle}>Article Preview</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeIconCircle}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close preview"
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Cover Image */}
              {news.thumbnailUrl ? (
                <View style={styles.coverWrapper}>
                  <Image
                    source={{ uri: news.thumbnailUrl }}
                    style={styles.cover}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlayGradient} />
                  <View style={styles.floatingCategoryChip}>
                    <CategoryChip category={news.category} />
                  </View>
                </View>
              ) : (
                <View style={[styles.cover, styles.coverFallback]}>
                  <Text style={styles.coverFallbackIcon}>📰</Text>
                  <Text style={styles.coverFallbackText}>No Featured Image Selected</Text>
                </View>
              )}

              {/* Status & Read Time Row */}
              <View style={styles.metaTopBar}>
                <StatusBadgeLike status={news.status} />
                <View style={styles.readTimeBadge}>
                  <Text style={styles.readTimeIcon}>⏱️</Text>
                  <Text style={styles.readTimeText}>{readTimeMin} min read</Text>
                </View>
              </View>

              {/* Headline */}
              <Text style={styles.headline}>{news.title || 'Untitled News Headline'}</Text>

              {/* Author & Publication metadata card */}
              <View style={styles.authorCard}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>
                    {(news.author || 'H').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.authorDetails}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>{news.author || 'HRSJM Editorial'}</Text>
                    <Text style={styles.authorRoleBadge}>Editor</Text>
                  </View>
                  <View style={styles.metaSubRow}>
                    <Text style={styles.metaItemText}>📅 {news.date || 'Today'}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaItemText}>🕐 {news.time || 'Immediate'}</Text>
                  </View>
                </View>
              </View>

              {/* Tags */}
              {tags.length > 0 ? (
                <View style={styles.tagWrap}>
                  {tags.map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagHash}>#</Text>
                      <Text style={styles.tagText} numberOfLines={1}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Executive Summary Card */}
              {news.summary ? (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryLeftBar} />
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>EXECUTIVE SUMMARY</Text>
                    <Text style={styles.summaryText}>{news.summary}</Text>
                  </View>
                </View>
              ) : null}

              {/* Rich Content Body */}
              {renderRichContent(news.content)}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeButtonText}>Back to Editor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: AdminColors.cardSurface,
  },
  sheet: {
    backgroundColor: AdminColors.cardSurface,
    borderTopLeftRadius: BorderRadius.xl + 4,
    borderTopRightRadius: BorderRadius.xl + 4,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs + 2,
    paddingBottom: Spacing.sm,
    maxHeight: '92%',
  },
  dragHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: '#CBD5E1',
    marginBottom: Spacing.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: Spacing.sm,
  },
  headerTitleGroup: {
    gap: 2,
  },
  previewLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  sheetTitle: {
    ...Typography.sectionHeader,
    fontSize: 18,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  closeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetClose: {
    fontSize: 13,
    fontWeight: '800',
    color: AdminColors.textSecondary,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },

  // Cover Image
  coverWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  cover: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
  },
  imageOverlayGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  floatingCategoryChip: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  coverFallbackIcon: {
    fontSize: 40,
  },
  coverFallbackText: {
    ...Typography.caption,
    color: AdminColors.textMuted,
    fontWeight: '600',
  },

  // Metadata
  metaTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  readTimeIcon: {
    fontSize: 11,
  },
  readTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.textSecondary,
  },

  // Headline
  headline: {
    ...Typography.screenTitle,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '800',
    color: AdminColors.textPrimary,
    marginTop: Spacing.sm,
  },

  // Author Card
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AdminColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  authorDetails: {
    flex: 1,
    gap: 2,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: AdminColors.textPrimary,
  },
  authorRoleBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: AdminColors.primary,
    backgroundColor: AdminColors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  metaSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItemText: {
    fontSize: 11,
    color: AdminColors.textMuted,
    fontWeight: '500',
  },
  metaDivider: {
    fontSize: 11,
    color: '#CBD5E1',
  },

  // Tags
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3.5,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  tagHash: {
    fontSize: 11,
    fontWeight: '700',
    color: AdminColors.primary,
    marginRight: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.primary,
  },

  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryLeftBar: {
    width: 4,
    backgroundColor: AdminColors.primary,
  },
  summaryContent: {
    flex: 1,
    padding: Spacing.md,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AdminColors.primary,
    letterSpacing: 0.6,
  },
  summaryText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#334155',
    fontStyle: 'italic',
  },

  // Rich Content Body
  contentBody: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  emptyLineSpacer: {
    height: 8,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  headingAccent: {
    width: 3.5,
    height: 18,
    backgroundColor: AdminColors.primary,
    borderRadius: 2,
  },
  headingText: {
    fontSize: 16,
    fontWeight: '800',
    color: AdminColors.textPrimary,
  },
  heading1Text: {
    fontSize: 18,
    fontWeight: '900',
    color: AdminColors.primaryDark,
    marginTop: Spacing.sm,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 23,
    color: '#334155',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
    marginVertical: 2,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AdminColors.primary,
    marginTop: 8,
  },
  numberedItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 2,
    marginVertical: 2,
  },
  numberBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    paddingHorizontal: 4,
  },
  numberBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },

  // Inline formatting styles
  inlineBold: {
    fontWeight: '800',
    color: AdminColors.textPrimary,
  },
  inlineItalic: {
    fontStyle: 'italic',
  },
  inlineUnderline: {
    textDecorationLine: 'underline',
  },
  inlineLink: {
    color: AdminColors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  // Footer Actions
  footerActions: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.primary,
    shadowColor: AdminColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
