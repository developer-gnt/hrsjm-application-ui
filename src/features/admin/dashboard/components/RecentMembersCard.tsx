import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate } from '../../../../core/utils';
import type { AdminMemberItem } from '../types/dashboard.types';

interface RecentMembersCardProps {
  members: AdminMemberItem[];
  onViewAll?: () => void;
}

const DEFAULT_MEMBERS = [
  { id: '1', full_name: 'Aman Shaikh', created_at: '2026-09-28', status: 'ACTIVE' },
  { id: '2', full_name: 'Saniya Khan', created_at: '2026-09-27', status: 'ACTIVE' },
  { id: '3', full_name: 'Rohit Verma', created_at: '2026-09-26', status: 'ACTIVE' },
  { id: '4', full_name: 'Faiza Ansari', created_at: '2026-09-26', status: 'ACTIVE' },
];

const initialsOf = (fullName?: string | null): string => {
  if (!fullName || typeof fullName !== 'string') {
    return 'M';
  }
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return 'M';
  }
  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
};

const getDisplayName = (member: any): string => {
  const raw = member?.full_name || member?.fullName || member?.name;
  if (raw && raw.trim() && raw.trim().toLowerCase() !== 'member') {
    return raw.trim();
  }
  if (member?.email) {
    return member.email.split('@')[0];
  }
  if (member?.mobile_number) {
    return `Member ${member.mobile_number.slice(-4)}`;
  }
  return 'HRSJM Member';
};

export const RecentMembersCard: React.FC<RecentMembersCardProps> = ({
  members,
  onViewAll,
}) => {
  const displayList =
    Array.isArray(members) && members.length > 0 ? members.slice(0, 4) : DEFAULT_MEMBERS;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          Recent Members
        </Text>
        {onViewAll ? (
          <TouchableOpacity
            onPress={onViewAll}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.rows}>
        {displayList.map(member => {
          const displayName = getDisplayName(member);
          const initials = initialsOf(displayName);
          const isActive = member?.status === 'ACTIVE' || !member?.status;

          return (
            <View key={member.id} style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <View style={styles.memberInfo}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.memberDate} numberOfLines={1}>
                  {member?.created_at ? `Joined ${formatDate(member.created_at)}` : 'Active'}
                </Text>
              </View>

              <View
                style={[
                  styles.activeBadge,
                  !isActive && styles.inactiveBadge,
                ]}
              >
                <Text
                  style={[
                    styles.activeBadgeText,
                    !isActive && styles.inactiveBadgeText,
                  ]}
                >
                  {isActive ? 'Active' : member.status}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06294D',
    letterSpacing: -0.2,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  rows: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  memberDate: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  inactiveBadge: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  inactiveBadgeText: {
    color: '#64748B',
  },
});

