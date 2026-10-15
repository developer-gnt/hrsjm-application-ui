/**
 * Small vector-style icons drawn with views so they render identically
 * on every platform (same approach as the receipt action icons). All
 * icons size themselves from a single `size` prop and use percentage
 * layouts internally, so they scale crisply on any screen.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdminColors } from '../../../../core';

interface IconProps {
  size?: number;
  color?: string;
}

const Container: React.FC<{ size: number; children: React.ReactNode }> = ({
  size,
  children,
}) => <View style={{ width: size, height: size }}>{children}</View>;

export const PersonIcon: React.FC<IconProps> = ({ size = 18, color = AdminColors.primary }) => (
  <Container size={size}>
    <View style={styles.center}>
      <View
        style={[
          styles.personHead,
          { backgroundColor: color, width: size * 0.34, height: size * 0.34 },
        ]}
      />
      <View
        style={[
          styles.personBody,
          {
            backgroundColor: color,
            width: size * 0.62,
            height: size * 0.3,
            marginTop: size * 0.06,
          },
        ]}
      />
    </View>
  </Container>
);

export const MailIcon: React.FC<IconProps> = ({ size = 18, color = AdminColors.primary }) => (
  <Container size={size}>
    <View style={styles.center}>
      <View
        style={[
          styles.mailEnvelope,
          {
            width: size * 0.82,
            height: size * 0.58,
            borderColor: color,
            borderRadius: size * 0.12,
          },
        ]}
      >
        <View
          style={[
            styles.mailFlap,
            { backgroundColor: color, width: size * 0.3, marginTop: -size * 0.05 },
          ]}
        />
      </View>
    </View>
  </Container>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 18, color = AdminColors.primary }) => (
  <Container size={size}>
    <View style={styles.center}>
      <View
        style={[
          styles.phoneBody,
          {
            width: size * 0.44,
            height: size * 0.76,
            borderColor: color,
            borderRadius: size * 0.14,
          },
        ]}
      >
        <View
          style={[
            styles.phoneDot,
            { backgroundColor: color, width: size * 0.1, height: size * 0.1 },
          ]}
        />
      </View>
    </View>
  </Container>
);

export const IdCardIcon: React.FC<IconProps> = ({ size = 18, color = AdminColors.primary }) => (
  <Container size={size}>
    <View style={styles.center}>
      <View
        style={[
          styles.idCardBody,
          {
            width: size * 0.84,
            height: size * 0.6,
            borderColor: color,
            borderRadius: size * 0.12,
          },
        ]}
      >
        <View
          style={[
            styles.idCardPhoto,
            { backgroundColor: color, width: size * 0.14, height: size * 0.14 },
          ]}
        />
        <View style={styles.idCardLines}>
          <View
            style={[
              styles.idCardLine,
              { backgroundColor: color, width: size * 0.32 },
            ]}
          />
          <View
            style={[
              styles.idCardLine,
              { backgroundColor: color, width: size * 0.22 },
            ]}
          />
        </View>
      </View>
    </View>
  </Container>
);

export const BuildingIcon: React.FC<IconProps> = ({ size = 18, color = AdminColors.primary }) => (
  <Container size={size}>
    <View style={styles.center}>
      <View
        style={[
          styles.buildingBody,
          {
            width: size * 0.62,
            height: size * 0.74,
            borderColor: color,
            borderRadius: size * 0.06,
          },
        ]}
      >
        <View style={styles.buildingWindows}>
          {[0, 1, 2, 3].map(window => (
            <View
              key={window}
              style={[
                styles.buildingWindow,
                { backgroundColor: color },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  </Container>
);

export const BadgeCheckIcon: React.FC<IconProps> = ({
  size = 18,
  color = AdminColors.statusActive,
}) => (
  <Container size={size}>
    <View style={styles.center}>
      <View
        style={[
          styles.badgeCircle,
          { borderColor: color, width: size * 0.8, height: size * 0.8 },
        ]}
      >
        <Text style={[styles.badgeCheck, { color, fontSize: size * 0.42 }]}>
          ✓
        </Text>
      </View>
    </View>
  </Container>
);

export const ChevronRight: React.FC<IconProps> = ({
  size = 14,
  color = AdminColors.primary,
}) => (
  <Text style={{ color, fontSize: size, fontWeight: '700', lineHeight: size * 1.1 }}>
    ›
  </Text>
);

export const PencilGlyph: React.FC<IconProps> = ({
  size = 12,
  color = AdminColors.primary,
}) => (
  <Text style={{ color, fontSize: size, lineHeight: size * 1.2 }}>✎</Text>
);

export const DownloadIcon: React.FC<IconProps> = ({
  size = 15,
  color = AdminColors.textOnDark,
}) => (
  <View style={[styles.downloadIcon, { width: size, height: size, marginRight: size * 0.4 }]}>
    <Text style={[styles.downloadArrow, { color, fontSize: size * 0.8, lineHeight: size * 0.8 }]}>
      ↓
    </Text>
    <View
      style={[
        styles.downloadTray,
        { borderColor: color, width: size * 0.72, height: size * 0.36 },
      ]}
    />
  </View>
);

export const ShareIcon: React.FC<IconProps> = ({
  size = 15,
  color = AdminColors.primary,
}) => (
  <View style={[styles.shareIcon, { width: size * 1.1, height: size, marginRight: size * 0.4 }]}>
    <View
      style={[
        styles.shareNode,
        { backgroundColor: color, width: size * 0.36, height: size * 0.36, top: 0, left: 0 },
      ]}
    />
    <View
      style={[
        styles.shareNode,
        { backgroundColor: color, width: size * 0.36, height: size * 0.36, bottom: 0, left: 0 },
      ]}
    />
    <View
      style={[
        styles.shareNode,
        { backgroundColor: color, width: size * 0.36, height: size * 0.36, top: size * 0.2, right: 0 },
      ]}
    />
    <View
      style={[
        styles.shareLine,
        { backgroundColor: color, width: size * 0.5, top: size * 0.28, left: size * 0.3, transform: [{ rotate: '-27deg' }] },
      ]}
    />
    <View
      style={[
        styles.shareLine,
        { backgroundColor: color, width: size * 0.5, bottom: size * 0.28, left: size * 0.3, transform: [{ rotate: '27deg' }] },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personHead: {
    borderRadius: 999,
  },
  personBody: {
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  mailEnvelope: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  mailFlap: {
    height: 1.5,
    borderRadius: 1,
    transform: [{ rotate: '90deg' }],
  },
  phoneBody: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: '8%',
  },
  phoneDot: {
    borderRadius: 999,
  },
  idCardBody: {
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '10%',
  },
  idCardPhoto: {
    borderRadius: 2,
  },
  idCardLines: {
    marginLeft: '8%',
    flex: 1,
  },
  idCardLine: {
    height: 1.5,
    borderRadius: 1,
    marginBottom: 3,
  },
  buildingBody: {
    borderWidth: 1.5,
    padding: '10%',
  },
  buildingWindows: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buildingWindow: {
    width: '38%',
    aspectRatio: 1,
    borderRadius: 1,
    marginBottom: '12%',
  },
  badgeCircle: {
    borderWidth: 1.5,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCheck: {
    fontWeight: '800',
  },
  downloadIcon: {
    alignItems: 'center',
  },
  downloadArrow: {
    fontWeight: '700',
  },
  downloadTray: {
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: 1,
  },
  shareIcon: {},
  shareNode: {
    position: 'absolute',
    borderRadius: 999,
  },
  shareLine: {
    position: 'absolute',
    height: 1.5,
  },
  calendarBody: {
    borderWidth: 1.5,
    alignItems: 'center',
    paddingTop: '14%',
  },
  calendarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: '20%',
    marginBottom: 1,
  },
  calendarPin: {
    width: 1.5,
    height: 4,
    borderRadius: 1,
  },
  calendarGrid: {
    height: 1.5,
    alignSelf: 'stretch',
    marginHorizontal: '14%',
    borderRadius: 1,
  },
  starGlyph: {},
  crestShield: {
    borderColor: AdminColors.accentGold,
    backgroundColor: AdminColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AdminColors.accentGold,
    borderRadius: 999,
    backgroundColor: AdminColors.primary,
  },
  crestLetter: {
    fontWeight: '800',
    color: AdminColors.accentGold,
  },
  crestBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: AdminColors.accentGold,
    marginTop: 1,
  },
});

export const CalendarIcon: React.FC<IconProps> = ({ size = 18, color = AdminColors.textOnDark }) => (
  <Container size={size}>
    <View style={styles.center}>
      <View
        style={[
          styles.calendarBody,
          {
            width: size * 0.74,
            height: size * 0.66,
            borderColor: color,
            borderRadius: size * 0.1,
          },
        ]}
      >
        <View style={styles.calendarTopRow}>
          <View style={[styles.calendarPin, { backgroundColor: color }]} />
          <View style={[styles.calendarPin, { backgroundColor: color }]} />
        </View>
        <View style={[styles.calendarGrid, { backgroundColor: color }]} />
      </View>
    </View>
  </Container>
);

export const StarIcon: React.FC<IconProps> = ({ size = 18, color = AdminColors.textOnDark }) => (
  <Container size={size}>
    <View style={styles.center}>
      <Text style={[styles.starGlyph, { color, fontSize: size * 0.8, lineHeight: size * 0.9 }]}>
        ★
      </Text>
    </View>
  </Container>
);

/**
 * HRSJM crest logo — a shield stand-in drawn with views (gold outline,
 * navy fill, gold H) used on the ID card header. Swap with the real
 * brand asset behind the same size/position contract when available.
 */
export const CrestLogo: React.FC<IconProps> = ({ size = 32 }) => (
  <View style={{ width: size, height: size * 1.12, alignItems: 'center' }}>
    <View
      style={[
        styles.crestShield,
        {
          width: size,
          height: size * 1.12,
          borderRadius: size * 0.14,
          borderTopLeftRadius: size * 0.14,
          borderTopRightRadius: size * 0.14,
          borderBottomLeftRadius: size * 0.5,
          borderBottomRightRadius: size * 0.5,
          borderWidth: Math.max(1.5, size * 0.06),
        },
      ]}
    >
      <View style={[styles.crestInner, { margin: size * 0.12 }]}>
        <Text style={[styles.crestLetter, { fontSize: size * 0.44 }]}>H</Text>
        <View style={[styles.crestBar, { width: size * 0.36 }]} />
      </View>
    </View>
  </View>
);
