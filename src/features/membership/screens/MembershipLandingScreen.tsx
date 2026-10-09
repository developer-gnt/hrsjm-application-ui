import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon, type IconName } from '../../../core/components/common/Icon';
import type { AppStackParamList } from '../../../core/navigation/types';
import { MembershipTopBar } from '../components/MembershipTopBar';
import {
  MembershipBenefitsSheet,
  MembershipTypesSheet,
  NeedHelpSheet,
} from '../components/MembershipInfoSheets';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

interface ActionMenuItem {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function MembershipLandingScreen() {
  const navigation = useNavigation<NavProp>();
  const [benefitsVisible, setBenefitsVisible] = useState(false);
  const [typesVisible, setTypesVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const menuItems: ActionMenuItem[] = [
    {
      id: 'my-app',
      icon: 'file-text',
      title: 'My Application',
      subtitle: 'Check your application status',
      onPress: () => navigation.navigate('MyApplication'),
    },
    {
      id: 'benefits',
      icon: 'award',
      title: 'Membership Benefits',
      subtitle: 'Know what you get as a member',
      onPress: () => setBenefitsVisible(true),
    },
    {
      id: 'types',
      icon: 'heart',
      title: 'Membership Types',
      subtitle: 'View membership categories',
      onPress: () => setTypesVisible(true),
    },
    {
      id: 'help',
      icon: 'help-circle',
      title: 'Need Help?',
      subtitle: 'Contact our support team',
      onPress: () => setHelpVisible(true),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar showBack={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Membership</Text>
          <Text style={styles.subtitle}>
            Be a part of our mission for a more just and inclusive society.
          </Text>
        </View>

        {/* Hero Banner Card */}
        <View style={styles.heroCard}>
          <Image
            source={require('../../../assets/membership_hero_banner.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroScrim} />

          <View style={styles.heroContent}>
            <Text style={styles.heroHeadline}>
              Together{'\n'}for a Better{'\n'}Tomorrow
            </Text>
            <Text style={styles.heroBody}>
              Join HRSJM and contribute towards human rights, social justice and community development.
            </Text>
          </View>
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={styles.applyBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('MembershipStep1Personal')}
          accessibilityRole="button"
          accessibilityLabel="Apply for Membership">
          <Text style={styles.applyBtnText}>Apply for Membership</Text>
          <Icon name="arrow-right" size={18} color={colors.white} strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Action Menu List */}
        <View style={styles.menuContainer}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              activeOpacity={0.7}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${item.subtitle}`}>
              <View style={styles.menuIconBox}>
                <Icon name={item.icon} size={20} color={colors.primary} strokeWidth={2} />
              </View>

              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              <Icon name="chevron-right" size={18} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Info Bottom Sheets */}
      <MembershipBenefitsSheet
        visible={benefitsVisible}
        onClose={() => setBenefitsVisible(false)}
      />
      <MembershipTypesSheet
        visible={typesVisible}
        onClose={() => setTypesVisible(false)}
      />
      <NeedHelpSheet
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  screenTitle: {
    ...serif,
    fontSize: 28,
    fontWeight: '700',
    color: '#16274B',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  heroCard: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0F2860',
    position: 'relative',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 27, 65, 0.78)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  heroHeadline: {
    ...serif,
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  heroBody: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 8,
    lineHeight: 16,
    maxWidth: '90%',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
    borderRadius: radius.md,
    height: 48,
    gap: 8,
    marginBottom: spacing.lg,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  menuContainer: {
    gap: spacing.sm + 2,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#16274B',
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default MembershipLandingScreen;
