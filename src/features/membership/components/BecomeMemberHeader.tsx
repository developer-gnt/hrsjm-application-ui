import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, Spacing, BorderRadius } from '../../../core';
import { ChevronLeftIcon, SearchIcon } from './MembershipIcons';

const HRSJM_LOGO = require('../../../assets/hrsjm_logo.png');

interface BecomeMemberHeaderProps {
  paddingTop?: number;
  onBack?: () => void;
  onSearchPress?: () => void;
}

export const BecomeMemberHeader: React.FC<BecomeMemberHeaderProps> = ({
  paddingTop = 0,
  onBack,
  onSearchPress,
}) => {
  return (
    <View style={[styles.headerContainer, { paddingTop: paddingTop + Spacing.xs }]}>
      {/* Left Back Button */}
      <TouchableOpacity
        style={styles.circleButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ChevronLeftIcon size={16} color="#0F2860" />
      </TouchableOpacity>

      {/* Center Brand Identity */}
      <View style={styles.brandContainer}>
        <Image
          source={HRSJM_LOGO}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="HRSJM Emblem Logo"
        />
        <View style={styles.brandTextColumn}>
          <Text style={styles.brandTitle}>HRSJM</Text>
          <Text style={styles.brandSubtitleEn}>HUMAN RIGHTS & SOCIAL JUSTICE MISSION</Text>
          <Text style={styles.brandSubtitleHi}>मानव अधिकार • सामाजिक न्याय</Text>
        </View>
      </View>

      {/* Right Search Button */}
      <TouchableOpacity
        style={styles.circleButton}
        onPress={onSearchPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <SearchIcon size={17} color="#0F2860" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  brandTextColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: AdminColors.primary,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  brandSubtitleEn: {
    fontSize: 6.5,
    fontWeight: '700',
    color: '#1E3A8A',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  brandSubtitleHi: {
    fontSize: 6.5,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.2,
  },
});
