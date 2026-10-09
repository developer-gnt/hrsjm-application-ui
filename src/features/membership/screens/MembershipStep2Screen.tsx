import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import type { AppStackParamList } from '../../../core/navigation/types';
import { useMembership } from '../context/MembershipContext';
import { MembershipTopBar } from '../components/MembershipTopBar';
import { MembershipProgressBar } from '../components/MembershipProgressBar';
import { AppBottomSheet } from '../../../core/components/common/AppBottomSheet';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

interface AddressErrors {
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const STATE_CITIES: Record<string, string[]> = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai'],
  'Delhi NCR': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Dwarka', 'Rohini', 'Noida', 'Gurugram'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davangere', 'Ballari', 'Kalaburagi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Ghaziabad', 'Meerut', 'Bareilly', 'Aligarh'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
  Haryana: ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Durg'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Kashipur'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
};

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'United Arab Emirates', 'Singapore', 'Australia'];

export function MembershipStep2Screen() {
  const navigation = useNavigation<NavProp>();
  const { addressInfo, updateAddressInfo } = useMembership();

  const [errors, setErrors] = useState<AddressErrors>({});
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // Derived cities based on selected state
  const availableCities = addressInfo.state
    ? STATE_CITIES[addressInfo.state] || ['Central Area', 'North District', 'South District', 'Main City']
    : ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow'];

  const filteredStates = INDIAN_STATES.filter(st =>
    st.toLowerCase().includes(stateSearch.trim().toLowerCase())
  );

  const filteredCities = availableCities.filter(c =>
    c.toLowerCase().includes(citySearch.trim().toLowerCase())
  );

  const validateForm = (): boolean => {
    const newErrors: AddressErrors = {};

    // 1. Address Line 1
    if (!addressInfo.addressLine1 || addressInfo.addressLine1.trim().length === 0) {
      newErrors.addressLine1 = 'Address line 1 is required';
    } else if (addressInfo.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Address must be at least 5 characters';
    }

    // 2. City
    if (!addressInfo.city || addressInfo.city.trim().length === 0) {
      newErrors.city = 'Please select or enter city';
    }

    // 3. State
    if (!addressInfo.state || addressInfo.state.trim().length === 0) {
      newErrors.state = 'Please select a state';
    }

    // 4. Pincode (6 digits in India)
    if (!addressInfo.pincode || addressInfo.pincode.trim().length === 0) {
      newErrors.pincode = 'Pincode is required';
    } else {
      const cleanPincode = addressInfo.pincode.replace(/[^0-9]/g, '');
      if (cleanPincode.length !== 6) {
        newErrors.pincode = 'Must be a valid 6-digit pincode';
      }
    }

    // 5. Country
    if (!addressInfo.country || addressInfo.country.trim().length === 0) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      navigation.navigate('MembershipStep3Documents');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MembershipTopBar showBack onBackPress={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Main Title */}
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>Apply for Membership</Text>
          </View>

          {/* 3-Step Progress Bar (Step 2 Active) */}
          <MembershipProgressBar currentStep={2} />

          {/* Section Heading */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            <Text style={styles.sectionSubtitle}>
              Please provide your current address details.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* 1. Address Line 1 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Address Line 1 <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  errors.addressLine1 ? styles.inputError : undefined,
                ]}>
                <Icon name="map-pin" size={18} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your address line 1"
                  placeholderTextColor="#94A3B8"
                  value={addressInfo.addressLine1}
                  onChangeText={text => {
                    updateAddressInfo({ addressLine1: text });
                    if (errors.addressLine1)
                      setErrors(prev => ({ ...prev, addressLine1: undefined }));
                  }}
                  accessibilityLabel="Address Line 1"
                />
              </View>
              <Text style={styles.helperText}>House no., Building, Street name</Text>
              {errors.addressLine1 ? (
                <Text style={styles.errorText}>{errors.addressLine1}</Text>
              ) : null}
            </View>

            {/* 2. Address Line 2 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address Line 2</Text>
              <View style={styles.inputWrap}>
                <Icon name="map-pin" size={18} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your address line 2"
                  placeholderTextColor="#94A3B8"
                  value={addressInfo.addressLine2 || ''}
                  onChangeText={text => updateAddressInfo({ addressLine2: text })}
                  accessibilityLabel="Address Line 2"
                />
              </View>
              <Text style={styles.helperText}>Area, Landmark (Optional)</Text>
            </View>

            {/* 3. City & State Row (2 Columns with Dropdown Selectors) */}
            <View style={styles.rowTwoCols}>
              {/* City Dropdown */}
              <View style={[styles.fieldGroup, styles.col]}>
                <Text style={styles.fieldLabel}>
                  City <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputWrap,
                    errors.city ? styles.inputError : undefined,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setCitySearch('');
                    setCityModalVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`City, ${addressInfo.city || 'Enter city'}`}>
                  <Icon name="building" size={16} color="#64748B" strokeWidth={2} />
                  <Text
                    style={[
                      styles.selectText,
                      !addressInfo.city && styles.placeholderText,
                    ]}
                    numberOfLines={1}>
                    {addressInfo.city || 'Enter city'}
                  </Text>
                  <Icon name="chevron-down" size={14} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
                {errors.city ? (
                  <Text style={styles.errorText}>{errors.city}</Text>
                ) : null}
              </View>

              {/* State Dropdown */}
              <View style={[styles.fieldGroup, styles.col]}>
                <Text style={styles.fieldLabel}>
                  State <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputWrap,
                    errors.state ? styles.inputError : undefined,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setStateSearch('');
                    setStateModalVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`State, ${addressInfo.state || 'Select state'}`}>
                  <Icon name="building" size={16} color="#64748B" strokeWidth={2} />
                  <Text
                    style={[
                      styles.selectText,
                      !addressInfo.state && styles.placeholderText,
                    ]}
                    numberOfLines={1}>
                    {addressInfo.state || 'Select state'}
                  </Text>
                  <Icon name="chevron-down" size={14} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
                {errors.state ? (
                  <Text style={styles.errorText}>{errors.state}</Text>
                ) : null}
              </View>
            </View>

            {/* 4. Pincode & Country Row (2 Columns with Country Dropdown) */}
            <View style={styles.rowTwoCols}>
              {/* Pincode */}
              <View style={[styles.fieldGroup, styles.col]}>
                <Text style={styles.fieldLabel}>
                  Pincode <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    errors.pincode ? styles.inputError : undefined,
                  ]}>
                  <Icon name="grid" size={16} color="#64748B" strokeWidth={2} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter pincode"
                    placeholderTextColor="#94A3B8"
                    value={addressInfo.pincode}
                    onChangeText={text => {
                      updateAddressInfo({ pincode: text });
                      if (errors.pincode) setErrors(prev => ({ ...prev, pincode: undefined }));
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    accessibilityLabel="Pincode"
                  />
                </View>
                {errors.pincode ? (
                  <Text style={styles.errorText}>{errors.pincode}</Text>
                ) : null}
              </View>

              {/* Country Dropdown */}
              <View style={[styles.fieldGroup, styles.col]}>
                <Text style={styles.fieldLabel}>
                  Country <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.inputWrap}
                  activeOpacity={0.8}
                  onPress={() => setCountryModalVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Country, ${addressInfo.country || 'India'}`}>
                  <Icon name="globe" size={16} color="#64748B" strokeWidth={2} />
                  <Text style={styles.selectText}>{addressInfo.country || 'India'}</Text>
                  <Icon name="chevron-down" size={14} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Buttons (Back & Continue) */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.8}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Back to Personal Information">
              <Icon name="chevron-left" size={18} color={colors.primary} strokeWidth={2.4} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueBtn}
              activeOpacity={0.85}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to Document Upload">
              <Text style={styles.continueBtnText}>Continue</Text>
              <Icon name="arrow-right" size={18} color={colors.white} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* City Selection Bottom Sheet */}
      <AppBottomSheet
        visible={cityModalVisible}
        title={addressInfo.state ? `Select City (${addressInfo.state})` : 'Select City'}
        onClose={() => setCityModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.searchBarWrap}>
            <Icon name="search" size={16} color="#64748B" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search or enter city..."
              placeholderTextColor="#94A3B8"
              value={citySearch}
              onChangeText={setCitySearch}
              autoCorrect={false}
            />
            {citySearch.trim().length > 0 && (
              <TouchableOpacity
                style={styles.customAddBtn}
                onPress={() => {
                  updateAddressInfo({ city: citySearch.trim() });
                  if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
                  setCityModalVisible(false);
                }}>
                <Text style={styles.customAddText}>Use "{citySearch.trim()}"</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.optionsList}>
              {filteredCities.map(c => {
                const isSelected = addressInfo.city === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      updateAddressInfo({ city: c });
                      if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
                      setCityModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}>
                      {c}
                    </Text>
                    {isSelected && (
                      <Icon name="check" size={18} color={colors.primary} strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </AppBottomSheet>

      {/* State Selection Bottom Sheet */}
      <AppBottomSheet
        visible={stateModalVisible}
        title="Select State"
        onClose={() => setStateModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.searchBarWrap}>
            <Icon name="search" size={16} color="#64748B" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search state..."
              placeholderTextColor="#94A3B8"
              value={stateSearch}
              onChangeText={setStateSearch}
              autoCorrect={false}
            />
          </View>

          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.optionsList}>
              {filteredStates.map(st => {
                const isSelected = addressInfo.state === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      updateAddressInfo({ state: st, city: '' }); // reset city when state changes
                      if (errors.state) setErrors(prev => ({ ...prev, state: undefined }));
                      setStateModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}>
                      {st}
                    </Text>
                    {isSelected && (
                      <Icon name="check" size={18} color={colors.primary} strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </AppBottomSheet>

      {/* Country Selection Bottom Sheet */}
      <AppBottomSheet
        visible={countryModalVisible}
        title="Select Country"
        onClose={() => setCountryModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.optionsList}>
            {COUNTRIES.map(ctry => {
              const isSelected = (addressInfo.country || 'India') === ctry;
              return (
                <TouchableOpacity
                  key={ctry}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    updateAddressInfo({ country: ctry });
                    setCountryModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                    {ctry}
                  </Text>
                  {isSelected && (
                    <Icon name="check" size={18} color={colors.primary} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </AppBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.card,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 3,
  },
  titleSection: {
    marginBottom: spacing.xs,
  },
  screenTitle: {
    ...serif,
    fontSize: 26,
    fontWeight: '700',
    color: '#16274B',
    letterSpacing: -0.3,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16274B',
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 3,
  },
  formContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  requiredStar: {
    color: colors.danger,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: 8,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#FFF8F8',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#16274B',
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  selectText: {
    flex: 1,
    fontSize: 13.5,
    color: '#16274B',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  errorText: {
    fontSize: 11.5,
    color: colors.danger,
    fontWeight: '600',
    marginLeft: 2,
    marginTop: 2,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: '#D4DEF0',
    borderRadius: radius.md,
    height: 48,
    gap: 6,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  continueBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2860',
    borderRadius: radius.md,
    height: 48,
    gap: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  modalContainer: {
    paddingBottom: spacing.lg,
    maxHeight: 440,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    gap: 8,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#16274B',
  },
  customAddBtn: {
    backgroundColor: '#EAF1FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  customAddText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  listScroll: {
    maxHeight: 340,
  },
  optionsList: {
    gap: spacing.xs + 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F8FAFD',
    borderRadius: radius.sm,
  },
  optionItemSelected: {
    backgroundColor: '#EAF1FE',
  },
  optionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default MembershipStep2Screen;
