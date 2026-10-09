import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

const Container: React.FC<{ size: number; children: React.ReactNode }> = ({ size, children }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </View>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.42,
        height: size * 0.42,
        borderLeftWidth: 2.2,
        borderBottomWidth: 2.2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginLeft: size * 0.12,
      }}
    />
  </Container>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.52,
        height: size * 0.52,
        borderRadius: size * 0.26,
        borderWidth: 2,
        borderColor: color,
        marginTop: -size * 0.12,
        marginLeft: -size * 0.12,
      }}
    />
    <View
      style={{
        width: size * 0.32,
        height: 2,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
        bottom: size * 0.18,
        right: size * 0.16,
        borderRadius: 1,
      }}
    />
  </Container>
);

// Community / Be Part of a Cause Icon
export const CommunityIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    {/* Center person head */}
    <View
      style={{
        width: size * 0.32,
        height: size * 0.32,
        borderRadius: size * 0.16,
        borderWidth: 1.6,
        borderColor: color,
        position: 'absolute',
        top: size * 0.08,
      }}
    />
    {/* Left person head */}
    <View
      style={{
        width: size * 0.24,
        height: size * 0.24,
        borderRadius: size * 0.12,
        borderWidth: 1.4,
        borderColor: color,
        position: 'absolute',
        top: size * 0.16,
        left: size * 0.06,
      }}
    />
    {/* Right person head */}
    <View
      style={{
        width: size * 0.24,
        height: size * 0.24,
        borderRadius: size * 0.12,
        borderWidth: 1.4,
        borderColor: color,
        position: 'absolute',
        top: size * 0.16,
        right: size * 0.06,
      }}
    />
    {/* Center person body */}
    <View
      style={{
        width: size * 0.5,
        height: size * 0.26,
        borderTopLeftRadius: size * 0.2,
        borderTopRightRadius: size * 0.2,
        borderWidth: 1.6,
        borderColor: color,
        position: 'absolute',
        bottom: size * 0.08,
      }}
    />
    {/* Left person shoulder */}
    <View
      style={{
        width: size * 0.34,
        height: size * 0.2,
        borderTopLeftRadius: size * 0.16,
        borderWidth: 1.4,
        borderRightWidth: 0,
        borderColor: color,
        position: 'absolute',
        bottom: size * 0.06,
        left: size * 0.02,
      }}
    />
    {/* Right person shoulder */}
    <View
      style={{
        width: size * 0.34,
        height: size * 0.2,
        borderTopRightRadius: size * 0.16,
        borderWidth: 1.4,
        borderLeftWidth: 0,
        borderColor: color,
        position: 'absolute',
        bottom: size * 0.06,
        right: size * 0.02,
      }}
    />
  </Container>
);

// Access Resources / Book Icon
export const BookResourcesIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        flexDirection: 'row',
        width: size * 0.82,
        height: size * 0.62,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Left Page */}
      <View
        style={{
          width: size * 0.38,
          height: size * 0.56,
          borderWidth: 1.8,
          borderColor: color,
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
          borderRightWidth: 1,
        }}
      />
      {/* Center Spine */}
      <View
        style={{
          width: 1.8,
          height: size * 0.56,
          backgroundColor: color,
        }}
      />
      {/* Right Page */}
      <View
        style={{
          width: size * 0.38,
          height: size * 0.56,
          borderWidth: 1.8,
          borderColor: color,
          borderTopRightRadius: 3,
          borderBottomRightRadius: 3,
          borderLeftWidth: 1,
        }}
      />
    </View>
  </Container>
);

