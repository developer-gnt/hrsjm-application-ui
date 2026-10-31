import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutWorkArea } from '../types/about.types';

interface AboutWorkCardProps {
  area: AboutWorkArea;
  onPress?: () => void;
  fullWidth?: boolean;
}

export const AboutWorkCard: React.FC<AboutWorkCardProps> = ({
  area,
  onPress,
  fullWidth = false,
}) => {
  const cleanTitle = area.title.replace(/\n/g, ' ');

  if (fullWidth) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.fullCard,
          pressed && onPress && styles.pressed,
        ]}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`${cleanTitle} — ${area.description}`}
      >
        <View style={styles.iconCircle}>
          <AppIcon name={area.icon} size={22} color={AdminColors.primaryDark} />
        </View>
        <View style={styles.fullCopy}>
          <Text style={styles.title} numberOfLines={1}>
            {cleanTitle}
          </Text>
          {area.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{area.badge}</Text>
            </View>
          ) : null}
          {area.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {area.description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Open details for ${cleanTitle}`}
        >
          <AppIcon name="arrow-right" size={13} color={AdminColors.textOnDark} />
        </TouchableOpacity>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && onPress && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${cleanTitle} — ${area.description}`}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconCircle}>
          <AppIcon name={area.icon} size={22} color={AdminColors.primaryDark} />
        </View>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Open details for ${cleanTitle}`}
        >
          <AppIcon name="arrow-right" size={13} color={AdminColors.textOnDark} />
        </TouchableOpacity>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          {cleanTitle}
        </Text>
        {area.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{area.badge}</Text>
          </View>
        ) : null}
        {area.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {area.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    minHeight: 126,
    padding: 12,
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
    justifyContent: 'flex-start',
  },
  fullCard: {
    width: '100%',
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.border,
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.82,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AdminColors.accentGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  copy: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  fullCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 4,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: AdminColors.textSecondary,
  },
  arrowButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AdminColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
