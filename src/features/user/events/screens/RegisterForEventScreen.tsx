import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppInput } from '../../../../core/components';
import { AdminColors, BorderRadius, FontFamilies, Shadows, Spacing } from '../../../../core/theme';
import { AppIcon } from '../../components';
import { ContactHeader } from '../../contact/components/ContactHeader';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import type { UserEvent } from '../data/user-events';

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Other'] as const;
const DEMO_REGISTRATION_REFERENCE = 'HRSJM-DEMO-REG-001';

interface RegistrationForm {
  fullName: string;
  mobileNumber: string;
  email: string;
  city: string;
  preferredLanguage: string;
  specialRequirements: string;
}

interface RegisterForEventScreenProps {
  event: UserEvent;
  onBack: () => void;
  onBackToEvents: () => void;
  onOpenHome: () => void;
  onOpenAbout: () => void;
  onOpenRights: () => void;
  onOpenContact: () => void;
  onOpenNews: () => void;
}

const INITIAL_FORM: RegistrationForm = {
  fullName: '',
  mobileNumber: '',
  email: '',
  city: '',
  preferredLanguage: 'English',
  specialRequirements: '',
};

export const RegisterForEventScreen: React.FC<RegisterForEventScreenProps> = ({
  event,
  onBack,
  onBackToEvents,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenContact,
  onOpenNews,
}) => {
  const [form, setForm] = useState<RegistrationForm>(INITIAL_FORM);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationForm | 'consent', string>>>({});
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const formScrollRef = React.useRef<ScrollViewInstance | null>(null);

  const hasFormChanges =
    Boolean(
      form.fullName.trim() ||
        form.mobileNumber.trim() ||
        form.email.trim() ||
        form.city.trim() ||
        form.specialRequirements.trim(),
    ) || consentAccepted;

  const requestBack = useCallback(() => {
    if (isRegistered || !hasFormChanges) {
      onBack();
      return;
    }

    Alert.alert(
      'Discard registration?',
      'Your registration details have not been submitted. Leave this screen?',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onBack },
      ],
    );
  }, [hasFormChanges, isRegistered, onBack]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardVisible) {
        return false;
      }
      requestBack();
      return true;
    });
    return () => subscription.remove();
  }, [keyboardVisible, requestBack]);

  const updateField = <K extends keyof RegistrationForm>(field: K, value: RegistrationForm[K]) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome();
    } else if (tab.id === 'about') {
      onOpenAbout();
    } else if (tab.id === 'rights') {
      onOpenRights();
    } else if (tab.id === 'contact') {
      onOpenContact();
    } else if (tab.id === 'news') {
      onOpenNews();
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof RegistrationForm | 'consent', string>> = {};
    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    const mobileDigits = form.mobileNumber.replace(/\D/g, '');
    const localMobile = mobileDigits.length === 12 && mobileDigits.startsWith('91')
      ? mobileDigits.slice(2)
      : mobileDigits;
    if (!form.mobileNumber.trim()) {
      nextErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(localMobile)) {
      nextErrors.mobileNumber = 'Please enter a valid mobile number.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!form.city.trim()) {
      nextErrors.city = 'Please enter your city.';
    }
    if (!form.preferredLanguage) {
      nextErrors.preferredLanguage = 'Please select a language.';
    }
    if (!consentAccepted) {
      nextErrors.consent = 'Please accept the consent to continue.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitRegistration = () => {
    if (validate()) {
      setIsRegistered(true);
      setLanguageMenuOpen(false);
    } else {
      formScrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const renderEventSummary = () => (
    <View style={styles.eventSummary}>
      <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
      <View style={styles.eventInfo}>
        <Text style={styles.categoryBadge}>{event.category}</Text>
        <Text style={styles.eventTitle} numberOfLines={3}>{event.title}</Text>
        <View style={styles.metaRow}>
          <AppIcon name="calendar" size={14} color={AdminColors.primaryDark} />
          <Text style={styles.metaText}>{event.date}</Text>
        </View>
        <View style={styles.metaRow}>
          <AppIcon name="clock" size={14} color={AdminColors.primaryDark} />
          <Text style={styles.metaText}>{event.time}</Text>
        </View>
        <View style={styles.metaRow}>
          <AppIcon name="map-pin" size={14} color={AdminColors.primaryDark} />
          <View style={styles.venueText}>
            <Text style={styles.metaText}>{event.venue}</Text>
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPrivacyCard = () => (
    <View style={styles.privacyCard}>
      <View style={styles.privacyIconWrap}>
        <AppIcon name="lock" size={19} color={AdminColors.primaryDark} />
      </View>
      <View style={styles.privacyCopy}>
        <Text style={styles.privacyTitle}>Your information is safe with us.</Text>
        <Text style={styles.privacyDescription}>
          We keep your personal information confidential and use it only for event-related communication.
        </Text>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.successScroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.successCard}>
        <View style={styles.successIconWrap}>
          <AppIcon name="check" size={30} color={AdminColors.textOnDark} />
        </View>
        <Text style={styles.successTitle}>Registration Successful</Text>
        <Text style={styles.successSubtitle}>You have been registered for this event.</Text>
        <View style={styles.successEvent}>
          {renderEventSummary()}
        </View>
        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>Demo confirmation reference</Text>
          <Text style={styles.referenceId}>{DEMO_REGISTRATION_REFERENCE}</Text>
          <Text style={styles.referenceNote}>UI demonstration only — this is not a saved registration ID.</Text>
        </View>
      </View>

      <AppButton
        title="Back to Event Details"
        onPress={onBack}
        variant="gold"
        size="lg"
        style={styles.primaryButton}
        textStyle={styles.buttonText}
        icon={<AppIcon name="arrow-right" size={17} color={AdminColors.primaryDark} />}
        iconPosition="right"
        accessibilityRole="button"
        accessibilityLabel="Back to Event Details"
      />
      <TouchableOpacity
        style={styles.backToEvents}
        onPress={onBackToEvents}
        accessibilityRole="button"
        accessibilityLabel="Back to Events"
      >
        <AppIcon name="chevron-left" size={17} color={AdminColors.primaryDark} />
        <Text style={styles.backToEventsText}>Back to Events</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ContactHeader onBack={requestBack} />
      {isRegistered ? (
        renderSuccess()
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : Spacing.sm}
        >
          <ScrollView
            ref={formScrollRef}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageTitle}>Register for Event</Text>
            <Text style={styles.subtitle}>Please provide your details to register for this event.</Text>

            {renderEventSummary()}

            <Text style={styles.sectionHeading}>Your Details</Text>
            <AppInput
              label="Full Name"
              required
              placeholder="Enter your full name"
              value={form.fullName}
              onChangeText={value => updateField('fullName', value)}
              error={errors.fullName}
              autoCapitalize="words"
              accessibilityLabel="Full Name"
              leftIcon={<AppIcon name="user" size={17} color={AdminColors.primaryDark} />}
            />
            <AppInput
              label="Mobile Number"
              required
              placeholder="Enter your mobile number"
              value={form.mobileNumber}
              onChangeText={value => updateField('mobileNumber', value)}
              error={errors.mobileNumber}
              keyboardType="phone-pad"
              accessibilityLabel="Mobile Number"
              leftIcon={<AppIcon name="phone" size={17} color={AdminColors.primaryDark} />}
            />
            <AppInput
              label="Email Address"
              required
              placeholder="Enter your email address"
              value={form.email}
              onChangeText={value => updateField('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email Address"
              leftIcon={<AppIcon name="email" size={17} color={AdminColors.primaryDark} />}
            />

            <View style={styles.formRow}>
              <View style={styles.cityColumn}>
                <AppInput
                  label="City"
                  required
                  placeholder="Enter your city"
                  value={form.city}
                  onChangeText={value => updateField('city', value)}
                  error={errors.city}
                  autoCapitalize="words"
                  accessibilityLabel="City"
                  leftIcon={<AppIcon name="map-pin" size={16} color={AdminColors.primaryDark} />}
                  containerStyle={styles.noBottomMargin}
                />
              </View>
              <View style={styles.languageColumn}>
                <Text style={styles.fieldLabel}>Preferred Language <Text style={styles.requiredStar}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.languageSelect, errors.preferredLanguage && styles.languageSelectError]}
                  onPress={() => setLanguageMenuOpen(open => !open)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Preferred Language"
                  accessibilityState={{ expanded: languageMenuOpen }}
                >
                  <AppIcon name="globe" size={16} color={AdminColors.primaryDark} />
                  <Text style={styles.languageValue}>{form.preferredLanguage || 'Select a language'}</Text>
                  <AppIcon name="chevron-down" size={16} color={AdminColors.primaryDark} />
                </TouchableOpacity>
                {languageMenuOpen ? (
                  <View style={styles.languageMenu}>
                    {LANGUAGES.map(language => (
                      <TouchableOpacity
                        key={language}
                        style={styles.languageOption}
                        onPress={() => {
                          updateField('preferredLanguage', language);
                          setLanguageMenuOpen(false);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: form.preferredLanguage === language }}
                      >
                        <Text style={styles.languageOptionText}>{language}</Text>
                        {form.preferredLanguage === language ? (
                          <AppIcon name="check" size={15} color={AdminColors.primary} />
                        ) : null}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                {errors.preferredLanguage ? (
                  <Text style={styles.errorText}>{errors.preferredLanguage}</Text>
                ) : null}
              </View>
            </View>

            <AppInput
              label="Special Requirements / Accessibility Needs (Optional)"
              placeholder="Please let us know if you have any special requirements"
              helperText="e.g. wheelchair access, sign language support, etc."
              value={form.specialRequirements}
              onChangeText={value => updateField('specialRequirements', value)}
              maxLength={500}
              multiline
              textAlignVertical="top"
              style={styles.requirementsInput}
              accessibilityLabel="Special Requirements or Accessibility Needs"
              leftIcon={<AppIcon name="file-text" size={17} color={AdminColors.primaryDark} />}
            />
            <Text style={styles.characterCount}>{form.specialRequirements.length}/500</Text>

            {renderPrivacyCard()}

            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => {
                setConsentAccepted(accepted => !accepted);
                setErrors(previous => ({ ...previous, consent: undefined }));
              }}
              activeOpacity={0.8}
              accessibilityRole="checkbox"
              accessibilityLabel="I agree to receive event-related updates from HRSJM"
              accessibilityState={{ checked: consentAccepted }}
            >
              <View style={[styles.checkbox, consentAccepted && styles.checkboxChecked]}>
                {consentAccepted ? (
                  <AppIcon name="check" size={14} color={AdminColors.textOnDark} />
                ) : null}
              </View>
              <Text style={styles.consentText}>I agree to receive event-related updates from HRSJM.</Text>
            </TouchableOpacity>
            {errors.consent ? <Text style={styles.consentError}>{errors.consent}</Text> : null}

            <AppButton
              title="Confirm Registration"
              onPress={submitRegistration}
              variant="gold"
              size="lg"
              style={styles.primaryButton}
              textStyle={styles.buttonText}
              icon={<AppIcon name="arrow-right" size={17} color={AdminColors.primaryDark} />}
              iconPosition="right"
              accessibilityRole="button"
              accessibilityLabel="Confirm Registration"
            />
            <TouchableOpacity
              style={styles.backToDetails}
              onPress={requestBack}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to Event Details"
            >
              <AppIcon name="chevron-left" size={16} color={AdminColors.primaryDark} />
              <Text style={styles.backToDetailsText}>Back to Event Details</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <UserBottomNavigation activeTab="events" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AdminColors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  pageTitle: {
    marginTop: Spacing.sm,
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  eventSummary: {
    flexDirection: 'row',
    minHeight: 112,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  eventImage: {
    width: '40%',
    height: 128,
    borderRadius: BorderRadius.sm,
    backgroundColor: AdminColors.primaryLight,
  },
  eventInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: BorderRadius.full,
    backgroundColor: AdminColors.accentGoldLight,
    color: AdminColors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  venueText: {
    flex: 1,
    minWidth: 0,
  },
  sectionHeading: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cityColumn: {
    flex: 1,
    minWidth: 0,
  },
  languageColumn: {
    flex: 1,
    minWidth: 0,
    zIndex: 2,
  },
  noBottomMargin: {
    marginBottom: 0,
  },
  fieldLabel: {
    color: AdminColors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  requiredStar: {
    color: AdminColors.error,
  },
  languageSelect: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    backgroundColor: AdminColors.cardSurface,
  },
  languageSelectError: {
    borderColor: AdminColors.error,
  },
  languageValue: {
    flex: 1,
    minWidth: 0,
    color: AdminColors.textSecondary,
    fontSize: 11,
  },
  languageMenu: {
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.cardMedium,
  },
  languageOption: {
    minHeight: 40,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
  },
  languageOptionText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
  },
  requirementsInput: {
    minHeight: 76,
    paddingTop: Spacing.sm,
    fontSize: 12,
  },
  characterCount: {
    color: AdminColors.textSecondary,
    fontSize: 11.5,
    textAlign: 'right',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.accentGoldLight,
  },
  privacyIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFE8A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCopy: {
    flex: 1,
  },
  privacyTitle: {
    color: AdminColors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  privacyDescription: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 34,
    marginBottom: Spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.5,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: AdminColors.primaryDark,
    borderColor: AdminColors.primaryDark,
  },
  consentText: {
    flex: 1,
    color: AdminColors.primaryDark,
    fontSize: 12.5,
    lineHeight: 17,
  },
  errorText: {
    color: AdminColors.error,
    fontSize: 12,
    marginTop: 4,
  },
  consentError: {
    color: AdminColors.error,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  primaryButton: {
    width: '100%',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  buttonText: {
    color: AdminColors.primaryDark,
  },
  backToDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 40,
  },
  backToDetailsText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  successScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  successCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: AdminColors.successLight,
    backgroundColor: AdminColors.cardSurface,
    ...Shadows.card,
  },
  successIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: AdminColors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    textAlign: 'center',
  },
  successSubtitle: {
    color: AdminColors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  successEvent: {
    width: '100%',
  },
  referenceCard: {
    width: '100%',
    borderRadius: BorderRadius.md,
    backgroundColor: AdminColors.successLight,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  referenceLabel: {
    color: AdminColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  referenceId: {
    color: AdminColors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  referenceNote: {
    color: AdminColors.textSecondary,
    fontSize: 9,
    lineHeight: 12,
    marginTop: 2,
  },
  backToEvents: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 42,
  },
  backToEventsText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