// Participate in Events / Megaphone Icon
export const MegaphoneEventsIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    {/* Cone */}
    <View
      style={{
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: size * 0.24,
        borderRightWidth: size * 0.5,
        borderBottomWidth: size * 0.24,
        borderTopColor: 'transparent',
        borderRightColor: color,
        borderBottomColor: 'transparent',
        position: 'absolute',
        left: size * 0.16,
        top: size * 0.2,
      }}
    />
    {/* Base mouthpiece */}
    <View
      style={{
        width: size * 0.14,
        height: size * 0.3,
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.12,
        top: size * 0.33,
      }}
    />
    {/* Sound waves arc */}
    <View
      style={{
        width: size * 0.22,
        height: size * 0.44,
        borderRightWidth: 2,
        borderColor: color,
        borderTopRightRadius: size * 0.2,
        borderBottomRightRadius: size * 0.2,
        position: 'absolute',
        right: size * 0.1,
        top: size * 0.26,
      }}
    />
  </Container>
);

// Make a Real Impact / Heart in Hand Icon
export const ImpactHeartIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    {/* Heart symbol on top */}
    <View
      style={{
        width: size * 0.44,
        height: size * 0.4,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: size * 0.1,
      }}
    >
      <View
        style={{
          width: size * 0.2,
          height: size * 0.3,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.1,
          borderTopRightRadius: size * 0.1,
          transform: [{ rotate: '-45deg' }],
          position: 'absolute',
          left: size * 0.08,
        }}
      />
      <View
        style={{
          width: size * 0.2,
          height: size * 0.3,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.1,
          borderTopRightRadius: size * 0.1,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          right: size * 0.08,
        }}
      />
    </View>

    {/* Holding hands line / cradle below */}
    <View
      style={{
        width: size * 0.62,
        height: size * 0.26,
        borderBottomLeftRadius: size * 0.18,
        borderBottomRightRadius: size * 0.18,
        borderWidth: 1.8,
        borderColor: color,
        borderTopWidth: 0,
        position: 'absolute',
        bottom: size * 0.14,
      }}
    />
  </Container>
);

// Phase 3: Individual Member Icon (User Outline)
export const IndividualMemberIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.38,
        height: size * 0.38,
        borderRadius: size * 0.19,
        borderWidth: 1.8,
        borderColor: color,
      }}
    />
    <View
      style={{
        width: size * 0.64,
        height: size * 0.3,
        borderTopLeftRadius: size * 0.22,
        borderTopRightRadius: size * 0.22,
        borderWidth: 1.8,
        borderColor: color,
        borderBottomWidth: 0,
        marginTop: size * 0.08,
      }}
    />
  </Container>
);

// Phase 3: Student Member Icon (Group/Student)
export const StudentMemberIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    {/* Cap / Crown line */}
    <View
      style={{
        width: size * 0.5,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.12,
      }}
    />
    {/* Head */}
    <View
      style={{
        width: size * 0.34,
        height: size * 0.34,
        borderRadius: size * 0.17,
        borderWidth: 1.6,
        borderColor: color,
        position: 'absolute',
        top: size * 0.14,
      }}
    />
    {/* Body */}
    <View
      style={{
        width: size * 0.58,
        height: size * 0.32,
        borderTopLeftRadius: size * 0.2,
        borderTopRightRadius: size * 0.2,
        borderWidth: 1.6,
        borderColor: color,
        position: 'absolute',
        bottom: size * 0.1,
      }}
    />
  </Container>
);

// Phase 3: Professional Member Icon (Briefcase)
export const ProfessionalMemberIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    {/* Briefcase Handle */}
    <View
      style={{
        width: size * 0.32,
        height: size * 0.16,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderWidth: 1.6,
        borderBottomWidth: 0,
        borderColor: color,
        position: 'absolute',
        top: size * 0.1,
      }}
    />
    {/* Briefcase Body */}
    <View
      style={{
        width: size * 0.72,
        height: size * 0.48,
        borderRadius: 4,
        borderWidth: 1.8,
        borderColor: color,
        position: 'absolute',
        bottom: size * 0.16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: '100%',
          height: 1.4,
          backgroundColor: color,
        }}
      />
    </View>
  </Container>
);

