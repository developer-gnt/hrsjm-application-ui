import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AdminColors } from '../../../core/theme/colors';

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

export const UserOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#475569' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.38,
        height: size * 0.38,
        borderRadius: size * 0.19,
        borderWidth: 1.6,
        borderColor: color,
      }}
    />
    <View
      style={{
        width: size * 0.65,
        height: size * 0.32,
        borderTopLeftRadius: size * 0.25,
        borderTopRightRadius: size * 0.25,
        borderWidth: 1.6,
        borderColor: color,
        borderBottomWidth: 0,
        marginTop: size * 0.08,
      }}
    />
  </Container>
);

export const MailOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#475569' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.76,
        height: size * 0.54,
        borderWidth: 1.6,
        borderColor: color,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: size * 0.54,
          height: size * 0.54,
          borderBottomWidth: 1.5,
          borderRightWidth: 1.5,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          alignSelf: 'center',
          marginTop: -size * 0.28,
        }}
      />
    </View>
  </Container>
);

export const PhoneOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#475569' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.68,
        height: size * 0.68,
        borderWidth: 1.6,
        borderColor: color,
        borderRadius: size * 0.16,
        transform: [{ rotate: '-15deg' }],
      }}
    />
  </Container>
);

export const CalendarOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#475569' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.68,
        borderWidth: 1.6,
        borderColor: color,
        borderRadius: 3,
        paddingTop: 3,
      }}
    >
      <View style={{ height: 1.5, backgroundColor: color, width: '100%', marginBottom: 2 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 2 }}>
        <View style={{ width: 2.5, height: 2.5, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2.5, height: 2.5, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2.5, height: 2.5, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  </Container>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 18, color = '#0F2860' }) => (
  <Container size={size}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: size * 0.5, height: 2, backgroundColor: color }} />
      <View
        style={{
          width: size * 0.32,
          height: size * 0.32,
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginLeft: -size * 0.15,
        }}
      />
    </View>
  </Container>
);

export const GoogleGIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.85,
        height: size * 0.85,
        borderRadius: (size * 0.85) / 2,
        borderWidth: 2.5,
        borderColor: '#4285F4',
        borderRightColor: '#34A853',
        borderBottomColor: '#FBBC05',
        borderTopColor: '#EA4335',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.35,
          height: 2.5,
          backgroundColor: '#4285F4',
          alignSelf: 'flex-end',
          marginRight: 0.5,
        }}
      />
    </View>
  </Container>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 12, color = '#475569' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.45,
        height: size * 0.45,
        borderRightWidth: 1.8,
        borderBottomWidth: 1.8,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginTop: -size * 0.15,
      }}
    />
  </Container>
);

export const CheckCircleFilledIcon: React.FC<IconProps> = ({ size = 18, color = '#EAA224' }) => (
  <Container size={size}>
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
          width: size * 0.45,
          height: size * 0.25,
          borderLeftWidth: 1.8,
          borderBottomWidth: 1.8,
          borderColor: '#FFFFFF',
          transform: [{ rotate: '-45deg' }],
          marginTop: -size * 0.08,
        }}
      />
    </View>
  </Container>
);

export const UsersGroupIcon: React.FC<IconProps> = ({ size = 26, color = '#0F2860' }) => (
  <Container size={size}>
    {/* Center person */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.05,
        width: size * 0.32,
        height: size * 0.32,
        borderRadius: size * 0.16,
        borderWidth: 1.8,
        borderColor: color,
        alignSelf: 'center',
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: size * 0.1,
        width: size * 0.52,
        height: size * 0.28,
        borderTopLeftRadius: size * 0.2,
        borderTopRightRadius: size * 0.2,
        borderWidth: 1.8,
        borderColor: color,
        borderBottomWidth: 0,
        alignSelf: 'center',
      }}
    />
    {/* Left person */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.15,
        left: size * 0.05,
        width: size * 0.24,
        height: size * 0.24,
        borderRadius: size * 0.12,
        borderWidth: 1.6,
        borderColor: color,
      }}
    />
    {/* Right person */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.15,
        right: size * 0.05,
        width: size * 0.24,
        height: size * 0.24,
        borderRadius: size * 0.12,
        borderWidth: 1.6,
        borderColor: color,
      }}
    />
  </Container>
);

