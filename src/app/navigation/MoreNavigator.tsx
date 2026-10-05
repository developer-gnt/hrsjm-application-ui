import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from '../../core/constants/routes';
import { MoreMenuScreen } from './MoreMenuScreen';
import { ModulePlaceholderScreen } from './ModulePlaceholderScreen';
import { PaymentVerificationScreen } from '../../features/admin/payments';
import { PaymentDetailsScreen } from '../../features/admin/payments';
import { ExpenseVouchersScreen } from '../../features/admin/expenses';
import { CreateExpenseVoucherScreen } from '../../features/admin/expenses';
import { ExpenseDetailsScreen } from '../../features/admin/expenses';
import { ReceiptVouchersScreen } from '../../features/admin/receipts';
import { CreateReceiptVoucherScreen } from '../../features/admin/receipts';
import { ReceiptVoucherDetailsScreen } from '../../features/admin/receipts';
import {
  EventsScreen,
  EventDetailsScreen,
  CreateEventScreen,
} from '../../features/admin/content/events';
import { DonationsScreen } from '../../features/admin/donations';
import { AboutScreen } from '../../features/about';
import { MoreStackParamList } from './NavigationTypes';

const Stack = createNativeStackNavigator<MoreStackParamList>();

/**
 * Stack behind the More tab. Mubasshir owns all route definitions here
 * (spec §46); placeholder screens stand in for modules implemented in
 * Phases 4-8 and for other developers' modules (Donations).
 */
export const MoreNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />

    {/* Payments — Phase 5 (real) */}
    <Stack.Screen
      name={AppRoutes.PAYMENT_VERIFICATION}
      component={PaymentVerificationScreen}
    />
    <Stack.Screen
      name={AppRoutes.PAYMENT_DETAILS}
      component={PaymentDetailsScreen}
    />

    {/* Expense vouchers — Phase 5 (real) */}
    <Stack.Screen
      name={AppRoutes.EXPENSE_VOUCHERS}
      component={ExpenseVouchersScreen}
    />
    <Stack.Screen
      name={AppRoutes.CREATE_EXPENSE_VOUCHER}
      component={CreateExpenseVoucherScreen}
    />
    <Stack.Screen
      name={AppRoutes.EXPENSE_DETAILS}
      component={ExpenseDetailsScreen}
    />

    {/* Receipt vouchers — Phase 5 (real) */}
    <Stack.Screen
      name={AppRoutes.RECEIPT_VOUCHERS}
      component={ReceiptVouchersScreen}
    />
    <Stack.Screen
      name={AppRoutes.CREATE_RECEIPT_VOUCHER}
      component={CreateReceiptVoucherScreen}
    />
    <Stack.Screen
      name={AppRoutes.RECEIPT_DETAILS}
      component={ReceiptVoucherDetailsScreen}
    />

    {/* Accounting — Phase 6 */}
    <Stack.Screen name={AppRoutes.ACCOUNTING}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Accounting"
          icon="📚"
          phase="Phase 6"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name={AppRoutes.CHART_OF_ACCOUNTS}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Chart of Accounts"
          icon="📚"
          phase="Phase 6"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name={AppRoutes.GENERAL_LEDGER}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="General Ledger"
          icon="📚"
          phase="Phase 6"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name={AppRoutes.JOURNAL_ENTRIES}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Journal Entries"
          icon="📚"
          phase="Phase 6"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>

    {/* Financial reports — Phase 7 */}
    <Stack.Screen name={AppRoutes.REPORTS}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Financial Reports"
          icon="📈"
          phase="Phase 7"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name={AppRoutes.TRIAL_BALANCE}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Trial Balance"
          icon="📈"
          phase="Phase 7"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name={AppRoutes.PROFIT_LOSS}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Profit & Loss"
          icon="📈"
          phase="Phase 7"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name={AppRoutes.BALANCE_SHEET}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Balance Sheet"
          icon="📈"
          phase="Phase 7"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>

    {/* Donations management — Sahil's module */}
    <Stack.Screen name={AppRoutes.DONATIONS}>
      {({ navigation }) => (
        <DonationsScreen
          onBack={navigation.goBack}
          onNavigate={(target: string) => {
            if (target === 'AdminMoreTab') {
              navigation.navigate('MoreMenu' as any);
            } else {
              navigation.navigate(target as any);
            }
          }}
        />
      )}
    </Stack.Screen>

    {/* RBAC management — Phase 8 */}
    <Stack.Screen name={AppRoutes.ROLES_PERMISSIONS}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Roles & Permissions"
          icon="🛡️"
          phase="Phase 8"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>

    {/* Settings — shared */}
    <Stack.Screen name={AppRoutes.SETTINGS}>
      {({ navigation }) => (
        <ModulePlaceholderScreen
          title="Settings"
          icon="⚙️"
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>

    {/* Events Management — Suraj's module */}
    <Stack.Screen name={AppRoutes.EVENTS}>
      {({ navigation }) => (
        <EventsScreen
          onViewEvent={event =>
            navigation.navigate(AppRoutes.EVENT_DETAILS as any, { event })
          }
          onAddEvent={() =>
            navigation.navigate(AppRoutes.CREATE_EVENT as any)
          }
        />
      )}
    </Stack.Screen>

    <Stack.Screen name={AppRoutes.EVENT_DETAILS}>
      {({ navigation, route }: any) => (
        <EventDetailsScreen
          event={route.params?.event}
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>

    <Stack.Screen name={AppRoutes.CREATE_EVENT}>
      {({ navigation }) => (
        <CreateEventScreen onCancel={navigation.goBack} />
      )}
    </Stack.Screen>

    {/* About HRSJM — organization profile page */}
    <Stack.Screen name={AppRoutes.ABOUT}>
      {({ navigation }) => (
        <AboutScreen
          onBack={navigation.goBack}
          onNavigate={(target: string) => {
            if (target === 'AdminMoreTab') {
              navigation.navigate('MoreMenu' as any);
            } else {
              navigation.navigate(target as any);
            }
          }}
        />
      )}
    </Stack.Screen>
  </Stack.Navigator>
);

export default MoreNavigator;