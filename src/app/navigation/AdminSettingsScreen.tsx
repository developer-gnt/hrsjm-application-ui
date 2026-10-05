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

/**
 * ============================================================================
 * ADMIN SETTINGS SCREEN
 * ============================================================================
 *
 * This is the dedicated Admin Settings screen for the HRSJM Admin App.
 *
 * SECTIONS:
 * 1. General Settings          (Organization profile, contact, app preferences)
 * 2. User & Admin Management   (Roles & permissions, verification, admin users)
 * 3. Notifications & Alerts    (Email alerts, push notifications, SMS)
 * 4. Content & Platform        (Moderation, categories, banners, homepage content)
 * 5. Security & Privacy        (Passwords, session policy, logs, data privacy)
 * 6. System & Maintenance      (Backups, app version, maintenance mode)
 *
 * HOW TO ADD A NEW SETTING ITEM:
 * In SETTING_SECTIONS below, add your setting item under the desired section:
 *   {
 *     icon: '🔧',
 *     title: 'Setting Name',
 *     description: 'Helpful explanation for employees.',
 *     route: AppRoutes.YOUR_ROUTE, // Optional: if it links to a dedicated screen
 *   }
 */

export interface SettingItem {
  icon: string;
  title: string;
  description: string;
  route?: keyof MoreStackParamList;
  infoKey?: string;
}

export interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeBg: string;
  iconColor: string;
  items: SettingItem[];
}

