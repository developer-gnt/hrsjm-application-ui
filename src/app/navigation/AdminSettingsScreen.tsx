import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminHeader } from './AdminHeader';
import { Typography } from '../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../core/theme/spacing';
import { AppRoutes } from '../../core/constants/routes';
import { MoreStackParamList } from './NavigationTypes';
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Database,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderTree,
  Gift,
  Globe,
  IdCard,
  ImageIcon,
  Info,
  Key,
  Layers,
  Lock,
  Mail,
  MessageSquare,
  Newspaper,
  Phone,
  Receipt,
  Scale,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  UserCheck,
  Users,
  Wallet,
  Wrench,
  AppIconComponent,
} from '../../core/components/icons';

export interface SettingItem {
  icon: AppIconComponent;
  title: string;
  description: string;
  route?: keyof MoreStackParamList;
  infoKey?: string;
}

export interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: AppIconComponent;
  items: SettingItem[];
}

export const SETTING_SECTIONS: SettingSection[] = [
  {
    id: 'operations',
    title: 'Operations & Modules',
    description: 'Direct access to core admin modules and campaign trackers.',
    icon: Layers,
    items: [
      {
        icon: FileText,
        title: 'All Applications',
        description: 'Review, verify, and approve applications across all streams.',
        route: AppRoutes.MEMBERSHIP_APPLICATIONS,
      },
      {
        icon: Gift,
        title: 'Donations Management',
        description: 'Manage donation records, campaigns, donor details, and receipts.',
        route: AppRoutes.DONATIONS,
      },
      {
        icon: Calendar,
        title: 'Events Management',
        description: 'Create and manage NGO events, workshops, and registrations.',
        route: AppRoutes.EVENTS,
      },
      {
        icon: Newspaper,
        title: 'News & Announcements',
        description: 'Publish and manage news releases, media updates and alerts.',
        route: AppRoutes.NEWS,
      },
      {
        icon: BookOpen,
        title: 'Blogs & Articles',
        description: 'Publish and manage educational articles and field stories.',
        route: AppRoutes.BLOGS,
      },
      {
        icon: Scale,
        title: 'Know Your Rights',
        description: 'Publish and manage legal and human rights educational resources.',
        route: AppRoutes.KNOW_YOUR_RIGHTS,
      },
      {
        icon: Receipt,
        title: 'Expenses',
        description: 'Record and track organizational expenditure entries.',
        route: AppRoutes.EXPENSE_VOUCHERS,
      },
      {
        icon: ArrowDownToLine,
        title: 'Income',
        description: 'Review and manage all incoming revenue transactions.',
        route: AppRoutes.RECEIPT_VOUCHERS,
      },
      {
        icon: Briefcase,
        title: 'Accounting & Ledger',
        description: 'Chart of accounts, general ledger, and journal entries.',
        route: AppRoutes.ACCOUNTING,
      },
      {
        icon: BarChart3,
        title: 'Financial Reports',
        description: 'Trial balance, profit & loss, and balance sheet statements.',
        route: AppRoutes.REPORTS,
      },
    ],
  },
  {
    id: 'general',
    title: 'General Settings',
    description: 'Manage basic platform information and preferences.',
    icon: Settings,
    items: [
      {
        icon: IdCard,
        title: 'My Profile & ID Card',
        description: 'View and manage your administrator profile, official ID card and QR code.',
        route: AppRoutes.MY_PROFILE,
      },
      {
        icon: Building2,
        title: 'Organization Profile (About HRSJM)',
        description: 'Organization background, mission, vision, core values, and leadership.',
        route: AppRoutes.ABOUT,
      },
      {
        icon: Phone,
        title: 'Contact Information',
        description: 'Manage address, phone, email and social media links.',
      },
      {
        icon: SlidersHorizontal,
        title: 'App Settings',
        description: 'Configure app name, tagline, maintenance mode and other preferences.',
      },
      {
        icon: Info,
        title: 'About HRSJM',
        description: 'Learn about our mission, values, principles, and leadership team.',
        route: AppRoutes.ABOUT,
      },
    ],
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage user roles, permissions and access control.',
    icon: Users,
    items: [
      {
        icon: Users,
        title: 'All Users',
        description: 'View, filter, manage, verify, and edit all registered users across roles.',
        route: AppRoutes.USERS,
      },
      {
        icon: ShieldCheck,
        title: 'User Roles & Permissions',
        description: 'Manage admin roles and set access permissions.',
        route: AppRoutes.ROLES_PERMISSIONS,
      },
      {
        icon: UserCheck,
        title: 'Manage Admins',
        description: 'Add, edit or remove admin users.',
        route: AppRoutes.USERS,
      },
      {
        icon: ClipboardList,
        title: 'Verification Settings',
        description: 'Configure member verification and approval process.',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage notification settings and communication preferences.',
    icon: Bell,
    items: [
      {
        icon: Mail,
        title: 'Email Notifications',
        description: 'Configure email alerts and notification templates.',
      },
      {
        icon: Bell,
        title: 'Push Notifications',
        description: 'Manage in-app push notifications for important updates.',
      },
      {
        icon: MessageSquare,
        title: 'SMS Notifications',
        description: 'Configure SMS alerts for critical communications.',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content & Platform Settings',
    description: 'Manage content moderation and platform configuration.',
    icon: Globe,
    items: [
      {
        icon: FileCheck,
        title: 'Content Moderation',
        description: 'Configure content approval settings for rights, news, blogs, events etc.',
      },
      {
        icon: Tag,
        title: 'Categories & Tags',
        description: 'Manage categories for rights, work areas, news and blogs.',
      },
      {
        icon: ImageIcon,
        title: 'App Content',
        description: 'Manage banners, homepage content, and static pages.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Manage security settings and data privacy.',
    icon: Shield,
    items: [
      {
        icon: Lock,
        title: 'Password & Login Settings',
        description: 'Configure login security, password policies and session settings.',
      },
      {
        icon: Key,
        title: 'Data Privacy',
        description: 'Manage data retention, user data and privacy policies.',
      },
      {
        icon: Activity,
        title: 'Activity Logs',
        description: 'View admin activity and system logs.',
      },
    ],
  },
  {
    id: 'system',
    title: 'System Settings',
    description: 'Manage system configuration and maintenance.',
    icon: Wrench,
    items: [
      {
        icon: Database,
        title: 'Backup & Restore',
        description: 'Manage data backup and restore options.',
      },
      {
        icon: Info,
        title: 'App Version',
        description: 'View current app version and check for updates.',
      },
      {
        icon: Wrench,
        title: 'System Maintenance',
        description: 'Enable maintenance mode and manage system settings.',
      },
    ],
  },
];

export interface AdminSettingsScreenProps {
  navigation: NativeStackNavigationProp<MoreStackParamList, any>;
}

export const AdminSettingsScreen: React.FC<AdminSettingsScreenProps> = ({ navigation }) => {
  const [selectedSetting, setSelectedSetting] = useState<SettingItem | null>(null);
  const [toggleState, setToggleState] = useState(true);

  const handleItemPress = (item: SettingItem) => {
    if (item.route) {
      navigation.navigate(item.route as any);
    } else {
      setSelectedSetting(item);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Brand Header */}
      <AdminHeader
        unreadCount={3}
        onNavigate={target => {
          if (
            target === 'AdminDashboardTab' ||
            target === 'AdminMembersTab' ||
            target === 'AdminApplicationsTab' ||
            target === 'AdminComplaintsTab'
          ) {
            (navigation.getParent() as any)?.jumpTo(target);
          } else if (target === 'AdminMoreTab') {
            navigation.popToTop();
          } else {
            navigation.navigate(target as any);
          }
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title & Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>
            Manage your platform configuration and preferences.
          </Text>
        </View>

        {/* 7 Setting Section Cards with Outline Icons */}
        {SETTING_SECTIONS.map(section => {
          const SectionIcon = section.icon;
          return (
            <View key={section.id} style={styles.card}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBadge}>
                  <SectionIcon size={20} color="#0F2860" strokeWidth={2.2} />
                </View>

                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {section.description}
                  </Text>
                </View>
              </View>

              {/* Section Items */}
              <View style={styles.itemsList}>
                {section.items.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isLast = idx === section.items.length - 1;
                  return (
                    <View key={item.title}>
                      <TouchableOpacity
                        style={styles.itemRow}
                        activeOpacity={0.7}
                        onPress={() => handleItemPress(item)}
                      >
                        <View style={styles.itemIconBadge}>
                          <ItemIcon size={16} color="#1E3A8A" strokeWidth={2} />
                        </View>

                        <View style={styles.itemTextBlock}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <Text style={styles.itemDescription}>
                            {item.description}
                          </Text>
                        </View>

                        <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
                      </TouchableOpacity>
                      {!isLast && <View style={styles.divider} />}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Financial & Accounting Module Shortcuts */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBadge}>
              <Wallet size={20} color="#0F2860" strokeWidth={2.2} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Financial Modules</Text>
              <Text style={styles.sectionSubtitle}>
                Income, expenses, payment verification and accounting shortcuts.
              </Text>
            </View>
          </View>

          <View style={styles.itemsList}>
            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.PAYMENT_VERIFICATION)}
            >
              <View style={styles.itemIconBadge}>
                <CreditCard size={16} color="#1E3A8A" strokeWidth={2} />
              </View>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>Payment Verification</Text>
                <Text style={styles.itemDescription}>
                  Review & verify membership payments
                </Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.EXPENSE_VOUCHERS)}
            >
              <View style={styles.itemIconBadge}>
                <Receipt size={16} color="#1E3A8A" strokeWidth={2} />
              </View>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>Expenses</Text>
                <Text style={styles.itemDescription}>
                  Manage outgoing expenses & expenditure records
                </Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.RECEIPT_VOUCHERS)}
            >
              <View style={styles.itemIconBadge}>
                <ArrowDownToLine size={16} color="#1E3A8A" strokeWidth={2} />
              </View>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>Income Receipts</Text>
                <Text style={styles.itemDescription}>
                  Manage incoming receipt entries
                </Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.CHART_OF_ACCOUNTS)}
            >
              <View style={styles.itemIconBadge}>
                <FolderTree size={16} color="#1E3A8A" strokeWidth={2} />
              </View>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>Chart of Accounts</Text>
                <Text style={styles.itemDescription}>
                  Hierarchical structure of organizational ledger accounts
                </Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.GENERAL_LEDGER as any)}
            >
              <View style={styles.itemIconBadge}>
                <BookOpen size={16} color="#1E3A8A" strokeWidth={2} />
              </View>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>General Ledger</Text>
                <Text style={styles.itemDescription}>
                  Transaction book with opening, debit, credit & running balance
                </Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.JOURNAL_ENTRIES)}
            >
              <View style={styles.itemIconBadge}>
                <FileSpreadsheet size={16} color="#1E3A8A" strokeWidth={2} />
              </View>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>Journal Entries</Text>
                <Text style={styles.itemDescription}>
                  Dual-sided double entry records and reversal audit history
                </Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Interactive Detail Modal for Settings */}
      <Modal
        visible={!!selectedSetting}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSetting(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedSetting(null)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                {selectedSetting ? (
                  <View style={styles.modalIconBadge}>
                    <selectedSetting.icon size={18} color="#0F2860" strokeWidth={2.2} />
                  </View>
                ) : null}
                <Text style={styles.modalTitle}>{selectedSetting?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedSetting(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              {selectedSetting?.description}
            </Text>

            <View style={styles.modalSection}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Enable Configuration</Text>
                <Switch
                  value={toggleState}
                  onValueChange={setToggleState}
                  trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                  thumbColor={toggleState ? '#2563EB' : '#94A3B8'}
                />
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Current Status</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>Active / Configured</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.8}
              onPress={() => setSelectedSetting(null)}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Also export as MoreMenuScreen for backwards compatibility
export const MoreMenuScreen = AdminSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
    gap: 12,
  },
  titleSection: {
    marginTop: 2,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#D2DEEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2C59',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 15,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemTextBlock: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F2860',
  },
  itemDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#D2DEEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: Spacing.md,
  },
  modalSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  saveButton: {
    backgroundColor: '#0F2860',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
