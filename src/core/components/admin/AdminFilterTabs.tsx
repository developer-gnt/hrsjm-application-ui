import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import { AdminColors } from '../../theme/colors';

export interface AdminFilterTab<T = string> {
  key: T;
  label: string;
  /** Optional count rendered as a badge inside the chip. */
  count?: number;
}

export interface AdminFilterTabsProps<T = string> {
  tabs: AdminFilterTab<T>[];
  activeKey: T;
  onChange?: (key: T) => void;
  onSelect?: (key: T) => void;
  containerStyle?: ViewStyle;
}

/** Horizontal status/filter chip row with crisp typography & guaranteed height on Android/iOS/Web */
export const AdminFilterTabs = <T extends string = string>({
  tabs,
  activeKey,
  onChange,
  onSelect,
  containerStyle,
}: AdminFilterTabsProps<T>) => {
  const handlePress = (key: T) => {
    if (onChange) onChange(key);
    if (onSelect) onSelect(key);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.row}
      >
        {tabs.map(tab => {
          const active = tab.key === activeKey;
          const hasCount = tab.count !== undefined && tab.count !== null;

          return (
            <TouchableOpacity
              key={String(tab.key)}
              onPress={() => handlePress(tab.key)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                active ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  active ? styles.labelActive : styles.labelInactive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {hasCount ? (
                <View
                  style={[
                    styles.countPill,
                    active ? styles.countPillActive : styles.countPillInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      active ? styles.countTextActive : styles.countTextInactive,
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 44,
    justifyContent: 'center',
    marginVertical: 2,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    minHeight: 38,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: '#123B7A',
    borderColor: '#123B7A',
    shadowColor: '#123B7A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  labelInactive: {
    color: '#334155',
    fontWeight: '600',
  },
  countPill: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  countPillInactive: {
    backgroundColor: '#E2E8F0',
  },
  countText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  countTextInactive: {
    color: '#475569',
  },
});

export default AdminFilterTabs;