// Phase 3: Small Category Arrow Right Indicator
export const CategoryArrowRightIcon: React.FC<IconProps> = ({ size = 14, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.38,
        height: size * 0.38,
        borderTopWidth: 1.8,
        borderRightWidth: 1.8,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginLeft: -size * 0.1,
      }}
    />
  </Container>
);

// Phase 4: Main CTA Arrow Right Icon
export const CtaArrowRightIcon: React.FC<IconProps> = ({ size = 18, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.6,
        height: 2.2,
        backgroundColor: color,
        borderRadius: 1,
        position: 'absolute',
      }}
    />
    <View
      style={{
        width: size * 0.38,
        height: size * 0.38,
        borderTopWidth: 2.2,
        borderRightWidth: 2.2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
        right: size * 0.18,
      }}
    />
  </Container>
);

// Green Checklist Checkmark Circle
export const GreenCheckIcon: React.FC<IconProps> = ({ size = 14, color = '#059669' }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.34,
        height: size * 0.52,
        borderBottomWidth: 1.6,
        borderRightWidth: 1.6,
        borderColor: '#FFFFFF',
        transform: [{ rotate: '45deg' }],
        marginTop: -size * 0.1,
      }}
    />
  </View>
);

// Calendar / Duration Icon
export const CalendarDurationIcon: React.FC<IconProps> = ({ size = 16, color = '#1E40AF' }) => (
  <Container size={size}>
    {/* Top Binder Pins */}
    <View
      style={{
        flexDirection: 'row',
        gap: size * 0.3,
        position: 'absolute',
        top: size * 0.08,
      }}
    >
      <View style={{ width: 1.8, height: size * 0.18, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 1.8, height: size * 0.18, backgroundColor: color, borderRadius: 1 }} />
    </View>
    {/* Body */}
    <View
      style={{
        width: size * 0.76,
        height: size * 0.68,
        borderRadius: 2.5,
        borderWidth: 1.4,
        borderColor: color,
        marginTop: size * 0.14,
        overflow: 'hidden',
      }}
    >
      {/* Header bar inside calendar */}
      <View style={{ width: '100%', height: size * 0.2, backgroundColor: color }} />
    </View>
  </Container>
);

// Hierarchy / Tree Unit Icon
export const DistrictHierarchyIcon: React.FC<IconProps> = ({ size = 20, color = '#0F2860' }) => (
  <Container size={size}>
    {/* Top box */}
    <View
      style={{
        width: size * 0.28,
        height: size * 0.24,
        borderWidth: 1.4,
        borderColor: color,
        borderRadius: 2,
        position: 'absolute',
        top: size * 0.1,
      }}
    />
    {/* Vertical stem */}
    <View
      style={{
        width: 1.4,
        height: size * 0.2,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.34,
      }}
    />
    {/* Horizontal bar */}
    <View
      style={{
        width: size * 0.62,
        height: 1.4,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.54,
      }}
    />
    {/* Bottom left box */}
    <View
      style={{
        width: size * 0.24,
        height: size * 0.22,
        borderWidth: 1.4,
        borderColor: color,
        borderRadius: 2,
        position: 'absolute',
        bottom: size * 0.1,
        left: size * 0.12,
      }}
    />
    {/* Bottom right box */}
    <View
      style={{
        width: size * 0.24,
        height: size * 0.22,
        borderWidth: 1.4,
        borderColor: color,
        borderRadius: 2,
        position: 'absolute',
        bottom: size * 0.1,
        right: size * 0.12,
      }}
    />
  </Container>
);

