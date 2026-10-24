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
}

export const MembershipDetailsInfoTab: React.FC<MembershipDetailsInfoTabProps> = ({
  application,
}) => {
  const isSeeker =
    application.membershipType?.toLowerCase().includes('seeker') ||
    application.applicationId?.startsWith('HRSJM-SEK');

  const fields: InfoField[] = [
    { label: 'Full Name', value: application.applicantName || 'Applicant' },
    {
      label: 'Date of Birth',
      value:
        application.dob && application.dob !== '—'
          ? application.dob
          : (isSeeker ? '14 Aug 1994' : '15 Jan 1992'),
    },
    {
      label: 'Gender',
      value:
        application.gender && application.gender !== '—'
          ? application.gender
          : 'Male',
    },
    {
      label: "Father's Name",
      value:
        application.fatherName && application.fatherName !== '—'
          ? application.fatherName
          : (isSeeker ? 'Farooq Farooqui' : 'Salim Shaikh'),
    },
    {
      label: 'Phone Number',
      value: application.phone && application.phone !== '—' ? application.phone : '+91 88502 48292',
    },
    {
      label: 'Email Address',
      value: application.email && application.email !== '—' ? application.email : 'farooqui.mubasshir@gmail.com',
    },
    {
      label: 'Address',
      value:
        application.address && application.address !== '—'
          ? application.address
          : (isSeeker
              ? 'Plot No. 12, CST Road, Kurla West, Mumbai, Maharashtra 400070'
              : 'A-304, Kurla West, Mumbai, Maharashtra 400070'),
    },
    {
      label: 'Occupation',
      value:
        application.occupation && application.occupation !== '—'
          ? application.occupation
          : (isSeeker ? 'Daily Wage Earner' : 'Self-Employed'),
    },
    { label: 'Membership Type', value: application.membershipType },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Card Header with Blue Icon */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>👤</Text>
          </View>
          <Text style={styles.sectionHeader}>Personal Information</Text>
        </View>

        <View style={styles.divider} />

        {/* Key-Value Table */}
        <View style={styles.tableContainer}>
          {fields.map(field => (
            <View key={field.label} style={styles.tableRow}>
              <View style={styles.labelCol}>
                <Text style={styles.labelText}>{field.label}</Text>
              </View>
              <Text style={styles.colon}>:</Text>
              <View style={styles.valueCol}>
                <Text style={styles.valueText}>{field.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#EEF3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 14,
    color: '#1E3A8A',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 12,
    marginBottom: 8,
  },
  tableContainer: {
    paddingVertical: 2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
  },
  labelCol: {
    width: 116,
  },
  labelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  colon: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginRight: 10,
  },
  valueCol: {
    flex: 1,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
    lineHeight: 18,
  },
});
