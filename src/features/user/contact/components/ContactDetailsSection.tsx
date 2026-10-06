import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AppIcon } from '../../components';
import { CONTACT_DETAIL_CARDS, CONTACT_DETAILS_SUBTITLE } from '../data/contact-content';
import type { ContactDetailCard } from '../types/contact.types';

interface ContactDetailsCardProps {
  card: ContactDetailCard;
  onLinkPress?: (card: ContactDetailCard) => void;
}

/** One white detail card of the 2x2 "Our Contact Details" grid. */
export const ContactDetailsCard: React.FC<ContactDetailsCardProps> = ({
  card,
  onLinkPress,
}) => (
  <View style={styles.card}>
    <View style={styles.titleRow}>
      <View style={styles.iconCircle}>
        <View style={styles.iconCircleTint} />
        <AppIcon name={card.icon} size={17} color={AdminColors.primaryDark} />
      </View>
      <Text style={styles.title}>{card.title}</Text>
    </View>

    <View style={styles.lines}>
      {card.lines.map((line, index) => (
        <Text key={`${card.id}-${index}`} style={styles.line}>
          {line}
        </Text>
      ))}
    </View>

    {card.linkLabel && (
      <TouchableOpacity
        style={styles.link}
        onPress={() => onLinkPress?.(card)}
        activeOpacity={0.7}
        accessibilityRole="link"
        accessibilityLabel={card.linkLabel}
      >
        <Text style={styles.linkText}>{card.linkLabel}</Text>
        <AppIcon name="arrow-right" size={12} color={AdminColors.primary} />
      </TouchableOpacity>
    )}
  </View>
);

interface ContactDetailsSectionProps {
  onLinkPress?: (card: ContactDetailCard) => void;
}

/**
 * Home contact section, part 1 (reference-locked): serif "Our Contact
 * Details" heading, subtitle and the 2x2 details grid (Phone / Email /
 * Office Address / Working Hours).
 */
export const ContactDetailsSection: React.FC<ContactDetailsSectionProps> = ({
  onLinkPress,
}) => (
  <View style={styles.section}>
    <Text style={styles.heading}>Our Contact Details</Text>
    <Text style={styles.subtitle}>{CONTACT_DETAILS_SUBTITLE}</Text>

    <View style={styles.grid}>
      {CONTACT_DETAIL_CARDS.map(card => (
        <ContactDetailsCard key={card.id} card={card} onLinkPress={onLinkPress} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.base,
  },
  heading: {
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: AdminColors.primaryDark,
  },
  subtitle: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: AdminColors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: AdminColors.cardSurface,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    ...Shadows.card,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
    backgroundColor: AdminColors.accentGold,
    opacity: 0.16,
  },
  title: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    color: AdminColors.primaryDark,
    marginLeft: Spacing.sm,
    flexShrink: 1,
  },
  lines: {
    marginTop: Spacing.xs,
    marginLeft: 42,
  },
  line: {
    fontSize: 9.5,
    lineHeight: 13,
    color: AdminColors.textSecondary,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginLeft: 42,
  },
  linkText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: AdminColors.primary,
    marginRight: 4,
  },
});
