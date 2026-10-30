import React from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Spacing,
  Typography,
} from '../../../../../core/theme';
import {
  Pencil,
  EyeOff,
  FolderTree,
  Send,
  RotateCcw,
  Trash2,
  type AppIconComponent,
} from '../../../../../core/components/icons';
import type { BlogListItem, BlogStatus } from '../types/blog.types';

export interface BlogActionMenuAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BlogActionRow {
  key: string;
  Icon: AppIconComponent;
  label: string;
  destructive?: boolean;
}

/** Actions per status matching the approved wireframe. */
const actionsForStatus = (status: BlogStatus): BlogActionRow[] => {
  const rows: BlogActionRow[] = [{ key: 'edit', Icon: Pencil, label: 'Edit' }];

  if (status === 'PUBLISHED') {
    rows.push(
      { key: 'unpublish', Icon: EyeOff, label: 'Unpublish', destructive: true },
      { key: 'archive', Icon: FolderTree, label: 'Archive' },
    );
  } else if (status === 'DRAFT') {
    rows.push(
      { key: 'publish', Icon: Send, label: 'Publish' },
      { key: 'archive', Icon: FolderTree, label: 'Archive' },
    );
  } else {
    rows.push({ key: 'restore', Icon: RotateCcw, label: 'Restore' });
  }

  rows.push({ key: 'delete', Icon: Trash2, label: 'Delete', destructive: true });
  return rows;
};

interface BlogActionMenuProps {
  visible: boolean;
  /** Blog whose menu is open. */
  blog: BlogListItem | null;
  /** Position of the trigger button on screen. */
  anchor?: BlogActionMenuAnchor | null;
  /** Callback when an action key is pressed. */
  onAction?: (action: string) => void;
  onClose: () => void;
}

export const BlogActionMenu: React.FC<BlogActionMenuProps> = ({
  visible,
  blog,
  anchor,
  onAction,
  onClose,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  if (!blog || !visible) {
    return null;
  }

  const handleAction = (row: BlogActionRow) => {
    onClose();
    if (onAction) {
      onAction(row.key);
    }
  };

  const rows = actionsForStatus(blog.status);
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
              <View style={{ marginRight: 10 }}>
                <row.Icon
                  size={16}
                  color={row.destructive ? '#DC2626' : AdminColors.textPrimary}
                  strokeWidth={2}
                />
              </View>
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
