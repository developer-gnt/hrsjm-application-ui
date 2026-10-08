import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../auth/store/authStore';
import { DEFAULT_ADMIN_AVATAR, UserProfileModal } from '../../auth/components/UserProfileModal';

const HRSJM_LOGO = require('../../../assets/hrsjm_logo.png');

interface MemberHeaderProps {
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  unreadCount?: number;
}

export const MemberHeader: React.FC<MemberHeaderProps> = ({
  onNotificationsPress,
  onProfilePress,
  unreadCount = 2,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const avatarUrl = user?.avatar || DEFAULT_ADMIN_AVATAR;
  const memberName = user?.full_name || 'Member';

  const handleOpenProfile = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      setProfileModalVisible(true);
    }
  };

  const handleOpenNotifications = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 6 }]}>
      <View style={styles.contentRow}>
        {/* Left: Official HRSJM Logo & Mission Branding */}
        <View style={styles.brandContainer}>
          <Image
            source={HRSJM_LOGO}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.brandTextCol}>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>HRSJM</Text>
              <View style={styles.memberTag}>
                <Text style={styles.memberTagText}>MEMBER</Text>
              </View>
            </View>
            <Text style={styles.hindiTagline}>मानव अधिकार • सामाजिक न्याय</Text>
          </View>
        </View>

        {/* Right: Notifications Bell & Profile Avatar */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={handleOpenNotifications}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleOpenProfile}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Profile of ${memberName}`}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
            />
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Details Modal */}
      <UserProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onSignOut={signOut}
        onViewFullProfile={() => setProfileModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    paddingHorizontal: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoImage: {
    width: 38,
    height: 38,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  memberTag: {
    backgroundColor: '#FFF8E6',
    borderWidth: 1,
    borderColor: '#F1DC9B',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  memberTagText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 9,
    fontWeight: '700',
    color: '#C9A227',
    letterSpacing: 0.4,
  },
  hindiTagline: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  profileButton: {
    position: 'relative',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#C9A227',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