export const HeartHandIcon: React.FC<IconProps> = ({ size = 26, color = '#0F2860' }) => (
  <Container size={size}>
    {/* Heart */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.08,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.38,
          height: size * 0.38,
          borderWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          borderTopLeftRadius: size * 0.18,
          borderTopRightRadius: size * 0.18,
        }}
      />
    </View>
    {/* Hand cupping below */}
    <View
      style={{
        position: 'absolute',
        bottom: size * 0.12,
        width: size * 0.65,
        height: size * 0.28,
        borderBottomLeftRadius: size * 0.2,
        borderBottomRightRadius: size * 0.2,
        borderWidth: 1.8,
        borderColor: color,
        borderTopWidth: 0,
        alignSelf: 'center',
      }}
    />
  </Container>
);

export const LockOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.44,
        height: size * 0.36,
        borderTopLeftRadius: size * 0.22,
        borderTopRightRadius: size * 0.22,
        borderWidth: 1.8,
        borderColor: color,
        borderBottomWidth: 0,
        marginBottom: -1,
      }}
    />
    <View
      style={{
        width: size * 0.68,
        height: size * 0.46,
        borderRadius: 4,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.12,
          height: size * 0.15,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />
    </View>
  </Container>
);

export const EyeOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.78,
        height: size * 0.48,
        borderRadius: size * 0.39,
        borderWidth: 1.7,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.24,
          height: size * 0.24,
          borderRadius: size * 0.12,
          backgroundColor: color,
        }}
      />
    </View>
  </Container>
);

export const EyeSlashOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.78,
        height: size * 0.48,
        borderRadius: size * 0.39,
        borderWidth: 1.7,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.24,
          height: size * 0.24,
          borderRadius: size * 0.12,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.85,
          height: 1.7,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  </Container>
);

export const AadhaarDocIcon: React.FC<IconProps> = ({ size = 24, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.82,
        height: size * 0.58,
        borderRadius: 4,
        borderWidth: 1.6,
        borderColor: color,
        padding: 2,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <View style={{ width: size * 0.18, height: size * 0.18, borderRadius: 2, backgroundColor: color }} />
        <View style={{ flex: 1, height: 2, backgroundColor: color, borderRadius: 1 }} />
      </View>
      <View style={{ height: 1.5, width: '70%', backgroundColor: color, borderRadius: 1 }} />
      <View style={{ height: 1.5, width: '90%', backgroundColor: color, borderRadius: 1 }} />
    </View>
  </Container>
);

export const PanCardDocIcon: React.FC<IconProps> = ({ size = 24, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.82,
        height: size * 0.56,
        borderRadius: 4,
        borderWidth: 1.6,
        borderColor: color,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: size * 0.12, backgroundColor: color, width: '100%' }} />
      <View style={{ padding: 2, flex: 1, justifyContent: 'space-around' }}>
        <View style={{ width: size * 0.18, height: size * 0.14, backgroundColor: '#EAA224', borderRadius: 1 }} />
        <View style={{ height: 1.5, width: '60%', backgroundColor: color }} />
      </View>
    </View>
  </Container>
);

export const PassportDocIcon: React.FC<IconProps> = ({ size = 24, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.65,
        height: size * 0.82,
        borderRadius: 3,
        borderWidth: 1.6,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: size * 0.16,
          borderWidth: 1.4,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: size * 0.14, height: size * 0.14, borderRadius: size * 0.07, backgroundColor: color }} />
      </View>
      <View style={{ height: 1.5, width: '50%', backgroundColor: color, marginTop: 3 }} />
    </View>
  </Container>
);

