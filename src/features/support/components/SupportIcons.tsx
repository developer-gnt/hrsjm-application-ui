import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export const PlusIcon: React.FC<IconProps> = ({ size = 16, color = '#FFFFFF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View style={{ width: size * 0.7, height: 2.2, backgroundColor: color, borderRadius: 1 }} />
    <View
      style={{
        width: 2.2,
        height: size * 0.7,
        backgroundColor: color,
        position: 'absolute',
        borderRadius: 1,
      }}
    />
  </View>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
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
  </View>
);

export const EditPencilIcon: React.FC<IconProps> = ({ size = 16, color = '#1B3F8F' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.28,
        height: size * 0.72,
        borderWidth: 1.6,
        borderColor: color,
        borderRadius: 2,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, color = '#1B3F8F' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.42,
        height: size * 0.42,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginTop: -size * 0.15,
      }}
    />
  </View>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ size = 16, color = '#1B3F8F' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.42,
        height: size * 0.42,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginTop: size * 0.15,
      }}
    />
  </View>
);

export const FilterIcon: React.FC<IconProps> = ({ size = 16, color = '#1B3F8F' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View style={{ width: size * 0.8, height: 1.8, backgroundColor: color, borderRadius: 1, marginBottom: 2.5 }} />
    <View style={{ width: size * 0.55, height: 1.8, backgroundColor: color, borderRadius: 1, marginBottom: 2.5 }} />
    <View style={{ width: size * 0.3, height: 1.8, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.55,
        height: size * 0.55,
        borderRadius: (size * 0.55) / 2,
        borderWidth: 1.8,
        borderColor: color,
        marginTop: -size * 0.15,
        marginLeft: -size * 0.15,
      }}
    />
    <View
      style={{
        width: size * 0.32,
        height: 1.8,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
        bottom: size * 0.14,
        right: size * 0.12,
        borderRadius: 1,
      }}
    />
  </View>
);

// Summary Card 1: Total Tickets (ticket / document)
export const TotalTicketsIcon: React.FC<IconProps> = ({ size = 20, color = '#1B3F8F' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.85,
        borderRadius: 3,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        paddingTop: 3,
      }}
    >
      <View style={{ width: '60%', height: 1.5, backgroundColor: color, marginBottom: 2.5 }} />
      <View style={{ width: '60%', height: 1.5, backgroundColor: color, marginBottom: 2.5 }} />
      <View style={{ width: '40%', height: 1.5, backgroundColor: color }} />
    </View>
  </View>
);

// Summary Card 2: Open Tickets (clock/timer)
export const ClockIcon: React.FC<IconProps> = ({ size = 20, color = '#D97706' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.85,
        height: size * 0.85,
        borderRadius: (size * 0.85) / 2,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 1.8,
          height: size * 0.28,
          backgroundColor: color,
          position: 'absolute',
          top: size * 0.15,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          width: size * 0.22,
          height: 1.8,
          backgroundColor: color,
          position: 'absolute',
          top: size * 0.38,
          right: size * 0.18,
          borderRadius: 1,
        }}
      />
    </View>
  </View>
);

// Summary Card 3: Resolved Tickets (checkmark circle)
export const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, color = '#10B981' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.85,
        height: size * 0.85,
        borderRadius: (size * 0.85) / 2,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.24,
          height: size * 0.4,
          borderBottomWidth: 1.8,
          borderRightWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginTop: -size * 0.08,
        }}
      />
    </View>
  </View>
);

// Summary Card 4: Closed Tickets (cancel/close circle)
export const ClosedCircleIcon: React.FC<IconProps> = ({ size = 20, color = '#EF4444' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.85,
        height: size * 0.85,
        borderRadius: (size * 0.85) / 2,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.42,
          height: 1.8,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size * 0.42,
          height: 1.8,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
          position: 'absolute',
        }}
      />
    </View>
  </View>
);

// Category tile icons
export const CategoryIcon: React.FC<{ category: string; size?: number; color?: string }> = ({
  category,
  size = 20,
  color,
}) => {
  const norm = category.toLowerCase();

  if (norm.includes('membership renewal') || norm.includes('renew')) {
    return <Text style={{ fontSize: size * 0.9 }}>🔄</Text>;
  }
  if (norm.includes('membership')) {
    return <Text style={{ fontSize: size * 0.9 }}>🪪</Text>;
  }
  if (norm.includes('donation')) {
    return <Text style={{ fontSize: size * 0.9 }}>🧡</Text>;
  }
  if (norm.includes('kyc') || norm.includes('document')) {
    return <Text style={{ fontSize: size * 0.9 }}>📄</Text>;
  }
  if (norm.includes('account') || norm.includes('profile')) {
    return <Text style={{ fontSize: size * 0.9 }}>👤</Text>;
  }
  if (norm.includes('payment')) {
    return <Text style={{ fontSize: size * 0.9 }}>⚠️</Text>;
  }
  if (norm.includes('id card') || norm.includes('certificate')) {
    return <Text style={{ fontSize: size * 0.9 }}>🎖️</Text>;
  }
  if (norm.includes('volunteer')) {
    return <Text style={{ fontSize: size * 0.9 }}>🤝</Text>;
  }
  if (norm.includes('human rights')) {
    return <Text style={{ fontSize: size * 0.9 }}>⚖️</Text>;
  }
  if (norm.includes('complaint') || norm.includes('feedback')) {
    return <Text style={{ fontSize: size * 0.9 }}>💬</Text>;
  }
  return <Text style={{ fontSize: size * 0.9 }}>📋</Text>;
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
