import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../../features/auth/screens/SplashScreen';
import { OnboardingScreen } from '../../features/auth/screens/OnboardingScreen';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { RegisterIntroScreen } from '../../features/auth/screens/RegisterIntroScreen';
import { RegisterScreen } from '../../features/auth/screens/RegisterScreen';
import { ForgotPasswordScreen } from '../../features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../../features/auth/screens/ResetPasswordScreen';
import { AuthStackParamList } from './NavigationTypes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth stack: Splash → Onboarding → Login → (Register) → Forgot/Reset Password.
 * Header rendering is delegated to each screen (AppHeader / custom bands).
 */
export const AuthNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Splash">
    <Stack.Screen
      name="Splash"
      component={SplashScreen}
      options={{ headerShown: false, animation: 'fade' }}
    />
    <Stack.Screen
      name="Onboarding"
      component={OnboardingScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
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
  </Stack.Navigator>
);

export default AuthNavigator;