export const DrivingLicenceDocIcon: React.FC<IconProps> = ({ size = 24, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.82,
        height: size * 0.58,
        borderRadius: 4,
        borderWidth: 1.6,
        borderColor: color,
        padding: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {/* Steering wheel */}
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: size * 0.14,
          borderWidth: 1.4,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: 1.2, height: '100%', backgroundColor: color }} />
        <View style={{ width: '100%', height: 1.2, backgroundColor: color, position: 'absolute' }} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ height: 1.5, width: '100%', backgroundColor: color }} />
        <View style={{ height: 1.5, width: '70%', backgroundColor: color }} />
      </View>
    </View>
  </Container>
);

export const VoterIdDocIcon: React.FC<IconProps> = ({ size = 24, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.76,
        borderRadius: 4,
        borderWidth: 1.6,
        borderColor: color,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Photo frame */}
      <View style={{ width: size * 0.26, height: size * 0.26, borderWidth: 1.2, borderColor: color, borderRadius: 2 }} />
      <View style={{ width: '80%', height: 1.5, backgroundColor: color }} />
      <View style={{ width: '60%', height: 1.5, backgroundColor: color }} />
    </View>
  </Container>
);

export const OtherDocIcon: React.FC<IconProps> = ({ size = 24, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.65,
        height: size * 0.8,
        borderRadius: 3,
        borderWidth: 1.6,
        borderColor: color,
        padding: 3,
        justifyContent: 'space-around',
      }}
    >
      <View style={{ height: 1.5, width: '80%', backgroundColor: color }} />
      <View style={{ height: 1.5, width: '90%', backgroundColor: color }} />
      <View style={{ height: 1.5, width: '60%', backgroundColor: color }} />
    </View>
  </Container>
);

export const UploadDocSheetIcon: React.FC<IconProps> = ({ size = 44, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.9,
        borderRadius: 6,
        borderWidth: 2.2,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      }}
    >
      {/* Arrow pointing up inside document */}
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderTopWidth: 2.2,
          borderLeftWidth: 2.2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginBottom: -size * 0.04,
        }}
      />
      <View style={{ width: 2.2, height: size * 0.26, backgroundColor: color }} />
    </View>
  </Container>
);

export const UploadTrayIcon: React.FC<IconProps> = ({ size = 20, color = '#0F2860' }) => (
  <Container size={size}>
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Up Arrow */}
      <View
        style={{
          width: size * 0.38,
          height: size * 0.38,
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginBottom: -size * 0.08,
        }}
      />
      <View style={{ width: 2, height: size * 0.38, backgroundColor: color, marginBottom: 2 }} />
      {/* Tray */}
      <View
        style={{
          width: size * 0.8,
          height: size * 0.26,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
    </View>
  </Container>
);

export const UploadCloudIcon: React.FC<IconProps> = ({ size = 32, color = '#0F2860' }) => (
  <Container size={size}>
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Arrow pointing up */}
      <View
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderTopWidth: 2.2,
          borderRightWidth: 2.2,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginBottom: -size * 0.08,
        }}
      />
      <View style={{ width: 2.2, height: size * 0.35, backgroundColor: color }} />
      <View
        style={{
          width: size * 0.7,
          height: size * 0.25,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          borderWidth: 2,
          borderColor: color,
          borderTopWidth: 0,
          marginTop: 2,
        }}
      />
    </View>
  </Container>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.52,
        height: size * 0.52,
        borderRadius: size * 0.26,
        borderWidth: 1.8,
        borderColor: color,
        marginLeft: -size * 0.15,
        marginTop: -size * 0.15,
      }}
    />
    <View
      style={{
        width: size * 0.32,
        height: 2,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
        bottom: size * 0.15,
        right: size * 0.12,
      }}
    />
  </Container>
);

