import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

const GPAY_LOGO = require('../../../assets/logo/gpay_brand.png');
const PHONEPE_LOGO = require('../../../assets/logo/phonepe_brand.png');
const PAYTM_LOGO = require('../../../assets/logo/paytm_brand.png');
const UPI_LOGO = require('../../../assets/logo/upi_brand.png');

/**
 * Official BHIM Tri-Color Chevron Logo
 */
export const BhimFlagLogo: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <Svg width={size * 0.85} height={size} viewBox="0 0 24 28" fill="none">
    {/* Left/Upper Saffron Polygon */}
    <Polygon points="8,2 20,13 13,13 2,2" fill="#F58220" />
    {/* Right/Lower Green Polygon */}
    <Polygon points="13,11 24,22 17,22 6,11" fill="#008752" />
  </Svg>
);

/**
 * Official UPI Logo (Unified Payments Interface from Wikimedia)
 */
export const UpiBrandLogo: React.FC<{ size?: number; width?: number; height?: number }> = ({
  size,
  width,
  height = 22,
}) => {
  const actualHeight = size || height;
  const actualWidth = width || actualHeight * 2.7;
  return (
    <Image
      source={UPI_LOGO}
      style={{ width: actualWidth, height: actualHeight }}
      resizeMode="contain"
    />
  );
};

/**
 * Screenshot 1: GPay App Icon (Exact Google Pay Logo)
 */
export const GPayAppLogo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Image
    source={GPAY_LOGO}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);

/**
 * Screenshot 1: PhonePe App Icon (Exact PhonePe Purple Logo)
 */
export const PhonePeAppLogo: React.FC<{ size?: number }> = ({ size = 38 }) => (
  <Image
    source={PHONEPE_LOGO}
    style={{ width: size, height: size, borderRadius: size / 2 }}
    resizeMode="contain"
  />
);

/**
 * Screenshot 1: Paytm App Icon (Exact Paytm Logo)
 */
export const PaytmAppLogo: React.FC<{ size?: number; height?: number }> = ({
  size = 38,
  height,
}) => {
  const actualSize = height ? height * 1.6 : size;
  return (
    <Image
      source={PAYTM_LOGO}
      style={{ width: actualSize, height: actualSize, borderRadius: actualSize / 2 }}
      resizeMode="contain"
    />
  );
};

/**
 * Screenshot 1: BHIM App Icon (Vibrant orange & green triangles)
 */
export const BhimAppLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <Svg width={size * 0.85} height={size} viewBox="0 0 24 28" fill="none">
    {/* Left/Top Orange Triangle */}
    <Polygon points="8,2 20,13 13,13 2,2" fill="#F58220" />
    {/* Right/Bottom Green Triangle */}
    <Polygon points="13,11 24,22 17,22 6,11" fill="#008752" />
  </Svg>
);

/**
 * Google 4-Color Logo + Text (for inline use)
 */
export const GPayBrandLogo: React.FC<{ height?: number }> = ({ height = 20 }) => (
  <View style={styles.brandRow}>
    <Image
      source={GPAY_LOGO}
      style={{ width: height * 1.2, height: height * 1.2 }}
      resizeMode="contain"
    />
    <Text style={styles.gpayText}>Pay</Text>
  </View>
);

/**
 * PhonePe Purple Logo + Name
 */
export const PhonePeBrandLogo: React.FC<{ height?: number }> = ({ height = 20 }) => (
  <View style={styles.brandRow}>
    <Image
      source={PHONEPE_LOGO}
      style={{ width: height, height: height, borderRadius: height / 2 }}
      resizeMode="contain"
    />
    <Text style={styles.phonePeText}>PhonePe</Text>
  </View>
);

/**
 * Paytm Logo + Name
 */
export const PaytmBrandLogo: React.FC<{ height?: number }> = ({ height = 18 }) => (
  <View style={styles.brandRow}>
    <Image
      source={PAYTM_LOGO}
      style={{ width: height * 1.4, height: height * 1.4, borderRadius: (height * 1.4) / 2 }}
      resizeMode="contain"
    />
    <Text style={styles.paytmText}>Paytm</Text>
  </View>
);

/**
 * BHIM Logo + Text
 */
export const BhimBrandLogo: React.FC<{ height?: number }> = ({ height = 20 }) => (
  <View style={styles.brandRow}>
    <BhimAppLogo size={height * 1.1} />
    <Text style={styles.bhimText}>BHIM</Text>
  </View>
);

/**
 * Official Visa Logo in Dark Navy/Blue
 */
export const VisaBadge: React.FC<{ height?: number }> = ({ height = 14 }) => (
  <View style={styles.visaContainer}>
    <Text style={[styles.visaText, { fontSize: height }]}>VISA</Text>
  </View>
);

/**
 * Official Mastercard Interlocking Red & Orange Circles
 */
export const MastercardBadge: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <Svg width={size * 1.5} height={size} viewBox="0 0 36 24">
    <Circle cx="12" cy="12" r="10" fill="#EB001B" />
    <Circle cx="24" cy="12" r="10" fill="#F79E1B" opacity="0.88" />
    <Path
      d="M18 5.6A10 10 0 0 0 14 12a10 10 0 0 0 4 6.4A10 10 0 0 0 22 12a10 10 0 0 0-4-6.4z"
      fill="#FF5F00"
    />
  </Svg>
);

