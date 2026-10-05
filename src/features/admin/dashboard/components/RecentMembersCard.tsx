import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Shadows } from '../../../../core/theme/spacing';
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
  return member?.full_name || member?.fullName || member?.name || member?.mobile_number || 'Member';
};

export const RecentMembersCard: React.FC<RecentMembersCardProps> = ({
  members,
  onViewAll,
}) => {
  const displayList = Array.isArray(members) && members.length > 0 ? members.slice(0, 4) : DEFAULT_MEMBERS;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          Recent Members
        </Text>
        {onViewAll ? (
          <TouchableOpacity onPress={onViewAll} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.rows}>
        {displayList.map(member => {
          const displayName = getDisplayName(member);
          const initials = initialsOf(displayName);
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
                  {member?.created_at ? formatDate(member.created_at) : '—'}
                </Text>
              </View>

              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>
                  {member?.status === 'ACTIVE' || !member?.status ? 'Active' : member.status}
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
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2C59',
  },
  viewAll: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F2C59',
  },
  memberDate: {
    fontSize: 8.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#16A34A',
  },
});
