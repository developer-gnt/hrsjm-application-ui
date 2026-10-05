/**
 * HRSJM membership ID card — exact recreation of the approved
 * reference design. This is the single source of truth for the card:
 * the My Profile inline preview, the My ID Card detail page and the
 * downloadable PDF (`utils/idCardDocument.ts`) all derive from it.
 *
 * Layout (top to bottom):
 *   crest logo + HRSJM + full name + Hindi subtitle
 *   member photo | name, membership type | Active badge
 *   icon info rows (Member ID / DOB / Member Since / Valid Till) |
 *   right column: QR → "Scan QR for verification" → HRSJM MEMBER
 *   badge → tagline
 *   gold footer strip — HUMAN RIGHTS | SOCIAL JUSTICE | EQUALITY |
 *   EMPOWERMENT
 *
 * All sizing derives from the rendered `width`, so the same component
 * scales from the small profile preview to the large detail page
 * without redesign.
 */
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AdminColors } from '../../../../core';
import { AdminProfile } from '../types/profile.types';
import { QrCode } from './QrCode';
import {
  CrestLogo,
  CalendarIcon,
  StarIcon,
  BadgeCheckIcon,
  PersonIcon,
} from './ProfileIcons';
import { initialsOf } from '../utils/format';

interface MyIdCardProps {
  profile: AdminProfile;
  /** Rendered card width; height follows the reference ratio. */
  width: number;
  style?: ViewStyle;
}

