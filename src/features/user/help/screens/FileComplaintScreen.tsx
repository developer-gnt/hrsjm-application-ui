import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
  type DocumentPickerResponse,
} from '@react-native-documents/picker';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AppButton, AppInput } from '../../../../core/components';
import {
  AdminColors,
  BorderRadius,
  FontFamilies,
  Spacing,
} from '../../../../core/theme';
import { AppIcon, HrsjmLogoMark } from '../../components';
import { UserBottomNavigation } from '../../home/components/UserBottomNavigation';
import type { HomeTab } from '../../home/types/home.types';
import { ComplaintProgress } from '../components/ComplaintProgress';

const COMPLAINT_TYPES = [
  'Human Rights Violation',
  "Women's Rights",
  'Child Rights',
  'Labour Rights',
  'Minority Rights',
  'Senior Citizen Rights',
  'Legal Rights',
  'Discrimination',
  'Violence / Abuse',
  'Other',
] as const;

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Marathi', 'Other'] as const;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const SUPPORTED_ATTACHMENT_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];
const SUPPORTED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

const isSupportedAttachment = (file: DocumentPickerResponse) => {
  const extension = file.name?.split('.').pop()?.toLowerCase();
  if (file.type) {
    return SUPPORTED_ATTACHMENT_TYPES.includes(file.type);
  }
  return extension
    ? SUPPORTED_ATTACHMENT_EXTENSIONS.includes(extension)
    : false;
};

type PreferredLanguage = (typeof LANGUAGE_OPTIONS)[number];

type FormState = {
  helpType: string;
  subject: string;
  description: string;
  preferredLanguage: PreferredLanguage;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
};

const emptyForm: FormState = {
  helpType: '',
  subject: '',
  description: '',
  preferredLanguage: 'English',
  fullName: '',
  mobile: '',
  email: '',
  address: '',
  city: '',
  state: '',
};

export interface FileComplaintScreenProps {
  onBack?: () => void;
  onOpenHome?: () => void;
  onOpenAbout?: () => void;
  onOpenRights?: () => void;
  onOpenContact?: () => void;
  onOpenEvents?: () => void;
  onOpenNews?: () => void;
}

