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

import { UserHomeScreen } from '../home/screens/UserHomeScreen';
import { HomeHeader } from '../home/components/HomeHeader';
import { AboutScreen } from '../about/screens/AboutScreen';
import { MemberRightsScreen } from '../../member/rights/screens/MemberRightsScreen';
import { UserEventsScreen } from '../events/screens/UserEventsScreen';
import { NewsScreen } from '../news/screens/NewsScreen';
import { UserBlogsScreen } from '../blogs/screens/UserBlogsScreen';
import { ContactUsScreen } from '../contact/screens/ContactUsScreen';
import { ProfileScreen } from '../../admin/profile/screens/ProfileScreen';
import { EditPersonalInfoScreen } from '../../admin/profile/screens/EditPersonalInfoScreen';
import { AdminDetailsScreen } from '../../admin/profile/screens/AdminDetailsScreen';
import { MyIdCardScreen } from '../../admin/profile/screens/MyIdCardScreen';
import { UserEventDetailsScreen } from '../events/screens/UserEventDetailsScreen';
import { RegisterForEventScreen } from '../events/screens/RegisterForEventScreen';
import { USER_EVENTS } from '../events/data/user-events';
import { NewsDetailsScreen } from '../news/screens/NewsDetailsScreen';
import { RightDetailsScreen } from '../rights/screens/RightDetailsScreen';
import { FileComplaintScreen } from '../help/screens/FileComplaintScreen';
import { NotificationsScreen } from '../notifications';
import { ProfileSettingsScreen } from '../../admin/settings';
import { UserActionPageScreen } from '../action-pages/screens/UserActionPageScreen';
import { WhatWeDoDetailScreen } from '../what-we-do/components/WhatWeDoDetailScreen';
import { MembershipCategoriesScreen } from '../../membership/screens/MembershipCategoriesScreen';
import { MembershipStep1Screen } from '../../membership/screens/MembershipStep1Screen';
import { MembershipStep2Screen } from '../../membership/screens/MembershipStep2Screen';
import { MembershipStep3Screen } from '../../membership/screens/MembershipStep3Screen';
import { MembershipSubmittedScreen } from '../../membership/screens/MembershipSubmittedScreen';
import { MyApplicationScreen } from '../../membership/screens/MyApplicationScreen';
import { ApplicationDetailsScreen } from '../../membership/screens/ApplicationDetailsScreen';
import { ApplicationApprovedScreen } from '../../membership/screens/ApplicationApprovedScreen';
import { ApplicationRejectedScreen } from '../../membership/screens/ApplicationRejectedScreen';
import { ApplicationAppliedScreen } from '../../membership/screens/ApplicationAppliedScreen';
import { useMembership } from '../../membership/context/MembershipContext';
import { DonationHistoryScreen } from '../../donations/screens/DonationHistoryScreen';
import { DonationDetailScreen } from '../../donations/screens/DonationDetailScreen';
import { ReceiptDetailScreen } from '../../receipts/screens/ReceiptDetailScreen';
import { TransactionHistoryScreen, TransactionDetailsScreen } from '../../transactions';

import { ReceiptPdfPreviewScreen } from '../../receipts/screens/ReceiptPdfPreviewScreen';


import {
  House,
  FileText,
  Scale,
  Calendar,
  MessageSquare,
  Clock,
  User,
  AppIconComponent,
} from '../../../core/components/icons';

const Tab = createBottomTabNavigator();

interface UserTabItem {
  name: string;
  label: string;
  Icon: AppIconComponent;
  component: React.ComponentType<any>;
}

const UserHomeScreenComponent: React.FC<any> = ({ navigation }) => {
  let hasApplied = false;
  let isReapplying = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const membershipCtx = useMembership();
    hasApplied = Boolean(membershipCtx?.hasApplied);
    isReapplying = Boolean(membershipCtx?.isReapplying);
  } catch {}

  const handleOpenStatus = () => {
    navigation.navigate('MyApplication');
  };

  return (
    <UserHomeScreen
      hideBottomNav={true}
      onOpenStatus={handleOpenStatus}
      onOpenProfile={() => navigation.navigate('UserProfile')}
      onOpenContact={() => navigation.navigate('ContactUs')}
      onOpenRights={() => navigation.navigate('UserRights')}
      onOpenAbout={(section?: string) => navigation.navigate('UserAbout', { section })}
      onOpenEvents={() => navigation.navigate('UserEvents')}
      onOpenEvent={(event) => navigation.navigate('UserEventDetails', { event })}
      onOpenNotifications={() => navigation.navigate('Notifications')}
      onOpenNews={() => navigation.navigate('UserNews')}
      onOpenBlogs={() => navigation.navigate('UserBlogs')}
      onOpenArticle={(article) => navigation.navigate('NewsDetails', { article })}
      onOpenGetHelp={() => navigation.navigate('FileComplaint')}
      onOpenRight={(rightId) => navigation.navigate('RightDetails', { rightId })}
      onOpenWhatWeDo={(contentId) => navigation.navigate('WhatWeDoDetail', { contentId })}
      onOpenActionPage={(pageId) => {
        if ((pageId === 'membership' || pageId === 'join') && hasApplied && !isReapplying) {
          handleOpenStatus();
          return;
        }
        if (pageId === 'membership') {
          navigation.navigate('MembershipCategories');
        } else {
          navigation.navigate('UserActionPage', { pageId });
        }
      }}
    />
  );
};

