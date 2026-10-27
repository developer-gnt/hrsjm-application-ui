import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MemberHeader } from '../components/MemberHeader';
import { useNotifications } from '../../admin/notifications';
import { AppRoutes } from '../../../core/constants/routes';
import { useAuthStore } from '../../auth/store/authStore';
import { DEFAULT_ADMIN_AVATAR } from '../../auth/components/UserProfileModal';
import { FontFamilies, BorderRadius } from '../../../core/theme';
import { Calendar } from '../../../core/components/icons';

const HRSJM_EMBLEM = require('../../../assets/hrsjm_logo.png');

export const MemberHomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const { unreadCount } = useNotifications();

  const memberName = user?.full_name || 'HRSJM Member';
  const memberEmail = user?.email || 'member@hrsjm.org';
  const memberMobile = user?.mobile_number || '+91 98888 80002';
  const avatarUrl = user?.avatar || DEFAULT_ADMIN_AVATAR;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MemberHeader
        unreadCount={unreadCount}
        onPressNotifications={() => navigation.navigate(AppRoutes.NOTIFICATIONS)}
        onPressDonate={() => navigation.navigate('UserActionPage', { pageId: 'donate' })}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 20 },
        ]}
      >
        {/* Member Digital Identity Card (Gold & Navy Premium Card) */}
        <TouchableOpacity
          style={styles.membershipCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('MembershipDetails')}
        >
          <View style={styles.cardHeaderRow}>
            <Image source={HRSJM_EMBLEM} style={styles.cardEmblem} resizeMode="contain" />
            <View style={styles.cardOrgCol}>
              <Text style={styles.cardOrgTitle}>HRSJM</Text>
              <Text style={styles.cardOrgSub}>मानव अधिकार • सामाजिक न्याय</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.cardBodyRow}>
            <Image source={{ uri: avatarUrl }} style={styles.memberPhoto} />
            <View style={styles.memberInfoCol}>
              <Text style={styles.memberName} numberOfLines={1}>{memberName}</Text>
              <Text style={styles.memberDesignation}>Official Verified Member</Text>
              <Text style={styles.memberIdText}>ID: HRSJM-MEM-2026-0842</Text>
            </View>
          </View>

          <View style={styles.cardFooterRow}>
            <View style={styles.cardFooterMeta}>
              <Text style={styles.cardMetaLabel}>VALID THRU</Text>
              <Text style={styles.cardMetaValue}>31 DEC 2027</Text>
            </View>
            <View style={styles.cardFooterDivider} />
            <View style={styles.cardFooterMeta}>
              <Text style={styles.cardMetaLabel}>CHAPTER</Text>
              <Text style={styles.cardMetaValue}>MAHARASHTRA</Text>
            </View>
            <View style={styles.cardFooterDivider} />
            <View style={styles.cardFooterMeta}>
              <Text style={styles.cardMetaLabel}>STATUS</Text>
              <Text style={styles.cardMetaValue}>VERIFIED 🛡️</Text>
            </View>
          </View>

          <View style={styles.cardViewMoreRow}>
            <Text style={styles.cardViewMoreText}>View Membership Details & Renewal →</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.sectionArea}>
          <Text style={styles.sectionHeading}>MEMBER SERVICES</Text>
          <View style={styles.shortcutsGrid}>
            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate('MemberCauses')}
              activeOpacity={0.75}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Text style={styles.shortcutIcon}>💛</Text>
              </View>
              <Text style={styles.shortcutTitle}>Causes & Aid</Text>
              <Text style={styles.shortcutSub}>Support verified missions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate('MemberEvents')}
              activeOpacity={0.75}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#EEF3FC' }]}>
                <Calendar size={20} color="#1E40AF" />
              </View>
              <Text style={styles.shortcutTitle}>Events</Text>
              <Text style={styles.shortcutSub}>Volunteer & drives</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate('MemberReceipts')}
              activeOpacity={0.75}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={styles.shortcutIcon}>📥</Text>
              </View>
              <Text style={styles.shortcutTitle}>80G Receipts</Text>
              <Text style={styles.shortcutSub}>Tax exemptions & history</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate('MemberProfile')}
              activeOpacity={0.75}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Text style={styles.shortcutIcon}>🪪</Text>
              </View>
              <Text style={styles.shortcutTitle}>My ID Card</Text>
              <Text style={styles.shortcutSub}>Digital credentials & cert</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate('MemberDashboard')}
              activeOpacity={0.75}
            >
              <View style={[styles.shortcutIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Text style={styles.shortcutIcon}>📊</Text>
              </View>
              <Text style={styles.shortcutTitle}>Community Dashboard</Text>
              <Text style={styles.shortcutSub}>Stats, learning & feed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Member Impact Mission Banner */}
        <View style={styles.impactCard}>
          <View style={styles.impactTopRow}>
            <Text style={styles.impactTag}>COMMUNITY IMPACT</Text>
            <Text style={styles.impactDate}>YEAR 2026</Text>
          </View>
          <Text style={styles.impactTitle}>Together Protecting Human Rights & Dignity</Text>
          <Text style={styles.impactBody}>
            As an active HRSJM member, your support directly drives grassroots legal aid, emergency healthcare, and child education programs across India.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  membershipCard: {
    backgroundColor: '#011F39',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#123F68',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardEmblem: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  cardOrgCol: {
    flex: 1,
  },
  cardOrgTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardOrgSub: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#FAD465',
  },
  statusBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.22)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.45)',
  },
  statusBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 0.5,
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
  },
  memberPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FAD465',
  },
  memberInfoCol: {
    flex: 1,
  },
  memberName: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  memberDesignation: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#DBE5EE',
    marginTop: 2,
  },
  memberIdText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#FAD465',
    marginTop: 3,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  cardFooterMeta: {
    flex: 1,
    alignItems: 'center',
  },
  cardMetaLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#DBE5EE',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  cardMetaValue: {
    fontFamily: FontFamilies.display,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cardFooterDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardViewMoreRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cardViewMoreText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#FAD465',
    letterSpacing: 0.3,
  },
  sectionArea: {
    gap: 10,
  },
  sectionHeading: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
    color: '#718096',
    letterSpacing: 0.8,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  shortcutCard: {
    width: '48.4%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  shortcutIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shortcutIcon: {
    fontSize: 18,
  },
  shortcutTitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2F52',
  },
  shortcutSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#34516D',
    marginTop: 2,
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  impactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactTag: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '800',
    color: '#C9971A',
    letterSpacing: 0.6,
  },
  impactDate: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#718096',
  },
  impactTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2F52',
    lineHeight: 20,
    marginBottom: 6,
  },
  impactBody: {
    fontFamily: 'Inter',
    fontSize: 12.5,
    color: '#34516D',
    lineHeight: 18,
  },
});
