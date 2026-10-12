import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { SupportTicket } from '../types/ticket.types';
import { APPROVED_TICKET_CATEGORIES } from '../data/categories';
import { supportTicketsStore } from '../services/supportTicketsStore';
import { SupportTicketsHeader } from '../components/SupportTicketsHeader';
import { SupportProgressStepper } from '../components/SupportProgressStepper';
import { CategoryIcon } from '../components/SupportIcons';
import { SupportBottomNav } from '../components/SupportBottomNav';

interface TicketSubmittedScreenProps {
  ticketId?: string;
  onViewAllTickets?: () => void;
  onCreateAnotherTicket?: () => void;
  onBottomTabPress?: (key: string) => void;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const TicketSubmittedScreen: React.FC<TicketSubmittedScreenProps> = ({
  ticketId,
  onViewAllTickets,
  onCreateAnotherTicket,
  onBottomTabPress,
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Look up ticket from store by ticketId or fallback to lastCreatedTicket
  const ticket: SupportTicket | undefined =
    (ticketId ? supportTicketsStore.getTicketById(ticketId) : undefined) ||
    supportTicketsStore.getLastCreatedTicket() ||
    supportTicketsStore.getTickets()[0];

  const categoryObj = APPROVED_TICKET_CATEGORIES.find(
    c => c.name.toLowerCase() === ticket?.category?.toLowerCase()
  );

  const displayTicketNumber = ticket?.ticketNumber || (ticketId ? `#${ticketId}` : '#TKT-2026-0001');

  const handleCopyId = () => {
    const textToCopy = displayTicketNumber.replace(/^#/, '');
    const nav = typeof globalThis !== 'undefined' ? (globalThis as any).navigator : undefined;
    if (nav && nav.clipboard && nav.clipboard.writeText) {
      nav.clipboard.writeText(textToCopy);
    }
    setCopied(true);
  };

  return (
    <View style={styles.screen}>
      {/* Top Branded Header */}
      <SupportTicketsHeader
        paddingTop={insets.top}
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        onProfilePress={onProfilePress}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* Stepper (Step 3 active / completed) */}
          <View style={styles.stepperContainer}>
            <SupportProgressStepper currentStep={3} />
          </View>

          {/* Success Hero Section */}
          <View style={styles.heroCard}>
            <View style={styles.successIconCircle}>
              <Text style={styles.checkmarkEmoji}>✓</Text>
            </View>

            <Text style={styles.heroTitle}>Ticket Submitted Successfully!</Text>
            <Text style={styles.heroSubtitle}>
              Your support request has been logged into our system. Our team has received your ticket and will attend to it shortly.
            </Text>
          </View>

          {/* Ticket Information Card */}
          <View style={styles.ticketDetailsCard}>
            {/* Ticket Reference Row */}
            <View style={styles.referenceRow}>
              <View>
                <Text style={styles.referenceLabel}>TICKET REFERENCE ID</Text>
                <Text style={styles.referenceValue}>{displayTicketNumber}</Text>
              </View>

              <TouchableOpacity
                style={[styles.copyButton, copied && styles.copyButtonActive]}
                onPress={handleCopyId}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Copy ticket reference ID"
              >
                <Text style={styles.copyButtonIcon}>{copied ? '✓' : '📋'}</Text>
                <Text style={[styles.copyButtonText, copied && styles.copyButtonTextActive]}>
                  {copied ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.cardDivider} />

            {/* Ticket Info Rows */}
            {/* Row 1: Category */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <View style={styles.infoValueRow}>
                <View
                  style={[
                    styles.categoryIconBadge,
                    { backgroundColor: categoryObj?.bgColor || '#EFF6FF' },
                  ]}
                >
                  <CategoryIcon
                    category={categoryObj?.name || ticket?.category || 'General'}
                    size={16}
                  />
                </View>
                <Text style={styles.infoValueText}>
                  {ticket?.category || 'General Inquiry'}
                </Text>
              </View>
            </View>

            {/* Row 2: Subject */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subject</Text>
              <Text style={[styles.infoValueText, styles.subjectText]} numberOfLines={2}>
                {ticket?.subject || 'Support Request'}
              </Text>
            </View>

            {/* Row 3: Status */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusBadgeText}>
                  {ticket?.status && ticket.status !== 'open' && ticket.status !== 'pending'
                    ? (ticket.status === 'in_progress'
                        ? 'In Progress'
                        : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1))
                    : 'Pending'}
                </Text>
              </View>
            </View>

            {/* Row 4: Submitted Date */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Submitted On</Text>
              <Text style={styles.infoValueText}>
                {ticket?.formattedDate || 'Today'}
              </Text>
            </View>

            {/* Row 5: Attachments (if any) */}
            {ticket?.attachments && ticket.attachments.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Attachments</Text>
                <Text style={styles.infoValueText}>
                  {`${ticket.attachments.length} file${ticket.attachments.length > 1 ? 's' : ''}`}
                </Text>
              </View>
            )}

            {/* SLA Response Note */}
            <View style={styles.slaBox}>
              <Text style={styles.slaIcon}>⏱️</Text>
              <View style={styles.slaTextWrap}>
                <Text style={styles.slaTitle}>Expected Response Time</Text>
                <Text style={styles.slaSubtitle}>
                  Within 24–48 business hours. You can check ticket updates anytime on your support dashboard.
                </Text>
              </View>
            </View>
          </View>

          {/* Action CTAs */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onViewAllTickets}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View All Support Tickets"
            >
              <Text style={styles.primaryButtonText}>View All Tickets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onCreateAnotherTicket}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Raise Another Ticket"
            >
              <Text style={styles.secondaryButtonText}>+ Raise Another Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavHost}>
        <SupportBottomNav
          bottomInset={insets.bottom}
          activeKey="support"
          onTabPress={onBottomTabPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  contentWrap: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  stepperContainer: {
    marginBottom: Spacing.xs,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: Spacing.base + 4,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: Spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  successIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  checkmarkEmoji: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 420,
  },
  ticketDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.base,
    marginBottom: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referenceLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  referenceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: AdminColors.primary,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  copyButtonActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  copyButtonIcon: {
    fontSize: 12,
  },
  copyButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  copyButtonTextActive: {
    color: '#16A34A',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.sm + 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  infoLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryIconBadge: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  subjectText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  slaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: Spacing.sm + 2,
    gap: 8,
  },
  slaIcon: {
    fontSize: 15,
    marginTop: 1,
  },
  slaTextWrap: {
    flex: 1,
  },
  slaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
  },
  slaSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  actionsContainer: {
    gap: 10,
    marginBottom: Spacing.base,
  },
  primaryButton: {
    backgroundColor: AdminColors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AdminColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  bottomNavHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
