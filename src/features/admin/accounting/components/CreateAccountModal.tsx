import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../../core/theme';
import type {
  AccountItem,
  AccountType,
  CreateAccountPayload,
} from '../types/accounting.types';

interface CreateAccountModalProps {
  visible: boolean;
  parentAccounts: AccountItem[];
  defaultType?: AccountType;
  onClose: () => void;
  onSubmit: (payload: CreateAccountPayload) => Promise<void>;
}

const ACCOUNT_TYPES: Array<{ key: AccountType; label: string }> = [
  { key: 'ASSET', label: 'Asset' },
  { key: 'LIABILITY', label: 'Liability' },
  { key: 'FUND_EQUITY', label: 'Equity / Fund' },
  { key: 'INCOME', label: 'Income' },
  { key: 'EXPENSE', label: 'Expense' },
];

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  visible,
  parentAccounts,
  defaultType = 'EXPENSE',
  onClose,
  onSubmit,
}) => {
  const [accountName, setAccountName] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(defaultType);
  const [parentAccountId, setParentAccountId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const eligibleParents = parentAccounts.filter(a => a.account_type === accountType);

  const handleSave = async () => {
    if (!accountName.trim()) {
      setErrorMsg('Account name is required');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit({
        account_name: accountName.trim(),
        account_type: accountType,
        account_code: accountCode.trim() || undefined,
        parent_account_id: parentAccountId || undefined,
        description: description.trim() || undefined,
      });
      // Reset form
      setAccountName('');
      setAccountCode('');
      setDescription('');
      setParentAccountId(null);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Add a new account to the Chart of Accounts</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Account Type Selector */}
            <Text style={styles.label}>Account Category *</Text>
            <View style={styles.typeGrid}>
              {ACCOUNT_TYPES.map(type => {
                const isSelected = accountType === type.key;
                return (
                  <TouchableOpacity
                    key={type.key}
                    style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                    onPress={() => {
                      setAccountType(type.key);
                      setParentAccountId(null);
                    }}
                  >
                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Account Code */}
            <Text style={styles.label}>Account Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5010"
              placeholderTextColor="#94A3B8"
              value={accountCode}
              onChangeText={setAccountCode}
            />

            {/* Account Name */}
            <Text style={styles.label}>Account Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Legal Aid Workshop Expenses"
              placeholderTextColor="#94A3B8"
              value={accountName}
              onChangeText={setAccountName}
            />

            {/* Parent Account */}
            {eligibleParents.length > 0 && (
              <>
                <Text style={styles.label}>Parent Account (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parentScroll}>
                  <TouchableOpacity
                    style={[styles.parentChip, parentAccountId === null && styles.parentChipSelected]}
                    onPress={() => setParentAccountId(null)}
                  >
                    <Text style={[styles.parentChipText, parentAccountId === null && styles.parentChipTextSelected]}>
                      None (Top Level)
                    </Text>
                  </TouchableOpacity>
                  {eligibleParents.map(parent => (
                    <TouchableOpacity
                      key={parent.id}
                      style={[styles.parentChip, parentAccountId === parent.id && styles.parentChipSelected]}
                      onPress={() => setParentAccountId(parent.id)}
                    >
                      <Text
                        style={[
                          styles.parentChipText,
                          parentAccountId === parent.id && styles.parentChipTextSelected,
                        ]}
                      >
                        {parent.account_code ? `${parent.account_code} ` : ''}
                        {parent.account_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Description */}
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Purpose and usage notes for this account"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </ScrollView>

          {/* Footer actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
  },
  body: {
    maxHeight: 400,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeChipSelected: {
    backgroundColor: '#EBF1FF',
    borderColor: AdminColors.primary,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  typeChipTextSelected: {
    color: AdminColors.primary,
    fontWeight: '700',
  },
  parentScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  parentChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  parentChipSelected: {
    backgroundColor: '#EBF1FF',
    borderColor: AdminColors.primary,
  },
  parentChipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  parentChipTextSelected: {
    color: AdminColors.primary,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    backgroundColor: AdminColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
