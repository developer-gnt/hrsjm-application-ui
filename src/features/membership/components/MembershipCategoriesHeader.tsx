import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, Spacing, Typography } from '../../../core';

interface MembershipCategoriesHeaderProps {
  paddingTop?: number;
  onBack: () => void;
}

export const MembershipCategoriesHeader: React.FC<MembershipCategoriesHeaderProps> = ({
  paddingTop = 0,
  onBack,
}) => {
  return (
    <View style={[styles.container, { paddingTop: paddingTop + Spacing.sm }]}>
      <View style={styles.contentRow}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Title & Subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Membership Categories
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Choose a membership plan that fits you
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F2860',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: Spacing.md,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#E0E7FF',
    marginTop: 2,
    fontWeight: '500',
  },
});
