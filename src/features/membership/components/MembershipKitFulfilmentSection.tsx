import React, { useState } from 'react';
import {
  Clipboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from '../../../core/components/icons';

export interface KitFulfillmentData {
  status?: 'PENDING' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED';
  courier_name?: string;
  tracking_number?: string;
  dispatch_date?: string;
  delivery_address?: string;
  notes?: string;
  items?: string[];
  updated_at?: string;
}

interface MembershipKitFulfilmentSectionProps {
  kitFulfillment?: KitFulfillmentData | null;
  memberAddress?: string;
}

export const MembershipKitFulfilmentSection: React.FC<MembershipKitFulfilmentSectionProps> = ({
  kitFulfillment,
  memberAddress,
}) => {
  const [copied, setCopied] = useState(false);

  const status = kitFulfillment?.status || 'PROCESSING';
  const courierName = kitFulfillment?.courier_name || 'India Post (Speed Post)';
  const trackingNumber = kitFulfillment?.tracking_number || '';
  const dispatchDate = kitFulfillment?.dispatch_date
    ? new Date(kitFulfillment.dispatch_date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'In Preparation';

  const address = kitFulfillment?.delivery_address || memberAddress || 'Registered Address on Profile';

  const defaultItems = [
    'Official Appointment Letter',
    'Membership Certificate',
    'Physical ID Card & Lanyard',
    'Car / Bike Sticker',
    'HRSJM Official T-Shirt',
  ];

  const items = kitFulfillment?.items && kitFulfillment.items.length > 0
    ? kitFulfillment.items
    : defaultItems;

  const handleCopyTracking = () => {
    if (trackingNumber) {
      Clipboard.setString(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'DELIVERED':
        return {
          label: 'Delivered',
          bg: '#F0FDF4',
          border: '#BBF7D0',
          text: '#166534',
          icon: CheckCircle2,
        };
      case 'DISPATCHED':
        return {
          label: 'Dispatched via Speed Post',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1E40AF',
          icon: Truck,
        };
      case 'PROCESSING':
        return {
          label: 'In Preparation / Packing',
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
          icon: Package,
        };
      default:
        return {
          label: 'Pending Verification',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#64748B',
          icon: Clock,
        };
    }
  };

  const badge = getStatusBadge();
  const StatusIcon = badge.icon;

  return (
    <View style={styles.sectionContainer} accessible={true} accessibilityLabel="Membership Kit Fulfilment Section">
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Physical Kit Fulfilment</Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <StatusIcon size={13} color={badge.text} strokeWidth={2.2} />
          <Text style={[styles.statusBadgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Main Fulfillment Card */}
      <View style={styles.cardContainer}>
        {/* Tracking & Courier Info Box */}
        <View style={styles.courierBanner}>
          <View style={styles.courierIconBox}>
            <Truck size={22} color="#0F2860" strokeWidth={2} />
          </View>
          <View style={styles.courierInfoCol}>
            <Text style={styles.courierServiceLabel}>Carrier / Fulfilment Partner</Text>
            <Text style={styles.courierServiceName}>{courierName}</Text>
          </View>
        </View>

        {/* Tracking Number Row */}
        {trackingNumber ? (
          <View style={styles.trackingRow}>
            <View style={styles.trackingCol}>
              <Text style={styles.trackingLabel}>Consignment / Tracking No.</Text>
              <Text style={styles.trackingValue}>{trackingNumber}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyTracking}
              style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Copy Tracking Number"
            >
              <Copy size={14} color={copied ? '#166534' : '#0F2860'} />
              <Text style={[styles.copyBtnText, copied && styles.copyBtnTextSuccess]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noticeBox}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.noticeText}>
              Consignment tracking ID will be generated upon speed post dispatch.
            </Text>
          </View>
        )}

        {/* Details Grid: Date & Destination Address */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={styles.detailItemHeader}>
              <Calendar size={14} color="#64748B" />
              <Text style={styles.detailItemLabel}>Dispatch Date</Text>
            </View>
            <Text style={styles.detailItemValue}>{dispatchDate}</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailItemHeader}>
              <MapPin size={14} color="#64748B" />
              <Text style={styles.detailItemLabel}>Delivery Destination</Text>
            </View>
            <Text style={styles.detailItemValue} numberOfLines={2}>
              {address}
            </Text>
          </View>
        </View>

        {/* Kit Items Inclusions Checklist */}
        <View style={styles.itemsSection}>
          <View style={styles.itemsSectionHeader}>
            <Package size={15} color="#0F2860" />
            <Text style={styles.itemsSectionTitle}>Welcome Kit Contents</Text>
          </View>

          <View style={styles.itemsList}>
            {items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.checkIconBox}>
                  <CheckCircle2 size={15} color="#16A34A" strokeWidth={2.2} />
                </View>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Verification Note */}
        <View style={styles.footerNote}>
          <ShieldCheck size={14} color="#64748B" />
          <Text style={styles.footerNoteText}>
            Official HRSJM physical kits are dispatched via Government Speed Post with postal tracking.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  courierBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  courierIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  courierInfoCol: {
    flex: 1,
  },
  courierServiceLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  courierServiceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2860',
    marginTop: 2,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  trackingCol: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  trackingValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.8,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyBtnSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
  },
  copyBtnTextSuccess: {
    color: '#166534',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  detailItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  detailItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  itemsSection: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 12,
    marginBottom: 12,
  },
  itemsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  itemsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
  },
  itemsList: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIconBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  footerNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
});