export const FileComplaintScreen: React.FC<FileComplaintScreenProps> = ({
  onBack,
  onOpenHome,
  onOpenAbout,
  onOpenRights,
  onOpenContact,
  onOpenEvents,
  onOpenNews,
}) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [attachments, setAttachments] = useState<DocumentPickerResponse[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const stepLabels = ['Complaint Details', 'Your Details', 'Review & Submit'];

  const handleStepBack = () => {
    if (isSubmitted) {
      onBack?.();
      return;
    }

    if (step === 1) {
      onBack?.();
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    setStep(2);
  };

  useEffect(() => {
    if (isSubmitted) {
      return;
    }

    const onHardwareBackPress = () => {
      if (step === 1) {
        Alert.alert(
          'Discard complaint?',
          'Are you sure you want to leave this complaint flow?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Leave', onPress: () => onBack?.() },
          ],
        );
        return true;
      }

      setStep(prev => (prev === 2 ? 1 : 2));
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress,
    );

    return () => subscription.remove();
  }, [isSubmitted, step, onBack]);

  const handleTabPress = (tab: HomeTab) => {
    if (tab.id === 'home') {
      onOpenHome?.();
      return;
    }
    if (tab.id === 'about') {
      onOpenAbout?.();
      return;
    }
    if (tab.id === 'rights') {
      onOpenRights?.();
      return;
    }
    if (tab.id === 'contact') {
      onOpenContact?.();
      return;
    }
    if (tab.id === 'events') {
      onOpenEvents?.();
      return;
    }
    if (tab.id === 'news') {
      onOpenNews?.();
    }
  };

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateStepOne = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.helpType.trim()) {
      nextErrors.helpType = 'Please select the type of help you need.';
    }
    if (!form.subject.trim()) {
      nextErrors.subject = 'Subject is required.';
    }
    if (!form.description.trim()) {
      nextErrors.description = 'Detailed description is required.';
    } else if (form.description.length > 1000) {
      nextErrors.description = 'Description must be 1000 characters or less.';
    }
    setErrors(prev => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepTwo = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }
    if (!form.mobile.trim()) {
      nextErrors.mobile = 'Mobile number is required.';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(form.mobile.trim())) {
      nextErrors.mobile = 'Enter a valid mobile number.';
    }
    if (form.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(form.email.trim())) {
        nextErrors.email = 'Enter a valid email address.';
      }
    }

    setErrors(prev => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const openComplaintTypePicker = () => {
    Alert.alert('Select the type of help', 'Choose an option', [
      ...COMPLAINT_TYPES.map(option => ({
        text: option,
        onPress: () => updateField('helpType', option),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openAttachmentPicker = async () => {
    try {
      const pickedFiles = await pick({
        type: [types.images, types.pdf],
        allowMultiSelection: true,
      });
      const validFiles: DocumentPickerResponse[] = [];
      const rejectedFiles: string[] = [];

      pickedFiles.forEach(file => {
        const fileName = file.name || 'Unnamed file';
        if (file.error) {
          rejectedFiles.push(`${fileName} (${file.error})`);
        } else if (!isSupportedAttachment(file)) {
          rejectedFiles.push(`${fileName} (unsupported file type)`);
        } else if (file.size === null) {
          rejectedFiles.push(`${fileName} (file size could not be checked)`);
        } else if (file.size > MAX_ATTACHMENT_SIZE) {
          rejectedFiles.push(`${fileName} (larger than 5 MB)`);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        setAttachments(previous => [...previous, ...validFiles]);
      }
      if (rejectedFiles.length > 0) {
        Alert.alert('Some files were not added', rejectedFiles.join('\n'));
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === errorCodes.OPERATION_CANCELED) {
          return;
        }
        if (error.code === errorCodes.IN_PROGRESS) {
          Alert.alert(
            'File picker is open',
            'Finish or close the current file selection first.',
          );
          return;
        }
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to open the file picker.';
      console.error('Unable to pick complaint attachments:', error);
      Alert.alert('Unable to select files', message);
    }
  };

  const renderStepOne = () => (
    <View>
      <Text style={styles.sectionHeading}>Complaint Details</Text>

      <Text style={styles.label}>What type of help do you need? *</Text>
      <TouchableOpacity
        style={[styles.selectField, errors.helpType ? styles.fieldError : null]}
        onPress={openComplaintTypePicker}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Select complaint type"
      >
        <Text
          style={[styles.selectText, !form.helpType && styles.placeholderText]}
        >
          {form.helpType || 'Select an option'}
        </Text>
        <AppIcon
          name="chevron-down"
          size={18}
          color={AdminColors.primaryDark}
        />
      </TouchableOpacity>
      {errors.helpType ? (
        <Text style={styles.errorText}>{errors.helpType}</Text>
      ) : null}

      <AppInput
        label="Subject / Title"
        required
        placeholder="Briefly describe your issue"
        value={form.subject}
        onChangeText={value => updateField('subject', value)}
        error={errors.subject}
        accessibilityLabel="Complaint subject"
        leftIcon={
          <AppIcon name="file-text" size={16} color={AdminColors.primaryDark} />
        }
      />

      <Text style={styles.label}>Detailed Description *</Text>
      <TextInput
        value={form.description}
        onChangeText={value => updateField('description', value)}
        placeholder="Please provide full details of your complaint or the help you need."
        multiline
        maxLength={1000}
        style={[styles.textArea, errors.description ? styles.fieldError : null]}
        placeholderTextColor={AdminColors.textMuted}
        accessibilityLabel="Detailed complaint description"
      />
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>{form.description.length}/1000</Text>
      </View>
      {errors.description ? (
        <Text style={styles.errorText}>{errors.description}</Text>
      ) : null}

      <Text style={styles.label}>Upload Supporting Documents (Optional)</Text>
      <TouchableOpacity
        style={[styles.uploadBox, errors.helpType ? styles.fieldError : null]}
        onPress={openAttachmentPicker}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Upload supporting documents"
      >
        <AppIcon name="image" size={24} color={AdminColors.primaryDark} />
        <Text style={styles.uploadTitle}>
          {attachments.length > 0
            ? `${attachments.length} file${
                attachments.length === 1 ? '' : 's'
              } selected`
            : 'Tap to upload files'}
        </Text>
        <Text style={styles.uploadHint}>
          {attachments.length > 0
            ? 'Tap to add more files · JPG, PNG, PDF (max 5MB each)'
            : 'JPG, PNG, PDF (max 5MB each)'}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <AppButton
          title="Next: Your Details  →"
          onPress={() => {
            if (validateStepOne()) {
              setStep(2);
            }
          }}
          variant="gold"
          size="lg"
          style={styles.primaryButton}
          textStyle={{ color: AdminColors.primaryDark }}
        />
      </View>
    </View>
  );

  const renderStepTwo = () => (
    <View>
      <Text style={styles.sectionHeading}>Your Details</Text>

      <AppInput
        label="Full Name"
        required
        placeholder="Enter your full name"
        value={form.fullName}
        onChangeText={value => updateField('fullName', value)}
        error={errors.fullName}
        accessibilityLabel="Full name"
        leftIcon={
          <AppIcon name="user" size={16} color={AdminColors.primaryDark} />
        }
      />
      <AppInput
        label="Mobile Number"
        required
        placeholder="Enter your mobile number"
        keyboardType="phone-pad"
        value={form.mobile}
        onChangeText={value => updateField('mobile', value)}
        error={errors.mobile}
        accessibilityLabel="Mobile number"
        leftIcon={
          <AppIcon name="phone" size={16} color={AdminColors.primaryDark} />
        }
      />
      <AppInput
        label="Email Address"
        placeholder="Enter your email (optional)"
        keyboardType="email-address"
        value={form.email}
        onChangeText={value => updateField('email', value)}
        error={errors.email}
        accessibilityLabel="Email address"
        leftIcon={
          <AppIcon name="email" size={16} color={AdminColors.primaryDark} />
        }
      />
      <AppInput
        label="Address"
        placeholder="Enter your complete address"
        value={form.address}
        onChangeText={value => updateField('address', value)}
        accessibilityLabel="Address"
        leftIcon={
          <AppIcon name="map-pin" size={16} color={AdminColors.primaryDark} />
        }
      />

      <View style={styles.twoColumnRow}>
        <View style={styles.columnField}>
          <AppInput
            label="City"
            placeholder="Enter your city"
            value={form.city}
            onChangeText={value => updateField('city', value)}
            accessibilityLabel="City"
            containerStyle={styles.inputColumn}
            leftIcon={
              <AppIcon
                name="map-pin"
                size={14}
                color={AdminColors.primaryDark}
              />
            }
          />
        </View>
        <View style={styles.columnField}>
          <AppInput
            label="State"
            placeholder="Select your state"
            value={form.state}
            onChangeText={value => updateField('state', value)}
            accessibilityLabel="State"
            containerStyle={styles.inputColumn}
            leftIcon={
              <AppIcon
                name="map-pin"
                size={14}
                color={AdminColors.primaryDark}
              />
            }
          />
        </View>
      </View>

      <Text style={styles.label}>Preferred Language</Text>
      <View style={styles.languageGroup}>
        {LANGUAGE_OPTIONS.map(language => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageOption,
              form.preferredLanguage === language &&
                styles.languageOptionSelected,
            ]}
            onPress={() => updateField('preferredLanguage', language)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityLabel={`Preferred language ${language}`}
            accessibilityState={{
              selected: form.preferredLanguage === language,
            }}
          >
            <View style={styles.languageRadioOuter}>
              <View
                style={[
                  styles.languageRadioInner,
                  form.preferredLanguage === language &&
                    styles.languageRadioInnerSelected,
                ]}
              />
            </View>
            <Text style={styles.languageText}>{language}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.doubleButtonRow}>
        <AppButton
          title="Back"
          onPress={handleStepBack}
          variant="outline"
          size="lg"
          style={styles.secondaryButton}
        />
        <AppButton
          title="Next: Review & Submit"
          onPress={() => {
            if (validateStepTwo()) {
              setStep(3);
            }
          }}
          variant="gold"
          size="lg"
          style={styles.primaryButton}
          textStyle={{ color: AdminColors.primaryDark }}
        />
      </View>
    </View>
  );

  const renderStepThree = () => (
    <View>
      <Text style={styles.sectionHeading}>Review Your Complaint</Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewCardHeader}>
          <Text style={styles.reviewCardTitle}>Complaint Details</Text>
          <TouchableOpacity
            onPress={() => setStep(1)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Edit complaint details"
          >
            <Text style={styles.inlineEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Type of Help</Text>
          <Text style={styles.summaryValue}>
            {form.helpType || 'Not provided'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subject / Title</Text>
          <Text style={styles.summaryValue}>
            {form.subject || 'Not provided'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Description</Text>
          <Text style={styles.summaryValue}>
            {form.description || 'Not provided'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Supporting Documents</Text>
          <Text style={styles.summaryValue}>
            {attachments.length > 0
              ? attachments.map(file => file.name || 'Unnamed file').join(', ')
              : 'Not uploaded'}
          </Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewCardHeader}>
          <Text style={styles.reviewCardTitle}>Your Details</Text>
          <TouchableOpacity
            onPress={() => setStep(2)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Edit your details"
          >
            <Text style={styles.inlineEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Full Name</Text>
          <Text style={styles.summaryValue}>
            {form.fullName || 'Not provided'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Mobile Number</Text>
          <Text style={styles.summaryValue}>
            {form.mobile || 'Not provided'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Email Address</Text>
          <Text style={styles.summaryValue}>
            {form.email || 'Not provided'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Address</Text>
          <Text style={styles.summaryValue}>
            {form.address || 'Not provided'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>City</Text>
          <Text style={styles.summaryValue}>{form.city || 'Not provided'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>State</Text>
          <Text style={styles.summaryValue}>
            {form.state || 'Not provided'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Preferred Language</Text>
          <Text style={styles.summaryValue}>{form.preferredLanguage}</Text>
        </View>
      </View>

      <View style={styles.privacyCard}>
        <View style={styles.privacyIconWrap}>
          <AppIcon
            name="shield-check"
            size={20}
            color={AdminColors.primaryDark}
          />
        </View>
        <View style={styles.privacyTextWrap}>
          <Text style={styles.privacyTitle}>
            Your information is safe with us.
          </Text>
          <Text style={styles.privacyDescription}>
            We keep your personal information confidential and use it only to
            respond to your request.
          </Text>
        </View>
      </View>

      <View style={styles.doubleButtonRow}>
        <AppButton
          title="Back"
          onPress={handleStepBack}
          variant="outline"
          size="lg"
          style={styles.secondaryButton}
        />
        <AppButton
          title="Submit Complaint"
          onPress={() => setIsSubmitted(true)}
          variant="gold"
          size="lg"
          style={styles.primaryButton}
          textStyle={{ color: AdminColors.primaryDark }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, Spacing.sm) },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleStepBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon
              name="chevron-left"
              size={20}
              color={AdminColors.primaryDark}
            />
          </TouchableOpacity>

          <View style={styles.logoWrap}>
            <HrsjmLogoMark height={38} />
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Search"
            >
              <AppIcon
                name="search"
                size={20}
                color={AdminColors.primaryDark}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>File a Complaint / Get Help</Text>
          <Text style={styles.subtitle}>
            Please provide the details below. Our team will review your
            complaint and get in touch with you.
          </Text>

          <ComplaintProgress
            steps={stepLabels.map(label => ({ id: label, label }))}
            activeStep={step - 1}
          />

          {isSubmitted ? (
            <View style={styles.successCard}>
              <View style={styles.successIconWrap}>
                <AppIcon
                  name="check"
                  size={24}
                  color={AdminColors.textOnDark}
                />
              </View>
              <Text style={styles.successTitle}>Complaint Submitted</Text>
              <Text style={styles.successText}>
                Thank you for reaching out to HRSJM. Your complaint has been
                received and our team will review it.
              </Text>
              <View style={styles.referenceBox}>
                <Text style={styles.referenceLabel}>Reference ID</Text>
                <Text style={styles.referenceId}>HRSJM-DEMO-001</Text>
              </View>
              <AppButton
                title="Back to Home"
                onPress={() => onBack?.()}
                variant="gold"
                size="lg"
                style={styles.successButton}
                textStyle={{ color: AdminColors.primaryDark }}
              />
            </View>
          ) : step === 1 ? (
            renderStepOne()
          ) : step === 2 ? (
            renderStepTwo()
          ) : (
            renderStepThree()
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <UserBottomNavigation activeTab="home" onTabPress={handleTabPress} />
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
  header: {
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  pageTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 24,
    lineHeight: 30,
    color: AdminColors.primaryDark,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  subtitle: {
    color: AdminColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    fontFamily: FontFamilies.serif,
    fontSize: 20,
    lineHeight: 24,
    color: AdminColors.primaryDark,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  label: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    backgroundColor: AdminColors.cardSurface,
    marginBottom: Spacing.md,
  },
  selectText: {
    color: AdminColors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  placeholderText: {
    color: AdminColors.textMuted,
  },
  fieldError: {
    borderColor: AdminColors.error,
  },
  textArea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: AdminColors.cardSurface,
    textAlignVertical: 'top',
    color: AdminColors.textPrimary,
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  counterRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  counterText: {
    color: AdminColors.textSecondary,
    fontSize: 11,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 118,
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    color: AdminColors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  uploadHint: {
    color: AdminColors.textSecondary,
    fontSize: 11.5,
    marginTop: 2,
  },
  actionRow: {
    marginTop: Spacing.md,
  },
  doubleButtonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
  },
  errorText: {
    color: AdminColors.error,
    fontSize: 11,
    marginTop: -8,
    marginBottom: Spacing.sm,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  columnField: {
    flex: 1,
  },
  inputColumn: {
    marginBottom: 0,
  },
  languageGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    backgroundColor: AdminColors.cardSurface,
  },
  languageOptionSelected: {
    borderColor: AdminColors.primaryDark,
    backgroundColor: AdminColors.primaryLight,
  },
  languageRadioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: AdminColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  languageRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  languageRadioInnerSelected: {
    backgroundColor: AdminColors.primaryDark,
  },
  languageText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: AdminColors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
    marginBottom: Spacing.xs,
  },
  reviewCardTitle: {
    color: AdminColors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  inlineEditText: {
    color: AdminColors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  summaryLabel: {
    flex: 1,
    color: AdminColors.textSecondary,
    fontSize: 12,
  },
  summaryValue: {
    flex: 1.2,
    color: AdminColors.primaryDark,
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '600',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.accentGoldLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  privacyIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: AdminColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  privacyTextWrap: {
    flex: 1,
  },
  privacyTitle: {
    color: AdminColors.primaryDark,
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  privacyDescription: {
    color: AdminColors.primaryDark,
    fontSize: 11.5,
    lineHeight: 16,
  },
  successCard: {
    marginTop: Spacing.md,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AdminColors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    color: AdminColors.primaryDark,
    fontFamily: FontFamilies.serif,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  successText: {
    color: AdminColors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
  },
  referenceBox: {
    width: '100%',
    marginTop: Spacing.lg,
    backgroundColor: AdminColors.primaryLight,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
  },
  referenceLabel: {
    color: AdminColors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  referenceId: {
    color: AdminColors.primaryDark,
    marginTop: Spacing.xs,
    fontSize: 22,
    fontWeight: '700',
  },
  successButton: {
    width: '100%',
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
});
