import React from 'react';
import {
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
import type { RightsListItem, RightsStatus } from '../types/rights.types';

export interface RightsActionMenuAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RightsActionRow {
  key: string;
  icon: string;
  label: string;
  destructive?: boolean;
}

/** Actions per status matching the approved reference wireframe. */
const actionsForStatus = (status: RightsStatus): RightsActionRow[] => {
  const rows: RightsActionRow[] = [{ key: 'edit', icon: '✏️', label: 'Edit' }];

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

interface RightsActionMenuProps {
  visible: boolean;
  /** Article whose menu is open. */
  article: RightsListItem | null;
  /** Screen position of the three-dot button. */
  anchor?: RightsActionMenuAnchor | null;
  /** Callback when an action key is pressed. */
  onAction?: (action: string) => void;
  onClose: () => void;
}

export const RightsActionMenu: React.FC<RightsActionMenuProps> = ({
  visible,
  article,
  anchor,
  onAction,
  onClose,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  if (!article || !visible) {
    return null;
  }

  const handleAction = (row: RightsActionRow) => {
    onClose();
    if (onAction) {
      onAction(row.key);
    }
  };

  const rows = actionsForStatus(article.status);
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
