import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import {
  BookResourcesIcon,
  CommunityIcon,
  ImpactHeartIcon,
  MegaphoneEventsIcon,
} from './MembershipIcons';

interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface WhyBecomeMemberSectionProps {
  onCardPress?: (cardId: string) => void;
}

export const WhyBecomeMemberSection: React.FC<WhyBecomeMemberSectionProps> = ({
  onCardPress,
}) => {
  const benefits: BenefitItem[] = [
    {
      id: 'cause',
      title: 'Be Part of a Cause',
      description: 'Join a community working for human rights and social justice.',
      icon: <CommunityIcon size={20} color="#0F2860" />,
    },
    {
      id: 'resources',
      title: 'Access Resources',
      description: 'Get exclusive access to learning materials, workshops and updates.',
      icon: <BookResourcesIcon size={20} color="#0F2860" />,
    },
    {
      id: 'events',
      title: 'Participate in Events',
      description: 'Be the first to know about events, campaigns and volunteer opportunities.',
      icon: <MegaphoneEventsIcon size={20} color="#0F2860" />,
    },
    {
      id: 'impact',
      title: 'Make a Real Impact',
      description: 'Support our work and help create positive change in society.',
      icon: <ImpactHeartIcon size={20} color="#0F2860" />,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Why Become a Member?</Text>

      {/* 2x2 Grid of Benefit Cards */}
      <View style={styles.gridContainer}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => onCardPress?.(benefits[0].id)}
            accessibilityRole="button"
            accessibilityLabel={benefits[0].title}
          >
            <View style={styles.iconCircle}>{benefits[0].icon}</View>
            <Text style={styles.cardTitle}>{benefits[0].title}</Text>
            <Text style={styles.cardDescription}>{benefits[0].description}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => onCardPress?.(benefits[1].id)}
            accessibilityRole="button"
            accessibilityLabel={benefits[1].title}
          >
            <View style={styles.iconCircle}>{benefits[1].icon}</View>
            <Text style={styles.cardTitle}>{benefits[1].title}</Text>
            <Text style={styles.cardDescription}>{benefits[1].description}</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => onCardPress?.(benefits[2].id)}
            accessibilityRole="button"
            accessibilityLabel={benefits[2].title}
          >
            <View style={styles.iconCircle}>{benefits[2].icon}</View>
            <Text style={styles.cardTitle}>{benefits[2].title}</Text>
            <Text style={styles.cardDescription}>{benefits[2].description}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => onCardPress?.(benefits[3].id)}
            accessibilityRole="button"
            accessibilityLabel={benefits[3].title}
          >
            <View style={styles.iconCircle}>{benefits[3].icon}</View>
            <Text style={styles.cardTitle}>{benefits[3].title}</Text>
            <Text style={styles.cardDescription}>{benefits[3].description}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EBF0F7',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
    minHeight: 146,
    justifyContent: 'flex-start',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF8E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 4,
    lineHeight: 17,
  },
  cardDescription: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
});
