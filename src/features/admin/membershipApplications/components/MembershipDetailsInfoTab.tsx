import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import { MembershipApplicationItem } from '../types/membershipApplications.types';

interface MembershipDetailsInfoTabProps {
  application: MembershipApplicationItem;
}

interface InfoField {
  label: string;
  value?: string;
  icon?: string;
}

export const MembershipDetailsInfoTab: React.FC<MembershipDetailsInfoTabProps> = ({
  application,
}) => {
  const fields: InfoField[] = [
    { label: 'Full Name', value: application.applicantName, icon: '👤' },
    { label: 'Date of Birth', value: application.dob || '15 Aug 1995', icon: '📅' },
    { label: 'Gender', value: application.gender || 'Not specified', icon: '⚧' },
    { label: "Father's Name", value: application.fatherName || 'Not specified', icon: '👨' },
    { label: 'Phone Number', value: application.phone || 'Not provided', icon: '📞' },
    { label: 'Email Address', value: application.email || 'Not provided', icon: '✉️' },
    { label: 'Address', value: application.address || 'Not specified', icon: '📍' },
    { label: 'Occupation', value: application.occupation || 'Professional', icon: '💼' },
    { label: 'Membership Type', value: application.membershipType, icon: '⭐' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Personal & Membership Details</Text>
        <View style={styles.divider} />

        {fields.map((field, idx) => (
          <View
            key={field.label}
            style={[styles.row, idx === fields.length - 1 && styles.rowLast]}
          >
            <View style={styles.labelColumn}>
              {field.icon ? <Text style={styles.fieldIcon}>{field.icon}</Text> : null}
              <Text style={styles.fieldLabel}>{field.label}</Text>
            </View>
            <Text style={styles.fieldValue}>{field.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  card: {
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 10,
    marginBottom: 6,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  labelColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  fieldIcon: {
    fontSize: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2860',
    lineHeight: 20,
    paddingLeft: 18,
  },
});
