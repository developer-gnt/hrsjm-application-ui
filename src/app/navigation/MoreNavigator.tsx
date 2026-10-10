import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes } from '../../core/constants/routes';
import { MoreMenuScreen } from './MoreMenuScreen';
import { ModulePlaceholderScreen } from './ModulePlaceholderScreen';
import { PaymentVerificationScreen, PaymentDetailsScreen } from '../../features/admin/payments';
import { ExpenseVouchersScreen, CreateExpenseVoucherScreen, ExpenseDetailsScreen } from '../../features/admin/expenses';
import { ReceiptVouchersScreen, CreateReceiptVoucherScreen, ReceiptVoucherDetailsScreen } from '../../features/admin/receipts';
import {
  ChartOfAccountsScreen,
  GeneralLedgerScreen,
  JournalEntriesScreen,
} from '../../features/admin/accounting';
import {
  EventsScreen,
  EventDetailsScreen,
  CreateEventScreen,
} from '../../features/admin/content/events';
import {
  NewsListScreen,
  NewsDetailsScreen,
  CreateNewsScreen,
  EditNewsScreen,
} from '../../features/admin/content/news';
import {
  BlogsListScreen,
  BlogDetailsScreen,
  CreateBlogScreen,
  EditBlogScreen,
} from '../../features/admin/content/blogs';
import {
  AssistanceRequestsScreen,
  AssistanceDetailsScreen,
  AssistanceDocumentsScreen,
} from '../../features/admin/assistance';
import {
  SupportTicketsScreen,
  TicketDetailsScreen,
  TicketChatScreen,
} from '../../features/admin/support';
import { NotificationsScreen } from '../../features/admin/notifications';
import { ProfileSettingsScreen } from '../../features/admin/settings';
import { DonationsScreen, ReceiptDetailsPage } from '../../features/admin/donations';
import {
  ProfileScreen,
  EditPersonalInfoScreen,
  AdminDetailsScreen,
  MyIdCardScreen,
} from '../../features/admin/profile';
import {
  ReportsScreen,
  TrialBalanceScreen,
  ProfitLossScreen,
  BalanceSheetScreen,
} from '../../features/admin/reports';
import { AboutScreen } from '../../features/user/about';
import { MoreStackParamList } from './NavigationTypes';

const Stack = createNativeStackNavigator<MoreStackParamList>();

