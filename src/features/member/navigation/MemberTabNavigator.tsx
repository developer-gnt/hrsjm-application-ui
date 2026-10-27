import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MemberHomeScreen } from '../screens/MemberHomeScreen';
import { MemberCausesContainer } from '../screens/MemberCausesContainer';
import { MemberEventsContainer } from '../screens/MemberEventsContainer';
import { ReceiptsListScreen } from '../../receipts/screens/ReceiptsListScreen';
import { ReceiptDetailScreen } from '../../receipts/screens/ReceiptDetailScreen';
import { ReceiptPdfPreviewScreen } from '../../receipts/screens/ReceiptPdfPreviewScreen';
import { ProfileScreen } from '../../admin/profile/screens/ProfileScreen';
import {
  MembershipDetailsScreen,
  RenewMembershipScreen,
  MyApplicationScreen,
  MembershipCategoriesScreen,
  ApplicationDetailsScreen,
} from '../../membership';
import {
  MemberHomeDashboardScreen,
  MemberDashboardDetailsScreen,
} from '../dashboard';
import { RightDetailsScreen, MemberRightsScreen } from '../rights';
import { FileComplaintScreen } from '../../user/help';
import { SupportTicketsScreen } from '../../support';
import { NotificationsScreen } from '../../admin/notifications';
import { AppRoutes } from '../../../core/constants/routes';
import { AboutScreen } from '../../user/about';
import { NewsListScreen, NewsDetailsScreen } from '../../admin/content/news';
import { BlogsListScreen, BlogDetailsScreen } from '../../admin/content/blogs';
import { ProfileSettingsScreen } from '../../admin/settings';
import { EventDetailsScreen } from '../../admin/content/events';
import {
  MyIdCardScreen,
  EditPersonalInfoScreen,
  AdminDetailsScreen,
} from '../../admin/profile';
import { UserActionPageScreen } from '../../user/action-pages';
import {
  House,
  Heart,
  Calendar,
  FileText,
  User,
  AppIconComponent,
} from '../../../core/components/icons';

const Tab = createBottomTabNavigator();

interface MemberTabItem {
  name: string;
  label: string;
  Icon: AppIconComponent;
  component: React.ComponentType<any>;
}

const MemberHomeScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <MemberHomeDashboardScreen
      useAdminHeader
      showBottomNav={false}
      onOpenNotifications={() => navigation.navigate(AppRoutes.NOTIFICATIONS)}
      onOpenMembershipInfo={() => navigation.navigate('MembershipDetails')}
      onOpenMembershipDetails={() => navigation.navigate('MembershipDetails')}
      onOpenRights={() => navigation.navigate('KnowYourRights')}
      onOpenResources={() => navigation.navigate('KnowYourRights')}
      onOpenComplaint={() => navigation.navigate('MemberComplaint')}
      onOpenTickets={() => navigation.navigate(AppRoutes.SUPPORT_TICKETS)}
      onOpenEvents={() => navigation.navigate('MemberEvents')}
      onOpenEvent={(event) => navigation.navigate('EventDetails', { event })}
      onOpenDonation={() => navigation.navigate('UserActionPage', { pageId: 'donate' })}
      onOpenHome={() => navigation.navigate('MemberHome')}
      onOpenAbout={() => navigation.navigate('About')}
      onOpenNews={() => navigation.navigate('News')}
      onOpenContact={() => navigation.navigate('MemberProfile')}
    />
  );
};

const MemberProfileScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <ProfileScreen
      isMemberProfile={true}
      showIdCard={true}
      onNavigate={(target) => {
        if (target === 'MyApplication' || target === 'status') {
          navigation.navigate('MyApplication');
        } else if (target === 'MembershipCategories' || target === 'membership') {
          navigation.navigate('MembershipCategories');
        } else {
          navigation.navigate(target);
        }
      }}
      onViewStatus={() => navigation.navigate('MyApplication')}
      onJoinMembership={() => navigation.navigate('MembershipCategories')}
      onEditPersonal={() => navigation.navigate('EditPersonalInfo')}
      onEditAdminDetails={() => navigation.navigate('AdminDetails')}
      onViewIdCard={() => navigation.navigate('MyIdCard')}
      onViewMembershipDetails={() => navigation.navigate('MembershipDetails')}
    />
  );
};

const MEMBER_TABS: MemberTabItem[] = [
  {
    name: 'MemberHome',
    label: 'Home',
    Icon: House,
    component: MemberHomeScreenComponent,
  },
  {
    name: 'MemberCauses',
    label: 'Causes',
    Icon: Heart,
    component: MemberCausesContainer,
  },
  {
    name: 'MemberEvents',
    label: 'Events',
    Icon: Calendar,
    component: MemberEventsContainer,
  },
  {
    name: 'MemberReceipts',
    label: 'Receipts',
    Icon: FileText,
    component: ReceiptsListScreen,
  },
  {
    name: 'MemberProfile',
    label: 'Profile',
    Icon: User,
    component: MemberProfileScreenComponent,
  },
];

const MemberCustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 6) },
      ]}
      accessibilityRole="tablist"
    >
      {MEMBER_TABS.map((tabDef, index) => {
        const isFocused = state.index === index;
        const { name, label, Icon } = tabDef;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index]?.key || name,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index]?.name || name);
          }
        };

        const iconColor = isFocused ? '#E9B82E' : '#718096';

        return (
          <TouchableOpacity
            key={name}
            onPress={onPress}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isFocused }}
            style={styles.tabItem}
          >
            <View style={styles.iconBox}>
              <Icon size={22} color={iconColor} />
            </View>
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MemberTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="MemberHome"
      backBehavior="history"
      tabBar={props => <MemberCustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {MEMBER_TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}
      <Tab.Screen
        name="MembershipDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MembershipDetailsScreen
            showBottomNav={false}
            onBack={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MemberHome');
              }
            }}
            onRenewPress={() => navigation.navigate('RenewMembership')}
            onMemberCardPress={() => navigation.navigate('MyIdCard')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="RenewMembership"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <RenewMembershipScreen
            onBack={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MembershipDetails');
              }
            }}
            onProfilePress={() => navigation.navigate('MemberProfile')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="MemberDashboard"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MemberHomeDashboardScreen
            onBack={navigation.goBack}
            onOpenNotifications={() => navigation.navigate(AppRoutes.NOTIFICATIONS)}
            onOpenMembershipInfo={() => navigation.navigate('MembershipDetails')}
            onOpenMembershipDetails={() => navigation.navigate('MembershipDetails')}
            onOpenRight={(rightId) => navigation.navigate('MemberRights', { rightId })}
            onOpenRights={() => navigation.navigate('KnowYourRights')}
            onOpenComplaint={() => navigation.navigate('MemberComplaint')}
            onOpenTickets={() => navigation.navigate(AppRoutes.SUPPORT_TICKETS)}
            onOpenEvents={() => navigation.navigate('MemberEvents')}
            onOpenEvent={(event) => navigation.navigate('EventDetails', { event })}
            onOpenDonation={() => navigation.navigate('UserActionPage', { pageId: 'donate' })}
            onOpenHome={() => navigation.navigate('MemberHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenNews={() => navigation.navigate('News')}
            onOpenContact={() => navigation.navigate('MemberProfile')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="MemberDashboardDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MemberDashboardDetailsScreen
            showBottomNav={false}
            onBack={navigation.goBack}
            onOpenMembershipInfo={() => navigation.navigate('MembershipDetails')}
            onOpenComplaint={() => navigation.navigate('MemberComplaint')}
            onOpenTickets={() => navigation.navigate(AppRoutes.SUPPORT_TICKETS)}
            onOpenDonation={() => navigation.navigate('UserActionPage', { pageId: 'donate' })}
            onOpenRight={(rightId) => navigation.navigate('MemberRights', { rightId })}
            onOpenRights={() => navigation.navigate('KnowYourRights')}
            onOpenEvents={() => navigation.navigate('MemberEvents')}
            onOpenEvent={(event) => navigation.navigate('EventDetails', { event })}
            onOpenHome={() => navigation.navigate('MemberHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenNews={() => navigation.navigate('News')}
            onOpenContact={() => navigation.navigate('MemberProfile')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="MemberComplaint"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <FileComplaintScreen
            onBack={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MemberHome');
              }
            }}
            onViewTickets={() => navigation.navigate(AppRoutes.SUPPORT_TICKETS)}
            onOpenHome={() => navigation.navigate('MemberHome')}
            onOpenEvents={() => navigation.navigate('MemberEvents')}
            onOpenRights={() => navigation.navigate('MemberRights')}
            onOpenAbout={() => navigation.navigate('MemberProfile')}
            onOpenContact={() => navigation.navigate('MemberProfile')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name={AppRoutes.SUPPORT_TICKETS}
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <SupportTicketsScreen
            showBottomNav={false}
            onBack={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MemberHome');
              }
            }}
            onCreateTicketPress={() => navigation.navigate('MemberComplaint')}
            onProfilePress={() => navigation.navigate('MemberProfile')}
            onNotificationsPress={() => navigation.navigate(AppRoutes.NOTIFICATIONS)}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="MemberRights"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <RightDetailsScreen
            rightId={route?.params?.rightId || 'human-rights'}
            showBottomNav={false}
            onBack={navigation.goBack}
            onOpenRights={() => navigation.navigate('KnowYourRights')}
            onFileComplaint={() => navigation.navigate('MemberComplaint')}
            onOpenEvents={() => navigation.navigate('MemberEvents')}
            onOpenHome={() => navigation.navigate('MemberHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenContact={() => navigation.navigate('MemberProfile')}
            onOpenRight={(id) => navigation.navigate('MemberRights', { rightId: id })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="ReceiptDetail"
        options={{ tabBarButton: () => null }}
        component={ReceiptDetailScreen}
      />
      <Tab.Screen
        name="ReceiptPdfPreview"
        options={{ tabBarButton: () => null }}
        component={ReceiptPdfPreviewScreen}
      />

      {/* Community & Impact Pages */}
      <Tab.Screen
        name="About"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <AboutScreen
            onBack={navigation.goBack}
            onNavigate={(target) => {
              if (target === 'KnowYourRights' || target === 'rights') {
                navigation.navigate('KnowYourRights');
              } else if (target === 'events' || target === 'Events') {
                navigation.navigate('MemberEvents');
              } else if (target === 'news' || target === 'News') {
                navigation.navigate('News');
              } else if (target === 'contact' || target === 'Contact') {
                navigation.navigate('MemberProfile');
              } else {
                navigation.navigate(target as any);
              }
            }}
            onOpenRights={() => navigation.navigate('KnowYourRights')}
            onOpenContact={() => navigation.navigate('MemberProfile')}
            onOpenEvents={() => navigation.navigate('MemberEvents')}
            onOpenNews={() => navigation.navigate('News')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="KnowYourRights"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MemberRightsScreen
            onBack={navigation.goBack}
            onOpenRight={(rightId) =>
              navigation.navigate('MemberRights', { rightId })
            }
            onFileComplaint={() => navigation.navigate('MemberComplaint')}
            onContactSupport={() => navigation.navigate('MemberProfile')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="News"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <NewsListScreen
            onViewNews={(news) => navigation.navigate('NewsDetails', { news })}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="NewsDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <NewsDetailsScreen
            news={route.params?.news}
            onBack={navigation.goBack}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Blogs"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <BlogsListScreen
            onOpenBlog={(blog) => navigation.navigate('BlogDetails', { blog })}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="BlogDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <BlogDetailsScreen
            blog={route.params?.blog}
            onBack={navigation.goBack}
          />
        )}
      </Tab.Screen>

      {/* Account, Events & System Pages */}
      <Tab.Screen
        name="Notifications"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <NotificationsScreen
            onBack={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MemberHome');
              }
            }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        options={{ tabBarButton: () => null }}
        component={ProfileSettingsScreen}
      />

      <Tab.Screen
        name="MyIdCard"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MyIdCardScreen onBack={navigation.goBack} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="EventDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <EventDetailsScreen
            event={route.params?.event}
            onBack={navigation.goBack}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="AdminComplaintsTab"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <FileComplaintScreen
            onBack={navigation.goBack}
            onOpenHome={() => navigation.navigate('MemberHome')}
            onOpenEvents={() => navigation.navigate('MemberEvents')}
            onOpenRights={() => navigation.navigate('KnowYourRights')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenContact={() => navigation.navigate('MemberProfile')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="EditPersonalInfo"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <EditPersonalInfoScreen
            onBack={navigation.goBack}
            onSaved={navigation.goBack}
            onNavigate={(target) => navigation.navigate(target)}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="AdminDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <AdminDetailsScreen
            onBack={navigation.goBack}
            onNavigate={(target) => navigation.navigate(target)}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MyProfile"
        options={{ tabBarButton: () => null }}
        component={MemberProfileScreenComponent}
      />

      <Tab.Screen
        name="MyApplication"
        options={{ tabBarButton: () => null }}
        component={MyApplicationScreen}
      />

      <Tab.Screen
        name="ApplicationDetails"
        options={{ tabBarButton: () => null }}
        component={ApplicationDetailsScreen as any}
      />

      <Tab.Screen
        name="MembershipCategories"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MembershipCategoriesScreen
            onBack={navigation.goBack}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="UserActionPage"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => {
          const pageId = route?.params?.pageId || 'donate';
          return (
            <UserActionPageScreen
              pageId={pageId}
              hideBottomNav={true}
              showBottomNav={false}
              onBack={() => {
                if (navigation?.canGoBack && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('MemberHome');
                }
              }}
              onOpenHome={() => navigation.navigate('MemberHome')}
              onOpenAbout={() => navigation.navigate('About')}
              onOpenRights={() => navigation.navigate('KnowYourRights')}
              onOpenEvents={() => navigation.navigate('MemberEvents')}
              onOpenNews={() => navigation.navigate('News')}
              onOpenContact={() => navigation.navigate('MemberProfile')}
              onOpenMembershipCategories={() => navigation.navigate('MembershipCategories')}
              onOpenDonations={() => navigation.navigate('UserActionPage', { pageId: 'donate' })}
            />
          );
        }}
      </Tab.Screen>

      <Tab.Screen
        name="Donate"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }: any) => (
          <UserActionPageScreen
            pageId="donate"
            hideBottomNav={true}
            showBottomNav={false}
            onBack={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MemberHome');
              }
            }}
            onOpenHome={() => navigation.navigate('MemberHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenRights={() => navigation.navigate('KnowYourRights')}
            onOpenEvents={() => navigation.navigate('MemberEvents')}
            onOpenNews={() => navigation.navigate('News')}
            onOpenContact={() => navigation.navigate('MemberProfile')}
            onOpenMembershipCategories={() => navigation.navigate('MembershipCategories')}
            onOpenDonations={() => navigation.navigate('UserActionPage', { pageId: 'donate' })}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DBE5EE',
    paddingTop: 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '700',
    color: '#E9B82E',
  },
  tabLabelInactive: {
    fontFamily: 'Inter-Medium',
    fontWeight: '600',
    color: '#718096',
  },
});
