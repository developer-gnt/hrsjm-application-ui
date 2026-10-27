import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate } from '../../../../core/utils';
import type { AdminMemberItem } from '../types/dashboard.types';

interface RecentMembersCardProps {
  members: AdminMemberItem[];
  onViewAll?: () => void;
  onPressRow?: (memberId: string) => void;
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
  const raw =
    member?.full_name ||
    member?.fullName ||
    member?.name ||
    member?.user?.full_name ||
    member?.application_data?.full_name;
  if (raw && raw.trim() && raw.trim().toLowerCase() !== 'member') {
    return raw.trim();
  }
  if (member?.email || member?.user?.email) {
    return (member.email || member.user.email).split('@')[0];
  }
  if (member?.mobile_number || member?.mobile || member?.user?.mobile_number) {
    const num = member.mobile_number || member.mobile || member.user.mobile_number;
    return `Member ${num.slice(-4)}`;
  }
  return 'HRSJM Member';
};

export const RecentMembersCard: React.FC<RecentMembersCardProps> = ({
  members,
  onViewAll,
  onPressRow,
}) => {
  // Show only members whose applications have been approved.
  // Strictly filter out pending applications and users who have merely registered.
  const approvedMembers = Array.isArray(members)
    ? members.filter(member => {
        const memStatus = String(
          (member as any)?.membership?.status || (member as any)?.membership_status || '',
        ).toUpperCase();
        return memStatus === 'ACTIVE' || memStatus === 'APPROVED';
      })
    : [];

  const displayList = approvedMembers.slice(0, 4);

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

      {displayList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No approved members yet</Text>
          <Text style={styles.emptySubtitle}>
            Approved members will appear here once applications are verified and approved.
          </Text>
        </View>
      ) : (
        <View style={styles.rows}>
          {displayList.map(member => {
            const displayName = getDisplayName(member);
            const initials = initialsOf(displayName);
            const rawStatus = (
              (member as any)?.membership?.status ||
              member?.status ||
              'ACTIVE'
            ).toUpperCase();
            const isActive = rawStatus === 'ACTIVE' || rawStatus === 'APPROVED';

            return (
              <TouchableOpacity
                key={member.id}
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => onPressRow?.(member.id)}
              >
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
                    {isActive ? 'Active' : member.status || 'Active'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
  emptyContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
});

