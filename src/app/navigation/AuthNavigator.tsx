import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../../features/auth/screens/SplashScreen';
// import { OnboardingScreen } from '../../features/auth/screens/OnboardingScreen';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { RegisterIntroScreen } from '../../features/auth/screens/RegisterIntroScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';
import { ForgotPasswordScreen } from '../../features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../../features/auth/screens/ResetPasswordScreen';
import { MembershipCategoriesScreen } from '../../features/membership/screens/MembershipCategoriesScreen';
import { MembershipStep1Screen } from '../../features/membership/screens/MembershipStep1Screen';
import { MembershipStep2Screen } from '../../features/membership/screens/MembershipStep2Screen';
import { MembershipStep3Screen } from '../../features/membership/screens/MembershipStep3Screen';
import { MembershipSubmittedScreen } from '../../features/membership/screens/MembershipSubmittedScreen';
import { AuthStackParamList } from './NavigationTypes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth stack: Splash → (Onboarding commented out) → Login → (Register) → Forgot/Reset Password
 * + Existing Member Registration flow (Categories → Step1 → Step2 → Step3 → Submitted).
 * Header rendering is delegated to each screen (AppHeader / custom bands).
 */
export const AuthNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Splash">
    <Stack.Screen
      name="Splash"
      component={SplashScreen}
      options={{ headerShown: false, animation: 'fade' }}
    />
    {/* Onboarding commented out for now - direct to login */}
    {/*
    <Stack.Screen
      name="Onboarding"
      component={OnboardingScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    */}
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="RegisterIntro"
      component={RegisterIntroScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MembershipCategories"
      options={{ headerShown: false }}
    >
      {({ navigation }: any) => (
        <MembershipCategoriesScreen
          onBack={navigation.goBack}
          onApplyPost={(post) => {
            navigation.navigate('MembershipStep1Personal', { post });
          }}
        />
      )}
    </Stack.Screen>
    <Stack.Screen
      name="MembershipStep1Personal"
      component={MembershipStep1Screen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MembershipStep2Address"
      component={MembershipStep2Screen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MembershipStep3Documents"
      component={MembershipStep3Screen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MembershipSubmitted"
      component={MembershipSubmittedScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;