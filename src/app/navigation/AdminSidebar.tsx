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
import { AppRoutes } from '../../core/constants/routes';
import { useAuthStore } from '../../features/auth/store/authStore';
import { DEFAULT_ADMIN_AVATAR } from '../../features/auth/components/UserProfileModal';
import { AuthLogo } from '../../features/auth/components/AuthLogo';
import {
  ArrowDownToLine,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronRight,
  FileText,
  Gift,
  Heart,
  HeartHandshake,
  House,
  IdCard,
  LogOut,
  MessageSquare,
  Newspaper,
  Plus,
  Receipt,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
  AppIconComponent,
} from '../../core/components/icons';

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
  icon: AppIconComponent;
  title: string;
  target: string;
  badge?: string;
}

export const ADMIN_MENU_GROUPS: { groupTitle: string; items: DrawerMenuItem[] }[] = [
  {
    groupTitle: 'MAIN NAVIGATION',
    items: [
      { id: 'dashboard', icon: House, title: 'Dashboard', target: AppRoutes.ADMIN_DASHBOARD_TAB },
      { id: 'users', icon: Users, title: 'User Management', target: AppRoutes.USERS },
      { id: 'membership_applications', icon: FileText, title: 'All Applications', target: AppRoutes.MEMBERSHIP_APPLICATIONS },
      { id: 'members', icon: User, title: 'Members Directory', target: AppRoutes.ADMIN_MEMBERS_TAB },
      { id: 'assistance', icon: HeartHandshake, title: 'Donation Seekers & Aid', target: AppRoutes.ASSISTANCE_REQUESTS },
      { id: 'complaints', icon: MessageSquare, title: 'Support & Complaints', target: AppRoutes.ADMIN_COMPLAINTS_TAB },
    ],
  },
  {
    groupTitle: 'USER MODULE',
    items: [
      { id: 'all_users', icon: Users, title: 'All Users Directory', target: AppRoutes.USERS },
      { id: 'add_user', icon: Plus, title: 'Add New User', target: AppRoutes.ADD_USER },
      { id: 'roles', icon: ShieldCheck, title: 'Roles & Permissions', target: AppRoutes.ROLES_PERMISSIONS },
    ],
  },
  {
    groupTitle: 'CONTENT & MEDIA',
    items: [
      { id: 'events', icon: Calendar, title: 'Events Management', target: AppRoutes.EVENTS },
      { id: 'news', icon: Newspaper, title: 'News & Press', target: AppRoutes.NEWS },
      { id: 'blogs', icon: BookOpen, title: 'Articles & Blogs', target: AppRoutes.BLOGS },
      { id: 'rights', icon: Scale, title: 'Know Your Rights', target: AppRoutes.KNOW_YOUR_RIGHTS },
    ],
  },
  {
    groupTitle: 'FINANCE & ACCOUNTS',
    items: [
      { id: 'expenses', icon: Receipt, title: 'Expenses', target: AppRoutes.EXPENSE_VOUCHERS },
      { id: 'receipts', icon: ArrowDownToLine, title: 'Income', target: AppRoutes.RECEIPT_VOUCHERS },
      { id: 'accounting', icon: Briefcase, title: 'Accounting & Ledger', target: AppRoutes.ACCOUNTING },
      { id: 'reports', icon: BarChart3, title: 'Financial Reports', target: AppRoutes.REPORTS },
      { id: 'donations', icon: Gift, title: 'Donations Management', target: AppRoutes.DONATIONS },
    ],
  },
  {
    groupTitle: 'PLATFORM & SYSTEM',
    items: [
      { id: 'profile', icon: IdCard, title: 'My Profile & ID Card', target: AppRoutes.MY_PROFILE },
      { id: 'notifications', icon: Bell, title: 'Notifications', target: AppRoutes.NOTIFICATIONS },
      { id: 'settings', icon: Settings, title: 'Settings & Preferences', target: AppRoutes.SETTINGS },
    ],
  },
];

export const MEMBER_MENU_GROUPS: { groupTitle: string; items: DrawerMenuItem[] }[] = [
  {
    groupTitle: 'MEMBER SERVICES',
    items: [
      { id: 'member_home', icon: House, title: 'Member Dashboard', target: 'MemberHome' },
      { id: 'member_causes', icon: Heart, title: 'Social Causes & Aid', target: 'MemberCauses' },
      { id: 'member_events', icon: Calendar, title: 'Upcoming Events & Drives', target: 'MemberEvents' },
      { id: 'member_receipts', icon: ArrowDownToLine, title: 'My Donations & 80G Receipts', target: 'MemberReceipts' },
      { id: 'complaints', icon: MessageSquare, title: 'Help & Support Desk', target: AppRoutes.ADMIN_COMPLAINTS_TAB },
    ],
  },
  {
    groupTitle: 'COMMUNITY & IMPACT',
    items: [
      { id: 'about', icon: BookOpen, title: 'About HRSJM Mission', target: AppRoutes.ABOUT },
      { id: 'rights', icon: Scale, title: 'Know Your Rights', target: AppRoutes.KNOW_YOUR_RIGHTS },
      { id: 'news', icon: Newspaper, title: 'News & Press Releases', target: AppRoutes.NEWS },
      { id: 'blogs', icon: BookOpen, title: 'Articles & Blogs', target: AppRoutes.BLOGS },
    ],
  },
  {
    groupTitle: 'MEMBERSHIP & ACCOUNT',
    items: [
      { id: 'profile', icon: IdCard, title: 'Digital ID Card & Profile', target: AppRoutes.MY_PROFILE },
      { id: 'notifications', icon: Bell, title: 'Notifications', target: AppRoutes.NOTIFICATIONS },
      { id: 'settings', icon: Settings, title: 'Settings & Security', target: AppRoutes.SETTINGS },
    ],
  },
];