const UserAboutScreenComponent: React.FC<any> = ({ navigation, route }) => {
  let hasApplied = false;
  let isReapplying = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const membershipCtx = useMembership();
    hasApplied = Boolean(membershipCtx?.hasApplied);
    isReapplying = Boolean(membershipCtx?.isReapplying);
  } catch {}

  return (
    <AboutScreen
      showBottomNav={false}
      onOpenRights={() => navigation.navigate('UserRights')}
      onOpenContact={() => navigation.navigate('ContactUs')}
      onOpenEvents={() => navigation.navigate('UserEvents')}
      onOpenNews={() => navigation.navigate('UserNews')}
      onOpenMyApplication={() => navigation.navigate('MyApplication')}
      onOpenStatus={() => navigation.navigate('MyApplication')}
      onOpenWhatWeDo={(contentId) => navigation.navigate('WhatWeDoDetail', { contentId })}
      onNavigate={(target) => {
        if (target === 'my-application' || target === 'MyApplication' || target === 'status') {
          navigation.navigate('MyApplication');
        } else if (target === 'donations') {
          navigation.navigate('UserActionPage', { pageId: 'donate' });
        } else if (target === 'membership' || target === 'membership-categories') {
          if (hasApplied && !isReapplying) {
            navigation.navigate('MyApplication');
          } else {
            navigation.navigate('MembershipCategories');
          }
        } else if (target === 'notifications') {
          navigation.navigate('Notifications');
        } else if (target === 'blogs' || target === 'articles') {
          navigation.navigate('UserBlogs');
        } else {
          navigation.navigate(target);
        }
      }}
    />
  );
};

const UserRightsScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <MemberRightsScreen
      onOpenRight={(rightId) => navigation.navigate('RightDetails', { rightId })}
      onFileComplaint={() => navigation.navigate('FileComplaint')}
      onContactSupport={() => navigation.navigate('ContactUs')}
    />
  );
};

const UserEventsScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <UserEventsScreen
      hideBottomNav={true}
      showBottomNav={false}
      onOpenEvent={(event) => navigation.navigate('UserEventDetails', { event })}
      onOpenAbout={() => navigation.navigate('UserAbout')}
      onOpenRights={() => navigation.navigate('UserRights')}
      onOpenContact={() => navigation.navigate('ContactUs')}
      onOpenNews={() => navigation.navigate('UserNews')}
    />
  );
};

const UserNewsScreenComponent: React.FC<any> = ({ navigation, route }) => {
  return (
    <NewsScreen
      hideBottomNav={true}
      showBottomNav={false}
      initialViewAll={route?.params?.viewAll ?? false}
      onOpenArticle={(article) => navigation.navigate('NewsDetails', { article })}
      onOpenHome={() => navigation.navigate('UserHome')}
      onOpenAbout={() => navigation.navigate('UserAbout')}
      onOpenRights={() => navigation.navigate('UserRights')}
      onOpenEvents={() => navigation.navigate('UserEvents')}
      onOpenContact={() => navigation.navigate('ContactUs')}
    />
  );
};

const UserProfileScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <ProfileScreen
      isMemberProfile={false}
      showIdCard={false}
      headerComponent={<HomeHeader />}
      onNavigate={(target) => {
        if (target === 'ContactUs' || target === 'contact') {
          navigation.navigate('ContactUs');
        } else if (target === 'MyIdCard') {
          return;
        } else if (target === 'MyApplication' || target === 'status') {
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
      onViewMembershipDetails={() => navigation.navigate('UserHome')}
    />
  );
};

const UserHistoryScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <DonationHistoryScreen
      customHeader={
        <HomeHeader
          onPressSearch={() => navigation.navigate('Search')}
          onPressNotifications={() => navigation.navigate('Notifications')}
        />
      }
      onNavigateHome={() => navigation.navigate('UserHome')}
      onNavigateDonate={() => navigation.navigate('UserActionPage', { pageId: 'donate' })}
    />
  );
};

