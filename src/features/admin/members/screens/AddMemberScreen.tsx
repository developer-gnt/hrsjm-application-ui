import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandColors } from '../../../../core/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { FontFamilies } from '../../../../core/theme/typography';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { DatePickerModal } from '../../../../core/components/common/DatePickerModal';
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
  FileCheck,
  FileText,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  UploadCloud,
  User,
  Users,
} from '../../../../core/components/icons';
import { useNavigation } from '@react-navigation/native';
import { useCreateMember, useMembershipCategories } from '../hooks/useMembers';
import type { CreateMemberPayload } from '../services/members.service';
import {
  DISTRICT_STATE_POSTS,
  LETTER_PAD_POSTS,
  NATIONAL_LEVEL_POSTS,
  type MembershipPostData,
} from '../../../membership/data/membershipCategoriesData';

interface AddMemberScreenProps {
  onBack?: () => void;
  onSubmit?: (payload: CreateMemberPayload) => Promise<void> | void;
  isSubmitting?: boolean;
  onNavigate?: (target: string) => void;
}

type FormStep = 1 | 2 | 3 | 4 | 5;

interface FormCategoryOption {
  id: string;
  postName: string;
  qualification: string;
  fee: string;
  feeAmount: number;
  validity: string;
  benefits: string[];
  backendCode?: string;
}

export type MainCategoryType = 'General Membership' | 'Letter Pad Post' | 'National Level Post';

export interface CategoryDefinition {
  id: MainCategoryType;
  title: string;
  subtitle: string;
  icon: any;
}

export const MAIN_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'General Membership',
    title: 'General Membership',
    subtitle: 'District & Zonal General posts for active participation',
    icon: Users,
  },
  {
    id: 'Letter Pad Post',
    title: 'Letter Pad Post',
    subtitle: 'Leadership positions with official Letter Pad authority',
    icon: FileText,
  },
  {
    id: 'National Level Post',
    title: 'National Level Post',
    subtitle: 'National executive council positions for specialized departments',
    icon: Landmark,
  },
];

export const CATEGORY_POSTS_MAP: Record<MainCategoryType, FormCategoryOption[]> = {
  'General Membership': [
    {
      id: 'district-general-member',
      postName: 'District General Member',
      qualification: 'Minimum 8th Class',
      fee: '₹ 800',
      feeAmount: 800,
      validity: '1 Year',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker'],
      backendCode: 'DISTRICT_UNIT',
    },
    {
      id: 'zonal-general-member',
      postName: 'Zonal General Member',
      qualification: 'Minimum 8th Class',
      fee: '₹ 900',
      feeAmount: 900,
      validity: '1 Year',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker'],
      backendCode: 'STATE_UNIT',
    },
    {
      id: 'district-unit-post',
      postName: 'District Unit Post',
      qualification: 'Minimum 10th Class',
      fee: '₹ 1,300',
      feeAmount: 1300,
      validity: '1 Year',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card, Lanyard & T-Shirt'],
      backendCode: 'DISTRICT_UNIT',
    },
    {
      id: 'zonal-unit-post',
      postName: 'Zonal Unit Post',
      qualification: 'Minimum 10th Class',
      fee: '₹ 2,300',
      feeAmount: 2300,
      validity: '2 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card, Lanyard & T-Shirt'],
      backendCode: 'STATE_UNIT',
    },
  ],
  'Letter Pad Post': [
    {
      id: 'lion-of-zone',
      postName: 'Lion of Zone',
      qualification: 'Graduation / Degree',
      fee: '₹ 5,000',
      feeAmount: 5000,
      validity: '5 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker', 'T-Shirt & Official Letter Pad'],
      backendCode: 'LION_COUNSELOR_AMBASSADOR',
    },
    {
      id: 'councillor-of-zone',
      postName: 'Councillor of Zone',
      qualification: 'Graduation / Degree',
      fee: '₹ 5,000',
      feeAmount: 5000,
      validity: '5 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker', 'T-Shirt & Official Letter Pad'],
      backendCode: 'LION_COUNSELOR_AMBASSADOR',
    },
    {
      id: 'ambassador-of-zone',
      postName: 'Ambassador of Zone',
      qualification: 'Graduation / Degree',
      fee: '₹ 5,000',
      feeAmount: 5000,
      validity: '5 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker', 'T-Shirt & Official Letter Pad'],
      backendCode: 'LION_COUNSELOR_AMBASSADOR',
    },
    {
      id: 'honble-zone-director',
      postName: "Hon'ble Zone Director",
      qualification: 'Post Graduation',
      fee: '₹ 10,000',
      feeAmount: 10000,
      validity: '10 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker', 'T-Shirt & Official Letter Pad'],
      backendCode: 'STATE_DIRECTOR',
    },
  ],
  'National Level Post': [
    {
      id: 'national-legal-council-call',
      postName: 'National Legal Council Call',
      qualification: 'Post Graduation (Law/Legal)',
      fee: '₹ 10,000',
      feeAmount: 10000,
      validity: '10 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker', 'T-Shirt & Official Letter Pad'],
      backendCode: 'NATIONAL_COUNCIL_CELL',
    },
    {
      id: 'national-minority-council-call',
      postName: 'National Minority Council Call',
      qualification: 'Post Graduation',
      fee: '₹ 10,000',
      feeAmount: 10000,
      validity: '10 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker', 'T-Shirt & Official Letter Pad'],
      backendCode: 'NATIONAL_COUNCIL_CELL',
    },
    {
      id: 'national-woman-council-call',
      postName: 'National Woman Council Call',
      qualification: 'Post Graduation',
      fee: '₹ 10,000',
      feeAmount: 10000,
      validity: '10 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker', 'T-Shirt & Official Letter Pad'],
      backendCode: 'NATIONAL_COUNCIL_CELL',
    },
    {
      id: 'national-political-council-call',
      postName: 'National Political Council Call',
      qualification: 'Post Graduation',
      fee: '₹ 10,000',
      feeAmount: 10000,
      validity: '10 Years',
      benefits: ['Appointment Letter', 'Certificate', 'Identity Card & Sticker', 'T-Shirt & Official Letter Pad'],
      backendCode: 'NATIONAL_COUNCIL_CELL',
    },
  ],
};

