import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import {
  ContactChevronRightIcon,
  WebsiteGlobeIcon,
  WhatsAppChatIcon,
} from './MembershipIcons';

interface RenewContactBarProps {
  websiteUrl?: string;
  whatsAppNumber?: string;
  onWebsitePress?: () => void;
  onWhatsAppPress?: () => void;
}

export const RenewContactBar: React.FC<RenewContactBarProps> = ({
  websiteUrl = 'https://hrsjm.org/',
  whatsAppNumber = '7021057853',
  onWebsitePress,
  onWhatsAppPress,
}) => {
  const handleWebsitePress = () => {
    if (onWebsitePress) {
      onWebsitePress();
    } else {
      Linking.openURL(websiteUrl).catch(() => {});
    }
  };

  const handleWhatsAppPress = () => {
    if (onWhatsAppPress) {
      onWhatsAppPress();
    } else {
      const cleanNumber = whatsAppNumber.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/91${cleanNumber}`).catch(() => {});
    }
  };

  return (
    <View
      style={styles.cardContainer}
      accessibilityRole="region"
      accessibilityLabel="Contact Information"
    >
      {/* Left Segment: Website */}
      <TouchableOpacity
        style={styles.contactSegment}
        onPress={handleWebsitePress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Website: ${websiteUrl}`}
      >
        <View style={styles.iconCircleBlue}>
          <WebsiteGlobeIcon size={20} color="#1E40AF" />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.labelSmall}>Website :</Text>
          <Text style={styles.valueText} numberOfLines={1}>
            {websiteUrl}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Vertical Divider */}
      <View style={styles.divider} />

      {/* Right Segment: WhatsApp */}
      <TouchableOpacity
        style={styles.contactSegment}
        onPress={handleWhatsAppPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`WhatsApp: ${whatsAppNumber}`}
      >
        <View style={styles.iconCircleGreen}>
          <WhatsAppChatIcon size={20} color="#16A34A" />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.labelSmall}>WhatsApp :</Text>
          <Text style={styles.valueText} numberOfLines={1}>
            {whatsAppNumber}
          </Text>
        </View>
        <ContactChevronRightIcon size={14} color="#1E40AF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1.5,
  },
  contactSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 7,
  },
  iconCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  iconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 13,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 15,
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
});
