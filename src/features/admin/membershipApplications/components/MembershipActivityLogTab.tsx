import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipApplicationItem } from '../types/membershipApplications.types';

interface MembershipActivityLogTabProps {
  application: MembershipApplicationItem;
}

export const MembershipActivityLogTab: React.FC<MembershipActivityLogTabProps> = ({
  application,
}) => {
  const activityLogs = application.activityLog && application.activityLog.length > 0
    ? application.activityLog
    : [
        {
          id: 'log-default-1',
          title: application.status === 'approved'
            ? 'Application Approved'
            : application.status === 'rejected'
            ? 'Application Rejected'
            : 'Under Review',
          description: application.status === 'approved'
            ? 'Application verified and approved by Administrator.'
            : application.status === 'rejected'
            ? 'Application reviewed and marked as rejected.'
            : 'Application undergoing document verification.',
          timestamp: application.submittedAt,
          status: application.status,
        },
        {
          id: 'log-default-2',
          title: 'Application Submitted',
          description: 'Membership application submitted online by applicant.',
          timestamp: application.submittedAt,
          status: 'submitted' as const,
        },
      ];

  const getLogDotColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'under_review':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      case 'submitted':
      default:
        return '#1E3A8A';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Application Audit History</Text>

      <View style={styles.timelineCard}>
        {activityLogs.map((log, index) => {
          const isLast = index === activityLogs.length - 1;
          const dotColor = getLogDotColor(log.status);

          return (
            <View key={log.id} style={styles.logItem}>
              {/* Left timeline track */}
              <View style={styles.trackColumn}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                {!isLast ? <View style={styles.line} /> : null}
              </View>

              {/* Right log content */}
              <View style={[styles.contentColumn, !isLast && styles.contentColumnSpaced]}>
                <View style={styles.logHeader}>
                  <Text style={styles.logTitle}>{log.title}</Text>
                  <Text style={styles.logTime}>{log.timestamp}</Text>
                </View>
                <Text style={styles.logDescription}>{log.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    marginBottom: Spacing.sm,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    padding: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trackColumn: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
    minHeight: 40,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 4,
  },
  contentColumnSpaced: {
    paddingBottom: 20,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
    flexWrap: 'wrap',
    gap: 4,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
  },
  logTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  logDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
});
