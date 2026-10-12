import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';
import { SupportTicket, TicketStatus } from '../types/ticket.types';
import { CategoryIcon, ChevronRightIcon } from './SupportIcons';
import { APPROVED_TICKET_CATEGORIES } from '../data/categories';

interface SupportTicketCardProps {
  ticket: SupportTicket;
  onPress?: (ticket: SupportTicket) => void;
  onViewDetails?: (ticket: SupportTicket) => void;
}

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: 'Pending',
    bg: '#FEF3C7',
    text: '#D97706',
    border: '#FDE68A',
  },
  open: {
    label: 'Open',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
  },
  in_progress: {
    label: 'In Progress',
    bg: '#FFFBEB',
    text: '#D97706',
    border: '#FDE68A',
  },
  resolved: {
    label: 'Resolved',
    bg: '#F0FDF4',
    text: '#16A34A',
    border: '#BBF7D0',
  },
  closed: {
    label: 'Closed',
    bg: '#FEF2F2',
    text: '#DC2626',
    border: '#FECACA',
  },
};

export const SupportTicketCard: React.FC<SupportTicketCardProps> = ({
  ticket,
  onPress,
  onViewDetails,
}) => {
  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

  // Find category style metadata
  const catItem = APPROVED_TICKET_CATEGORIES.find(
    c => c.name.toLowerCase() === ticket.category.toLowerCase()
  );
  const tileBg = catItem?.bgColor || '#F1F5F9';

  const handleCardPress = () => {
    if (onPress) {
      onPress(ticket);
    } else if (onViewDetails) {
      onViewDetails(ticket);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(ticket);
    } else if (onPress) {
      onPress(ticket);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${ticket.ticketNumber}, ${ticket.subject}, status: ${statusCfg.label}`}
    >
      <View style={styles.topRow}>
        {/* Category Icon Tile */}
        <View style={[styles.iconTile, { backgroundColor: tileBg }]}>
          <CategoryIcon category={ticket.category} size={22} />
        </View>

        {/* Content Info */}
        <View style={styles.contentColumn}>
          <Text style={styles.subjectText} numberOfLines={1}>
            {ticket.subject}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.ticketIdText}>
              {ticket.ticketNumber}
            </Text>
            <Text style={styles.metaDivider}>|</Text>
            <Text style={styles.categoryText} numberOfLines={1}>
              {ticket.category}
            </Text>
          </View>

          <Text style={styles.dateText}>{ticket.formattedDate}</Text>

          <Text style={styles.descriptionPreview} numberOfLines={1}>
            {ticket.description}
          </Text>
        </View>

        {/* Right Actions: Status Badge & View Details */}
        <View style={styles.rightActionColumn}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusCfg.bg,
                borderColor: statusCfg.border,
              },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
              {statusCfg.label}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={handleViewDetails}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${ticket.ticketNumber}`}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <ChevronRightIcon size={12} color={AdminColors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  contentColumn: {
    flex: 1,
    paddingRight: 8,
  },
  subjectText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ticketIdText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  metaDivider: {
    fontSize: 11,
    color: '#CBD5E1',
    marginHorizontal: 5,
  },
  categoryText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    flexShrink: 1,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  descriptionPreview: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
  rightActionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 64,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
    marginTop: 8,
    gap: 3,
  },
  viewDetailsText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AdminColors.primary,
  },
});
