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
import { AboutScreen } from '../about/screens/AboutScreen';
import { MemberRightsScreen } from '../../member/rights/screens/MemberRightsScreen';
import { UserEventsScreen } from '../events/screens/UserEventsScreen';
import { NewsScreen } from '../news/screens/NewsScreen';
import { ContactUsScreen } from '../contact/screens/ContactUsScreen';
import { ProfileScreen } from '../../admin/profile/screens/ProfileScreen';
import { EditPersonalInfoScreen } from '../../admin/profile/screens/EditPersonalInfoScreen';
import { AdminDetailsScreen } from '../../admin/profile/screens/AdminDetailsScreen';
import { MyIdCardScreen } from '../../admin/profile/screens/MyIdCardScreen';
import { UserEventDetailsScreen } from '../events/screens/UserEventDetailsScreen';
import { RegisterForEventScreen } from '../events/screens/RegisterForEventScreen';
import { NewsDetailsScreen } from '../news/screens/NewsDetailsScreen';
import { RightDetailsScreen } from '../rights/screens/RightDetailsScreen';
import { FileComplaintScreen } from '../help/screens/FileComplaintScreen';
import { NotificationsScreen } from '../../admin/notifications';
import { ProfileSettingsScreen } from '../../admin/settings';

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

interface UserTabItem {
  name: string;
  label: string;
  Icon: AppIconComponent;
  component: React.ComponentType<any>;
}

const UserHomeScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <UserHomeScreen
      hideBottomNav={true}
      onOpenProfile={() => navigation.navigate('UserProfile')}
      onOpenContact={() => navigation.navigate('ContactUs')}
      onOpenRights={() => navigation.navigate('UserRights')}
      onOpenAbout={() => navigation.navigate('UserAbout')}
      onOpenEvents={() => navigation.navigate('UserEvents')}
      onOpenNews={() => navigation.navigate('UserNews')}
      onOpenGetHelp={() => navigation.navigate('FileComplaint')}
      onOpenRight={(rightId) => navigation.navigate('RightDetails', { rightId })}
      onOpenActionPage={(pageId) => {
        if (pageId === 'join' || pageId === 'membership') {
          navigation.navigate('UserAbout');
        } else if (pageId === 'donate') {
          navigation.navigate('UserAbout');
        }
      }}
    />
  );
};

const UserAboutScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <AboutScreen
      showBottomNav={false}
      onBack={() => navigation.navigate('UserHome')}
      onOpenRights={() => navigation.navigate('UserRights')}
      onOpenContact={() => navigation.navigate('ContactUs')}
      onOpenEvents={() => navigation.navigate('UserEvents')}
      onOpenNews={() => navigation.navigate('UserNews')}
    />
  );
};

const UserRightsScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <MemberRightsScreen
      onBack={() => navigation.navigate('UserHome')}
      onOpenRight={(rightId) => navigation.navigate('RightDetails', { rightId })}
      onFileComplaint={() => navigation.navigate('FileComplaint')}
      onContactSupport={() => navigation.navigate('ContactUs')}
    />
  );
};

const UserEventsScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <UserEventsScreen
      onBack={() => navigation.navigate('UserHome')}
      onOpenEvent={(event) => navigation.navigate('UserEventDetails', { event })}
      onOpenAbout={() => navigation.navigate('UserAbout')}
      onOpenRights={() => navigation.navigate('UserRights')}
      onOpenContact={() => navigation.navigate('ContactUs')}
      onOpenNews={() => navigation.navigate('UserNews')}
    />
  );
};

const UserNewsScreenComponent: React.FC<any> = ({ navigation }) => {
  return (
    <NewsScreen
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
      onNavigate={(target) => {
        if (target === 'ContactUs' || target === 'contact') {
          navigation.navigate('ContactUs');
        } else {
          navigation.navigate(target);
        }
      }}
      onEditPersonal={() => navigation.navigate('EditPersonalInfo')}
      onEditAdminDetails={() => navigation.navigate('AdminDetails')}
      onViewIdCard={() => navigation.navigate('MyIdCard')}
      onViewMembershipDetails={() => navigation.navigate('UserHome')}
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
    name: 'UserProfile',
    label: 'Profile',
    Icon: User,
    component: UserProfileScreenComponent,
  },
];

const UserCustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

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

        const iconColor = isFocused ? '#D97706' : '#1B3F8F';

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
            event={route.params?.event}
            onBack={navigation.goBack}
            onRegister={() =>
              navigation.navigate('RegisterForEvent', {
                event: route.params?.event,
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
            onBack={navigation.goBack}
            onOpenRights={() => navigation.navigate('UserRights')}
            onOpenHome={() => navigation.navigate('UserHome')}
            onOpenAbout={() => navigation.navigate('UserAbout')}
            onOpenContact={() => navigation.navigate('ContactUs')}
            onOpenEvents={() => navigation.navigate('UserEvents')}
            onOpenNews={() => navigation.navigate('UserNews')}
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
        component={NotificationsScreen}
      />

      <Tab.Screen
        name="ProfileSettings"
        options={{ tabBarButton: () => null }}
        component={ProfileSettingsScreen}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
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
    color: '#D97706',
  },
  tabLabelInactive: {
    fontFamily: 'Inter-Medium',
    fontWeight: '600',
    color: '#1B3F8F',
  },
});

export default UserTabNavigator;
