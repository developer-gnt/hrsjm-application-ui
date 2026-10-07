import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  UserOutlineIcon,
  MailOutlineIcon,
  PhoneOutlineIcon,
  CalendarOutlineIcon,
  ArrowRightIcon,
  GoogleGIcon,
  ChevronDownIcon,
} from '../components/AuthIcons';
import { DobDatePickerModal } from '../components/DobDatePickerModal';
import { getRegistrationState, updateRegistrationState } from '../state/registrationState';
import { navigateToCreateAccountAdditional } from '../../../core/navigation/appRouter';

const HRSJM_LOGO = require('../../../assets/hrsjm_logo.png');
const HERO_BG = require('../../../assets/create_account_hero.jpg');

interface CreateAccountScreenProps {
  onBack?: () => void;
  onContinue?: (formData: CreateAccountFormData) => void;
  onLoginPress?: () => void;
  onGoogleSignUp?: () => void;
}

export interface CreateAccountFormData {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  dob: string;
}

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({
  onBack,
  onContinue,
  onLoginPress,
  onGoogleSignUp,
}) => {
  const { width } = useWindowDimensions();
  const regState = getRegistrationState();
  const [fullName, setFullName] = useState(() => regState.fullName || '');
  const [email, setEmail] = useState(() => regState.email || '');
  const [phone, setPhone] = useState(() => {
    if (regState.phone && regState.phone.startsWith('+91 ')) {
      return regState.phone.replace('+91 ', '');
    }
    return regState.phone || '';
  });
  const [countryCode, setCountryCode] = useState(() => regState.countryCode || '+91');
  const [dob, setDob] = useState(() => regState.dob || '');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Sizing calculations for responsive layout
  const isTabletOrDesktop = width > 520;
  const contentMaxWidth = isTabletOrDesktop ? 440 : width;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).window?.history) {
      (globalThis as any).window.history.back();
    } else {
      Alert.alert('Navigation', 'Back button pressed');
    }
  };

  const handleContinue = () => {
    const formattedPhone = phone.trim()
      ? `${countryCode} ${phone.trim()}`
      : '';
    updateRegistrationState({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: formattedPhone,
      countryCode,
      dob: dob.trim(),
    });
    if (onContinue) {
      onContinue({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), countryCode, dob: dob.trim() });
    } else {
      navigateToCreateAccountAdditional();
    }
  };

  const handleGoogleSignUp = () => {
    if (onGoogleSignUp) {
      onGoogleSignUp();
    } else {
      Alert.alert('Google Sign Up', 'Sign up with Google pressed');
    }
  };

  const handleLogin = () => {
    if (onLoginPress) {
      onLoginPress();
    } else {
      Alert.alert('Login', 'Navigate to Login screen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isTabletOrDesktop && { alignItems: 'center' },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={[styles.mainWrapper, { width: contentMaxWidth }]}>
            {/* Top Hero Image Section covering the entire sky & landscape backdrop */}
            <ImageBackground
              source={HERO_BG}
              style={styles.heroBackground}
              imageStyle={styles.heroBackgroundImage}
              resizeMode="cover"
            >
              {/* Top Bar with Back Button */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <ChevronLeftIcon size={16} color="#0F2860" />
                </TouchableOpacity>
              </View>

              {/* Branding Section with Official HRSJM Logo */}
              <View style={styles.brandingSection}>
                <Image
                  source={HRSJM_LOGO}
                  style={styles.logoImage}
                  resizeMode="contain"
                  accessibilityLabel="HRSJM Emblem Logo"
                />
              </View>

              {/* Main Heading & Subtitle */}
              <View style={styles.headingSection}>
                <Text style={styles.heroHeading}>
                  <Text style={styles.headingNavy}>Create Your </Text>
                  <Text style={styles.headingGold}>Account</Text>
                </Text>
                <Text style={styles.heroSubheading}>
                  Join HRSJM and be part of a movement{'\n'}for a fairer, more just and equal society.
                </Text>
              </View>

              {/* Quote positioned naturally above sunrise / landscape */}
              <View style={styles.quoteRow}>
                <View style={styles.quoteWrapper}>
                  <Text style={styles.quoteText}>
                    “People{'\n'}Rights{'\n'}Justice{'\n'}Change.”
                  </Text>
                  <View style={styles.quoteUnderline} />
                </View>
              </View>

              {/* Spacer so the people with backpacks are positioned right above/at the card overlap */}
              <View style={styles.peopleBottomSpacer} />
            </ImageBackground>

            {/* Overlapping White Personal Information Card */}
            <View style={styles.cardContainer}>
              <Text style={styles.cardHeading}>Personal Information</Text>
              <Text style={styles.cardDescription}>
                Fill in your details to create an account.
              </Text>

              {/* Field 1: Full Name */}
              <View style={styles.inputField}>
                <View style={styles.inputLeftIcon}>
                  <UserOutlineIcon size={18} color="#475569" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name *"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    updateRegistrationState({ fullName: text });
                  }}
                  autoCapitalize="words"
                  accessibilityLabel="Full Name"
                />
              </View>

              {/* Field 2: Email Address */}
              <View style={styles.inputField}>
                <View style={styles.inputLeftIcon}>
                  <MailOutlineIcon size={18} color="#475569" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address *"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    updateRegistrationState({ email: text });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessibilityLabel="Email Address"
                />
              </View>

              {/* Field 3: Mobile Number with Flag +91 */}
              <View style={styles.inputField}>
                <View style={styles.inputLeftIcon}>
                  <PhoneOutlineIcon size={18} color="#475569" />
                </View>
                <View style={styles.countryPicker}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <ChevronDownIcon size={10} color="#64748B" />
                </View>
                <View style={styles.verticalDivider} />
                <TextInput
                  style={[styles.textInput, styles.phoneInput]}
                  placeholder="Mobile Number *"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    updateRegistrationState({
                      phone: text ? `${countryCode} ${text}` : '',
                    });
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  accessibilityLabel="Mobile Number"
                />
              </View>

              {/* Field 4: Date of Birth with Calendar Picker */}
              <TouchableOpacity
                style={styles.inputField}
                onPress={() => setIsDatePickerVisible(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Select Date of Birth"
              >
                <View style={styles.inputLeftIcon}>
                  <CalendarOutlineIcon size={18} color="#475569" />
                </View>
                <Text
                  style={[
                    styles.textInput,
                    styles.dobText,
                    !dob && styles.placeholderText,
                  ]}
                >
                  {dob || 'Date of Birth'}
                </Text>
                <View style={styles.inputRightIcon}>
                  <CalendarOutlineIcon size={18} color="#94A3B8" />
                </View>
              </TouchableOpacity>

              {/* DOB Calendar Picker Modal */}
              <DobDatePickerModal
                visible={isDatePickerVisible}
                selectedDate={dob}
                onSelectDate={(date) => {
                  setDob(date);
                  updateRegistrationState({ dob: date });
                }}
                onClose={() => setIsDatePickerVisible(false)}
              />

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Continue"
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <View style={styles.continueArrowWrapper}>
                  <ArrowRightIcon size={16} color="#0F2860" />
                </View>
              </TouchableOpacity>

              {/* OR Divider */}
              <View style={styles.orDividerContainer}>
                <View style={styles.orDividerLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orDividerLine} />
              </View>

              {/* Google Sign Up Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Sign up with Google"
              >
                <GoogleGIcon size={18} />
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginQuestion}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Login"
                >
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  mainWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  heroBackground: {
    width: '100%',
    height: 520, // Ample height so the sky holds all text comfortably above the people
  },
  heroBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 14 : 8,
    paddingBottom: 0,
    alignItems: 'flex-start',
    zIndex: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(230, 235, 245, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  brandingSection: {
    alignItems: 'center',
    marginTop: -18,
    marginBottom: 4,
  },
  logoImage: {
    width: 160,
    height: 115,
  },
  headingSection: {
    alignItems: 'center',
    marginTop: 0,
    paddingHorizontal: 20,
  },
  heroHeading: {
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    letterSpacing: 0.3,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headingNavy: {
    color: '#0F2860',
  },
  headingGold: {
    color: '#E9A11F',
  },
  heroSubheading: {
    fontSize: 13,
    color: '#0F2860',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
    marginTop: 22,
  },
  quoteWrapper: {
    alignItems: 'flex-end',
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'right',
    lineHeight: 20,
    fontFamily: Platform.select({ ios: 'Snell Roundhand', android: 'sans-serif-condensed', default: 'cursive' }),
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  quoteUnderline: {
    width: 50,
    height: 2.4,
    backgroundColor: '#E9A11F',
    marginTop: 3,
    borderRadius: 1.2,
  },
  peopleBottomSpacer: {
    flex: 1,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    marginTop: -55, // Overlap onto backpacks leaving people and sunrise visible
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 18,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 13,
  },
  inputLeftIcon: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRightIcon: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
    height: '100%',
  },
  dobText: {
    lineHeight: 46,
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
  },
  flagEmoji: {
    fontSize: 15,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 2,
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAA224',
    height: 48,
    borderRadius: 10,
    marginTop: 6,
    shadowColor: '#EAA224',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.3,
  },
  continueArrowWrapper: {
    marginLeft: 8,
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    height: 48,
    borderRadius: 10,
    gap: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2860',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 4,
  },
  loginQuestion: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
});