export const SETTING_SECTIONS: SettingSection[] = [
  {
    id: 'operations',
    title: 'Operations & Modules',
    description: 'Direct access to core admin modules and campaign trackers.',
    icon: '🎁',
    badgeBg: '#FEF3C7',
    iconColor: '#D97706',
    items: [
      {
        icon: '🎁',
        title: 'Donations Management',
        description:
          'Manage donation records, campaigns, donor details, and receipts.',
        route: AppRoutes.DONATIONS,
      },
      {
        icon: '📅',
        title: 'Events Management',
        description:
          'Create and manage NGO events, workshops, and registrations.',
        route: AppRoutes.EVENTS,
      },
      {
        icon: '💰',
        title: 'Payment Verification',
        description:
          'Verify offline and online membership fee payments.',
        route: AppRoutes.PAYMENT_VERIFICATION,
      },
      {
        icon: '🧾',
        title: 'Expense Vouchers',
        description: 'Record and track organizational expense vouchers.',
        route: AppRoutes.EXPENSE_VOUCHERS,
      },
      {
        icon: '📥',
        title: 'Receipt Vouchers',
        description: 'Manual receipt entries against income accounts.',
        route: AppRoutes.RECEIPT_VOUCHERS,
      },
    ],
  },
  {
    id: 'general',
    title: 'General Settings',
    description: 'Manage basic platform information and preferences.',
    icon: '⚙️',
    badgeBg: '#E0F2FE',
    iconColor: '#0284C7',
    items: [
      {
        icon: '🏢',
        title: 'Organization Profile (About HRSJM)',
        description:
          'Organization background, mission, vision, core values, and leadership.',
        route: AppRoutes.ABOUT,
      },
      {
        icon: '📞',
        title: 'Contact Information',
        description: 'Manage address, phone, email and social media links.',
      },
      {
        icon: '📱',
        title: 'App Settings',
        description:
          'Configure app name, tagline, maintenance mode and other preferences.',
      },
    ],
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage user roles, permissions and access control.',
    icon: '👥',
    badgeBg: '#DCFCE7',
    iconColor: '#16A34A',
    items: [
      {
        icon: '🛡️',
        title: 'User Roles & Permissions',
        description: 'Manage admin roles and set access permissions.',
        route: AppRoutes.ROLES_PERMISSIONS,
      },
      {
        icon: '👤',
        title: 'Manage Admins',
        description: 'Add, edit or remove admin users.',
      },
      {
        icon: '📋',
        title: 'Verification Settings',
        description: 'Configure member verification and approval process.',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage notification settings and communication preferences.',
    icon: '🔔',
    badgeBg: '#FEF3C7',
    iconColor: '#D97706',
    items: [
      {
        icon: '✉️',
        title: 'Email Notifications',
        description: 'Configure email alerts and notification templates.',
      },
      {
        icon: '🔔',
        title: 'Push Notifications',
        description:
          'Manage in-app push notifications for important updates.',
      },
      {
        icon: '💬',
        title: 'SMS Notifications',
        description: 'Configure SMS alerts for critical communications.',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content & Platform Settings',
    description: 'Manage content moderation and platform configuration.',
    icon: '🌐',
    badgeBg: '#F3E8FF',
    iconColor: '#9333EA',
    items: [
      {
        icon: '📝',
        title: 'Content Moderation',
        description:
          'Configure content approval settings for rights, news, blogs, events etc.',
      },
      {
        icon: '🏷️',
        title: 'Categories & Tags',
        description: 'Manage categories for rights, work areas, news and blogs.',
      },
      {
        icon: '🖼️',
        title: 'App Content',
        description: 'Manage banners, homepage content, and static pages.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Manage security settings and data privacy.',
    icon: '🛡️',
    badgeBg: '#FEE2E2',
    iconColor: '#DC2626',
    items: [
      {
        icon: '🔒',
        title: 'Password & Login Settings',
        description:
          'Configure login security, password policies and session settings.',
      },
      {
        icon: '🗄️',
        title: 'Data Privacy',
        description: 'Manage data retention, user data and privacy policies.',
      },
      {
        icon: '🕒',
        title: 'Activity Logs',
        description: 'View admin activity and system logs.',
      },
    ],
  },
  {
    id: 'system',
    title: 'System Settings',
    description: 'Manage system configuration and maintenance.',
    icon: '🔧',
    badgeBg: '#F1F5F9',
    iconColor: '#475569',
    items: [
      {
        icon: '🗃️',
        title: 'Backup & Restore',
        description: 'Manage data backup and restore options.',
      },
      {
        icon: 'ℹ️',
        title: 'App Version',
        description: 'View current app version and check for updates.',
      },
      {
        icon: '🛠️',
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

        {/* 6 Setting Section Cards */}
        {SETTING_SECTIONS.map(section => (
          <View key={section.id} style={styles.card}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconBadge,
                  { backgroundColor: section.badgeBg },
                ]}
              >
                <Text style={styles.sectionIcon}>{section.icon}</Text>
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
                const isLast = idx === section.items.length - 1;
                return (
                  <View key={item.title}>
                    <TouchableOpacity
                      style={styles.itemRow}
                      activeOpacity={0.7}
                      onPress={() => handleItemPress(item)}
                    >
                      <Text style={styles.itemIcon}>{item.icon}</Text>

                      <View style={styles.itemTextBlock}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemDescription}>
                          {item.description}
                        </Text>
                      </View>

                      <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Financial & Voucher Module Shortcuts */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconBadge,
                { backgroundColor: '#FEF3C7' },
              ]}
            >
              <Text style={styles.sectionIcon}>💼</Text>
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Financial Modules</Text>
              <Text style={styles.sectionSubtitle}>
                Vouchers, payment verification and accounting shortcuts.
              </Text>
            </View>
          </View>

          <View style={styles.itemsList}>
            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.PAYMENT_VERIFICATION)}
            >
              <Text style={styles.itemIcon}>💰</Text>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>Payment Verification</Text>
                <Text style={styles.itemDescription}>
                  Review & verify membership payments
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.EXPENSE_VOUCHERS)}
            >
              <Text style={styles.itemIcon}>🧾</Text>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>Expense Vouchers</Text>
                <Text style={styles.itemDescription}>
                  Manage outgoing vouchers & approvals
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(AppRoutes.RECEIPT_VOUCHERS)}
            >
              <Text style={styles.itemIcon}>📥</Text>
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemTitle}>Receipt Vouchers</Text>
                <Text style={styles.itemDescription}>
                  Manage incoming receipt entries
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
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
                <Text style={styles.modalIcon}>{selectedSetting?.icon}</Text>
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
    gap: 10,
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
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
    gap: 10,
  },
  itemIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  itemTextBlock: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  chevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
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
  },
  modalIcon: {
    fontSize: 22,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeIcon: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
  },
  modalDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  modalSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AdminSettingsScreen;