export const SEEKER_MENU_GROUPS: { groupTitle: string; items: DrawerMenuItem[] }[] = [
  {
    groupTitle: 'AID & ASSISTANCE',
    items: [
      { id: 'seeker_home', icon: House, title: 'Seeker Dashboard', target: 'SeekerHome' },
      { id: 'seeker_apply', icon: FileText, title: 'Apply for Assistance', target: 'SeekerApply' },
      { id: 'seeker_status', icon: Search, title: 'My Aid Requests Status', target: 'SeekerStatus' },
      { id: 'complaints', icon: MessageSquare, title: 'Support & Grievances', target: AppRoutes.ADMIN_COMPLAINTS_TAB },
    ],
  },
  {
    groupTitle: 'RESOURCES',
    items: [
      { id: 'rights', icon: Scale, title: 'Know Your Legal Rights', target: AppRoutes.KNOW_YOUR_RIGHTS },
      { id: 'profile', icon: IdCard, title: 'My Profile', target: AppRoutes.MY_PROFILE },
    ],
  },
];

export const MENU_GROUPS = ADMIN_MENU_GROUPS;

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const avatarUrl = user?.avatar || DEFAULT_ADMIN_AVATAR;

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

  const userRole = user?.roles?.[0]?.name?.toUpperCase() || 'MEMBER';
  const roleNames = (user?.roles ?? []).map(r => (r.name || '').toUpperCase());
  const isAdmin =
    roleNames.includes('ADMIN') ||
    roleNames.includes('SUPER_ADMIN') ||
    user?.email?.toLowerCase().includes('admin') ||
    (!roleNames.includes('MEMBER') && !roleNames.includes('SEEKER') && !roleNames.includes('DONATION_SEEKER'));

  const activeMenuGroups = isAdmin
    ? ADMIN_MENU_GROUPS
    : userRole === 'DONATION_SEEKER'
    ? SEEKER_MENU_GROUPS
    : MEMBER_MENU_GROUPS;

  const appRoleLabel = isAdmin
    ? 'Admin'
    : userRole === 'DONATION_SEEKER'
    ? 'Seeker'
    : 'Member';

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
                <X size={18} color="#64748B" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* User Profile Summary */}
            <TouchableOpacity
              style={styles.userCard}
              activeOpacity={0.7}
              onPress={() => handleSelect(AppRoutes.MY_PROFILE)}
            >
              <Image source={{ uri: avatarUrl }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.full_name || `${appRoleLabel} User`}
                </Text>
                <Text style={styles.userRole}>
                  {(user?.roles?.[0]?.name || appRoleLabel).replace(/_/g, ' ')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Grouped Navigation Links */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeMenuGroups.map((group, groupIdx) => (
              <View key={group.groupTitle} style={styles.menuGroup}>
                <Text style={styles.groupHeaderTitle}>{group.groupTitle}</Text>

                {group.items.map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item.target)}
                    >
                      <View style={styles.itemLeft}>
                        <View style={styles.itemIconBadge}>
                          <ItemIcon size={16} color="#0F2860" strokeWidth={2} />
                        </View>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                      </View>
                      <View style={styles.itemRight}>
                        {item.badge ? (
                          <View style={styles.menuBadge}>
                            <Text style={styles.menuBadgeText}>{item.badge}</Text>
                          </View>
                        ) : null}
                        <ChevronRight size={14} color="#94A3B8" strokeWidth={2.2} />
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {groupIdx < activeMenuGroups.length - 1 && (
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
              <LogOut size={16} color="#DC2626" strokeWidth={2.2} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>HRSJM {appRoleLabel} Mobile v1.0.0</Text>
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
    backgroundColor: 'rgba(1, 31, 57, 0.45)',
  },
  drawerContent: {
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#011F39',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
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
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F0',
    padding: Spacing.sm,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#DBE5EE',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FAD465',
    backgroundColor: '#DBE5EE',
    marginRight: Spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2F52',
  },
  userRole: {
    fontSize: 11,
    color: '#06294D',
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
    color: '#718096',
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
  itemIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#D2DEEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemTitle: {
    ...Typography.body,
    fontSize: 14,
    color: '#0B2F52',
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  itemChevron: {
    fontSize: 18,
    color: '#718096',
    fontWeight: '400',
    marginLeft: Spacing.xs,
  },
  groupDivider: {
    height: 1,
    backgroundColor: '#DBE5EE',
    marginVertical: Spacing.xs,
  },
  drawerFooter: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#DBE5EE',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    justifyContent: 'center',
    gap: 6,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  versionText: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
  },
});
