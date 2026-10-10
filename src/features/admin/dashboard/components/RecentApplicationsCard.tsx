import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { formatDate } from '../../../../core/utils';
import type { AssistanceRequestItem } from '../types/dashboard.types';

interface RecentApplicationsCardProps {
  rows: Array<Pick<AssistanceRequestItem, 'id' | 'created_at' | 'status'>>;
  onViewAll?: () => void;
}

const DEFAULT_ROWS = [
  { id: 'APP20260915001', created_at: '2026-09-28', status: 'APPROVED' },
  { id: 'APP20260914023', created_at: '2026-09-27', status: 'UNDER_REVIEW' },
  { id: 'APP20260913012', created_at: '2026-09-26', status: 'APPROVED' },
  { id: 'APP20260912008', created_at: '2026-09-25', status: 'PENDING' },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  APPROVED: { label: 'Approved', bg: '#DCFCE7', text: '#16A34A' },
  UNDER_REVIEW: { label: 'Review', bg: '#FEF3C7', text: '#D97706' },
  PENDING: { label: 'Pending', bg: '#DBEAFE', text: '#2563EB' },
  REJECTED: { label: 'Rejected', bg: '#FEE2E2', text: '#DC2626' },
};

export const RecentApplicationsCard: React.FC<RecentApplicationsCardProps> = ({
  rows,
  onViewAll,
}) => {
  const displayList = rows && rows.length > 0 ? rows.slice(0, 4) : DEFAULT_ROWS;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          Recent Applications
        </Text>
        {onViewAll ? (
          <TouchableOpacity onPress={onViewAll} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.rows}>
        {displayList.map(row => {
          const statusConfig = STATUS_CONFIG[row.status] || {
            label: row.status.replace(/_/g, ' '),
            bg: '#F1F5F9',
            text: '#475569',
          };

          return (
            <View key={row.id} style={styles.row}>
              <View style={styles.iconBox}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
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
                <Text style={styles.appId} numberOfLines={1}>
                  {row.id}
                </Text>
                <Text style={styles.appDate} numberOfLines={1}>
                  {formatDate(row.created_at)}
                </Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                <Text
                  style={[styles.statusBadgeText, { color: statusConfig.text }]}
                  numberOfLines={1}
                >
                  {statusConfig.label}
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
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appId: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F2C59',
  },
  appDate: {
    fontSize: 8.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
});