/**
 * Official RuPay Logo in Navy and Green
 */
export const RupayBadge: React.FC<{ height?: number }> = ({ height = 13 }) => (
  <View style={styles.rupayContainer}>
    <Text style={[styles.rupayText, { fontSize: height }]}>RuPay</Text>
    <Svg width={height * 0.8} height={height} viewBox="0 0 14 16">
      <Polygon points="2,2 12,8 2,14" fill="#097939" />
      <Polygon points="0,4 8,8 0,12" fill="#FF671F" />
    </Svg>
  </View>
);

/**
 * Screenshot 2: Vector Credit / Debit Card Icon
 */
export const CardVectorIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#0F2454',
}) => (
  <Svg width={size} height={size * 0.75} viewBox="0 0 32 24" fill="none">
    <Rect
      x="1.5"
      y="2"
      width="29"
      height="20"
      rx="3.5"
      stroke={color}
      strokeWidth="2"
      fill="#FFFFFF"
    />
    <Rect x="1.5" y="6.5" width="29" height="4" fill={color} />
    <Rect x="4" y="14" width="6" height="4" rx="1" fill="#F59E0B" />
    <Rect x="13" y="15" width="13" height="2" rx="1" fill="#CBD5E1" />
  </Svg>
);

/**
 * Screenshot 2: Vector Bank Pillars Icon
 */
export const BankVectorIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#0F2454',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Roof pediment */}
    <Polygon points="12,2 2,7 22,7" fill={color} />
    {/* Architrave */}
    <Rect x="3" y="7" width="18" height="2" fill={color} />
    {/* Columns */}
    <Rect x="4" y="10" width="2.5" height="8" rx="0.5" fill={color} />
    <Rect x="8.5" y="10" width="2.5" height="8" rx="0.5" fill={color} />
    <Rect x="13" y="10" width="2.5" height="8" rx="0.5" fill={color} />
    <Rect x="17.5" y="10" width="2.5" height="8" rx="0.5" fill={color} />
    {/* Base */}
    <Rect x="2" y="19" width="20" height="2.5" rx="0.5" fill={color} />
  </Svg>
);

/**
 * Screenshot 2: Vector Wallets Icon
 */
export const WalletVectorIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#0F2454',
}) => (
  <Svg width={size} height={size * 0.85} viewBox="0 0 26 22" fill="none">
    {/* Wallet outline */}
    <Rect
      x="1.5"
      y="3"
      width="23"
      height="16"
      rx="3.5"
      stroke={color}
      strokeWidth="2"
      fill="#FFFFFF"
    />
    {/* Top card slip */}
    <Path
      d="M5 3V1.8A1.8 1.8 0 0 1 6.8 0h12.4A1.8 1.8 0 0 1 21 1.8V3"
      stroke={color}
      strokeWidth="1.6"
    />
    {/* Flap pocket on right */}
    <Path
      d="M15 7.5h8.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H15a3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5z"
      fill="#FFFFFF"
      stroke={color}
      strokeWidth="1.8"
    />
    {/* Snap button */}
    <Circle cx="19" cy="11" r="1.5" fill={color} />
  </Svg>
);

/**
 * Screenshot 2: Vector Shield Icon for Secure Payment
 */
export const SecureShieldVectorIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 26,
  color = '#1E40AF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Shield contour */}
    <Path
      d="M12 2.5L4 5.8v6.2c0 5.2 3.4 9.8 8 10.7 4.6-.9 8-5.5 8-10.7V5.8L12 2.5z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill="#EFF6FF"
    />
    {/* Checkmark inside */}
    <Path
      d="M8.5 12.2l2.3 2.3 4.7-4.7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Screenshot 2: Radio Button (Amber circle when selected, grey outline when unselected)
 */
export const PaymentRadioButton: React.FC<{ selected: boolean }> = ({ selected }) => (
  <View
    style={[
      styles.radioCircle,
      selected ? styles.radioCircleSelected : styles.radioCircleUnselected,
    ]}
  >
    {selected && <View style={styles.radioInnerDot} />}
  </View>
);

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpayText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#5F6368',
    marginLeft: 2,
  },
  phonePeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    fontWeight: '800',
    color: '#5F259F',
    letterSpacing: -0.2,
  },
  paytmText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    fontWeight: '900',
    color: '#002970',
    letterSpacing: -0.3,
  },
  bhimText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  visaContainer: {
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    fontFamily: 'Poppins-Bold',
    fontWeight: '900',
    color: '#1A1F71',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  rupayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rupayText: {
    fontFamily: 'Poppins-Bold',
    fontWeight: '900',
    color: '#0F2860',
    letterSpacing: -0.2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderWidth: 2,
    borderColor: '#EAA43A',
    backgroundColor: '#FFFFFF',
  },
  radioCircleUnselected: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  radioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EAA43A',
  },
});
