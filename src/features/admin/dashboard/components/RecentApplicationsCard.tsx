import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { formatDate } from '../../../../core/utils';
import type { AssistanceRequestItem } from '../types/dashboard.types';

interface RecentApplicationsCardProps {
  rows: Array<
    Pick<AssistanceRequestItem, 'id' | 'created_at' | 'status'> & {
      full_name?: string;
    }
  >;
  onViewAll?: () => void;
  onPressRow?: (rowId: string) => void;
}

const DEFAULT_ROWS: Array<
  Pick<AssistanceRequestItem, 'id' | 'created_at' | 'status'> & {
    full_name?: string;
  }
> = [
  { id: '3e19d710', full_name: 'Amina Sheikh', created_at: '2026-09-28', status: 'APPROVED' },
  { id: 'c5ac70b3', full_name: 'Tariq Mehmood', created_at: '2026-09-27', status: 'UNDER_REVIEW' },
  { id: '8f4219d1', full_name: 'Zoya Siddiqui', created_at: '2026-09-26', status: 'APPROVED' },
  { id: '5a109c2b', full_name: 'Farhan Akhtar', created_at: '2026-09-25', status: 'PENDING' },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  APPROVED: { label: 'Approved', bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  ACTIVE: { label: 'Approved', bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  UNDER_REVIEW: { label: 'Review', bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  PENDING: { label: 'Pending', bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  SUBMITTED: { label: 'Pending', bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  REJECTED: { label: 'Rejected', bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  CLOSED: { label: 'Closed', bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' },
};

const formatAppCode = (id?: string): string => {
  if (!id) return '#APP-001';
  if (id.startsWith('#')) return id;
  if (id.startsWith('APP-')) return `#${id}`;
  if (id.startsWith('HRSJM-')) return `#${id}`;
  const clean = id.replace(/-/g, '').slice(-5).toUpperCase();
  return `#APP-${clean}`;
};

export const RecentApplicationsCard: React.FC<RecentApplicationsCardProps> = ({
  rows,
  onViewAll,
  onPressRow,
}) => {
  // Show submitted applications awaiting review
  const pendingRows = Array.isArray(rows)
    ? rows.filter(row => {
        const up = (row.status || '').toUpperCase();
        return up === 'PENDING' || up === 'UNDER_REVIEW' || up === 'SUBMITTED';
      })
    : [];

  const displayList = pendingRows.slice(0, 4);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          Recent Applications
        </Text>
        {onViewAll ? (
          <TouchableOpacity
            onPress={onViewAll}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View all applications"
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {displayList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No pending applications</Text>
          <Text style={styles.emptySubtitle}>
            Submitted applications awaiting review will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.rows}>
          {displayList.map(row => {
            const normalizedKey = (row.status || '').toUpperCase();
            const statusConfig = STATUS_CONFIG[normalizedKey] || STATUS_CONFIG[row.status] || {
              label: (row.status || 'Pending').replace(/_/g, ' '),
              bg: '#F8FAFC',
              text: '#64748B',
              border: '#E2E8F0',
            };

            const appCode = formatAppCode(row.id);
            const hasName = Boolean(row.full_name && row.full_name.trim());
            const primaryText = hasName ? row.full_name!.trim() : `Application ${appCode}`;
            const secondaryText = hasName
              ? `${appCode} · ${formatDate(row.created_at)}`
              : formatDate(row.created_at);

            return (
              <TouchableOpacity
                key={row.id}
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => {
                  if (onPressRow) {
                    onPressRow(row.id);
                  } else if (onViewAll) {
                    onViewAll();
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={`${primaryText}, status ${statusConfig.label}`}
              >
                <View style={styles.iconBox}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                      stroke="#2563EB"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M14 2V8H20"
                      stroke="#2563EB"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M16 13H8"
                      stroke="#2563EB"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                    <Path
                      d="M16 17H8"
                      stroke="#2563EB"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>

                <View style={styles.appInfo}>
                  <Text style={styles.primaryText} numberOfLines={1}>
                    {primaryText}
                  </Text>
                  <Text style={styles.secondaryText} numberOfLines={1}>
                    {secondaryText}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.bg, borderColor: statusConfig.border },
                  ]}
                >
                  <Text
                    style={[styles.statusBadgeText, { color: statusConfig.text }]}
                    numberOfLines={1}
                  >
                    {statusConfig.label}
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
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#06294D',
  },
  secondaryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
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

