import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, serif, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';
import { AppLogo } from '../../../core/components/common/AppLogo';
import type { MembershipApplicationRecord } from '../types/membership.types';

interface MembershipCardModalProps {
  visible: boolean;
  onClose: () => void;
  record: MembershipApplicationRecord;
}

export function MembershipCardModal({
  visible,
  onClose,
  record,
}: MembershipCardModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header with Close button */}
          <View style={styles.topRow}>
            <Text style={styles.modalTitle}>Official Membership Card</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close card">
              <Icon name="x-circle" size={22} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Membership Card Face */}
          <View style={styles.idBadgeContainer}>
            {/* Header Strip */}
            <View style={styles.badgeHeader}>
              <AppLogo size={36} />
              <View style={styles.badgeOrgTextWrap}>
                <Text style={styles.badgeOrgName}>HUMAN RIGHTS & SOCIAL JUSTICE MISSION</Text>
                <Text style={styles.badgeOrgSub}>मानव अधिकार एवं सामाजिक न्याय मिशन</Text>
              </View>
            </View>

            {/* Badge Body */}
            <View style={styles.badgeBody}>
              <View style={styles.photoFrame}>
                {record.personalInfo.profilePhotoUri ? (
                  <Image
                    source={{ uri: record.personalInfo.profilePhotoUri }}
                    style={styles.memberPhoto}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Icon name="person" size={32} color={colors.primary} strokeWidth={2} />
                  </View>
                )}
              </View>

              <View style={styles.memberDetails}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {record.personalInfo.fullName || 'Aman Shaikh'}
                </Text>
                <Text style={styles.memberType}>{record.membershipType}</Text>
                <View style={styles.memIdTag}>
                  <Text style={styles.memIdTagText}>
                    ID: {record.membershipId || 'MEM2026001283'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Badge Footer */}
            <View style={styles.badgeFooter}>
              <View style={styles.footerCol}>
                <Text style={styles.footerLabel}>VALID FROM</Text>
                <Text style={styles.footerVal}>{record.validFrom || '14 Sep 2026'}</Text>
              </View>

              <View style={styles.footerCol}>
                <Text style={styles.footerLabel}>VALID TILL</Text>
                <Text style={styles.footerVal}>{record.validTill || '14 Sep 2027'}</Text>
              </View>

              <View style={styles.footerColRight}>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>ACTIVE</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.disclaimerText}>
            This is a verified digital identification credential issued by the Human Rights & Social Justice Mission.
          </Text>

          <TouchableOpacity
            style={styles.doneBtn}
            activeOpacity={0.85}
            onPress={onClose}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16274B',
  },
  closeBtn: {
    padding: 4,
  },
  idBadgeContainer: {
    backgroundColor: '#0F2860',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F5A623',
    padding: spacing.md,
    position: 'relative',
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    paddingBottom: spacing.sm,
    gap: 8,
  },
  badgeOrgTextWrap: {
    flex: 1,
  },
  badgeOrgName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 0.4,
  },
  badgeOrgSub: {
    fontSize: 8.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  badgeBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  photoFrame: {
    width: 68,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FE',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    ...serif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  memberType: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  memIdTag: {
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.4)',
  },
  memIdTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCD34D',
  },
  badgeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: spacing.sm,
  },
  footerCol: {
    flex: 1,
  },
  footerColRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 8.5,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '700',
  },
  footerVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    marginTop: 1,
  },
  activePill: {
    backgroundColor: colors.active,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  activePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 15,
  },
  doneBtn: {
    backgroundColor: '#0F2860',
    borderRadius: radius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  doneBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.white,
  },
});

export default MembershipCardModal;
