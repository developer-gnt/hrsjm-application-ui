import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../core/theme/typography';
import { Spacing, BorderRadius } from '../../core/theme/spacing';
import { useAuthStore } from '../../features/auth/store/authStore';
import { DEFAULT_ADMIN_AVATAR } from '../../features/auth/components/UserProfileModal';
import { AuthLogo } from '../../features/auth/components/AuthLogo';

/**
 * ============================================================================
 * ADMIN SIDEBAR (Drawer Menu)
 * ============================================================================
 * 
 * This component renders the slide-in side navigation drawer for the HRSJM Admin App.
 * Tapping the hamburger button (☰) in the AdminHeader opens this sidebar.
 *
 * HOW TO ADD A NEW MENU ITEM:
 * Add an object to the appropriate group in MENU_GROUPS below:
 *   { id: 'unique_id', icon: '🎨', title: 'Feature Name', target: 'RouteName' }
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

export interface AdminSidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (target: string) => void;
}

export interface DrawerMenuItem {
  id: string;
  icon: string;
  title: string;
  target: string;
  badge?: string;
}

export const MENU_GROUPS: { groupTitle: string; items: DrawerMenuItem[] }[] = [
  {
    groupTitle: 'MAIN NAVIGATION',
    items: [
      { id: 'dashboard', icon: '🏠', title: 'Dashboard', target: 'AdminDashboardTab' },
      { id: 'members', icon: '👥', title: 'Members Directory', target: 'AdminMembersTab' },
      { id: 'applications', icon: '📄', title: 'Applications Review', target: 'AdminApplicationsTab' },
      { id: 'complaints', icon: '💬', title: 'Support & Complaints', target: 'AdminComplaintsTab' },
      { id: 'events', icon: '📅', title: 'Events Management', target: 'Events' },
    ],
  },
  {
    groupTitle: 'FINANCE & VOUCHERS',
    items: [
      { id: 'payments', icon: '💰', title: 'Payment Verification', target: 'PaymentVerification' },
      { id: 'expenses', icon: '🧾', title: 'Expense Vouchers', target: 'ExpenseVouchers' },
      { id: 'receipts', icon: '📥', title: 'Receipt Vouchers', target: 'ReceiptVouchers' },
      { id: 'accounting', icon: '📚', title: 'Accounting & Ledger', target: 'Accounting' },
      { id: 'reports', icon: '📈', title: 'Financial Reports', target: 'Reports' },
      { id: 'donations', icon: '🎁', title: 'Donations Management', target: 'Donations' },
    ],
  },
  {
    groupTitle: 'PLATFORM & SYSTEM',
    items: [
      { id: 'roles', icon: '🛡️', title: 'Roles & Permissions', target: 'RolesPermissions' },
      { id: 'settings', icon: '⚙️', title: 'Settings', target: 'AdminMoreTab' },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleSelect = (target: string) => {
    onClose();
    setTimeout(() => {
      onNavigate(target);
    }, 150);
  };

  const handleSignOut = async () => {
    onClose();
    try {
      await signOut();
    } catch {
      // Session local cleanup already handled in authStore
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <StatusBar barStyle="dark-content" />

        {/* Semi-transparent Dimmed Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Sliding Drawer Container */}
        <Animated.View
          style={[
            styles.drawerContent,
            {
              width: DRAWER_WIDTH,
              transform: [{ translateX: slideAnim }],
              paddingTop:
                Platform.OS === 'ios'
                  ? Math.max(insets.top, 14)
                  : (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 16),
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Brand Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.logoRow}>
              <AuthLogo size="sm" layout="horizontal" variant="dark" showSubtitle={false} />
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* User Profile Summary */}
            <View style={styles.userCard}>
              <Image source={{ uri: DEFAULT_ADMIN_AVATAR }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.full_name || 'Admin User'}
                </Text>
                <Text style={styles.userRole}>
                  {(user?.roles?.[0]?.name || 'SUPER_ADMIN').replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
          </View>

          {/* Grouped Navigation Links */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {MENU_GROUPS.map((group, groupIdx) => (
              <View key={group.groupTitle} style={styles.menuGroup}>
                <Text style={styles.groupHeaderTitle}>{group.groupTitle}</Text>

                {group.items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item.target)}
                  >
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.itemChevron}>›</Text>
                  </TouchableOpacity>
                ))}

                {groupIdx < MENU_GROUPS.length - 1 && (
                  <View style={styles.groupDivider} />
                )}
              </View>
            ))}
          </ScrollView>

          {/* Drawer Footer with Sign Out */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.signOutBtn}
              activeOpacity={0.75}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>HRSJM Admin Mobile v1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  drawerContent: {
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: '#E2E8F0',
    marginRight: Spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userRole: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  menuGroup: {
    marginBottom: Spacing.sm,
  },
  groupHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 16,
    marginRight: Spacing.md,
    width: 22,
    textAlign: 'center',
  },
  itemTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  itemChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '400',
    marginLeft: Spacing.xs,
  },
  groupDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.xs,
  },
  drawerFooter: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    justifyContent: 'center',
  },
  signOutIcon: {
    fontSize: 15,
    marginRight: Spacing.xs,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
