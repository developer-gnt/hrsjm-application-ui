import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'primary' | 'white';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  variant = 'primary',
}) => {
  const isPrimary = variant === 'primary';

  return (
    <View
      style={[
        styles.container,
        isPrimary ? styles.primaryContainer : styles.whiteContainer,
      ]}
    >
      <StatusBar
        barStyle={isPrimary ? 'light-content' : 'dark-content'}
      />
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text
                style={[
                  styles.backIcon,
                  { color: isPrimary ? AdminColors.textOnDark : AdminColors.textPrimary },
                ]}
              >
                ←
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                { color: isPrimary ? AdminColors.textOnDark : AdminColors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  { color: isPrimary ? AdminColors.accentGoldLight : AdminColors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightAction && <View style={styles.rightContainer}>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
  },
  primaryContainer: {
    backgroundColor: AdminColors.headerBg,
  },
  whiteContainer: {
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...Typography.sectionHeader,
  },
  subtitle: {
    ...Typography.secondary,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
});
