import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usersStore } from '../services/usersStore';
import { UserItem, UserType, UserStatus, UserGender } from '../types/user.types';
import { UsersHeader } from '../components/UsersHeader';
import { UsersBottomNav } from '../components/UsersBottomNav';
import { DobDatePickerModal } from '../../../auth/components/DobDatePickerModal';
import {
  UserOutlineIcon,
  MailOutlineIcon,
  ChevronLeftIcon,
  CalendarOutlineIcon,
} from '../../../auth/components/AuthIcons';

interface EditUserScreenProps {
  userId?: string;
  onBack?: () => void;
  onSuccess?: (updatedUser: UserItem) => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
  status?: string;
}

const USER_TYPE_OPTIONS: { label: string; value: UserType }[] = [
  { label: 'Member', value: 'member' },
  { label: 'Donation Seeker', value: 'seeker' },
  { label: 'Donor', value: 'donor' },
  { label: 'General User', value: 'general' },
];

const STATUS_OPTIONS: { label: string; value: UserStatus; color: string }[] = [
  { label: 'Active', value: 'active', color: '#059669' },
  { label: 'Pending', value: 'pending', color: '#D97706' },
  { label: 'Blocked', value: 'blocked', color: '#DC2626' },
];

const GENDER_OPTIONS: UserGender[] = ['Male', 'Female', 'Other'];

