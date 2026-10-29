import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../core/components/common/AppHeader';
import { AppCard } from '../../../core/components/common/AppCard';
import { AppButton } from '../../../core/components/common/AppButton';
import { AdminColors } from '../../../core/theme/colors';
import { Typography, FontFamilies } from '../../../core/theme/typography';
import { Spacing } from '../../../core/theme/spacing';
import { useAuthStore } from '../../auth/store/authStore';
import { GlobalPaymentModal, PaymentPayload } from '../../payments';
import { causesService } from '../../member/services/causes.service';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

export const DonorHomeScreen: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const paymentPayload: PaymentPayload = {
    userId: user?.id,
    purpose: 'donation',
    title: 'HRSJM General Welfare Donation',
    subtitle: 'Human Rights and Social Justice Mission',
    category: 'Public Welfare Aid',
    location: 'National / All India',
    amount: selectedAmount,
    donorName: user?.full_name || 'Donor Supporter',
    donorMobile: user?.mobile_number || '',
    donorEmail: user?.email || '',
    entityId: `don-${Date.now()}`,
  };

  const handleDonate = () => {
    setPaymentModalVisible(true);
  };

  const handleSuccess = (receipt: any) => {
    causesService.recordDonation(
      'General Welfare',
      receipt?.amount || selectedAmount,
      receipt?.paymentId,
    );
    setPaymentModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader title="HRSJM Public & Donor Portal" />
      <ScrollView contentContainerStyle={styles.container}>
        <AppCard style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            {user ? `Welcome, ${user.full_name}` : 'Welcome to HRSJM'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Human Rights and Social Justice Mission
          </Text>
        </AppCard>

        {/* Quick Donation Card with Gateway */}
        <AppCard style={styles.donationCard}>
          <Text style={styles.donationCardTitle}>Support HRSJM Mission</Text>
          <Text style={styles.donationCardSub}>
            Your contributions directly fund legal aid, education, healthcare, and emergency social relief.
          </Text>

          <View style={styles.presetAmountsRow}>
            {PRESET_AMOUNTS.map(amt => {
              const active = selectedAmount === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  style={[styles.presetChip, active && styles.presetChipActive]}
                  onPress={() => setSelectedAmount(amt)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetChipText, active && styles.presetChipTextActive]}>
                    ₹{amt.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.donateCtaBtn}
            onPress={handleDonate}
            activeOpacity={0.85}
          >
            <Text style={styles.donateCtaBtnText}>
              Donate ₹{selectedAmount.toLocaleString('en-IN')} via Cashfree Gateway
            </Text>
          </TouchableOpacity>

          <Text style={styles.securityNote}>
            🔒 100% Secure • 80G Tax Exemption Certificate Available
          </Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Active Campaigns</Text>
          <Text style={styles.cardBody}>
            Explore ongoing social welfare causes and relief funds.
          </Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>My Donations & 80G Receipts</Text>
          <Text style={styles.cardBody}>
            Download tax-exemption certificates for your contributions.
          </Text>
        </AppCard>

        {user ? (
          <View style={styles.actionContainer}>
            <AppButton
              title="Log Out"
              variant="outline"
              onPress={signOut}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Cashfree Payment Gateway Checkout Modal */}
      <GlobalPaymentModal
        visible={paymentModalVisible}
        payload={paymentPayload}
        initialStage="checkout"
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  container: {
    padding: Spacing.base,
    gap: 14,
  },
  welcomeCard: {
    backgroundColor: '#EDF2F7',
    borderColor: '#DBE5EE',
    borderWidth: 1,
    padding: Spacing.lg,
  },
  welcomeTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    ...Typography.secondary,
    color: AdminColors.textSecondary,
  },
  donationCard: {
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EC',
    borderRadius: 12,
  },
  donationCardTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2F52',
    marginBottom: 4,
  },
  donationCardSub: {
    ...Typography.body,
    color: '#718096',
    marginBottom: 12,
    fontSize: 12.5,
  },
  presetAmountsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#DCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  presetChipActive: {
    borderColor: '#06294D',
    backgroundColor: '#06294D',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34516D',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  donateCtaBtn: {
    backgroundColor: '#FAD465',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011F39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  donateCtaBtnText: {
    color: '#011F39',
    fontSize: 14,
    fontWeight: '700',
  },
  securityNote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    padding: Spacing.lg,
  },
  cardTitle: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardBody: {
    ...Typography.body,
    color: AdminColors.textSecondary,
  },
  actionContainer: {
    marginTop: Spacing.md,
  },
});

export default DonorHomeScreen;

