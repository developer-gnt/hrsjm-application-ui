import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Spacing, BorderRadius } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';

interface MembersPageHeaderProps {
  title?: string;
  subtitle?: string;
  onAddMember?: () => void;
  onViewApplications?: () => void;
}

const AddButton = TouchableOpacity as React.ComponentType<any>;

/**
 * Members Page Header matching the Donation Seekers reference layout:
 * - Heading "Members" on the left
 * - Yellow "+ Add Member" button on the right, aligned horizontally with the heading
 * - Description "Manage and view all registered members." directly below
 */
export const MembersPageHeader: React.FC<MembersPageHeaderProps> = ({
  title = 'Members',
  subtitle = 'Manage and view all registered members.',
  onAddMember,
}) => {
  return (
    <View style={styles.headerArea}>
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>{title}</Text>
        {onAddMember ? (
          <AddButton
            title="Add Member"
            onPress={onAddMember}
            accessibilityRole="button"
            accessibilityLabel="Add Member"
            style={styles.addButton}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonPlus}>+</Text>
            <Text style={styles.addButtonText}>Add Member</Text>
          </AddButton>
        ) : null}
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