export const MyIdCard: React.FC<MyIdCardProps> = ({ profile, width, style }) => {
  const height = width * 0.86;
  const pad = width * 0.045;
  const footerHeight = width * 0.062;

  const photoWidth = width * 0.15;
  const photoHeight = photoWidth * 1.25;
  const nameSize = Math.max(13, width * 0.058);
  const typeSize = Math.max(9, width * 0.04);
  const rowLabelSize = Math.max(7.5, width * 0.032);
  const rowValueSize = Math.max(8.5, width * 0.036);
  const qrSize = width * 0.185;
  const footerTextSize = Math.max(5.5, width * 0.026);

  const infoRows: Array<{
    key: string;
    label: string;
    value: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'memberId',
      label: 'Member ID',
      value: profile.memberId,
      icon: <PersonIcon size={width * 0.032} color={AdminColors.textOnDark} />,
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      value: profile.dateOfBirth,
      icon: <CalendarIcon size={width * 0.032} color={AdminColors.textOnDark} />,
    },
    {
      key: 'since',
      label: 'Member Since',
      value: profile.memberSince,
      icon: <StarIcon size={width * 0.032} color={AdminColors.accentGold} />,
    },
    {
      key: 'valid',
      label: 'Valid Till',
      value: profile.validTill,
      icon: (
        <BadgeCheckIcon
          size={width * 0.032}
          color={AdminColors.textOnDark}
        />
      ),
    },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          width,
          height,
          borderRadius: width * 0.045,
        },
        style,
      ]}
    >
      {/* ── Subtle decorative background (upper-right treatment) ─────── */}
      <View
        pointerEvents="none"
        style={[
          styles.decoBand,
          {
            width: width * 1.1,
            height: width * 0.22,
            top: -width * 0.06,
            right: -width * 0.35,
            transform: [{ rotate: '-24deg' }],
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.decoBand,
          {
            width: width * 0.9,
            height: width * 0.14,
            top: width * 0.1,
            right: -width * 0.3,
            transform: [{ rotate: '-24deg' }],
          },
        ]}
      />
      {/* ── Header: crest + HRSJM + full name + Hindi ─────────────────── */}
      <View style={[styles.headerRow, { padding: pad, paddingBottom: pad * 0.45 }]}>
        <CrestLogo size={width * 0.082} />
        <View style={[styles.headerIdentity, { marginLeft: pad * 0.55 }]}>
          <Text
            style={[styles.headerBrand, { fontSize: Math.max(12, width * 0.056) }]}
          >
            HRSJM
          </Text>
          <Text
            style={[
              styles.headerFullName,
              { fontSize: Math.max(5, width * 0.021) },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION
          </Text>
          <Text
            style={[
              styles.headerHindi,
              { fontSize: Math.max(5, width * 0.021) },
            ]}
            numberOfLines={1}
          >
            मानव अधिकार · सामाजिक न्याय
          </Text>
        </View>
      </View>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <View style={[styles.mainArea, { paddingHorizontal: pad, paddingBottom: pad * 0.4 }]}>
        {/* Photo + name + membership type + Active badge */}
        <View style={styles.identityRow}>
          <View
            style={[
              styles.photo,
              {
                width: photoWidth,
                height: photoHeight,
                borderRadius: width * 0.02,
                borderWidth: Math.max(1.5, width * 0.007),
              },
            ]}
          >
            <Text
              style={[
                styles.photoInitials,
                { fontSize: Math.max(9, width * 0.05) },
              ]}
            >
              {initialsOf(profile.fullName)}
            </Text>
          </View>

          <View style={[styles.identityText, { marginLeft: pad * 0.5 }]}>
            <Text
              style={[styles.name, { fontSize: nameSize }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {profile.fullName}
            </Text>
            <Text
              style={[styles.membershipType, { fontSize: typeSize }]}
              numberOfLines={1}
            >
              {profile.membershipType}
            </Text>
          </View>

          <View
            style={[
              styles.activeBadge,
              {
                paddingHorizontal: width * 0.026,
                paddingVertical: width * 0.012,
                borderRadius: width * 0.018,
              },
            ]}
          >
            <Text
              style={[
                styles.activeBadgeText,
                { fontSize: Math.max(7, width * 0.03) },
              ]}
            >
              {profile.accountStatus}
            </Text>
          </View>
        </View>

        {/* Info rows (left) + QR column (right) */}
        <View style={[styles.detailRow, { marginTop: height * 0.03 }]}>
          <View style={styles.infoRowsColumn}>
            {infoRows.map(row => (
              <View
                key={row.key}
                style={[styles.infoRow, { marginBottom: height * 0.026 }]}
              >
                <View style={styles.infoIcon}>{row.icon}</View>
                <Text
                  style={[styles.infoLabel, { fontSize: rowLabelSize }]}
                  numberOfLines={1}
                >
                  {row.label}
                </Text>
                <Text
                  style={[styles.infoValue, { fontSize: rowValueSize }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.qrColumn, { marginLeft: pad * 0.5 }]}>
            <QrCode size={qrSize} data={profile.memberId} />
            <Text
              style={[
                styles.qrCaption,
                {
                  fontSize: Math.max(6, width * 0.026),
                  lineHeight: Math.max(8, width * 0.034),
                },
              ]}
              numberOfLines={2}
            >
              Scan QR for{'\n'}verification
            </Text>
            <View
              style={[
                styles.memberBadge,
                {
                  borderWidth: 1,
                  borderColor: AdminColors.accentGold,
                  paddingHorizontal: width * 0.024,
                  paddingVertical: width * 0.011,
                  borderRadius: width * 0.016,
                  marginTop: height * 0.012,
                },
              ]}
            >
              <Text
                style={[
                  styles.memberBadgeText,
                  { fontSize: Math.max(6.5, width * 0.028) },
                ]}
              >
                HRSJM MEMBER
              </Text>
            </View>
            <Text
              style={[
                styles.tagline,
                {
                  fontSize: Math.max(6, width * 0.025),
                  lineHeight: Math.max(8, width * 0.032),
                  marginTop: height * 0.01,
                },
              ]}
              numberOfLines={2}
            >
              Together for a Fairer,{'\n'}More Just Society
            </Text>
          </View>
        </View>
      </View>

      {/* ── Gold footer strip ──────────────────────────────────────────── */}
      <View style={[styles.goldFooter, { height: footerHeight }]}>
        {['HUMAN RIGHTS', 'SOCIAL JUSTICE', 'EQUALITY', 'EMPOWERMENT'].map(
          (item, index) => (
            <View key={item} style={styles.footerItem}>
              {index > 0 && <View style={styles.footerDivider} />}
              <Text
                style={[styles.footerText, { fontSize: footerTextSize }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {item}
              </Text>
            </View>
          ),
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.primaryDark,
    overflow: 'hidden',
  },
  decoBand: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderRadius: 999,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIdentity: {
    flex: 1,
    justifyContent: 'center',
  },
  headerBrand: {
    fontWeight: '800',
    color: AdminColors.textOnDark,
    letterSpacing: 0.4,
  },
  headerFullName: {
    fontWeight: '700',
    color: AdminColors.textOnDark,
    letterSpacing: 0.2,
    marginTop: 1,
  },
  headerHindi: {
    color: AdminColors.accentGold,
    marginTop: 1,
  },
  mainArea: {
    flex: 1,
    paddingBottom: 0,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    backgroundColor: AdminColors.primaryLight,
    borderColor: AdminColors.textOnDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitials: {
    fontWeight: '800',
    color: AdminColors.primary,
  },
  identityText: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: '800',
    color: AdminColors.textOnDark,
  },
  membershipType: {
    color: AdminColors.accentGold,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: AdminColors.statusActive,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    color: AdminColors.textOnDark,
    fontWeight: '700',
  },
  detailRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowsColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    color: AdminColors.accentGold,
    marginLeft: 8,
    flexShrink: 0,
    width: '37%',
  },
  infoValue: {
    color: AdminColors.textOnDark,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'left',
  },
  qrColumn: {
    alignItems: 'center',
  },
  qrCaption: {
    color: AdminColors.textOnDark,
    textAlign: 'center',
    marginTop: 3,
  },
  memberBadge: {
    backgroundColor: 'transparent',
  },
  memberBadgeText: {
    color: AdminColors.textOnDark,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  tagline: {
    color: AdminColors.textOnDark,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  goldFooter: {
    backgroundColor: AdminColors.accentGold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  footerDivider: {
    width: 1,
    height: '55%',
    backgroundColor: 'rgba(15, 40, 96, 0.35)',
    marginRight: 6,
  },
  footerText: {
    color: AdminColors.primaryDark,
    fontWeight: '700',
    flexShrink: 1,
  },
});

export default MyIdCard;
