import React from 'react';
import { StyleSheet, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../../core/components/common/AppHeader';
import { AdminColors } from '../../core/theme/colors';
import { Typography } from '../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../core/theme/spacing';
import { PermissionKeys } from '../../core/permissions/permission.constants';
import { useCanAny } from '../../core/permissions/can';
import { AppRoutes } from '../../core/constants/routes';
import { useAuthStore } from '../../features/auth/store/authStore';
import { MoreStackParamList } from './NavigationTypes';

type MoreMenuScreenProps = NativeStackScreenProps<
  MoreStackParamList,
  'MoreMenu'
>;

interface MenuItem {
  route: 'PaymentVerification' | 'ExpenseVouchers' | 'ReceiptVouchers' | 'Accounting' | 'Reports' | 'Donations' | 'RolesPermissions' | 'Settings';
  icon: string;
  title: string;
  description: string;
  /** Item renders only when the user holds at least one of these keys. */
  permissions: string[] | null;
}

const MENU_ITEMS: MenuItem[] = [
  {
    route: AppRoutes.PAYMENT_VERIFICATION,
    icon: '💰',
    title: 'Payment Verification',
    description: 'Verify offline & gateway membership payments',
    permissions: [PermissionKeys.PAYMENT_READ, PermissionKeys.PAYMENT_VERIFY],
  },
  {
    route: AppRoutes.EXPENSE_VOUCHERS,
    icon: '🧾',
    title: 'Expense Vouchers',
    description: 'Record and manage expense entries',
    permissions: [PermissionKeys.EXPENSE_READ],
  },
  {
    route: AppRoutes.RECEIPT_VOUCHERS,
    icon: '📥',
    title: 'Receipt Vouchers',
    description: 'Manual receipt entries against income accounts',
    permissions: [PermissionKeys.RECEIPT_ENTRY_READ],
  },
  {
    route: AppRoutes.ACCOUNTING,
    icon: '📚',
    title: 'Accounting',
    description: 'Chart of Accounts, Ledger & Journal Entries',
    permissions: [
      PermissionKeys.ACCOUNT_READ,
      PermissionKeys.LEDGER_READ,
      PermissionKeys.ACCOUNTING_ENTRY_READ,
    ],
  },
  {
    route: AppRoutes.REPORTS,
    icon: '📈',
    title: 'Financial Reports',
    description: 'Trial Balance, P&L and Balance Sheet',
    permissions: [
      PermissionKeys.REPORT_READ,
      PermissionKeys.TRIAL_BALANCE_READ,
      PermissionKeys.PROFIT_LOSS_READ,
      PermissionKeys.BALANCE_SHEET_READ,
    ],
  },
  {
    route: AppRoutes.DONATIONS,
    icon: '🎁',
    title: 'Donations Management',
    description: 'Donation campaigns and records (Sahil)',
    permissions: [PermissionKeys.DONATION_READ],
  },
  {
    route: AppRoutes.ROLES_PERMISSIONS,
    icon: '🛡️',
    title: 'Roles & Permissions',
    description: 'Roles, permission catalog, user assignments',
    permissions: [PermissionKeys.ROLE_READ, PermissionKeys.PERMISSION_READ],
  },
  {
    route: AppRoutes.SETTINGS,
    icon: '⚙️',
    title: 'Settings',
    description: 'App preferences and account settings',
    permissions: null,
  },
];

/**
 * One row of the More hub. The permission hook lives here (per-row) so items
 * appear/disappear reactively when the permission set changes.
 */
const MenuRow: React.FC<{ item: MenuItem; onPress: () => void }> = ({
  item,
  onPress,
}) => {
  // Hook is called unconditionally; ungated rows ignore the result.
  const hasAnyPermission = useCanAny(item.permissions ?? []);
  const allowed = item.permissions ? hasAnyPermission : true;
  if (!allowed) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.itemIcon}>
        <Text style={styles.itemIconText}>{item.icon}</Text>
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
      <Text style={styles.itemChevron}>›</Text>
    </TouchableOpacity>
  );
};

/**
 * "More" hub — central navigation for financial, accounting and system
 * modules. Items render dynamically based on backend-resolved permissions
 * (rule.md §3); routes are shared contracts other developers plug into.
 */
export const MoreMenuScreen: React.FC<MoreMenuScreenProps> = ({ navigation }) => {
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="More" subtitle={user?.full_name ?? 'HRSJM Admin'} />
      <View style={styles.list}>
        {MENU_ITEMS.map(item => (
          <MenuRow
            key={item.route}
            item={item}
            onPress={() => navigation.navigate(item.route)}
          />
        ))}

        <TouchableOpacity
          style={[styles.item, styles.logoutItem]}
          activeOpacity={0.7}
          onPress={() => {
            signOut();
          }}
        >
          <View style={[styles.itemIcon, styles.logoutIcon]}>
            <Text style={styles.itemIconText}>🚪</Text>
          </View>
          <View style={styles.itemTextContainer}>
            <Text style={[styles.itemTitle, styles.logoutText]}>Logout</Text>
            <Text style={styles.itemDescription}>
              Revoke this device's session
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  list: {
    flex: 1,
    padding: Spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  logoutItem: {
    marginTop: Spacing.xl,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  logoutIcon: {
    backgroundColor: AdminColors.errorLight,
  },
  itemIconText: {
    fontSize: 18,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.cardTitle,
    color: AdminColors.textPrimary,
  },
  logoutText: {
    color: AdminColors.error,
  },
  itemDescription: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  itemChevron: {
    fontSize: 20,
    color: AdminColors.textMuted,
    marginLeft: Spacing.sm,
  },
});

export default MoreMenuScreen;