import React, { useState } from 'react';
import {
  Alert,
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
import { MemberCause, DonationFormData, DonationReceiptResult } from '../types/causes.types';
import { causesService } from '../services/causes.service';
import { useAuthStore } from '../../auth/store/authStore';
import { GlobalPaymentModal, PaymentPayload, PaymentReceiptDetails } from '../../payments';
import { FontFamilies } from '../../../core/theme/typography';
import { CheckCircle2, Lock } from '../../../core/components/icons';

interface MemberDonationModalProps {
  visible: boolean;
  cause: MemberCause | null;
  onClose: () => void;
  onSuccess?: (receipt: DonationReceiptResult) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export const MemberDonationModal: React.FC<MemberDonationModalProps> = ({
  visible,
  cause,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(state => state.user);

  const maxAllowedAmount = cause
    ? Math.max(0, cause.targetAmount - cause.raisedAmount)
    : undefined;

  const defaultInitialAmt = maxAllowedAmount !== undefined && maxAllowedAmount > 0
    ? Math.min(1000, maxAllowedAmount)
    : 1000;

  const [selectedAmount, setSelectedAmount] = useState<number>(defaultInitialAmt);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [panNumber, setPanNumber] = useState<string>('');
  const [phone, setPhone] = useState<string>(user?.mobile_number || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [needReceipt, setNeedReceipt] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [receiptResult, setReceiptResult] = useState<DonationReceiptResult | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentPayload, setPaymentPayload] = useState<PaymentPayload | null>(null);

  if (!cause) return null;

  const currentAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;

  const showExcessAmountAlert = (maxNeeded: number) => {
    Alert.alert(
      'Thank You for Your Support',
      `Thank you for your support! We just need only ₹${maxNeeded.toLocaleString('en-IN')}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedAmount(maxNeeded);
            setIsCustom(false);
            setCustomAmount('');
          },
        },
      ],
    );
  };

  const handleSelectPreset = (amount: number) => {
    if (maxAllowedAmount !== undefined && maxAllowedAmount > 0 && amount > maxAllowedAmount) {
      showExcessAmountAlert(maxAllowedAmount);
      return;
    }
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
  };

  const handleSubmitDonation = async () => {
    if (maxAllowedAmount !== undefined && maxAllowedAmount <= 0) {
      Alert.alert(
        'Goal Reached',
        `Thank you for your support! This cause has already achieved its total goal of ₹${cause.targetAmount.toLocaleString('en-IN')}.`,
        [{ text: 'OK', onPress: onClose }],
      );
      return;
    }

    if (maxAllowedAmount !== undefined && maxAllowedAmount > 0 && currentAmount > maxAllowedAmount) {
      showExcessAmountAlert(maxAllowedAmount);
      return;
    }

    const minRequired = maxAllowedAmount !== undefined && maxAllowedAmount < 50 ? maxAllowedAmount : 50;
    if (currentAmount < minRequired) {
      Alert.alert('Invalid Amount', `Please enter a contribution amount of at least ₹${minRequired}.`);
      return;
    }

    if (!agreeTerms) {
      Alert.alert(
        'Terms & Conditions Required',
        'Please review and agree to the Terms & Conditions (including voluntary & non-refundable donation terms) to proceed.'
      );
      return;
    }

    const payload: PaymentPayload = {
      purpose: 'donation',
      title: cause.title,
      subtitle: 'Human Rights & Social Justice Mission',
      category: cause.category,
      location: cause.location,
      imageUrl: cause.imageUrl,
      amount: currentAmount,
      donorName: user?.full_name || 'HRSJM Supporter',
      donorMobile: phone.trim() || user?.mobile_number || '',
      donorEmail: email.trim() || user?.email || '',
      panNumber: panNumber.trim().toUpperCase() || undefined,
      need80GReceipt: needReceipt,
      entityId: cause.id,
      targetAmount: cause.targetAmount,
      raisedAmount: cause.raisedAmount,
      maxAllowedAmount,
    };

    setPaymentPayload(payload);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (receipt: PaymentReceiptDetails) => {
    setPaymentModalVisible(false);
    const donatedAmount = receipt?.amount || currentAmount;
    causesService.recordDonation(cause?.id, donatedAmount, receipt?.paymentId);
    const formattedReceipt: DonationReceiptResult = {
      receiptNumber: receipt?.receiptNumber || `HRSJM-REC-${Date.now()}`,
      donationId: receipt?.orderId || `DON-${Date.now()}`,
      causeTitle: cause?.title || 'Social Welfare Cause',
      amount: donatedAmount,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentMode: 'Online (Cashfree PG)',
      donorName: user?.full_name || 'HRSJM Donor',
      panNumber: panNumber.trim().toUpperCase() || undefined,
      is80GEligible: Boolean(panNumber && needReceipt),
    };
    setReceiptResult(formattedReceipt);
    onSuccess?.(formattedReceipt);
  };

  const handleCloseAll = () => {
    setReceiptResult(null);
    onClose();
  };

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCloseAll}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <TouchableWithoutFeedback onPress={handleCloseAll}>
          <View style={styles.backdropOverlay} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.modalCard,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {/* Top Handle */}
          <View style={styles.sheetHandle} />

          {receiptResult ? (
            /* Success Receipt View */
            <ScrollView
              contentContainerStyle={styles.successContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.successCheckIcon}>
                <CheckCircle2 size={36} color="#059669" strokeWidth={2} />
              </View>

              <Text style={styles.successTitle}>Thank You for Your Support!</Text>
              <Text style={styles.successSubtitle}>
                Your generous contribution of{' '}
                <Text style={styles.boldAmount}>
                  ₹{Number(receiptResult.amount).toLocaleString('en-IN')}
                </Text>{' '}
                has been successfully received for{' '}
                <Text style={styles.boldCause}>{cause.title}</Text>.
              </Text>

              {/* Receipt Summary Card */}
              <View style={styles.receiptBox}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Receipt Number</Text>
                  <Text style={styles.receiptValue}>
                    {receiptResult.receiptNumber}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transaction Date</Text>
                  <Text style={styles.receiptValue}>{receiptResult.date}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Donor Name</Text>
                  <Text style={styles.receiptValue}>
                    {receiptResult.donorName}
                  </Text>
                </View>
                {receiptResult.panNumber && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>PAN (80G Tax Exemption)</Text>
                    <Text style={styles.receiptValue}>
                      {receiptResult.panNumber}
                    </Text>
                  </View>
                )}
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptTotalLabel}>Total Contributed</Text>
                  <Text style={styles.receiptTotalAmount}>
                    ₹{Number(receiptResult.amount).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={handleCloseAll}
                activeOpacity={0.8}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Donation Input Form */
            <ScrollView
              contentContainerStyle={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Header */}
              <View style={styles.modalHeaderRow}>
                <View style={styles.headerTitleCol}>
                  <Text style={styles.modalPreTitle}>Support this initiative</Text>
                  <Text style={styles.modalCauseTitle} numberOfLines={2}>
                    {cause.title}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Amount Selection Section */}
              <Text style={styles.sectionLabel}>Select Donation Amount (₹)</Text>
              <View style={styles.presetGrid}>
                {PRESET_AMOUNTS.map(amt => {
                  const isSelected = !isCustom && selectedAmount === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.presetChip,
                        isSelected && styles.presetChipActive,
                      ]}
                      onPress={() => handleSelectPreset(amt)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isSelected && styles.presetChipTextActive,
                        ]}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Amount Field */}
              <View
                style={[
                  styles.customAmountBox,
                  isCustom && styles.customAmountBoxActive,
                ]}
              >
                <Text style={styles.rupeePrefix}>₹</Text>
                <TextInput
                  style={styles.customAmountInput}
                  placeholder="Enter other amount (e.g. 2500)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={customAmount}
                  onFocus={handleCustomFocus}
                  onChangeText={val => {
                    setIsCustom(true);
                    setCustomAmount(val.replace(/\D/g, ''));
                  }}
                />
              </View>

              {/* 80G Tax Benefit Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setNeedReceipt(!needReceipt)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    needReceipt && styles.checkboxBoxChecked,
                  ]}
                >
                  {needReceipt && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={styles.checkboxTextCol}>
                  <Text style={styles.checkboxTitle}>
                    I want an 80G Tax Benefit Donation Receipt
                  </Text>
                  <Text style={styles.checkboxSub}>
                    50% tax exemption under Section 80G of Income Tax Act.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* PAN Number (if 80G checked) */}
              {needReceipt && (
                <View style={styles.fieldBlock}>
                  <Text style={styles.inputLabel}>
                    PAN Number <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInputField}
                    placeholder="ABCDE1234F"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                    maxLength={10}
                    value={panNumber}
                    onChangeText={setPanNumber}
                  />
                </View>
              )}

              {/* Contact Info (Pre-filled) */}
              <View style={styles.rowInputs}>
                <View style={styles.halfField}>
                  <Text style={styles.inputLabel}>Mobile</Text>
                  <TextInput
                    style={styles.textInputField}
                    placeholder="+91 9876543210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.inputLabel}>Email (Receipt)</Text>
                  <TextInput
                    style={styles.textInputField}
                    placeholder="aman@gmail.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Terms & Conditions Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    agreeTerms && styles.checkboxBoxChecked,
                  ]}
                >
                  {agreeTerms && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={styles.checkboxTextCol}>
                  <Text style={styles.checkboxTitle}>
                    I agree to the Terms &amp; Conditions *
                  </Text>
                  <Text style={styles.checkboxSub}>
                    Governed by HRSJM Terms, including voluntary and non-refundable contribution policy.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Submit CTA */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (currentAmount < 50 || !agreeTerms) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmitDonation}
                disabled={isSubmitting || currentAmount < 50 || !agreeTerms}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting
                    ? 'Processing...'
                    : `Contribute ₹${currentAmount.toLocaleString('en-IN')} Now`}
                </Text>
              </TouchableOpacity>

              <View style={styles.secureNoticeRow}>
                <Lock size={12} color="#64748B" strokeWidth={2} />
                <Text style={styles.securePaymentNotice}>
                  256-Bit SSL Encrypted & Verified NGO Payment Gateway
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>

    {/* Cashfree Payment Gateway Checkout Modal */}
    <GlobalPaymentModal
      visible={paymentModalVisible}
      payload={paymentPayload}
      initialStage="checkout"
      onClose={() => setPaymentModalVisible(false)}
      onSuccess={handlePaymentSuccess}
    />
    </>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
  },
  backdropOverlay: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 12,
  },
  modalPreTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#C9A227',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalCauseTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2F52',
    marginTop: 2,
    lineHeight: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '700',
  },
  sectionLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    flex: 1,
    minWidth: '22%',
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FAF7F0',
    borderWidth: 1.5,
    borderColor: '#DCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: '#06294D',
    borderColor: '#06294D',
  },
  presetChipText: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2F52',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  customAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DCE4EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  customAmountBoxActive: {
    borderColor: '#06294D',
    backgroundColor: '#FAF7F0',
  },
  rupeePrefix: {
    fontFamily: FontFamilies.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#06294D',
    marginRight: 6,
  },
  customAmountInput: {
    flex: 1,
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF8E6',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#C9A227',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#C9A227',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  checkboxTextCol: {
    flex: 1,
  },
  checkboxTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
    lineHeight: 16,
  },
  checkboxSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
  },
  reqStar: {
    color: '#EF4444',
  },
  textInputField: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#0F172A',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  halfField: {
    flex: 1,
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#DBE5EE',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontFamily: FontFamilies.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#011F39',
    letterSpacing: 0.3,
  },
  secureNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  securePaymentNotice: {
    fontFamily: FontFamilies.sans,
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
  },
  successContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successCheckIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 32,
  },
  successTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#06294D',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontFamily: FontFamilies.sans,
    fontSize: 13,
    color: '#34516D',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  boldAmount: {
    fontWeight: '700',
    color: '#06294D',
  },
  boldCause: {
    fontWeight: '700',
    color: '#06294D',
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#FAF7F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    padding: 16,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    color: '#718096',
  },
  receiptValue: {
    fontFamily: FontFamilies.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2F52',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#DBE5EE',
    marginVertical: 8,
  },
  receiptTotalLabel: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
  },
  receiptTotalAmount: {
    fontFamily: FontFamilies.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#059669',
  },
  doneBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  doneBtnText: {
    fontFamily: FontFamilies.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#011F39',
  },
});
