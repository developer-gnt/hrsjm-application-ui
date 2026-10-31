import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AdminHeader } from '../../../app/navigation/AdminHeader';
import { Spacing } from '../../../core';

interface MembershipCategoriesHeaderProps {
  paddingTop?: number;
  onBack?: () => void;
}

export const MembershipCategoriesHeader: React.FC<MembershipCategoriesHeaderProps> = ({
  onBack,
}) => {
  return (
    <View style={styles.container}>
      <AdminHeader showBack={Boolean(onBack)} onBack={onBack} />
      <View style={styles.titleSection}>
        <Text style={styles.title}>Membership Categories</Text>
        <Text style={styles.subtitle}>Choose a membership plan that fits you</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  titleSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FAF9F5',
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B2F52',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

export default MembershipCategoriesHeader;
