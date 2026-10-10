import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import type { AccountTreeNode } from '../types/accounting.types';

interface AccountDetailsSheetProps {
  visible: boolean;
  account: AccountTreeNode | null;
  onClose: () => void;
  onViewLedger: (account: AccountTreeNode) => void;
  onToggleStatus: (account: AccountTreeNode) => void;
}

export const AccountDetailsSheet: React.FC<AccountDetailsSheetProps> = ({
  visible,
  account,
  onClose,
  onViewLedger,
  onToggleStatus,
}) => {
  if (!account) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {/* Account Title & Code */}
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              {account.account_code ? (
                <Text style={styles.codeText}>{account.account_code}</Text>
              ) : null}
              <Text style={styles.nameText}>{account.account_name}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                account.is_active ? styles.statusActive : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  account.is_active ? styles.statusTextActive : styles.statusTextInactive,
                ]}
              >
                {account.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {/* Metadata Grid */}
          <View style={styles.metaBox}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{account.account_type}</Text>
            </View>

            {account.description ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Description</Text>
                <Text style={styles.metaValue}>{account.description}</Text>
              </View>
            ) : null}

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Child Accounts</Text>
              <Text style={styles.metaValue}>
                {account.children ? account.children.length : 0} sub-accounts
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsList}>
            {/* View Ledger */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => {
                onClose();
                onViewLedger(account);
              }}
            >
              <Text style={styles.actionIcon}>📖</Text>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionBtnPrimaryText}>View Account Ledger</Text>
                <Text style={styles.actionBtnPrimarySub}>
                  Inspect opening balance, debits, credits and running balance
                </Text>
              </View>
              <Text style={styles.chevronPrimary}>›</Text>
            </TouchableOpacity>

            {/* Toggle Active / Inactive Status */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                onClose();
                onToggleStatus(account);
              }}
            >
              <Text style={styles.actionIcon}>{account.is_active ? '⏸️' : '▶️'}</Text>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionBtnText}>
                  {account.is_active ? 'Deactivate Account' : 'Activate Account'}
                </Text>
                <Text style={styles.actionBtnSub}>
                  {account.is_active
                    ? 'Hide from voucher dropdown selections'
                    : 'Make available for voucher posting'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextInactive: {
    color: '#64748B',
  },
  metaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionsList: {
    gap: 8,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnPrimary: {
    backgroundColor: '#EBF1FF',
    borderColor: '#BFDBFE',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionBtnSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  actionBtnPrimarySub: {
    fontSize: 11,
    color: '#4B6B94',
    marginTop: 1,
  },
  chevronPrimary: {
    fontSize: 20,
    color: AdminColors.primary,
    fontWeight: '700',
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
