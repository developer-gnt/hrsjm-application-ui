import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { PressableScale } from './PressableScale';
import type { AppIconComponent } from '../icons';

export interface BottomNavItem {
  key: string;
  label: string;
  Icon: AppIconComponent;
}

interface AppBottomNavigationProps {
  items: BottomNavItem[];
  activeKey: string;
  onItemPress?: (key: string) => void;
}

const NAV_ICON_SIZE = 24;
const NAV_LABEL_SIZE = 11;

/**
 * Reusable bottom navigation bar: 44pt+ touch targets, outline icons,
 * subtle gold selected-state pill (single sparing use of the gold accent),
 * stable while content scrolls, and safe-area aware on the bottom inset.
 */
export const AppBottomNavigation: React.FC<AppBottomNavigationProps> = ({
  items,
  activeKey,
  onItemPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}
      accessibilityRole="tablist"
    >
      {items.map(({ key, label, Icon }) => {
        const isActive = key === activeKey;
        return (
          <PressableScale
            key={key}
            onPress={() => onItemPress?.(key)}
            scaleTo={0.94}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            testID={`bottom-nav-${key}`}
            containerStyle={styles.item}
            style={styles.itemInner}
          >
            <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
              <Icon
                size={NAV_ICON_SIZE}
                color={isActive ? BrandColors.goldDark : BrandColors.textMuted}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </View>
            <Text
              style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: BrandColors.surface,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    paddingTop: Spacing.sm,
  },
  item: {
    flex: 1,
    minWidth: 0,
  },
  itemInner: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    minHeight: 52,
  },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderRadius: BorderRadius.lg,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: BrandColors.goldSoft,
  },
  label: {
    marginTop: 3,
    fontSize: NAV_LABEL_SIZE,
    fontWeight: '500',
    lineHeight: 14,
    maxWidth: '100%',
  },
  labelActive: {
    color: BrandColors.goldDark,
    fontWeight: '600',
  },
  labelInactive: {
    color: BrandColors.textMuted,
  },
});

export default AppBottomNavigation;
