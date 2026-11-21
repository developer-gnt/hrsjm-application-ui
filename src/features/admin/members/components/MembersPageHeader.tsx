import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { Camera } from '../../../../core/components/icons';

interface MembersPageHeaderProps {
  title?: string;
  subtitle?: string;
  onAddMember?: () => void;
  onViewApplications?: () => void;
  onScanMember?: () => void;
}

const HeaderActionButton = TouchableOpacity as React.ComponentType<any>;

/**
 * Members Page Header matching the Donation Seekers reference layout:
 * - Heading "Members" on the left
 * - Actions on the right: "Scan ID" and "+ Add Member"
 * - Description "Manage and view all registered members." directly below
 */
export const MembersPageHeader: React.FC<MembersPageHeaderProps> = ({
  title = 'Members',
  subtitle = 'Manage and view all registered members.',
  onAddMember,
  onScanMember,
}) => {
  return (
    <View style={styles.headerArea}>
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>{title}</Text>
        <View style={styles.actionsGroup}>
          {onScanMember ? (
            <HeaderActionButton
              title="Scan & Verify"
              onPress={onScanMember}
              accessibilityRole="button"
              accessibilityLabel="Scan and verify member ID card"
              style={styles.scanButton}
              activeOpacity={0.85}
            >
              <Camera size={15} color="#082046" strokeWidth={2.2} />
              <Text style={styles.scanButtonText}>Verify ID</Text>
            </HeaderActionButton>
          ) : null}
          {onAddMember ? (
            <HeaderActionButton
              title="Add Member"
              onPress={onAddMember}
              accessibilityRole="button"
              accessibilityLabel="Add Member"
              style={styles.addButton}
              activeOpacity={0.85}
            >
              <Text style={styles.addButtonPlus}>+</Text>
              <Text style={styles.addButtonText}>Add Member</Text>
            </HeaderActionButton>
          ) : null}
        </View>
      </View>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  headerArea: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  pageTitle: {
    ...Typography.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#0B2F52',
  },
  pageSubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
    lineHeight: 18,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.button,
  },
  scanButtonText: {
    ...Typography.button,
    fontSize: 13,
    fontWeight: '700',
    color: '#082046',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAD465',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.button,
    elevation: 2,
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  addButtonPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#011F39',
    lineHeight: 18,
  },
  addButtonText: {
    ...Typography.button,
    fontSize: 13,
    fontWeight: '700',
    color: '#011F39',
  },
});

export default MembersPageHeader;

