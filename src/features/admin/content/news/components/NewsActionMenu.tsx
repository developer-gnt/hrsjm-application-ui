import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { feedback } from '../../../../../core/feedback/FeedbackContext';
import type { NewsListItem, NewsStatus } from '../types/news.types';

export interface NewsActionMenuAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface NewsActionRow {
  key: string;
  icon: string;
  label: string;
  destructive?: boolean;
}

/** Actions per status matching the approved mobile reference pattern. */
export const actionsForNewsStatus = (status: NewsStatus): NewsActionRow[] => {
  const rows: NewsActionRow[] = [
    { key: 'view', icon: '👁', label: 'View' },
    { key: 'edit', icon: '✏️', label: 'Edit' },
  ];

  if (status === 'PUBLISHED') {
    rows.push(
      { key: 'unpublish', icon: '🚫', label: 'Unpublish', destructive: true },
      { key: 'archive', icon: '📦', label: 'Archive' },
    );
  } else if (status === 'DRAFT') {
    rows.push(
      { key: 'publish', icon: '📣', label: 'Publish' },
      { key: 'archive', icon: '📦', label: 'Archive' },
    );
  } else {
    rows.push({ key: 'restore', icon: '♻️', label: 'Restore' });
  }

  rows.push({ key: 'delete', icon: '🗑️', label: 'Delete', destructive: true });
  return rows;
};

export interface NewsActionMenuProps {
  visible: boolean;
  news: NewsListItem | null;
  anchor?: NewsActionMenuAnchor | null;
  onAction?: (action: string) => void;
  onClose: () => void;
}

export const NewsActionMenu: React.FC<NewsActionMenuProps> = ({
  visible,
  news,
  anchor,
  onAction,
  onClose,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  if (!news || !visible) {
    return null;
  }

  const handleAction = (row: NewsActionRow) => {
    onClose();
    if (onAction) {
      onAction(row.key);
    }
  };

  const rows = actionsForNewsStatus(news.status);
  const MENU_WIDTH = 160;
  const MENU_HEIGHT = rows.length * 42 + 16;
  const MARGIN = 12;

  // Horizontal positioning: align right edge of popup with right edge of anchor button
  let left = anchor
    ? anchor.x + anchor.width - MENU_WIDTH
    : windowWidth - MENU_WIDTH - MARGIN;

  if (left < MARGIN) {
    left = MARGIN;
  } else if (left + MENU_WIDTH > windowWidth - MARGIN) {
    left = windowWidth - MENU_WIDTH - MARGIN;
  }

  // Vertical positioning: prefer below anchor; if overflowing bottom, flip above anchor
  let top = anchor ? anchor.y + anchor.height + 4 : 120;

  if (top + MENU_HEIGHT > windowHeight - MARGIN) {
    if (anchor && anchor.y - MENU_HEIGHT - 4 >= MARGIN) {
      top = anchor.y - MENU_HEIGHT - 4;
    } else {
      top = Math.max(MARGIN, windowHeight - MENU_HEIGHT - MARGIN);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="Close actions"
      >
        <View
          style={[styles.menuCard, { top, left, width: MENU_WIDTH }]}
          onStartShouldSetResponder={() => true}
        >
          {rows.map(row => (
            <TouchableOpacity
              key={row.key}
              style={styles.actionRow}
              onPress={() => handleAction(row)}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{row.icon}</Text>
              <Text
                style={[
                  styles.actionLabel,
                  row.destructive && styles.actionLabelDanger,
                ]}
              >
                {row.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

/** Backward compatibility helper */
export const showNewsActionMenu = (
  news: NewsListItem,
  callbacks?: {
    onView?: () => void;
    onEdit?: () => void;
    onPublish?: () => void;
    onUnpublish?: () => void;
    onArchive?: () => void;
    onRestore?: () => void;
    onDelete?: () => void;
  },
): void => {
  feedback.info(news.title, `Status: ${news.status}`);
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  menuCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  actionLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#06294D',
  },
  actionLabelDanger: {
    color: '#EF4444',
  },
});
