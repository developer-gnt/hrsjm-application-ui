import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import {
  MembershipApplicationItem,
  getApplicationAccountType,
  getApplicationFeeAmount,
  getApplicationPaymentStatus,
} from '../types/membershipApplications.types';

interface MembershipDetailsInfoTabProps {
  application: MembershipApplicationItem;
}

interface InfoField {
  label: string;
  value?: string;
  isAmount?: boolean;
  isPaymentStatus?: boolean;
}

export const MembershipDetailsInfoTab: React.FC<MembershipDetailsInfoTabProps> = ({
  application,
}) => {
  const accountType = getApplicationAccountType(application);
  const isSeeker = accountType === 'seeker';
  const feeAmount = getApplicationFeeAmount(application);
  const paymentStatus = getApplicationPaymentStatus(application);
  const isPaid = paymentStatus === 'PAID';

  const fields: InfoField[] = [
    { label: 'Full Name', value: application.applicantName || 'Applicant' },
    { label: 'Account Type', value: isSeeker ? 'Donor Seeker' : 'Membership' },
    {
      label: isSeeker ? 'Assistance Type' : 'Member Type',
      value: isSeeker
        ? application.membershipType &&
          application.membershipType !== 'Donation Seeker' &&
          application.membershipType !== 'Donor Seeker'
          ? application.membershipType
          : 'Aid Request'
        : application.membershipType || 'Standard Member',
    },
    {
      label: 'Amount',
      value: feeAmount,
      isAmount: true,
    },
    {
      label: 'Payment Status',
      value: isSeeker ? 'Free / Exempt' : isPaid ? 'Paid' : 'Unpaid',
      isPaymentStatus: true,
    },
    {
      label: 'Date of Birth',
      value: application.dob && application.dob !== '—' ? application.dob : 'Not specified',
    },
    {
      label: 'Gender',
      value: application.gender && application.gender !== '—' ? application.gender : 'Not specified',
    },
    {
      label: 'Phone Number',
      value: application.phone && application.phone !== '—' ? application.phone : 'Not provided',
    },
    {
      label: 'Email Address',
      value: application.email && application.email !== '—' ? application.email : 'Not provided',
    },
    {
      label: 'Address',
      value: application.address && application.address !== '—' ? application.address : 'Not specified',
    },
    {
      label: 'Nearby Police Station',
      value: application.policeStation || 'Not specified',
    },
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
                {field.isPaymentStatus ? (
                  <View
                    style={[
                      styles.statusPill,
                      isPaid
                        ? styles.statusPillPaid
                        : isSeeker
                        ? styles.statusPillExempt
                        : styles.statusPillUnpaid,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        isPaid
                          ? styles.statusDotPaid
                          : isSeeker
                          ? styles.statusDotExempt
                          : styles.statusDotUnpaid,
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        isPaid
                          ? styles.statusTextPaid
                          : isSeeker
                          ? styles.statusTextExempt
                          : styles.statusTextUnpaid,
                      ]}
                    >
                      {field.value}
                    </Text>
                  </View>
                ) : field.isAmount ? (
                  <Text style={styles.amountValueText}>{field.value}</Text>
                ) : (
                  <Text style={styles.valueText}>{field.value}</Text>
                )}
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
    alignItems: 'center',
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
  amountValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2860',
    lineHeight: 18,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  statusPillPaid: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusPillUnpaid: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusPillExempt: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotPaid: {
    backgroundColor: '#10B981',
  },
  statusDotUnpaid: {
    backgroundColor: '#EF4444',
  },
  statusDotExempt: {
    backgroundColor: '#64748B',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  statusTextPaid: {
    color: '#047857',
  },
  statusTextUnpaid: {
    color: '#B91C1C',
  },
  statusTextExempt: {
    color: '#475569',
  },
});
