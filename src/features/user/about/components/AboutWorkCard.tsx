import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AdminColors,
  Shadows,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import type { AboutWorkArea } from '../types/about.types';

interface AboutWorkCardProps {
  area: AboutWorkArea;
  onPress?: () => void;
}

export const AboutWorkCard: React.FC<AboutWorkCardProps> = ({
  area,
  onPress,
}) => (
  <Pressable
    style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    onPress={onPress}
    disabled={!onPress}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={`${area.title.replace(/\n/g, ' ')} — ${area.description}`}
  >
    <View style={styles.iconCircle}>
      <AppIcon name={area.icon} size={22} color={AdminColors.primaryDark} />
    </View>
    <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
      {area.title}
    </Text>
    <View style={styles.arrowButton}>
      <AppIcon name="arrow-right" size={12} color={AdminColors.textOnDark} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E3F7',
    ...Shadows.card,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.82,
  },
  iconCircle: {
    width: 38,
    height: 38,
    marginBottom: 10,
    borderRadius: 19,
    backgroundColor: '#F9EEC7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7D69C',
  },
  title: {
    maxWidth: '78%',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    letterSpacing: -0.15,
  },
  arrowButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AdminColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