/**
 * Stack behind the More tab — the unified hub for financial, content,
 * assistance, support, notifications and settings modules.
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

    {/* Accounting — Phase 6 (Real integrated screens) */}
    <Stack.Screen name={AppRoutes.ACCOUNTING}>
      {({ navigation }) => (
        <ChartOfAccountsScreen
          onBack={navigation.goBack}
          onViewAccountLedger={node =>
            navigation.navigate(AppRoutes.GENERAL_LEDGER as any, {
              accountId: node.id,
              accountName: node.account_name,
              accountCode: node.account_code,
            })
          }
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

    <Stack.Screen name={AppRoutes.CHART_OF_ACCOUNTS}>
      {({ navigation }) => (
        <ChartOfAccountsScreen
          onBack={navigation.goBack}
          onViewAccountLedger={node =>
            navigation.navigate(AppRoutes.GENERAL_LEDGER as any, {
              accountId: node.id,
              accountName: node.account_name,
              accountCode: node.account_code,
            })
          }
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

    <Stack.Screen name={AppRoutes.GENERAL_LEDGER}>
      {({ navigation, route }: any) => (
        <GeneralLedgerScreen
          accountId={route.params?.accountId}
          accountName={route.params?.accountName}
          accountCode={route.params?.accountCode}
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

    <Stack.Screen name={AppRoutes.JOURNAL_ENTRIES}>
      {({ navigation }) => (
        <JournalEntriesScreen
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

    {/* Financial reports — Phase 7 (Real integrated screens) */}
    <Stack.Screen name={AppRoutes.REPORTS}>
      {({ navigation }) => (
        <ReportsScreen
          onBack={navigation.goBack}
          onOpenTrialBalance={() => navigation.navigate(AppRoutes.TRIAL_BALANCE as any)}
          onOpenProfitLoss={() => navigation.navigate(AppRoutes.PROFIT_LOSS as any)}
          onOpenBalanceSheet={() => navigation.navigate(AppRoutes.BALANCE_SHEET as any)}
          onOpenLedger={() => navigation.navigate(AppRoutes.GENERAL_LEDGER as any)}
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

    <Stack.Screen name={AppRoutes.TRIAL_BALANCE}>
      {({ navigation }) => (
        <TrialBalanceScreen
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

    <Stack.Screen name={AppRoutes.PROFIT_LOSS}>
      {({ navigation }) => (
        <ProfitLossScreen
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

    <Stack.Screen name={AppRoutes.BALANCE_SHEET}>
      {({ navigation }) => (
        <BalanceSheetScreen
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

    {/* Donations management — Sahil's module */}
    <Stack.Screen name={AppRoutes.DONATIONS}>
      {({ navigation }) => (
        <DonationsScreen
          onBack={navigation.goBack}
          onViewReceipt={(donationId: string) =>
            navigation.navigate(AppRoutes.DONATION_RECEIPT_DETAILS, { donationId })
          }
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

    <Stack.Screen name={AppRoutes.DONATION_RECEIPT_DETAILS}>
      {({ navigation, route }: any) => (
        <ReceiptDetailsPage
          donationId={route.params?.donationId}
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

    {/* Settings — Real merged ProfileSettingsScreen */}
    <Stack.Screen name={AppRoutes.SETTINGS} component={ProfileSettingsScreen} />
    <Stack.Screen name={AppRoutes.PROFILE_SETTINGS} component={ProfileSettingsScreen} />

    {/* Admin Profile & ID Card — Sahil's module */}
    <Stack.Screen name={AppRoutes.MY_PROFILE}>
      {({ navigation }) => (
        <ProfileScreen
          onBack={navigation.goBack}
          onEditPersonal={() =>
            navigation.navigate(AppRoutes.EDIT_PERSONAL_INFO as any)
          }
          onEditAdminDetails={() =>
            navigation.navigate(AppRoutes.ADMIN_DETAILS as any)
          }
          onViewIdCard={() =>
            navigation.navigate(AppRoutes.MY_ID_CARD as any)
          }
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

    <Stack.Screen name={AppRoutes.EDIT_PERSONAL_INFO}>
      {({ navigation }) => (
        <EditPersonalInfoScreen
          onBack={navigation.goBack}
          onSaved={navigation.goBack}
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

    <Stack.Screen name={AppRoutes.ADMIN_DETAILS}>
      {({ navigation }) => (
        <AdminDetailsScreen
          onBack={navigation.goBack}
          onSaved={navigation.goBack}
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

    <Stack.Screen name={AppRoutes.MY_ID_CARD}>
      {({ navigation }) => (
        <MyIdCardScreen
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

    {/* About HRSJM — Aman's module */}
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

    {/* Notifications — Real merged NotificationsScreen */}
    <Stack.Screen name={AppRoutes.NOTIFICATIONS} component={NotificationsScreen} />

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

    {/* News Management — Suraj's module */}
    <Stack.Screen name={AppRoutes.NEWS}>
      {({ navigation }) => (
        <NewsListScreen
          onViewNews={news =>
            navigation.navigate(AppRoutes.NEWS_DETAILS as any, { news })
          }
          onAddNews={() =>
            navigation.navigate(AppRoutes.CREATE_NEWS as any)
          }
        />
      )}
    </Stack.Screen>

    <Stack.Screen name={AppRoutes.NEWS_DETAILS}>
      {({ navigation, route }: any) => (
        <NewsDetailsScreen
          news={route.params?.news}
          onBack={navigation.goBack}
          onEdit={news =>
            navigation.navigate(AppRoutes.EDIT_NEWS as any, { news })
          }
        />
      )}
    </Stack.Screen>

    <Stack.Screen name={AppRoutes.CREATE_NEWS}>
      {({ navigation }) => (
        <CreateNewsScreen onCancel={navigation.goBack} />
      )}
    </Stack.Screen>

    <Stack.Screen name={AppRoutes.EDIT_NEWS}>
      {({ navigation, route }: any) => (
        <EditNewsScreen
          news={route.params?.news}
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>

    {/* Blogs Management — Suraj's module */}
    <Stack.Screen name={AppRoutes.BLOGS}>
      {({ navigation }) => (
        <BlogsListScreen
          onOpenBlog={blog =>
            navigation.navigate(AppRoutes.BLOG_DETAILS as any, { blog })
          }
          onAddBlog={() =>
            navigation.navigate(AppRoutes.CREATE_BLOG as any)
          }
          onEditBlog={blog =>
            navigation.navigate(AppRoutes.EDIT_BLOG as any, { blog })
          }
        />
      )}
    </Stack.Screen>

    <Stack.Screen name={AppRoutes.BLOG_DETAILS}>
      {({ navigation, route }: any) => (
        <BlogDetailsScreen
          blog={route.params?.blog}
          onBack={navigation.goBack}
          onEdit={blog =>
            navigation.navigate(AppRoutes.EDIT_BLOG as any, { blog })
          }
        />
      )}
    </Stack.Screen>

    <Stack.Screen name={AppRoutes.CREATE_BLOG}>
      {({ navigation }) => (
        <CreateBlogScreen onCancel={navigation.goBack} />
      )}
    </Stack.Screen>

    <Stack.Screen name={AppRoutes.EDIT_BLOG}>
      {({ navigation, route }: any) => (
        <EditBlogScreen
          blog={route.params?.blog}
          onBack={navigation.goBack}
        />
      )}
    </Stack.Screen>

    {/* Assistance Requests / Donation Seekers — Arshad's module */}
    <Stack.Screen
      name={AppRoutes.ASSISTANCE_REQUESTS}
      component={AssistanceRequestsScreen}
    />
    <Stack.Screen
      name={AppRoutes.ASSISTANCE_DETAILS}
      component={AssistanceDetailsScreen as any}
    />
    <Stack.Screen
      name={AppRoutes.ASSISTANCE_DOCUMENTS}
      component={AssistanceDocumentsScreen as any}
    />

    {/* Complaints & Support — Ticket Details and Chat */}
    <Stack.Screen
      name={AppRoutes.SUPPORT_TICKETS}
      component={SupportTicketsScreen}
    />
    <Stack.Screen
      name={AppRoutes.TICKET_DETAILS}
      component={TicketDetailsScreen as any}
    />
    <Stack.Screen
      name={AppRoutes.TICKET_CHAT}
      component={TicketChatScreen as any}
    />
  </Stack.Navigator>
);

export default MoreNavigator;