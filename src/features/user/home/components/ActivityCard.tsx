import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { ActivityTone, MemberActivity } from '../types/home.types';

const TONE_STYLES: Record<ActivityTone, { surface: string; icon: string }> = {
  green: { surface: AdminColors.statusActiveLight, icon: AdminColors.statusActive },
  blue: { surface: AdminColors.infoLight, icon: AdminColors.info },
  amber: { surface: AdminColors.warningLight, icon: AdminColors.warning },
  purple: { surface: AdminColors.accentPurpleLight, icon: AdminColors.accentPurple },
};

interface ActivityCardProps {
  activity: MemberActivity;
  onPress?: () => void;
}

/** Tinted statistic tile from the member "My Activities" reference row. */
export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  const tone = TONE_STYLES[activity.tone];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tone.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${activity.value} ${activity.label}`}
    >
      <AppIcon name={activity.icon} size={22} color={tone.icon} strokeWidth={1.7} />
      <Text style={styles.value} numberOfLines={1}>
        {activity.value}
      </Text>
      <Text style={styles.label}>{activity.label}</Text>
    </TouchableOpacity>
  );
};

interface ActivitiesRowProps {
  activities: MemberActivity[];
  onPressActivity?: (activity: MemberActivity) => void;
}

/** Four-across responsive row of activity tiles (reference layout). */
export const ActivitiesRow: React.FC<ActivitiesRowProps> = ({
  activities,
  onPressActivity,
}) => (
  <View style={styles.row}>
    {activities.map(activity => (
      <ActivityCard
        key={activity.id}
        activity={activity}
        onPress={() => onPressActivity?.(activity)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    minHeight: 104,
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
