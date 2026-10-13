import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';

export interface HelplineItem {
  id: string;
  name: string;
  number: string;
  category: string;
  hours: string;
  badgeColor: string;
  badgeTextColor: string;
}

export const EMERGENCY_HELPLINES: HelplineItem[] = [
  {
    id: 'police',
    name: 'National Emergency',
    number: '112',
    category: 'Police / Fire / Medical',
    hours: '24/7 Available',
    badgeColor: '#FEE2E2',
    badgeTextColor: '#DC2626',
  },
  {
    id: 'women',
    name: 'Women Helpline',
    number: '1091',
    category: 'Women in Distress',
    hours: '24/7 Toll Free',
    badgeColor: '#FEF3C7',
    badgeTextColor: '#D97706',
  },
  {
    id: 'child',
    name: 'Childline India',
    number: '1098',
    category: 'Child Rights & Care',
    hours: '24/7 Toll Free',
    badgeColor: '#E0E7FF',
    badgeTextColor: '#4F46E5',
  },
  {
    id: 'hrsjm',
    name: 'HRSJM Legal Helpdesk',
    number: '+91 22 1234 5678',
    category: 'Rights & Complaints',
    hours: 'Mon-Sat 10am-6pm',
    badgeColor: '#DCFCE7',
    badgeTextColor: '#16A34A',
  },
];

export const EmergencyHelplinesSection: React.FC = () => {
  const handleCall = async (item: HelplineItem) => {
    const cleanNumber = item.number.replace(/\s+/g, '');
    const url = `tel:${cleanNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Helpline Number', `${item.name}: ${item.number}`);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {EMERGENCY_HELPLINES.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => handleCall(item)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Call ${item.name} at ${item.number}`}
        >
          <View style={styles.topRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.badgeColor },
              ]}
            >
              <Text style={[styles.badgeText, { color: item.badgeTextColor }]}>
                {item.hours}
              </Text>
            </View>
            <View style={styles.callCircle}>
              <AppIcon name="phone" size={15} color={AdminColors.primaryDark} />
            </View>
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {item.category}
          </Text>

          <View style={styles.numberRow}>
            <Text style={styles.number}>{item.number}</Text>
            <View style={styles.callActionPill}>
              <Text style={styles.callActionText}>Call</Text>
              <AppIcon name="arrow-right" size={11} color={AdminColors.primaryDark} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingRight: Spacing.base,
    gap: Spacing.sm,
  },
  card: {
    width: 220,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  callCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: Spacing.xs,
  },
  category: {
    fontSize: 11,
    lineHeight: 15,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm + 4,
    paddingTop: Spacing.xs + 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  number: {
    fontSize: 13,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  callActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AdminColors.accentGoldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  callActionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
});