// Lion of State / Crown Icon
export const CrownLionIcon: React.FC<IconProps> = ({ size = 20, color = '#1E40AF' }) => (
  <Container size={size}>
    {/* Crown Base */}
    <View
      style={{
        width: size * 0.68,
        height: size * 0.44,
        borderBottomWidth: 1.8,
        borderLeftWidth: 1.6,
        borderRightWidth: 1.6,
        borderColor: color,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        position: 'absolute',
        bottom: size * 0.2,
      }}
    />
    {/* Crown Peaks */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: size * 0.68,
        position: 'absolute',
        top: size * 0.18,
      }}
    >
      <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, backgroundColor: color }} />
      <View style={{ width: size * 0.14, height: size * 0.14, borderRadius: size * 0.07, backgroundColor: color, marginTop: -size * 0.06 }} />
      <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, backgroundColor: color }} />
    </View>
  </Container>
);

// Counselor of State Icon (Scroll / Badge)
export const CounselorIcon: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
  <Container size={size}>
    {/* Badge outer circle */}
    <View
      style={{
        width: size * 0.54,
        height: size * 0.54,
        borderRadius: size * 0.27,
        borderWidth: 1.6,
        borderColor: color,
        position: 'absolute',
        top: size * 0.1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: color }} />
    </View>
    {/* Ribbon tails */}
    <View
      style={{
        flexDirection: 'row',
        gap: size * 0.12,
        position: 'absolute',
        bottom: size * 0.1,
      }}
    >
      <View style={{ width: size * 0.14, height: size * 0.28, backgroundColor: color, transform: [{ rotate: '18deg' }] }} />
      <View style={{ width: size * 0.14, height: size * 0.28, backgroundColor: color, transform: [{ rotate: '-18deg' }] }} />
    </View>
  </Container>
);

// Ambassador of State / Shield Icon
export const ShieldAmbassadorIcon: React.FC<IconProps> = ({ size = 20, color = '#1E40AF' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.62,
        height: size * 0.68,
        borderWidth: 1.8,
        borderColor: color,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: size * 0.3,
        borderBottomRightRadius: size * 0.3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 1.6, height: size * 0.38, backgroundColor: color }} />
    </View>
  </Container>
);

// Hon'ble State Director / Star Emblem Icon
export const StateDirectorIcon: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
  <Container size={size}>
    {/* Star Diamond center */}
    <View
      style={{
        width: size * 0.44,
        height: size * 0.44,
        borderWidth: 1.8,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
      }}
    />
    <View
      style={{
        width: size * 0.24,
        height: size * 0.24,
        borderRadius: size * 0.12,
        backgroundColor: color,
      }}
    />
  </Container>
);

// National Legal Council / Scales of Justice Icon
export const LegalCouncilIcon: React.FC<IconProps> = ({ size = 20, color = '#1E40AF' }) => (
  <Container size={size}>
    {/* Center pillar */}
    <View style={{ width: 1.8, height: size * 0.68, backgroundColor: color }} />
    {/* Cross beam */}
    <View style={{ width: size * 0.74, height: 1.8, backgroundColor: color, position: 'absolute', top: size * 0.24 }} />
    {/* Left Pan Triangle/Bowl */}
    <View
      style={{
        width: size * 0.24,
        height: size * 0.16,
        borderBottomWidth: 1.6,
        borderLeftWidth: 1.4,
        borderRightWidth: 1.4,
        borderColor: color,
        borderBottomLeftRadius: size * 0.12,
        borderBottomRightRadius: size * 0.12,
        position: 'absolute',
        left: size * 0.1,
        top: size * 0.44,
      }}
    />
    {/* Right Pan Triangle/Bowl */}
    <View
      style={{
        width: size * 0.24,
        height: size * 0.16,
        borderBottomWidth: 1.6,
        borderLeftWidth: 1.4,
        borderRightWidth: 1.4,
        borderColor: color,
        borderBottomLeftRadius: size * 0.12,
        borderBottomRightRadius: size * 0.12,
        position: 'absolute',
        right: size * 0.1,
        top: size * 0.44,
      }}
    />
    {/* Base Stand */}
    <View style={{ width: size * 0.44, height: 2, backgroundColor: color, position: 'absolute', bottom: size * 0.12, borderRadius: 1 }} />
  </Container>
);

