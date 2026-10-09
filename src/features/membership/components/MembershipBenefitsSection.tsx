import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface MembershipBenefitsSectionProps {
  onBenefitPress?: (benefit: BenefitItem) => void;
}

export const MembershipBenefitsSection: React.FC<MembershipBenefitsSectionProps> = ({
  onBenefitPress,
}) => {
  const benefits: BenefitItem[] = [
    {
      id: 'events',
      title: 'Access to Events',
      description: 'Exclusive invites to workshops, seminars and campaigns.',
      icon: (
        <View style={styles.groupIcon}>
          <View style={styles.groupSideLeft}>
            <View style={styles.groupSideHead} />
            <View style={styles.groupSideBody} />
          </View>
          <View style={styles.groupCenter}>
            <View style={styles.groupCenterHead} />
            <View style={styles.groupCenterBody} />
          </View>
          <View style={styles.groupSideRight}>
            <View style={styles.groupSideHead} />
            <View style={styles.groupSideBody} />
          </View>
        </View>
      ),
    },
    {
      id: 'learning',
      title: 'Learning Resources',
      description: 'Educational materials, research papers and guides.',
      icon: (
        <View style={styles.bookIcon}>
          <View style={styles.bookSpine} />
          <View style={styles.bookPageLeft} />
          <View style={styles.bookPageRight} />
        </View>
      ),
    },
    {
      id: 'network',
      title: 'Community Network',
      description: 'Connect with like-minded members and experts.',
      icon: (
        <View style={styles.networkIcon}>
          <View style={styles.networkNodeTop} />
          <View style={styles.networkNodeLeft} />
          <View style={styles.networkNodeRight} />
          <View style={styles.networkNodeBottom} />
          <View style={styles.networkLineV} />
          <View style={styles.networkLineH} />
        </View>
      ),
    },
    {
      id: 'volunteer',
      title: 'Volunteer Opportunities',
      description: 'Be part of on-ground initiatives and social programs.',
      icon: (
        <View style={styles.megaphoneIcon}>
          <View style={styles.megaphoneCone} />
          <View style={styles.megaphoneHandle} />
          <View style={styles.megaphoneRing} />
        </View>
      ),
    },
    {
      id: 'updates',
      title: 'Special Updates',
      description: 'Get the latest news, policy updates and success stories.',
      icon: (
        <View style={styles.shieldIcon}>
          <View style={styles.shieldOuter} />
          <View style={styles.shieldCheck} />
        </View>
      ),
    },
    {
      id: 'discounts',
      title: 'Member Discounts',
      description: 'Priority access and discounts on select events and programs.',
      icon: (
        <View style={styles.discountIcon}>
          <View style={styles.discountBadge} />
          <View style={styles.discountDotTop} />
          <View style={styles.discountLine} />
          <View style={styles.discountDotBottom} />
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container} accessibilityRole="region" accessibilityLabel="Membership Benefits Section">
      {/* Section Header */}
      <Text style={styles.sectionTitle}>Membership Benefits</Text>

      {/* 2-Column Benefits Grid */}
      <View style={styles.grid}>
        {benefits.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={onBenefitPress ? 0.75 : 1}
            onPress={() => onBenefitPress?.(item)}
            accessibilityRole={onBenefitPress ? 'button' : 'region'}
            accessibilityLabel={`${item.title}: ${item.description}`}
          >
            {/* Warm Peach/Gold Icon Circle */}
            <View style={styles.iconCircle}>{item.icon}</View>

            {/* Title & Description */}
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={3}>
              {item.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF2DC',
    borderWidth: 1,
    borderColor: '#FDE4B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 3,
    lineHeight: 16,
  },
  cardDescription: {
    fontSize: 10,
    lineHeight: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Vector Icons (Matching Reference) */
  /* 1. Group / Team Icon */
  groupIcon: {
    width: 22,
    height: 17,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
  },
  groupCenter: {
    alignItems: 'center',
    zIndex: 2,
  },
  groupCenterHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.3,
    borderColor: '#0A204C',
  },
  groupCenterBody: {
    width: 10,
    height: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 1.3,
    borderBottomWidth: 0,
    borderColor: '#0A204C',
    marginTop: 0.8,
    backgroundColor: '#FFF2DC',
  },
  groupSideLeft: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    bottom: 1,
    zIndex: 1,
  },
  groupSideRight: {
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 1,
    zIndex: 1,
  },
  groupSideHead: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.2,
    borderColor: '#0A204C',
  },
  groupSideBody: {
    width: 7,
    height: 4,
    borderTopLeftRadius: 3.5,
    borderTopRightRadius: 3.5,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: '#0A204C',
    marginTop: 0.8,
  },

  /* 2. Book Icon */
  bookIcon: {
    width: 20,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bookSpine: {
    width: 1.5,
    height: 14,
    backgroundColor: '#0A204C',
    zIndex: 2,
  },
  bookPageLeft: {
    width: 8,
    height: 12,
    borderWidth: 1.4,
    borderRightWidth: 0,
    borderColor: '#0A204C',
    borderTopLeftRadius: 2.5,
    borderBottomLeftRadius: 2.5,
  },
  bookPageRight: {
    width: 8,
    height: 12,
    borderWidth: 1.4,
    borderLeftWidth: 0,
    borderColor: '#0A204C',
    borderTopRightRadius: 2.5,
    borderBottomRightRadius: 2.5,
  },

  /* 3. Network Nodes Icon */
  networkIcon: {
    width: 18,
    height: 18,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkNodeTop: {
    position: 'absolute',
    top: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.3,
    borderColor: '#0A204C',
    backgroundColor: '#FFF2DC',
    zIndex: 2,
  },
  networkNodeBottom: {
    position: 'absolute',
    bottom: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.3,
    borderColor: '#0A204C',
    backgroundColor: '#FFF2DC',
    zIndex: 2,
  },
  networkNodeLeft: {
    position: 'absolute',
    left: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.3,
    borderColor: '#0A204C',
    backgroundColor: '#FFF2DC',
    zIndex: 2,
  },
  networkNodeRight: {
    position: 'absolute',
    right: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.3,
    borderColor: '#0A204C',
    backgroundColor: '#FFF2DC',
    zIndex: 2,
  },
  networkLineV: {
    position: 'absolute',
    width: 1.4,
    height: 14,
    backgroundColor: '#0A204C',
  },
  networkLineH: {
    position: 'absolute',
    height: 1.4,
    width: 14,
    backgroundColor: '#0A204C',
  },

  /* 4. Megaphone Icon */
  megaphoneIcon: {
    width: 19,
    height: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  megaphoneCone: {
    width: 12,
    height: 10,
    borderLeftWidth: 1.4,
    borderTopWidth: 1.4,
    borderBottomWidth: 1.4,
    borderColor: '#0A204C',
    borderTopLeftRadius: 1,
    borderBottomLeftRadius: 1,
    transform: [{ skewY: '-15deg' }],
  },
  megaphoneHandle: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    width: 3.5,
    height: 5,
    borderLeftWidth: 1.4,
    borderBottomWidth: 1.4,
    borderColor: '#0A204C',
    transform: [{ rotate: '20deg' }],
  },
  megaphoneRing: {
    position: 'absolute',
    right: 1,
    top: 2,
    width: 4,
    height: 10,
    borderRightWidth: 1.4,
    borderColor: '#0A204C',
    borderRadius: 3,
  },

  /* 5. Shield Icon */
  shieldIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shieldOuter: {
    width: 15,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.4,
    borderColor: '#0A204C',
  },
  shieldCheck: {
    position: 'absolute',
    width: 6,
    height: 3.5,
    borderLeftWidth: 1.4,
    borderBottomWidth: 1.4,
    borderColor: '#0A204C',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },

  /* 6. Discount Percent Icon */
  discountIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  discountBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.4,
    borderColor: '#0A204C',
  },
  discountLine: {
    position: 'absolute',
    width: 11,
    height: 1.3,
    backgroundColor: '#0A204C',
    transform: [{ rotate: '-45deg' }],
  },
  discountDotTop: {
    position: 'absolute',
    top: 4,
    left: 5,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#0A204C',
  },
  discountDotBottom: {
    position: 'absolute',
    bottom: 4,
    right: 5,
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#0A204C',
  },
});