export const FilterLinesIcon: React.FC<IconProps> = ({ size = 20, color = '#0F2860' }) => (
  <Container size={size}>
    <View style={{ width: size * 0.85, gap: 3.5, alignItems: 'flex-start' }}>
      <View style={{ width: '100%', height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: '70%', height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: '40%', height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  </Container>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 18, color = '#94A3B8' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.38,
        height: size * 0.38,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginLeft: -size * 0.1,
      }}
    />
  </Container>
);

export const DocumentFileLinesIcon: React.FC<IconProps> = ({ size = 24, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.88,
        borderRadius: 4,
        borderWidth: 1.8,
        borderColor: color,
        padding: 3,
        justifyContent: 'center',
        gap: 2.5,
      }}
    >
      <View style={{ width: '70%', height: 1.6, backgroundColor: color }} />
      <View style={{ width: '85%', height: 1.6, backgroundColor: color }} />
      <View style={{ width: '55%', height: 1.6, backgroundColor: color }} />
    </View>
  </Container>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.82,
        height: size * 0.68,
        borderRadius: 4,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: size * 0.1,
          borderWidth: 1.2,
          borderColor: color,
          position: 'absolute',
          top: 3,
          left: 4,
        }}
      />
      <View
        style={{
          width: size * 0.6,
          height: size * 0.35,
          borderTopWidth: 1.5,
          borderLeftWidth: 1.5,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          bottom: -size * 0.12,
          right: 2,
        }}
      />
    </View>
  </Container>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 22, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.85,
        height: size * 0.62,
        borderRadius: 4,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: size * 0.17,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
    </View>
  </Container>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 18, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.85,
        height: size * 0.52,
        borderRadius: size * 0.4,
        borderWidth: 1.6,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.26,
          height: size * 0.26,
          borderRadius: size * 0.13,
          backgroundColor: color,
        }}
      />
    </View>
  </Container>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Container size={size}>
    <View style={{ alignItems: 'center' }}>
      {/* Lid */}
      <View
        style={{
          width: size * 0.7,
          height: 1.8,
          backgroundColor: color,
          borderRadius: 1,
          marginBottom: 1.5,
        }}
      />
      {/* Can body */}
      <View
        style={{
          width: size * 0.54,
          height: size * 0.58,
          borderWidth: 1.6,
          borderColor: color,
          borderTopWidth: 0,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          paddingTop: 2,
        }}
      >
        <View style={{ width: 1.2, height: size * 0.35, backgroundColor: color }} />
        <View style={{ width: 1.2, height: size * 0.35, backgroundColor: color }} />
      </View>
    </View>
  </Container>
);

export const ClockOutlineIcon: React.FC<IconProps> = ({ size = 16, color = '#D97706' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.88,
        height: size * 0.88,
        borderRadius: size * 0.44,
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Hour hand */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.18,
          width: 1.5,
          height: size * 0.26,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Minute hand */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.4,
          top: size * 0.4,
          width: size * 0.22,
          height: 1.5,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  </Container>
);

export const FileTextOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#0F2860' }) => (
  <Container size={size}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.9,
        borderRadius: 4,
        borderWidth: 1.6,
        borderColor: color,
        padding: 3,
        justifyContent: 'center',
        gap: 2.5,
      }}
    >
      <View style={{ width: '80%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: '90%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: '60%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
    </View>
  </Container>
);

export const CheckCircleSuccessIcon: React.FC<IconProps> = ({ size = 18, color = '#10B981' }) => (
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
        width: size * 0.42,
        height: size * 0.24,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#FFFFFF',
        transform: [{ rotate: '-45deg' }],
        marginTop: -size * 0.06,
      }}
    />
  </View>
);

export const InfoCircleFilledIcon: React.FC<IconProps> = ({ size = 22, color = '#0284C7' }) => (
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
    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: size * 0.6, fontStyle: 'italic' }}>
      i
    </Text>
  </View>
);

