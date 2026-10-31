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
import { SeekerHomeScreen } from '../screens/SeekerHomeScreen';
import { SeekerRequestsScreen } from '../screens/SeekerRequestsScreen';
import { CreateSeekerScreen } from '../../admin/assistance/screens/CreateSeekerScreen';
import { MemberRightsScreen, RightDetailsScreen } from '../../member/rights';
import { UserEventsScreen } from '../../user/events/screens/UserEventsScreen';
import { SupportTicketsScreen } from '../../support';
import { ProfileScreen } from '../../admin/profile/screens/ProfileScreen';
import { NotificationsScreen } from '../../admin/notifications';
import { AboutScreen } from '../../user/about';
import { UserActionPageScreen } from '../../user/action-pages';
import { WhatWeDoDetailScreen } from '../../user/what-we-do';
import { NewsScreen } from '../../user/news/screens/NewsScreen';
import { NewsDetailsScreen } from '../../user/news/screens/NewsDetailsScreen';
import { FileComplaintScreen } from '../../user/help';
import { HomeHeader } from '../../user/home/components/HomeHeader';
import {
  MyIdCardScreen,
  EditPersonalInfoScreen,
  AdminDetailsScreen,
} from '../../admin/profile';
import {
  House,
  FileText,
  Scale,
  Calendar,
  MessageSquare,
  User,
  AppIconComponent,
} from '../../../core/components/icons';

const Tab = createBottomTabNavigator();

interface SeekerTabItem {
  name: string;
  label: string;
  Icon: AppIconComponent;
  component: React.ComponentType<any>;
}

const SeekerHomeWrapper: React.FC<any> = ({ navigation }) => {
  return (
    <SeekerHomeScreen
      navigation={navigation}
      onNavigateToApply={() => navigation.navigate('AddSeeker')}
      onNavigateToRequests={() => navigation.navigate('SeekerRequests')}
      onNavigateToSupport={() => navigation.navigate('SeekerSupport')}
      onNavigateToRights={() => navigation.navigate('SeekerRights')}
      onNavigateToEvents={() => navigation.navigate('SeekerEvents')}
      onNavigateToNews={() => navigation.navigate('News')}
      onNavigateToComplaint={() => navigation.navigate('FileComplaint')}
      onOpenNotifications={() => navigation.navigate('Notifications')}
      onOpenProfile={() => navigation.navigate('SeekerProfile')}
    />
  );
};

const SeekerRequestsWrapper: React.FC<any> = ({ navigation }) => {
  return (
    <SeekerRequestsScreen
      navigation={navigation}
      onApplyPress={() => navigation.navigate('AddSeeker')}
      onContactSupport={() => navigation.navigate('SeekerSupport')}
    />
  );
};

const SeekerRightsWrapper: React.FC<any> = ({ navigation }) => {
  return (
    <MemberRightsScreen
      onOpenRight={(rightId) => navigation.navigate('RightDetails', { rightId })}
      onFileComplaint={() => navigation.navigate('FileComplaint')}
      onContactSupport={() => navigation.navigate('SeekerSupport')}
    />
  );
};

const SeekerEventsWrapper: React.FC<any> = ({ navigation }) => {
  return (
    <UserEventsScreen
      onOpenEvent={(event) => navigation.navigate('SeekerHome')}
      onOpenAbout={() => navigation.navigate('About')}
      onOpenRights={() => navigation.navigate('SeekerRights')}
      onOpenContact={() => navigation.navigate('SeekerSupport')}
      onOpenNews={() => navigation.navigate('News')}
    />
  );
};

const SeekerSupportWrapper: React.FC<any> = ({ navigation }) => {
  return (
    <SupportTicketsScreen
      showBottomNav={false}
      onCreateTicketPress={() => navigation.navigate('FileComplaint')}
      onProfilePress={() => navigation.navigate('SeekerProfile')}
      onNotificationsPress={() => navigation.navigate('Notifications')}
    />
  );
};

const SeekerProfileWrapper: React.FC<any> = ({ navigation }) => {
  return (
    <ProfileScreen
      headerComponent={<HomeHeader hideDonate />}
      onNavigate={(target) => navigation.navigate(target)}
      onEditPersonal={() => navigation.navigate('EditPersonalInfo')}
      onEditAdminDetails={() => navigation.navigate('AdminDetails')}
      onViewIdCard={() => navigation.navigate('MyIdCard')}
      onViewMembershipDetails={() => navigation.navigate('SeekerHome')}
    />
  );
};

const SEEKER_TABS: SeekerTabItem[] = [
  {
    name: 'SeekerHome',
    label: 'Home',
    Icon: House,
    component: SeekerHomeWrapper,
  },
  {
    name: 'SeekerRequests',
    label: 'My Aid',
    Icon: FileText,
    component: SeekerRequestsWrapper,
  },
  {
    name: 'SeekerRights',
    label: 'Rights',
    Icon: Scale,
    component: SeekerRightsWrapper,
  },
  {
    name: 'SeekerEvents',
    label: 'Events',
    Icon: Calendar,
    component: SeekerEventsWrapper,
  },
  {
    name: 'SeekerSupport',
    label: 'Helpdesk',
    Icon: MessageSquare,
    component: SeekerSupportWrapper,
  },
  {
    name: 'SeekerProfile',
    label: 'Profile',
    Icon: User,
    component: SeekerProfileWrapper,
  },
];

const SeekerCustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 6) },
      ]}
      accessibilityRole="tablist"
    >
      {SEEKER_TABS.map((tabDef, index) => {
        const isFocused = state.index === index;
        const iconColor = isFocused ? '#E9B82E' : '#718096'; // Gold accent & muted navy per docs/design.md
        const IconComponent = tabDef.Icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index]?.key || tabDef.name,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index]?.name || tabDef.name);
          }
        };

        return (
          <TouchableOpacity
            key={tabDef.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tabDef.label}
            testID={`tab-${tabDef.name}`}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.75}
          >
            <View style={styles.iconBox}>
              <IconComponent size={21} color={iconColor} />
            </View>
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
              numberOfLines={1}
            >
              {tabDef.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const SeekerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="SeekerHome"
      tabBar={(props) => <SeekerCustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main 6 Bottom Tabs */}
      <Tab.Screen name="SeekerHome" component={SeekerHomeWrapper} />
      <Tab.Screen name="SeekerRequests" component={SeekerRequestsWrapper} />
      <Tab.Screen name="SeekerRights" component={SeekerRightsWrapper} />
      <Tab.Screen name="SeekerEvents" component={SeekerEventsWrapper} />
      <Tab.Screen name="SeekerSupport" component={SeekerSupportWrapper} />
      <Tab.Screen name="SeekerProfile" component={SeekerProfileWrapper} />

      {/* Hidden Stack Routes accessible within Seeker flow */}
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
                  navigation.navigate('SeekerHome');
                }
              }}
              onOpenHome={() => navigation.navigate('SeekerHome')}
              onOpenAbout={() => navigation.navigate('About')}
              onOpenRights={() => navigation.navigate('SeekerRights')}
              onOpenEvents={() => navigation.navigate('SeekerEvents')}
              onOpenNews={() => navigation.navigate('News')}
              onOpenContact={() => navigation.navigate('SeekerProfile')}
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
                navigation.navigate('SeekerHome');
              }
            }}
            onOpenHome={() => navigation.navigate('SeekerHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenRights={() => navigation.navigate('SeekerRights')}
            onOpenEvents={() => navigation.navigate('SeekerEvents')}
            onOpenNews={() => navigation.navigate('News')}
            onOpenContact={() => navigation.navigate('SeekerProfile')}
            onOpenDonations={() => navigation.navigate('UserActionPage', { pageId: 'donate' })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Events"
        options={{ tabBarButton: () => null }}
        component={SeekerEventsWrapper}
      />

      <Tab.Screen
        name="Notifications"
        options={{ tabBarButton: () => null }}
        component={NotificationsScreen}
      />

      <Tab.Screen
        name="AddSeeker"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <CreateSeekerScreen
            navigation={navigation}
            onBack={navigation.goBack}
            onSuccess={() => navigation.navigate('SeekerRequests')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="About"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <AboutScreen
            onBack={navigation.goBack}
            onOpenWhatWeDo={(contentId) => navigation.navigate('WhatWeDoDetail' as any, { contentId })}
            onOpenRights={() => navigation.navigate('SeekerRights')}
            onOpenEvents={() => navigation.navigate('SeekerEvents')}
            onOpenNews={() => navigation.navigate('News')}
            onOpenContact={() => navigation.navigate('SeekerSupport')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="WhatWeDoDetail"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <WhatWeDoDetailScreen
            contentId={route.params?.contentId || 'human-rights-monitoring'}
            hideBottomNav={true}
            showBottomNav={false}
            onBack={navigation.goBack}
            onOpenHome={() => navigation.navigate('SeekerHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenRights={() => navigation.navigate('SeekerRights')}
            onOpenEvents={() => navigation.navigate('SeekerEvents')}
            onOpenNews={() => navigation.navigate('News')}
            onOpenContact={() => navigation.navigate('SeekerSupport')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="News"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <NewsScreen
            hideBottomNav={true}
            showBottomNav={false}
            onOpenArticle={(article) =>
              navigation.navigate('NewsDetails', { article })
            }
            onOpenHome={() => navigation.navigate('SeekerHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenRights={() => navigation.navigate('SeekerRights')}
            onOpenEvents={() => navigation.navigate('SeekerEvents')}
            onOpenContact={() => navigation.navigate('SeekerSupport')}
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
            onOpenHome={() => navigation.navigate('SeekerHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenRights={() => navigation.navigate('SeekerRights')}
            onOpenEvents={() => navigation.navigate('SeekerEvents')}
            onOpenContact={() => navigation.navigate('SeekerSupport')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="RightDetails"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation, route }: any) => (
          <RightDetailsScreen
            rightId={route.params?.rightId}
            onBack={navigation.goBack}
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
            onViewTickets={() => navigation.navigate('SeekerSupport')}
            onOpenHome={() => navigation.navigate('SeekerHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenRights={() => navigation.navigate('SeekerRights')}
            onOpenContact={() => navigation.navigate('SeekerProfile')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Complaint"
        options={{ tabBarButton: () => null }}
      >
        {({ navigation }) => (
          <FileComplaintScreen
            onBack={navigation.goBack}
            onViewTickets={() => navigation.navigate('SeekerSupport')}
            onOpenHome={() => navigation.navigate('SeekerHome')}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenRights={() => navigation.navigate('SeekerRights')}
            onOpenContact={() => navigation.navigate('SeekerProfile')}
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
    paddingHorizontal: 4,
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
    height: 24,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#E9B82E',
  },
  tabLabelInactive: {
    fontWeight: '600',
    color: '#718096',
  },
});

export default SeekerTabNavigator;
