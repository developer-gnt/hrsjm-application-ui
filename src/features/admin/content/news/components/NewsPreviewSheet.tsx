import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';
import { CategoryChip, STATUS_LABELS } from './NewsCard';
import type { NewsListItem, NewsStatus } from '../types/news.types';

/**
 * UI-only preview of the current form values, visually echoing the News
 * Details screen. Shown in a bottom sheet from the Create/Edit News forms;
 * no navigation, no backend.
 */

interface NewsPreviewSheetProps {
  visible: boolean;
  news: NewsListItem;
  onClose: () => void;
}

const StatusBadgeLike: React.FC<{ status: NewsStatus }> = ({ status }) => {
  const tones: Record<NewsStatus, { bg: string; text: string }> = {
    PUBLISHED: { bg: AdminColors.statusActiveLight, text: AdminColors.statusActive },
    DRAFT: { bg: AdminColors.warningLight, text: AdminColors.warning },
    ARCHIVED: { bg: AdminColors.statusInactiveLight, text: AdminColors.statusInactive },
  };
  const tone = tones[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.statusText, { color: tone.text }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
};

export const NewsPreviewSheet: React.FC<NewsPreviewSheetProps> = ({ visible, news, onClose }) => {
  const tags = news.tags ?? [];

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
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Preview News</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close preview"
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {news.thumbnailUrl ? (
                <Image
                  source={{ uri: news.thumbnailUrl }}
                  style={styles.cover}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cover, styles.coverFallback]}>
                  <Text style={styles.coverFallbackIcon}>📰</Text>
                </View>
              )}
              <View style={styles.badgesRow}>
                <CategoryChip category={news.category} />
                <StatusBadgeLike status={news.status} />
              </View>
              <Text style={styles.headline}>{news.title || 'News headline'}</Text>
              <View style={styles.metadataRow}>
                <Text style={styles.metadata}>👤 {news.author}</Text>
                <Text style={styles.metadata}>📅 {news.date}</Text>
                <Text style={styles.metadata}>🕐 {news.time}</Text>
                <Text style={styles.metadata}>👁 {news.views}</Text>
              </View>
              {tags.length > 0 ? (
                <View style={styles.tagWrap}>
                  {tags.map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText} numberOfLines={1}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{news.summary}</Text>
              </View>
              {news.content && news.content.length > 0 ? (
                news.content.map((paragraph, index) => (
                  <Text key={index} style={styles.paragraph}>
                    {paragraph}
                  </Text>
                ))
              ) : null}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
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
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    maxHeight: '90%',
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.border,
    marginBottom: Spacing.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.primaryDark,
  },
  sheetClose: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.textMuted,
    padding: Spacing.xs,
  },
  cover: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.background,
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackIcon: {
    fontSize: 34,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  headline: {
    ...Typography.screenTitle,
    fontSize: 19,
    lineHeight: 25,
    color: AdminColors.textPrimary,
    marginTop: Spacing.sm,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metadata: {
    ...Typography.secondaryMedium,
    fontSize: 11.5,
    color: AdminColors.textSecondary,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tagChip: {
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
  summaryCard: {
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  summaryText: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: AdminColors.textPrimary,
  },
  paragraph: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: AdminColors.textPrimary,
    marginTop: Spacing.md,
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  closeButtonText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: AdminColors.textPrimary,
  },
});