const USER_TABS: UserTabItem[] = [
  {
    name: 'UserHome',
    label: 'Home',
    Icon: House,
    component: UserHomeScreenComponent,
  },
  {
    name: 'UserAbout',
    label: 'About',
    Icon: FileText,
    component: UserAboutScreenComponent,
  },
  {
    name: 'UserRights',
    label: 'Rights',
    Icon: Scale,
    component: UserRightsScreenComponent,
  },
  {
    name: 'UserEvents',
    label: 'Events',
    Icon: Calendar,
    component: UserEventsScreenComponent,
  },
  {
    name: 'UserNews',
    label: 'News',
    Icon: MessageSquare,
    component: UserNewsScreenComponent,
  },
  {
    name: 'UserHistory',
    label: 'History',
    Icon: Clock,
    component: UserHistoryScreenComponent,
  },
];

const UserCustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation, descriptors }) => {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index];
  const currentRouteName = currentRoute?.name;

  // Only render bottom tab navigation on the 6 primary tabs
  const isMainTab = USER_TABS.some(t => t.name === currentRouteName);
  const options = descriptors?.[currentRoute.key]?.options;

  if (!isMainTab || (options?.tabBarStyle as any)?.display === 'none') {
    return null;
  }

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 6) },
      ]}
      accessibilityRole="tablist"
    >
      {USER_TABS.map((tabDef, index) => {
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

        const iconColor = isFocused ? '#E9B82E' : '#06294D';

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
              <Icon size={22} color={iconColor} strokeWidth={1.8} />
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

export const UserTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="UserHome"
      backBehavior="history"
      tabBar={props => <UserCustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {USER_TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}

      <Tab.Screen
        name="ContactUs"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <ContactUsScreen
            hideBottomNav={true}
            showBottomNav={false}
            onBack={navigation.goBack}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenEvents={() => navigation.navigate('UserEvents')}
            onOpenNews={() => navigation.navigate('UserNews')}
            onOpenGetHelp={() => navigation.navigate('FileComplaint')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="UserEventDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <UserEventDetailsScreen
            event={route.params?.event || USER_EVENTS[0]}
            onBack={navigation.goBack}
            onRegister={() =>
              navigation.navigate('RegisterForEvent', {
                event: route.params?.event || USER_EVENTS[0],
              })
            }
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="RegisterForEvent"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <RegisterForEventScreen
            event={route.params?.event}
            hideBottomNav={true}
            showBottomNav={false}
            onBack={navigation.goBack}
            onBackToEvents={() => navigation.navigate('UserEvents')}
            onOpenHome={() => navigation.navigate('UserHome')}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenContact={() => navigation.navigate('ContactUs')}
            onOpenNews={() => navigation.navigate('UserNews')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="NewsDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <NewsDetailsScreen
            article={route.params?.article}
            hideBottomNav={true}
            showBottomNav={false}
            onBack={navigation.goBack}
            onOpenArticle={(art) =>
              navigation.navigate('NewsDetails', { article: art })
            }
            onOpenHome={() => navigation.navigate('UserHome')}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenEvents={() => navigation.navigate('UserEvents')}
            onOpenContact={() => navigation.navigate('ContactUs')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="RightDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <RightDetailsScreen
            rightId={route.params?.rightId || 'human-rights'}
            showBottomNav={false}
            onBack={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('UserHome');
            }}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenHome={() => navigation.navigate('UserHome')}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenContact={() => navigation.navigate('ContactUs')}
            onOpenEvents={() => navigation.navigate('UserEvents')}
            onOpenNews={() => navigation.navigate('UserNews')}
            onOpenRight={(rightId) => navigation.navigate('RightDetails', { rightId })}
            onFileComplaint={() => navigation.navigate('FileComplaint')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="FileComplaint"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <FileComplaintScreen
            onBack={navigation.goBack}
            onOpenHome={() => navigation.navigate('UserHome')}
            onOpenEvents={() => navigation.navigate('UserEvents')}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenContact={() => navigation.navigate('ContactUs')}
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
        name="MyIdCard"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MyIdCardScreen
            onBack={navigation.goBack}
            onNavigate={(target) => navigation.navigate(target)}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Notifications"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }: any) => (
          <NotificationsScreen
            onBack={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('UserHome');
            }}
            onOpenHome={() => navigation.navigate('UserHome')}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenEvents={() => navigation.navigate('UserEvents')}
            onOpenNews={() => navigation.navigate('UserNews')}
            onOpenContact={() => navigation.navigate('ContactUs')}
            onOpenSearch={() => navigation.navigate('Search')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="UserActionPage"
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      >
        {({ navigation, route }: any) => {
          let hasApplied = false;
          let isReapplying = false;
          try {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const membershipCtx = useMembership();
            hasApplied = Boolean(membershipCtx?.hasApplied);
            isReapplying = Boolean(membershipCtx?.isReapplying);
          } catch {}

          const pageId = route.params?.pageId || 'join';
          if (pageId === 'membership') {
            if (hasApplied && !isReapplying) {
              return <MyApplicationScreen />;
            }
            return (
              <MembershipCategoriesScreen
                onBack={navigation.goBack}
                onApplyPost={(post) => {
                  navigation.navigate('MembershipStep1Personal', { post });
                }}
              />
            );
          }
          return (
            <UserActionPageScreen
              pageId={pageId}
              hideBottomNav={true}
              showBottomNav={false}
              onBack={navigation.goBack}
              onOpenHome={() => navigation.navigate('UserHome')}
              onOpenAbout={() => navigation.navigate('UserAbout')}
              onOpenRights={() => navigation.navigate('UserRights')}
              onOpenEvents={() => navigation.navigate('UserEvents')}
              onOpenNews={() => navigation.navigate('UserNews')}
              onOpenContact={() => navigation.navigate('ContactUs')}
              onOpenMembershipCategories={() => {
                if (hasApplied && !isReapplying) {
                  navigation.navigate('MyApplication');
                } else {
                  navigation.navigate('MembershipCategories');
                }
              }}
            />
          );
        }}
      </Tab.Screen>

      <Tab.Screen
        name="MembershipCategories"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <MembershipCategoriesScreen
            onBack={navigation.goBack}
            onApplyPost={(post) => {
              navigation.navigate('MembershipStep1Personal', { post });
            }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MembershipStep1Personal"
        options={{ tabBarButton: () => null }}
        component={MembershipStep1Screen}
      />

      <Tab.Screen
        name="MembershipStep2Address"
        options={{ tabBarButton: () => null }}
        component={MembershipStep2Screen}
      />

      <Tab.Screen
        name="MembershipStep3Documents"
        options={{ tabBarButton: () => null }}
        component={MembershipStep3Screen}
      />

      <Tab.Screen
        name="MembershipSubmitted"
        options={{ tabBarButton: () => null }}
        component={MembershipSubmittedScreen}
      />

      <Tab.Screen
        name="MyApplication"
        options={{ tabBarButton: () => null }}
        component={MyApplicationScreen}
      />

      <Tab.Screen
        name="ApplicationDetails"
        options={{ tabBarButton: () => null }}
        component={ApplicationDetailsScreen}
      />

      <Tab.Screen
        name="ApplicationApproved"
        options={{ tabBarButton: () => null }}
        component={ApplicationApprovedScreen}
      />

      <Tab.Screen
        name="ApplicationRejected"
        options={{ tabBarButton: () => null }}
        component={ApplicationRejectedScreen}
      />

      <Tab.Screen
        name="ApplicationApplied"
        options={{ tabBarButton: () => null }}
        component={ApplicationAppliedScreen}
      />

      <Tab.Screen
        name="WhatWeDoDetail"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <WhatWeDoDetailScreen
            contentId={route.params?.contentId || 'awareness-campaigns'}
            hideBottomNav={true}
            showBottomNav={false}
            onBack={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('UserHome');
            }}
            onOpenHome={() => navigation.navigate('UserHome')}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenEvents={() => navigation.navigate('UserEvents')}
            onOpenNews={() => navigation.navigate('UserNews')}
            onOpenContact={() => navigation.navigate('ContactUs')}
            onOpenJoin={() => navigation.navigate('MembershipCategories')}
            onOpenWhatWeDo={(contentId) => navigation.navigate('WhatWeDoDetail', { contentId })}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="UserBlogs"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }: any) => (
          <UserBlogsScreen
            hideBottomNav={true}
            showBottomNav={false}
            onBack={navigation.goBack}
            onOpenBlog={(blog) => {
              if (blog.article) {
                navigation.navigate('NewsDetails', { article: blog.article });
              }
            }}
            onOpenHome={() => navigation.navigate('UserHome')}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenEvents={() => navigation.navigate('UserEvents')}
            onOpenNews={() => navigation.navigate('UserNews')}
            onOpenContact={() => navigation.navigate('ContactUs')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="UserProfile"
        options={{ tabBarButton: () => null }}
        component={UserProfileScreenComponent}
      />

      <Tab.Screen
        name="DonationDetail"
        options={{ tabBarButton: () => null }}
        component={DonationDetailScreen}
      />

      <Tab.Screen
        name="ReceiptDetail"
        options={{ tabBarButton: () => null }}
        component={ReceiptDetailScreen}
      />
      <Tab.Screen
        name="TransactionHistory"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }: any) => (
          <TransactionHistoryScreen
            onBack={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('UserHome');
              }
            }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="TransactionDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }: any) => (
          <TransactionDetailsScreen
            onBack={() => {
              if (navigation?.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('TransactionHistory');
              }
            }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="ReceiptPdfPreview"
        options={{ tabBarButton: () => null }}
        component={ReceiptPdfPreviewScreen}
      />
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
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#E9B82E', // color-gold-600
  },
  tabLabelInactive: {
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#06294D',
  },
});

export default UserTabNavigator;
