import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors, Spacing, Typography } from '../../../../../core/theme';

interface EventFormSectionProps {
  title: string;
  children: React.ReactNode;
}

/** Section heading + content block for the Create Event form. */
export const EventFormSection: React.FC<EventFormSectionProps> = ({ title, children }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.primaryDark,
    marginBottom: Spacing.sm,
  },
});