import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { AdminColors } from '../../../../core';
import { AdminProfile } from '../types/profile.types';
import { QrCode } from './QrCode';
import { CrestLogo } from './ProfileIcons';

// Background asset — official HRSJM background image
const ID_CARD_BG = require('../../../../assets/id_card_bg.png');

interface MyIdCardProps {
  profile: AdminProfile;
  /** Rendered card width; height follows the reference ratio. */
  width: number;
  style?: ViewStyle;
}

export const MyIdCard: React.FC<MyIdCardProps> = ({ profile, width, style }) => {
  // Exact aspect ratio of physical standard ID card (w: 85.6mm, h: 54mm ≈ 1.585)
  const height = width / 1.585;
  const radius = width * 0.04;

  // Sizing tokens scaled to width
  const padH = width * 0.045;
  const padV = height * 0.05;

  // Header cream shape with curve
  const headerWidth = width * 0.72;
  const headerHeight = height * 0.32;
  const headerCurveRadius = width * 0.055;
  const goldLineWidth = Math.max(1.5, width * 0.005);

  const crestSize = width * 0.11;
  const brandSize = Math.max(11, width * 0.038);
  const subtitleSize = Math.max(6, width * 0.021);
  const hindiSize = Math.max(7, width * 0.024);

  const badgeFontSize = Math.max(7.5, width * 0.025);

  const nameSize = Math.max(13, width * 0.044);
  const memberTypeSize = Math.max(8.5, width * 0.027);
  const infoLabelSize = Math.max(7.5, width * 0.024);
  const infoValueSize = Math.max(8, width * 0.025);

  const qrSize = width * 0.18;
  const tapToViewSize = Math.max(6.5, width * 0.02);

  return (
    <View
      style={[
        styles.card,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <ImageBackground
        source={ID_CARD_BG}
        style={styles.fullBg}
        imageStyle={[styles.fullBgImage, { borderRadius: radius }]}
        resizeMode="cover"
      >
        {/* ── HEADER CREAM SHAPE (Gold curve border) ────────────────── */}
        <View
          style={[
            styles.headerCreamShape,
            {
              width: headerWidth,
              height: headerHeight,
              borderBottomRightRadius: headerCurveRadius,
              borderBottomWidth: goldLineWidth,
              borderRightWidth: goldLineWidth,
            },
          ]}
        >
          <View
            style={[
              styles.headerContent,
              {
                paddingLeft: padH,
                paddingRight: width * 0.03,
                paddingTop: padV,
                paddingBottom: padV * 0.6,
              },
            ]}
          >
            {/* Crest Logo */}
            <CrestLogo size={crestSize} />

            {/* Identity Text */}
            <View style={[styles.headerIdentity, { marginLeft: width * 0.022 }]}>
              <Text
                style={[styles.brandText, { fontSize: brandSize }]}
                numberOfLines={1}
              >
                HRSJM
              </Text>
              <Text
                style={[styles.subtitleText, { fontSize: subtitleSize }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
              </Text>
              <Text
                style={[styles.hindiText, { fontSize: hindiSize }]}
                numberOfLines={1}
              >
                <Text style={styles.hindiWord}>मानव अधिकार</Text>
                <Text style={styles.hindiDot}> · </Text>
                <Text style={styles.hindiWord}>सामाजिक न्याय</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── ACTIVE BADGE (top right over navy background) ──────────── */}
        <View
          style={[
            styles.activeBadge,
            {
              top: height * 0.065,
              right: padH,
              paddingHorizontal: width * 0.026,
              paddingVertical: height * 0.012,
              borderRadius: width * 0.025,
            },
          ]}
        >
          <Text style={[styles.activeBadgeText, { fontSize: badgeFontSize }]}>
            {profile.accountStatus}
          </Text>
        </View>

        {/* ── CARD BODY (Name, Membership Type, Info Rows, QR Code) ──── */}
        <View
          style={[
            styles.bodyContainer,
            {
              paddingHorizontal: padH,
              paddingBottom: height * 0.055,
              paddingTop: headerHeight + height * 0.04,
            },
          ]}
        >
          {/* Left Column: Name, Type, Info Rows */}
          <View style={styles.bodyLeft}>
            {/* Member Name */}
            <Text
              style={[styles.memberName, { fontSize: nameSize }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {profile.fullName}
            </Text>

            {/* Membership Type */}
            <Text
              style={[styles.memberType, { fontSize: memberTypeSize }]}
              numberOfLines={1}
            >
              {profile.membershipType}
            </Text>

            {/* Info Rows */}
            <View style={[styles.infoRows, { marginTop: height * 0.035 }]}>
              <InfoRow
                label="Member ID"
                value={profile.memberId}
                labelSize={infoLabelSize}
                valueSize={infoValueSize}
                rowMarginBottom={height * 0.022}
              />
              <InfoRow
                label="Valid Till"
                value={profile.validTill}
                labelSize={infoLabelSize}
                valueSize={infoValueSize}
                rowMarginBottom={height * 0.022}
              />
              <InfoRow
                label="Joined On"
                value={profile.memberSince}
                labelSize={infoLabelSize}
                valueSize={infoValueSize}
                rowMarginBottom={0}
              />
            </View>
          </View>

          {/* Right Column: QR Code + Tap to View */}
          <View style={styles.bodyRight}>
            <View
              style={[
                styles.qrWrapper,
                {
                  borderRadius: width * 0.022,
                  padding: width * 0.012,
                },
              ]}
            >
              <QrCode size={qrSize} data={profile.memberId} />
            </View>
            <Text style={[styles.tapToView, { fontSize: tapToViewSize }]}>
              Tap to View
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

/**
 * Single info row: "Label  :  Value"
 */
interface InfoRowProps {
  label: string;
  value: string;
  labelSize: number;
  valueSize: number;
  rowMarginBottom: number;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  labelSize,
  valueSize,
  rowMarginBottom,
}) => (
  <View style={[styles.infoRow, { marginBottom: rowMarginBottom }]}>
    <Text style={[styles.infoLabel, { fontSize: labelSize }]} numberOfLines={1}>
      {label}
    </Text>
    <Text style={[styles.infoColon, { fontSize: labelSize }]}> : </Text>
    <Text
      style={[styles.infoValue, { fontSize: valueSize }]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: AdminColors.primaryDark,
  },

  fullBg: {
    width: '100%',
    height: '100%',
  },
  fullBgImage: {},

  // ── Header cream shape with gold curve border ──────────────────────────
  headerCreamShape: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#FAF5EA',
    borderBottomColor: '#CAA048',
    borderRightColor: '#CAA048',
    overflow: 'hidden',
    zIndex: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  headerIdentity: {
    flex: 1,
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: 'serif',
    fontWeight: '900',
    color: '#082046',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontWeight: '800',
    color: '#082046',
    letterSpacing: 0.15,
    marginTop: 1,
  },
  hindiText: {
    fontWeight: '700',
    marginTop: 1.5,
  },
  hindiWord: {
    color: '#082046',
  },
  hindiDot: {
    color: '#CAA048',
    fontWeight: '900',
  },

  // ── Active badge (positioned on top right over navy) ───────────────────
  activeBadge: {
    position: 'absolute',
    backgroundColor: '#1E6539',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Body content ──────────────────────────────────────────────────────
  bodyContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bodyLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  memberName: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  memberType: {
    color: '#E5B842',
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  infoRows: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#FFFFFF',
    width: '32%',
    fontWeight: '400',
  },
  infoColon: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  infoValue: {
    color: '#FFFFFF',
    fontWeight: '400',
    flex: 1,
  },

  // ── QR column ─────────────────────────────────────────────────────────
  bodyRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToView: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '400',
  },
});

export default MyIdCard;
