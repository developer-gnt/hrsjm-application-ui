import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AdminColors, BorderRadius, Spacing, Typography } from '../../../../../core/theme';

interface NewsFormSectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * White card section for the Create News form: blue icon + title header with
 * a subtle divider, matching the reference layout.
 */
export const NewsFormSection: React.FC<NewsFormSectionProps> = ({ icon, title, children, style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.divider} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 15,
  },
  title: {
    ...Typography.sectionHeader,
    fontSize: 15,
    lineHeight: 20,
    color: AdminColors.primaryDark,
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AdminColors.border,
    marginBottom: Spacing.md,
  },
});