export const EditUserScreen: React.FC<EditUserScreenProps> = ({
  userId,
  onBack,
  onSuccess,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();

  const user = userId ? usersStore.getUserById(userId) : undefined;

  // Extract phone number and country code from existing user
  const initialCountryCode = user?.phone?.startsWith('+')
    ? user.phone.split(' ')[0]
    : '+91';
  const initialPhoneDigits = user?.phone?.startsWith('+')
    ? user.phone.slice(initialCountryCode.length).trim()
    : user?.phone || '';

  // Form Field States pre-populated with user data
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [phone, setPhone] = useState(initialPhoneDigits);
  const [userType, setUserType] = useState<UserType>(user?.userType || 'general');
  const [status, setStatus] = useState<UserStatus>(user?.status || 'active');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState<UserGender | ''>(user?.gender || '');
  const [address, setAddress] = useState(user?.address || '');
  const [remarks, setRemarks] = useState(user?.remarks || user?.notes || '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatarUrl);

  // Modals
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDobModal, setShowDobModal] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<FormErrors>({});

  if (!user) {
    return (
      <View style={styles.screen}>
        <UsersHeader
          paddingTop={insets.top}
          onMenuPress={onMenuPress}
          onNotificationsPress={onNotificationsPress}
          onProfilePress={onProfilePress}
        />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>User Not Found</Text>
          <Text style={styles.notFoundMessage}>
            Cannot edit user because the record could not be found.
          </Text>
          <TouchableOpacity
            style={styles.backLinkBtn}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to Users list"
          >
            <ChevronLeftIcon size={16} color="#FFFFFF" />
            <Text style={styles.backLinkBtnText}>Return to Users List</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavHost}>
          <UsersBottomNav
            bottomInset={insets.bottom}
            activeKey="users"
            onTabPress={onBottomTabPress}
          />
        </View>
      </View>
    );
  }

  const validate = (): boolean => {
    const err: FormErrors = {};

    // 1. Full Name
    if (!fullName.trim()) {
      err.name = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      err.name = 'Full name must be at least 2 characters';
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      err.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      err.email = 'Please enter a valid email address';
    }

    // 3. Phone Number
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      err.phone = 'Phone number is required';
    } else if (phoneDigits.length < 10) {
      err.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSaveChanges = () => {
    if (!validate()) {
      return;
    }

    const formattedPhone = `${countryCode} ${phone.trim()}`;
    const updated = usersStore.updateUser(user.id, {
      name: fullName.trim(),
      email: email.trim(),
      phone: formattedPhone,
      userType,
      status,
      dob: dob.trim() || undefined,
      gender: (gender as UserGender) || undefined,
      address: address.trim() || undefined,
      remarks: remarks.trim() || undefined,
      notes: remarks.trim() || undefined,
      avatarUrl: avatarUri,
    });

    if (updated && onSuccess) {
      onSuccess(updated);
    } else if (onBack) {
      onBack();
    }
  };

  const handleReset = () => {
    setFullName(user.name);
    setEmail(user.email);
    setCountryCode(initialCountryCode);
    setPhone(initialPhoneDigits);
    setUserType(user.userType || 'general');
    setStatus(user.status || 'active');
    setDob(user.dob || '');
    setGender(user.gender || '');
    setAddress(user.address || '');
    setRemarks(user.remarks || user.notes || '');
    setAvatarUri(user.avatarUrl);
    setErrors({});
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    }
  };

  const getUserTypeLabel = (val: UserType) => {
    const found = USER_TYPE_OPTIONS.find(o => o.value === val);
    return found ? found.label : 'Select user type';
  };

  const getStatusLabel = (val: UserStatus) => {
    const found = STATUS_OPTIONS.find(o => o.value === val);
    return found ? found.label : 'Select status';
  };

  const getStatusColor = (val: UserStatus) => {
    const found = STATUS_OPTIONS.find(o => o.value === val);
    return found ? found.color : '#059669';
  };

  const formatDobDisplay = (val?: string) => {
    if (!val) return 'Select date';
    if (/[a-zA-Z]/.test(val)) return val;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split('-');
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const month = months[parseInt(m, 10) - 1] || m;
      return `${parseInt(d, 10)} ${month} ${y}`;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
      const [d, m, y] = val.split('-');
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const month = months[parseInt(m, 10) - 1] || m;
      return `${parseInt(d, 10)} ${month} ${y}`;
    }
    return val;
  };

  const initials = (user.name || 'User')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.screen}>
      <UsersHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back link matching Image 1: "← Back to User Details" */}
          <TouchableOpacity
            style={styles.backLink}
            onPress={handleCancel}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cancel edit user"
          >
            <ChevronLeftIcon size={16} color="#0F2860" />
            <Text style={styles.backLinkText}>Back to User Details</Text>
          </TouchableOpacity>

          {/* Page Heading & Subtitle matching Image 1 */}
          <Text style={styles.pageTitle}>Edit User</Text>
          <Text style={styles.pageSubtitle}>
            Update user information and save changes.
          </Text>

          {/* Profile Summary Header matching Image 1: Un-carded circular avatar + Name, Email, Phone */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrap}>
              {avatarUri || user.avatarUrl ? (
                <Image source={{ uri: avatarUri || user.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitialsText}>{initials}</Text>
                </View>
              )}
            </View>
            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileHeaderName} numberOfLines={1}>
                {fullName || user.name}
              </Text>
              <Text style={styles.profileHeaderEmail} numberOfLines={1}>
                {email || user.email}
              </Text>
              <Text style={styles.profileHeaderPhone} numberOfLines={1}>
                {phone ? `${countryCode} ${phone}` : user.phone}
              </Text>
            </View>
          </View>

          {/* Form Fields Stack matching Image 1 */}
          <View style={styles.formStack}>
            {/* Field 1: Full Name * */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Full Name <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.name && styles.inputContainerError,
                ]}
              >
                <View style={styles.fieldIconWrap}>
                  <UserOutlineIcon size={18} color="#64748B" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter full name"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={t => {
                    setFullName(t);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  autoCapitalize="words"
                  accessibilityLabel="Edit Full Name input"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Field 2: Email Address * */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Email Address <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.email && styles.inputContainerError,
                ]}
              >
                <View style={styles.fieldIconWrap}>
                  <MailOutlineIcon size={18} color="#64748B" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter email address"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Edit Email Address input"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Field 3: Phone Number * */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Phone Number <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.phone && styles.inputContainerError,
                ]}
              >
                <View style={styles.fieldIconWrap}>
                  <Text style={styles.phoneIcon}>📳</Text>
                </View>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <Text style={styles.chevronSmall}>▾</Text>
                </View>
                <View style={styles.verticalDivider} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={t => {
                    setPhone(t);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  keyboardType="phone-pad"
                  accessibilityLabel="Edit Phone Number input"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Field 4: User Type * */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                User Type <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowUserTypeModal(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Edit User Type selector"
              >
                <View style={styles.fieldIconWrap}>
                  <Text style={styles.badgeIcon}>🔒</Text>
                </View>
                <Text style={styles.selectText} numberOfLines={1}>
                  {getUserTypeLabel(userType)}
                </Text>
                <Text style={styles.chevronIcon}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Field 5 & 6 (Row): Date of Birth & Gender matching Image 1 */}
            <View style={styles.twoColumnRow}>
              {/* Date of Birth */}
              <View style={styles.columnHalf}>
                <Text style={styles.fieldLabel}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDobModal(true)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Edit Date of Birth selector"
                >
                  <View style={styles.fieldIconWrapSmall}>
                    <CalendarOutlineIcon size={16} color="#64748B" />
                  </View>
                  <Text
                    style={[
                      styles.selectText,
                      !dob && styles.selectPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {formatDobDisplay(dob)}
                  </Text>
                  <Text style={styles.calendarRightIcon}>📅</Text>
                </TouchableOpacity>
              </View>

              {/* Gender */}
              <View style={styles.columnHalf}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowGenderModal(true)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Edit Gender selector"
                >
                  <Text
                    style={[
                      styles.selectText,
                      !gender && styles.selectPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {gender || 'Select gender'}
                  </Text>
                  <Text style={styles.chevronIcon}>▾</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Field 7: Address matching Image 1 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address</Text>
              <View style={styles.inputContainer}>
                <View style={styles.fieldIconWrap}>
                  <Text style={styles.docIcon}>📄</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter address"
                  placeholderTextColor="#94A3B8"
                  value={address}
                  onChangeText={setAddress}
                  accessibilityLabel="Edit Address input"
                />
              </View>
            </View>

            {/* Field 8: Status * matching Image 1 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Status <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowStatusModal(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Edit Account Status selector"
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(status) },
                  ]}
                />
                <Text style={styles.selectText} numberOfLines={1}>
                  {getStatusLabel(status)}
                </Text>
                <Text style={styles.chevronIcon}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Field 9: Profile Image Card matching Image 1 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Profile Image</Text>
              <View style={styles.profileImageCard}>
                <View style={styles.profileCardAvatarWrap}>
                  {avatarUri || user.avatarUrl ? (
                    <Image
                      source={{ uri: avatarUri || user.avatarUrl }}
                      style={styles.profileCardAvatarImg}
                    />
                  ) : (
                    <View style={styles.profileCardAvatarFallback}>
                      <Text style={styles.profileCardAvatarInitials}>
                        {initials}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.profileCardTextWrap}>
                  <Text style={styles.profileCardTitle}>
                    Tap to change profile photo
                  </Text>
                  <Text style={styles.profileCardSubtitle}>
                    JPG, PNG (Max 5 MB)
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.profileUploadBtn}
                  onPress={() => {
                    // Simulated photo update fallback for demo
                    setAvatarUri(
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                    );
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Change profile photo"
                >
                  <Text style={styles.profileUploadBtnIcon}>🖼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Action Buttons: [ Reset ] and [ ✓ Save Changes ] matching Image 1 */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleReset}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Reset form"
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveChanges}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Save Changes"
              >
                <Text style={styles.saveBtnCheck}>✓</Text>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* User Type Selection Modal */}
      <Modal
        visible={showUserTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserTypeModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowUserTypeModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <Text style={styles.pickerSheetTitle}>Select User Type</Text>
                {USER_TYPE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.pickerItem,
                      userType === opt.value && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setUserType(opt.value);
                      setShowUserTypeModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        userType === opt.value && styles.pickerItemTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {userType === opt.value && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowStatusModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <Text style={styles.pickerSheetTitle}>Select Account Status</Text>
                {STATUS_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.pickerItem,
                      status === opt.value && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setStatus(opt.value);
                      setShowStatusModal(false);
                    }}
                  >
                    <View style={styles.statusOptionRow}>
                      <View
                        style={[
                          styles.statusDotSmall,
                          { backgroundColor: opt.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.pickerItemText,
                          status === opt.value && styles.pickerItemTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    {status === opt.value && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGenderModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerSheet}>
                <Text style={styles.pickerSheetTitle}>Select Gender</Text>
                {GENDER_OPTIONS.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.pickerItem,
                      gender === g && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setGender(g);
                      setShowGenderModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        gender === g && styles.pickerItemTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                    {gender === g && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* DOB Date Picker Modal */}
      <DobDatePickerModal
        visible={showDobModal}
        selectedDate={dob}
        onClose={() => setShowDobModal(false)}
        onSelectDate={d => {
          setDob(d);
          setShowDobModal(false);
        }}
      />

      {/* Bottom Nav Host */}
      <View style={styles.bottomNavHost}>
        <UsersBottomNav
          bottomInset={insets.bottom}
          activeKey="users"
          onTabPress={onBottomTabPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2860',
    marginLeft: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
  },
  // Profile Summary Header matching Image 1
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#EEF2F6',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  profileHeaderInfo: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  profileHeaderName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: 3,
  },
  profileHeaderEmail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  profileHeaderPhone: {
    fontSize: 13,
    color: '#64748B',
  },
  // Form stack
  formStack: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldIconWrap: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIconWrapSmall: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
  },
  phoneIcon: {
    fontSize: 14,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  chevronSmall: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 4,
  },
  verticalDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 10,
  },
  badgeIcon: {
    fontSize: 14,
  },
  docIcon: {
    fontSize: 14,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  selectPlaceholder: {
    color: '#94A3B8',
  },
  chevronIcon: {
    fontSize: 12,
    color: '#0F2860',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  columnHalf: {
    flex: 1,
  },
  calendarRightIcon: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Profile Image upload card matching Image 1
  profileImageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileCardAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileCardAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  profileCardAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardAvatarInitials: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  profileCardTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  profileCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
  profileCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  profileUploadBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileUploadBtnIcon: {
    fontSize: 16,
  },
  // Bottom Action Buttons matching Image 1
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#0F2860',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerSheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pickerItemActive: {
    backgroundColor: '#F0F4FA',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: '#0F2860',
    fontWeight: '700',
  },
  checkMark: {
    fontSize: 16,
    color: '#0F2860',
    fontWeight: '700',
  },
  // Not found
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F2860',
    marginBottom: 8,
  },
  notFoundMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  backLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2860',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  backLinkBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