const STEP_LABELS = [
  { step: 1, label: 'Category' },
  { step: 2, label: 'Personal' },
  { step: 3, label: 'Address' },
  { step: 4, label: 'Documents' },
  { step: 5, label: 'Review' },
];

export const AddMemberScreen: React.FC<AddMemberScreenProps> = ({
  onBack,
  onSubmit,
  isSubmitting: externalIsSubmitting,
  onNavigate,
}) => {
  const navigation = useNavigation<any>();
  const createMemberMutation = useCreateMember();
  const isSubmitting = externalIsSubmitting ?? createMemberMutation.isPending;
  const { width } = useWindowDimensions();
  const isWide = width >= 650;

  // Fetch backend categories for ID mapping and dynamic enrichment
  const { data: serverCategories = [] } = useMembershipCategories();

  // Navigation step state
  const [currentStep, setCurrentStep] = useState<FormStep>(1);

  // Step 1: Category & Membership Post selection state
  const [selectedCategory, setSelectedCategory] = useState<MainCategoryType | null>(null);
  const [selectedMembershipPost, setSelectedMembershipPost] = useState<FormCategoryOption | null>(null);

  // Dropdown modal state ('category' | 'post' | null)
  const [activeDropdown, setActiveDropdown] = useState<'category' | 'post' | null>(null);

  // Step 1: Account Password state
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Personal Information state
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('');
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [qualification, setQualification] = useState('Graduate');

  // Step 3: Address state
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [landmark, setLandmark] = useState('');

  // Step 4: Documents state
  const [identityProofUploaded, setIdentityProofUploaded] = useState(true);
  const [addressProofUploaded, setAddressProofUploaded] = useState(true);
  const [photoUploaded, setPhotoUploaded] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic posts populated and enriched from server categories
  const availablePosts = React.useMemo<FormCategoryOption[]>(() => {
    if (!selectedCategory) return [];
    const basePosts = CATEGORY_POSTS_MAP[selectedCategory] || [];
    return basePosts.map((post) => {
      const serverMatch = serverCategories.find(
        (sc: any) =>
          sc.code === post.backendCode ||
          sc.name?.toLowerCase().trim() === post.postName.toLowerCase().trim()
      );
      if (serverMatch) {
        const rawFee = serverMatch.fee;
        const formattedFee =
          rawFee !== undefined && rawFee !== null
            ? typeof rawFee === 'number'
              ? `₹ ${rawFee.toLocaleString('en-IN')}`
              : `₹ ${rawFee}`
            : post.fee;
        return {
          ...post,
          fee: formattedFee,
          feeAmount: Number(rawFee) || post.feeAmount,
          backendCode: serverMatch.code || post.backendCode,
        };
      }
      return post;
    });
  }, [selectedCategory, serverCategories]);

  // Active selected post
  const activeSelectedPost = selectedMembershipPost;

  // Resolve matching backend category ID
  const resolveBackendCategoryId = (): string => {
    if (!selectedMembershipPost) return serverCategories[0]?.id || '';
    const code = selectedMembershipPost.backendCode;
    const matched = serverCategories.find(
      (c: any) =>
        c.code === code ||
        c.name?.toLowerCase().includes(selectedMembershipPost.postName.toLowerCase())
    );
    return matched?.id || serverCategories[0]?.id || 'd8907f1c-7c4e-4ed4-bee9-c47d51e5b97a';
  };

  const handleSelectCategory = (cat: MainCategoryType) => {
    if (selectedCategory !== cat) {
      setSelectedCategory(cat);
      // When category changes, clear previously selected Membership Post
      setSelectedMembershipPost(null);
    }
    setActiveDropdown(null);
    if (errors.category) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.category;
        return copy;
      });
    }
  };

  const handleSelectMembershipPost = (post: FormCategoryOption) => {
    setSelectedMembershipPost(post);
    setActiveDropdown(null);
    if (errors.membershipPost) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.membershipPost;
        return copy;
      });
    }
  };

  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    } else if (onBack) {
      onBack();
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCategory) {
      newErrors.category = 'Category is required. Please select a category.';
    }

    if (!selectedMembershipPost) {
      newErrors.membershipPost = 'Membership Post is required. Please select a post.';
    }

    if (!createPassword) {
      newErrors.createPassword = 'Create password is required.';
    } else if (createPassword.length < 6) {
      newErrors.createPassword = 'Password must be at least 6 characters.';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(createPassword)) {
      newErrors.createPassword = 'Password must contain both letters and numbers.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (confirmPassword !== createPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (min 2 characters).';
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required.';
    }
    if (!city.trim()) {
      newErrors.city = 'City is required.';
    }
    if (!stateName.trim()) {
      newErrors.state = 'State is required.';
    }
    if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
      newErrors.pincode = 'Pincode must be 6 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleFinalSubmit = async () => {
    const catId = resolveBackendCategoryId();
    const payload: CreateMemberPayload = {
      category_id: catId,
      full_name: fullName.trim() || 'New Member',
      mobile_number: mobileNumber.replace(/\D/g, '').slice(0, 10),
      email: email.trim() ? email.trim().toLowerCase() : undefined,
      personal_details: {
        dob: dob || undefined,
        gender,
        qualification,
        address: [addressLine1, addressLine2, city, stateName, pincode].filter(Boolean).join(', '),
        city: city.trim() || undefined,
        state: stateName.trim() || undefined,
        pincode: pincode.trim() || undefined,
      },
      admin_notes: `Application for ${activeSelectedPost?.postName || 'General Membership'}. Police Station: ${policeStation || 'N/A'}, Landmark: ${landmark || 'N/A'}.`,
      auto_activate: true,
    };

    if (onSubmit) {
      await onSubmit(payload);
    } else {
      await createMemberMutation.mutateAsync(payload);
      if (onBack) onBack();
      else if (navigation?.canGoBack?.()) navigation.goBack();
    }
  };

  // Render Step 1: Category, Membership Post & Account Details
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {/* SECTION 1: Membership Category & Post Selection */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.numberedCircle}>
            <Text style={styles.numberedCircleText}>1</Text>
          </View>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardTitle}>
              Membership Category & Post <Text style={styles.requiredStar}>*</Text>
            </Text>
            <Text style={styles.cardSubtitle}>
              Select category and designated post
            </Text>
          </View>
        </View>

        {/* 1. Category Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Category <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              selectedCategory && styles.dropdownButtonSelected,
              errors.category && styles.dropdownButtonError,
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveDropdown('category')}
            testID="category-dropdown-button"
            accessibilityLabel="Category dropdown"
          >
            <Text
              style={[
                styles.dropdownText,
                selectedCategory ? styles.dropdownTextSelected : styles.dropdownPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedCategory || 'Select Category'}
            </Text>
            <ChevronDown size={18} color="#06294D" />
          </TouchableOpacity>
          {errors.category ? (
            <Text style={styles.errorText}>{errors.category}</Text>
          ) : null}
          <Text style={styles.fieldHint}>
            Options: General Membership, Letter Pad Post, National Level Post
          </Text>
        </View>

        {/* 2. Membership Post Field (directly underneath Category) */}
        {selectedCategory ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Membership Post <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                selectedMembershipPost && styles.dropdownButtonSelected,
                errors.membershipPost && styles.dropdownButtonError,
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveDropdown('post')}
              testID="membership-post-dropdown-button"
              accessibilityLabel="Membership Post dropdown"
            >
              <Text
                style={[
                  styles.dropdownText,
                  selectedMembershipPost ? styles.dropdownTextSelected : styles.dropdownPlaceholder,
                ]}
                numberOfLines={1}
              >
                {selectedMembershipPost ? selectedMembershipPost.postName : 'Select Membership Post'}
              </Text>
              <ChevronDown size={18} color="#06294D" />
            </TouchableOpacity>
            {errors.membershipPost ? (
              <Text style={styles.errorText}>{errors.membershipPost}</Text>
            ) : null}
          </View>
        ) : null}

        {/* 3. Detailed Card after selecting a Membership Post */}
        {selectedMembershipPost && (
          <View style={styles.postDetailsCard} testID="selected-post-details">
            <View style={styles.postDetailsHeader}>
              <View style={styles.postDetailsTitleCol}>
                <Text style={styles.postDetailsTitle}>
                  {selectedMembershipPost.postName}
                </Text>
                <Text style={styles.postDetailsCategoryTag}>
                  {selectedCategory}
                </Text>
              </View>
              <View style={styles.postValidityPill}>
                <Calendar size={13} color="#06294D" strokeWidth={2} />
                <Text style={styles.postValidityText}>
                  {selectedMembershipPost.validity}
                </Text>
              </View>
            </View>

            <View style={styles.postMetricsRow}>
              <View style={styles.postMetricItem}>
                <Text style={styles.postMetricLabel}>Fee</Text>
                <Text style={styles.postMetricFee}>
                  {selectedMembershipPost.fee}
                </Text>
              </View>
              <View style={styles.postMetricDivider} />
              <View style={styles.postMetricItem}>
                <Text style={styles.postMetricLabel}>Validity</Text>
                <Text style={styles.postMetricValue}>
                  {selectedMembershipPost.validity}
                </Text>
              </View>
              <View style={styles.postMetricDivider} />
              <View style={styles.postMetricItemWide}>
                <Text style={styles.postMetricLabel}>Qualification</Text>
                <Text style={styles.postMetricValue} numberOfLines={2}>
                  {selectedMembershipPost.qualification}
                </Text>
              </View>
            </View>

            {/* Benefits & Entitlements List */}
            {selectedMembershipPost.benefits && selectedMembershipPost.benefits.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>Included Benefits & Entitlements:</Text>
                <View style={styles.benefitsList}>
                  {selectedMembershipPost.benefits.map((b, idx) => (
                    <View key={idx} style={styles.benefitBadge}>
                      <Check size={12} color="#16A34A" strokeWidth={2.5} />
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* SECTION 4: Account Details */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.numberedCircle}>
            <Lock size={16} color="#0284C7" strokeWidth={2.2} />
          </View>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardTitle}>Account Details</Text>
            <Text style={styles.cardSubtitle}>Create a password for this member</Text>
          </View>
        </View>

        <View style={[styles.twoColRow, !isWide && styles.twoColRowStacked]}>
          {/* Create Password */}
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>
              Create Password <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[styles.inputBox, errors.createPassword && styles.inputBoxError]}>
              <Lock size={15} color="#718096" style={styles.fieldIcon} />
              <TextInput
                style={styles.textInput}
                value={createPassword}
                onChangeText={(t) => {
                  setCreatePassword(t);
                  if (errors.createPassword) setErrors((prev) => ({ ...prev, createPassword: '' }));
                }}
                placeholder="Enter password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!showCreatePassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCreatePassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showCreatePassword ? (
                  <EyeOff size={16} color="#718096" />
                ) : (
                  <Eye size={16} color="#718096" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Minimum 6 characters with letters and numbers</Text>
            {errors.createPassword ? <Text style={styles.errorText}>{errors.createPassword}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>
              Confirm Password <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[styles.inputBox, errors.confirmPassword && styles.inputBoxError]}>
              <Lock size={15} color="#718096" style={styles.fieldIcon} />
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Confirm password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} color="#718096" />
                ) : (
                  <Eye size={16} color="#718096" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Re-enter the password to confirm</Text>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>
        </View>
      </View>
    </View>
  );

  // Render Step 2: Personal Information
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.numberedCircle}>
            <Text style={styles.numberedCircleText}>2</Text>
          </View>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <Text style={styles.cardSubtitle}>Applicant contact and personal credentials</Text>
          </View>
        </View>

        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Full Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={[styles.inputBox, errors.fullName && styles.inputBoxError]}>
            <User size={16} color="#718096" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="words"
            />
          </View>
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
        </View>

        {/* Mobile Number & Email */}
        <View style={[styles.twoColRow, !isWide && styles.twoColRowStacked]}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>
              Mobile Number <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[styles.inputBox, errors.mobileNumber && styles.inputBoxError]}>
              <View style={styles.countryCodePill}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={mobileNumber}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, '').slice(0, 10);
                  setMobileNumber(digits);
                  if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: '' }));
                }}
                placeholder="10-digit number"
                placeholderTextColor="#A0AEC0"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.mobileNumber ? <Text style={styles.errorText}>{errors.mobileNumber}</Text> : null}
          </View>

          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={[styles.inputBox, errors.email && styles.inputBoxError]}>
              <Mail size={16} color="#718096" style={styles.fieldIcon} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="e.g. ramesh@example.com"
                placeholderTextColor="#A0AEC0"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>
        </View>

        {/* Gender & DOB */}
        <View style={[styles.twoColRow, !isWide && styles.twoColRowStacked]}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.chipsRow}>
              {(['Male', 'Female', 'Other'] as const).map((g) => {
                const isSelected = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.inputBox}
              activeOpacity={0.7}
              onPress={() => setDobPickerVisible(true)}
            >
              <Calendar size={16} color="#718096" style={styles.fieldIcon} />
              <Text style={[styles.dateText, !dob && styles.datePlaceholder]}>
                {dob || 'Select date of birth (YYYY-MM-DD)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Qualification */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Highest Qualification</Text>
          <View style={styles.chipsRowWrap}>
            {['10th Pass', '12th Pass', 'Graduate', 'Post Graduate'].map((q) => {
              const isSelected = qualification === q;
              return (
                <TouchableOpacity
                  key={q}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setQualification(q)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {q}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );

  // Render Step 3: Address & Police Station
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.numberedCircle}>
            <Text style={styles.numberedCircleText}>3</Text>
          </View>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardTitle}>Address & Jurisdiction</Text>
            <Text style={styles.cardSubtitle}>Residential location and local police jurisdiction</Text>
          </View>
        </View>

        {/* Address Line 1 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Street Address / House No. <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={[styles.inputBox, errors.addressLine1 && styles.inputBoxError]}>
            <MapPin size={16} color="#718096" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              value={addressLine1}
              onChangeText={(t) => {
                setAddressLine1(t);
                if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: '' }));
              }}
              placeholder="e.g. 104, Green Park Society"
              placeholderTextColor="#A0AEC0"
            />
          </View>
          {errors.addressLine1 ? <Text style={styles.errorText}>{errors.addressLine1}</Text> : null}
        </View>

        {/* City & State */}
        <View style={[styles.twoColRow, !isWide && styles.twoColRowStacked]}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>
              City / District <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[styles.inputBox, errors.city && styles.inputBoxError]}>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={(t) => {
                  setCity(t);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                }}
                placeholder="e.g. Mumbai"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
          </View>

          <View style={styles.col}>
            <Text style={styles.fieldLabel}>
              State <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[styles.inputBox, errors.state && styles.inputBoxError]}>
              <TextInput
                style={styles.textInput}
                value={stateName}
                onChangeText={(t) => {
                  setStateName(t);
                  if (errors.state) setErrors((prev) => ({ ...prev, state: '' }));
                }}
                placeholder="e.g. Maharashtra"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
          </View>
        </View>

        {/* Pincode & Police Station */}
        <View style={[styles.twoColRow, !isWide && styles.twoColRowStacked]}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Pincode</Text>
            <View style={[styles.inputBox, errors.pincode && styles.inputBoxError]}>
              <TextInput
                style={styles.textInput}
                value={pincode}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, '').slice(0, 6);
                  setPincode(digits);
                  if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: '' }));
                }}
                placeholder="e.g. 400001"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            {errors.pincode ? <Text style={styles.errorText}>{errors.pincode}</Text> : null}
          </View>

          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Police Station</Text>
            <View style={styles.inputBox}>
              <Shield size={16} color="#718096" style={styles.fieldIcon} />
              <TextInput
                style={styles.textInput}
                value={policeStation}
                onChangeText={setPoliceStation}
                placeholder="e.g. Bandra Police Station"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>
        </View>

        {/* Landmark */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Nearby Landmark</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Opposite City Hospital"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>
      </View>
    </View>
  );

  // Render Step 4: Documents Upload
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.numberedCircle}>
            <Text style={styles.numberedCircleText}>4</Text>
          </View>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardTitle}>Document Verification</Text>
            <Text style={styles.cardSubtitle}>KYC documentation and identity proofs</Text>
          </View>
        </View>

        {/* Aadhaar / Identity Proof */}
        <View style={styles.docRow}>
          <View style={styles.docIconWrap}>
            <FileCheck size={20} color="#06294D" />
          </View>
          <View style={styles.docInfoCol}>
            <Text style={styles.docTitle}>Identity Proof (Aadhaar / Voter ID)</Text>
            <Text style={styles.docSubtitle}>Verified · PDF/JPG up to 5MB</Text>
          </View>
          <TouchableOpacity
            style={[styles.docUploadBtn, identityProofUploaded && styles.docUploadBtnSuccess]}
            onPress={() => setIdentityProofUploaded((prev) => !prev)}
          >
            {identityProofUploaded ? (
              <Check size={16} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <UploadCloud size={16} color="#06294D" />
            )}
          </TouchableOpacity>
        </View>

        {/* Address Proof */}
        <View style={styles.docRow}>
          <View style={styles.docIconWrap}>
            <FileCheck size={20} color="#06294D" />
          </View>
          <View style={styles.docInfoCol}>
            <Text style={styles.docTitle}>Address Proof (Electricity / Rent)</Text>
            <Text style={styles.docSubtitle}>Verified · PDF/JPG up to 5MB</Text>
          </View>
          <TouchableOpacity
            style={[styles.docUploadBtn, addressProofUploaded && styles.docUploadBtnSuccess]}
            onPress={() => setAddressProofUploaded((prev) => !prev)}
          >
            {addressProofUploaded ? (
              <Check size={16} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <UploadCloud size={16} color="#06294D" />
            )}
          </TouchableOpacity>
        </View>

        {/* Photograph */}
        <View style={styles.docRow}>
          <View style={styles.docIconWrap}>
            <User size={20} color="#06294D" />
          </View>
          <View style={styles.docInfoCol}>
            <Text style={styles.docTitle}>Passport Size Photograph</Text>
            <Text style={styles.docSubtitle}>Verified · JPG up to 2MB</Text>
          </View>
          <TouchableOpacity
            style={[styles.docUploadBtn, photoUploaded && styles.docUploadBtnSuccess]}
            onPress={() => setPhotoUploaded((prev) => !prev)}
          >
            {photoUploaded ? (
              <Check size={16} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <UploadCloud size={16} color="#06294D" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render Step 5: Review
  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.numberedCircle}>
            <CheckCircle2 size={18} color="#0284C7" strokeWidth={2.2} />
          </View>
          <View style={styles.cardHeaderCol}>
            <Text style={styles.cardTitle}>Application Review</Text>
            <Text style={styles.cardSubtitle}>Please confirm the membership registration details</Text>
          </View>
        </View>

        {/* Selected Plan Summary Box */}
        <View style={styles.reviewPlanBox}>
          <Text style={styles.reviewPlanTitle}>{activeSelectedPost?.postName || 'General Member'}</Text>
          <View style={styles.reviewFeeRow}>
            <Text style={styles.reviewFeeLabel}>Membership Fee</Text>
            <Text style={styles.reviewFeeValue}>{activeSelectedPost?.fee || '₹ 800'}</Text>
          </View>
          <View style={styles.reviewFeeRow}>
            <Text style={styles.reviewFeeLabel}>Validity Period</Text>
            <Text style={styles.reviewFeeValue}>{activeSelectedPost?.validity || '1 Year'}</Text>
          </View>
        </View>

        {/* Member Particulars */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Applicant Details</Text>
          <Text style={styles.reviewItem}>Full Name: <Text style={styles.reviewValue}>{fullName || 'Not specified'}</Text></Text>
          <Text style={styles.reviewItem}>Mobile: <Text style={styles.reviewValue}>+91 {mobileNumber || 'Not specified'}</Text></Text>
          {email ? <Text style={styles.reviewItem}>Email: <Text style={styles.reviewValue}>{email}</Text></Text> : null}
          <Text style={styles.reviewItem}>Gender: <Text style={styles.reviewValue}>{gender}</Text></Text>
          {dob ? <Text style={styles.reviewItem}>DOB: <Text style={styles.reviewValue}>{dob}</Text></Text> : null}
          <Text style={styles.reviewItem}>Qualification: <Text style={styles.reviewValue}>{qualification}</Text></Text>
        </View>

        {/* Address & Police Station */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Address & Jurisdiction</Text>
          <Text style={styles.reviewItem}>
            Address: <Text style={styles.reviewValue}>{[addressLine1, addressLine2, city, stateName, pincode].filter(Boolean).join(', ') || 'Not specified'}</Text>
          </Text>
          {policeStation ? (
            <Text style={styles.reviewItem}>Police Station: <Text style={styles.reviewValue}>{policeStation}</Text></Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Top Admin Header */}
      <AdminHeader
        onNavigate={(target: string) => {
          if (onNavigate) onNavigate(target);
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        {/* Navigation Breadcrumb / Back Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackNavigation}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={20} color="#06294D" />
            <Text style={styles.backText}>
              {currentStep === 1 ? 'Members Directory' : `Step ${currentStep - 1}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5-Step Stepper Bar */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperRow}>
            {STEP_LABELS.map((item, idx) => {
              const isActive = currentStep === item.step;
              const isPast = currentStep > item.step;

              return (
                <React.Fragment key={item.step}>
                  <View style={styles.stepperItem}>
                    <View
                      style={[
                        styles.stepperCircle,
                        isActive && styles.stepperCircleActive,
                        isPast && styles.stepperCirclePast,
                      ]}
                    >
                      {isPast ? (
                        <Check size={13} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <Text
                          style={[
                            styles.stepperNumber,
                            isActive && styles.stepperNumberActive,
                          ]}
                        >
                          {item.step}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepperLabel,
                        isActive && styles.stepperLabelActive,
                        isPast && styles.stepperLabelPast,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {idx < STEP_LABELS.length - 1 && (
                    <View
                      style={[
                        styles.stepperLine,
                        currentStep > item.step && styles.stepperLineActive,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrap}>
              {/* Page Title Block */}
              <View style={styles.pageTitleBlock}>
                <Text style={styles.pageTitle}>Add New Member</Text>
                <Text style={styles.pageSubtitle}>
                  Register a new member with membership details
                </Text>
              </View>

              {/* Render Current Step */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Bottom Navigation Area */}
        <View style={styles.bottomNavArea}>
          <TouchableOpacity
            style={styles.bottomBackBtn}
            onPress={handleBackNavigation}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomBackBtnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomNextBtn, isSubmitting && styles.bottomNextBtnDisabled]}
            onPress={currentStep === 5 ? handleFinalSubmit : handleNextStep}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#011F39" />
            ) : (
              <>
                <Text style={styles.bottomNextBtnText}>
                  {currentStep === 5 ? 'Submit Application' : 'Next'}
                </Text>
                {currentStep < 5 && (
                  <ArrowRight size={18} color="#011F39" strokeWidth={2.4} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Native-feeling Android Bottom Sheet for Dropdowns */}
        <Modal
          visible={Boolean(activeDropdown)}
          transparent
          animationType="slide"
          onRequestClose={() => setActiveDropdown(null)}
        >
          <TouchableWithoutFeedback onPress={() => setActiveDropdown(null)}>
            <View style={styles.sheetBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.sheetContent}>
                  <View style={styles.sheetHandle} />

                  {/* 1. Category Dropdown Modal */}
                  {activeDropdown === 'category' && (
                    <>
                      <Text style={styles.sheetTitle}>Select Category</Text>
                      <Text style={styles.sheetSubtitle}>
                        Choose from the three membership tiers
                      </Text>

                      <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                        {MAIN_CATEGORIES.map((cat) => {
                          const isSelected = selectedCategory === cat.id;
                          const IconComp = cat.icon;
                          return (
                            <TouchableOpacity
                              key={cat.id}
                              style={[
                                styles.sheetOptionItem,
                                isSelected && styles.sheetOptionItemSelected,
                              ]}
                              onPress={() => handleSelectCategory(cat.id)}
                              testID={`category-option-${cat.id}`}
                              accessibilityRole="button"
                              accessibilityLabel={cat.title}
                            >
                              <View style={styles.sheetOptionIconBox}>
                                <IconComp size={18} color="#06294D" />
                              </View>
                              <View style={styles.sheetOptionLeft}>
                                <Text style={styles.sheetOptionName}>{cat.title}</Text>
                                <Text style={styles.sheetOptionMeta}>{cat.subtitle}</Text>
                              </View>
                              {isSelected && (
                                <View style={styles.sheetOptionCheck}>
                                  <Check size={16} color="#16A34A" strokeWidth={3} />
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </>
                  )}

                  {/* 2. Membership Post Dropdown Modal */}
                  {activeDropdown === 'post' && (
                    <>
                      <Text style={styles.sheetTitle}>Select Membership Post</Text>
                      <Text style={styles.sheetSubtitle}>
                        Available posts for {selectedCategory || 'Selected Category'}
                      </Text>

                      <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                        {availablePosts.map((opt) => {
                          const isSelected = selectedMembershipPost?.id === opt.id;
                          return (
                            <TouchableOpacity
                              key={opt.id}
                              style={[
                                styles.sheetOptionItem,
                                isSelected && styles.sheetOptionItemSelected,
                              ]}
                              onPress={() => handleSelectMembershipPost(opt)}
                              testID={`membership-post-option-${opt.id}`}
                              accessibilityRole="button"
                              accessibilityLabel={opt.postName}
                            >
                              <View style={styles.sheetOptionLeft}>
                                <Text style={styles.sheetOptionName}>{opt.postName}</Text>
                                <Text style={styles.sheetOptionMeta}>
                                  {opt.qualification} · {opt.validity}
                                </Text>
                              </View>
                              <View style={styles.sheetOptionRight}>
                                <Text style={styles.sheetOptionFee}>{opt.fee}</Text>
                                {isSelected && (
                                  <Check size={16} color="#16A34A" strokeWidth={3} />
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Date of Birth Picker Modal */}
        <DatePickerModal
          visible={dobPickerVisible}
          value={dob}
          title="Select Date of Birth"
          onSelect={(selected) => {
            setDob(selected);
            setDobPickerVisible(false);
          }}
          onClose={() => setDobPickerVisible(false)}
          maxYear={new Date().getFullYear()}
          minYear={1930}
        />
      </SafeAreaView>
    </View>
  );
};

export default AddMemberScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    backgroundColor: '#FAF7F0',
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  stepperItem: {
    alignItems: 'center',
    width: 60,
  },
  stepperCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepperCircleActive: {
    backgroundColor: '#FAD465',
    borderColor: '#FAD465',
  },
  stepperCirclePast: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  stepperNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepperNumberActive: {
    color: '#011F39',
    fontWeight: '800',
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepperLabelActive: {
    color: '#011F39',
    fontWeight: '700',
  },
  stepperLabelPast: {
    color: '#06294D',
    fontWeight: '600',
  },
  stepperLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  stepperLineActive: {
    backgroundColor: '#06294D',
  },
  keyboardContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
  contentWrap: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  pageTitleBlock: {
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: -0.2,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  stepContent: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    ...Shadows.card,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numberedCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberedCircleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
  },
  cardHeaderCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#06294D',
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  requiredStar: {
    color: '#DC2626',
    fontWeight: '700',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  dropdownButtonSelected: {
    borderColor: '#06294D',
    backgroundColor: '#F8FAFC',
  },
  dropdownButtonError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  dropdownText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  dropdownTextSelected: {
    color: '#06294D',
    fontWeight: '700',
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  fieldHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  postDetailsCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 4,
  },
  postDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  postDetailsTitleCol: {
    flex: 1,
  },
  postDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
  },
  postDetailsCategoryTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 1,
  },
  postValidityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  postValidityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  postMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  postMetricItem: {
    flex: 1,
    gap: 2,
  },
  postMetricItemWide: {
    flex: 1.4,
    gap: 2,
  },
  postMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 6,
  },
  postMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  postMetricValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#06294D',
  },
  postMetricFee: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  benefitsSection: {
    gap: 6,
  },
  benefitsTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#06294D',
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  benefitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDFAF2',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  benefitText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#15803D',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColRowStacked: {
    flexDirection: 'column',
    gap: 10,
  },
  col: {
    flex: 1,
    gap: 4,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#06294D',
  },
  helperText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  inputBoxError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#06294D',
    paddingVertical: 0,
  },
  countryCodePill: {
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    color: '#06294D',
  },
  datePlaceholder: {
    color: '#94A3B8',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  docIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfoCol: {
    flex: 1,
  },
  docTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#06294D',
  },
  docSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  docUploadBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docUploadBtnSuccess: {
    backgroundColor: '#16A34A',
  },
  reviewPlanBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  reviewPlanTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0369A1',
  },
  reviewFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewFeeLabel: {
    fontSize: 12,
    color: '#475569',
  },
  reviewFeeValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewSection: {
    gap: 4,
    paddingTop: 4,
  },
  reviewSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  reviewItem: {
    fontSize: 12,
    color: '#64748B',
  },
  reviewValue: {
    color: '#06294D',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },
  errorTextCenter: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomNavArea: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    ...Shadows.card,
  },
  bottomBackBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#06294D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
  },
  bottomNextBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#FAD465',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Shadows.card,
  },
  bottomNextBtnDisabled: {
    opacity: 0.6,
  },
  bottomNextBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#011F39',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '65%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#06294D',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  sheetScroll: {
    marginTop: 4,
  },
  sheetOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 8,
  },
  sheetOptionItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  sheetOptionLeft: {
    flex: 1,
  },
  sheetOptionName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#06294D',
  },
  sheetOptionMeta: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  sheetOptionFee: {
    fontSize: 14,
    fontWeight: '800',
    color: '#06294D',
    marginLeft: 8,
  },
  sheetOptionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sheetOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetOptionCheck: {
    marginLeft: 8,
  },
});
