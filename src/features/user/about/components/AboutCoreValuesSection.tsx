import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';

const CORE_VALUES = [
  {
    id: 'justice-equality',
    title: 'Justice & Equality',
    description: 'Equal protection, fairness, and non-discrimination under law for every person.',
    icon: 'scale',
    bgColor: '#FFF8E8',
    iconTint: '#FCE9B8',
  },
  {
    id: 'grassroots-action',
    title: 'Grassroots Action',
    description: 'Direct on-ground engagement working hand-in-hand with local communities.',
    icon: 'users',
    bgColor: '#EEF4FF',
    iconTint: '#DCE9FF',
  },
  {
    id: 'integrity-trust',
    title: 'Integrity & Trust',
    description: 'Highest standards of ethical accountability, open communication, and truth.',
    icon: 'shield-check',
    bgColor: '#ECF9F4',
    iconTint: '#D0F0E3',
  },
  {
    id: 'compassion-dignity',
    title: 'Compassion & Dignity',
    description: 'Empathy-driven service upholding human dignity at the center of every action.',
    icon: 'heart-hands',
    bgColor: '#FFF0F2',
    iconTint: '#F9DDE3',
  },
] as const;

export const AboutCoreValuesSection: React.FC = () => {
  return (
    <View style={styles.panel}>
      <View style={styles.heading}>
        <View style={styles.accentLine} />
        <Text style={styles.title}>Our Core Values</Text>
        <Text style={styles.subtitle}>
          The ethical pillars that guide our everyday action across India
        </Text>
      </View>

      <View style={styles.grid}>
        {CORE_VALUES.map(val => (
          <View
            key={val.id}
            style={[styles.card, { backgroundColor: val.bgColor }]}
          >
            <View style={[styles.iconBubble, { backgroundColor: val.iconTint }]}>
              <AppIcon
                name={val.icon}
                size={20}
                color={AdminColors.primaryDark}
              />
            </View>
            <Text style={styles.cardTitle}>{val.title}</Text>
            <Text style={styles.cardDescription}>{val.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  heading: {
    marginBottom: Spacing.sm,
  },
  accentLine: {
    width: 28,
    height: 2.5,
    marginBottom: 4,
    backgroundColor: AdminColors.accentGold,
    borderRadius: 1,
  },
  title: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    color: AdminColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: Spacing.xs,
  },
  card: {
    width: '48.5%',
    minHeight: 124,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(7, 31, 76, 0.06)',
    justifyContent: 'flex-start',
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: AdminColors.primaryDark,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  cardDescription: {
    marginTop: 4,
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