// National Minority Council / Unified People Icon
export const MinorityCouncilIcon: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
  <Container size={size}>
    {/* Center figure */}
    <View style={{ width: size * 0.26, height: size * 0.26, borderRadius: size * 0.13, borderWidth: 1.4, borderColor: color, position: 'absolute', top: size * 0.14 }} />
    <View style={{ width: size * 0.42, height: size * 0.24, borderTopLeftRadius: size * 0.16, borderTopRightRadius: size * 0.16, borderWidth: 1.4, borderColor: color, borderBottomWidth: 0, position: 'absolute', bottom: size * 0.16 }} />
    {/* Left shield-arc */}
    <View style={{ width: size * 0.22, height: size * 0.46, borderLeftWidth: 1.6, borderTopLeftRadius: size * 0.14, borderBottomLeftRadius: size * 0.14, borderColor: color, position: 'absolute', left: size * 0.1 }} />
    {/* Right shield-arc */}
    <View style={{ width: size * 0.22, height: size * 0.46, borderRightWidth: 1.6, borderTopRightRadius: size * 0.14, borderBottomRightRadius: size * 0.14, borderColor: color, position: 'absolute', right: size * 0.1 }} />
  </Container>
);

// National Women Council / Female Symbol Icon
export const WomenCouncilIcon: React.FC<IconProps> = ({ size = 20, color = '#1E40AF' }) => (
  <Container size={size}>
    {/* Head/Circle */}
    <View
      style={{
        width: size * 0.44,
        height: size * 0.44,
        borderRadius: size * 0.22,
        borderWidth: 1.8,
        borderColor: color,
        position: 'absolute',
        top: size * 0.1,
      }}
    />
    {/* Vertical line below */}
    <View
      style={{
        width: 1.8,
        height: size * 0.36,
        backgroundColor: color,
        position: 'absolute',
        bottom: size * 0.1,
      }}
    />
    {/* Horizontal crossbar */}
    <View
      style={{
        width: size * 0.36,
        height: 1.8,
        backgroundColor: color,
        position: 'absolute',
        bottom: size * 0.22,
      }}
    />
  </Container>
);

// National Political Council / Parliament Pillar Icon
export const PoliticalCouncilIcon: React.FC<IconProps> = ({ size = 20, color = '#059669' }) => (
  <Container size={size}>
    {/* Triangular Pediment / Dome roof */}
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.38,
        borderRightWidth: size * 0.38,
        borderBottomWidth: size * 0.2,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        position: 'absolute',
        top: size * 0.14,
      }}
    />
    {/* Pillars */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: size * 0.62,
        position: 'absolute',
        top: size * 0.38,
      }}
    >
      <View style={{ width: 1.6, height: size * 0.3, backgroundColor: color }} />
      <View style={{ width: 1.6, height: size * 0.3, backgroundColor: color }} />
      <View style={{ width: 1.6, height: size * 0.3, backgroundColor: color }} />
    </View>
    {/* Base Steps */}
    <View
      style={{
        width: size * 0.72,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        bottom: size * 0.14,
      }}
    />
  </Container>
);

// Verification Notice Shield / Checkmark Icon
export const VerificationShieldIcon: React.FC<IconProps> = ({ size = 20, color = '#1E40AF' }) => (
  <Container size={size}>
    {/* Shield Outer */}
    <View
      style={{
        width: size * 0.72,
        height: size * 0.78,
        borderWidth: 1.8,
        borderColor: color,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: size * 0.35,
        borderBottomRightRadius: size * 0.35,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Checkmark inside shield */}
      <View
        style={{
          width: size * 0.22,
          height: size * 0.36,
          borderBottomWidth: 1.8,
          borderRightWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginTop: -size * 0.08,
        }}
      />
    </View>
  </Container>
);



