import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppEmptyState } from '../../../../core/components/feedback/AppEmptyState';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { useDebouncedValue } from '../../../../core/hooks/useDebouncedValue';
import { AdminColors, BorderRadius, Spacing, Typography, Shadows } from '../../../../core/theme';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
} from '../../../../core/components/icons';
import { useAccounts } from '../hooks/useAccounts';
import type { AccountItem, AccountType } from '../types/accounting.types';

interface AccountPickerModalProps {
  visible: boolean;
  title: string;
  accountType: AccountType;
  /** Currently selected account id (shown with a check). */
  selectedId?: string | null;
  onSelect: (account: AccountItem) => void;
  onClose: () => void;
}

export const AccountPickerModal: React.FC<AccountPickerModalProps> = ({
  visible,
  title,
  accountType,
  selectedId,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const accountsQuery = useAccounts(accountType, debouncedSearch || undefined);

  // CRUD Sub-modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<AccountItem | null>(null);

  // Form states for Create / Edit
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormError(null);
    setCreateModalOpen(true);
  };

  const openEditModal = (account: AccountItem) => {
    setEditingAccount(account);
    setFormName(account.account_name);
    setFormCode(account.account_code || '');
    setFormDescription(account.description || '');
    setFormError(null);
  };

  const handleSaveCreate = async () => {
    if (!formName.trim()) {
      setFormError('Account name is required.');
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      const newAccount = await accountsQuery.createAccount({
        account_name: formName.trim(),
        account_type: accountType,
        account_code: formCode.trim() || undefined,
        description: formDescription.trim() || undefined,
      });
      setCreateModalOpen(false);
      onSelect(newAccount);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create account.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAccount) return;
    if (!formName.trim()) {
      setFormError('Account name is required.');
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      const updated = await accountsQuery.updateAccount(editingAccount.id, {
        account_name: formName.trim(),
        account_code: formCode.trim() || undefined,
        description: formDescription.trim() || undefined,
      });
      setEditingAccount(null);
      if (selectedId === editingAccount.id) {
        onSelect(updated);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update account.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return;
    setFormLoading(true);
    try {
      await accountsQuery.toggleAccountStatus(deletingAccount.id, deletingAccount.is_active);
      setDeletingAccount(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to change account status.');
    } finally {
      setFormLoading(false);
    }
  };

  const renderRow = ({ item }: { item: AccountItem }) => {
    const selected = item.id === selectedId;
    return (
      <View style={[styles.row, selected ? styles.rowSelected : null]}>
        <TouchableOpacity
          style={styles.rowMain}
          activeOpacity={0.7}
          onPress={() => {
            onSelect(item);
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Select ${item.account_name}`}
        >
          <View style={styles.rowText}>
            <View style={styles.nameRow}>
              <Text style={styles.rowName} numberOfLines={1}>
                {item.account_name}
              </Text>
              {!item.is_active && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>Inactive</Text>
                </View>
              )}
            </View>
            {item.account_code ? (
              <Text style={styles.rowCode}>{item.account_code}</Text>
            ) : null}
          </View>
          {selected ? (
            <View style={styles.checkIconWrap}>
              <Check size={16} color={AdminColors.primary} strokeWidth={2.5} />
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Row Action Controls: Edit and Delete */}
        <View style={styles.rowActions}>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => openEditModal(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.account_name}`}
          >
            <Pencil size={15} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => setDeletingAccount(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Delete or deactivate ${item.account_name}`}
          >
            <Trash2 size={15} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.typeTag}>{accountType} Accounts</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={18} color={AdminColors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Quick Add Bar & Search */}
          <View style={styles.searchRow}>
            <View style={styles.searchBarWrap}>
              <AppSearchBar placeholder="Search accounts..." onSearch={setSearch} />
            </View>
            <TouchableOpacity
              style={styles.addNewBtn}
              onPress={openCreateModal}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Add New Account"
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addNewBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Accounts List / States */}
          {accountsQuery.loading ? (
            <View style={styles.loaderWrap}>
              <AppLoader size="small" />
            </View>
          ) : accountsQuery.error ? (
            <Text style={styles.errorText}>
              {accountsQuery.error || 'Unable to load accounts. Try again.'}
            </Text>
          ) : accountsQuery.accounts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <AppEmptyState
                icon="📚"
                title="No accounts found"
                description={
                  debouncedSearch
                    ? 'Try a different search term or add a new account.'
                    : `No ${accountType.toLowerCase()} accounts created yet.`
                }
                actionTitle="+ Create Account"
                onAction={openCreateModal}
              />
            </View>
          ) : (
            <FlatList
              data={accountsQuery.accounts}
              keyExtractor={item => item.id}
              renderItem={renderRow}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* --- CREATE ACCOUNT MODAL --- */}
      <Modal
        visible={createModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalOpen(false)}
      >
        <View style={styles.innerBackdrop}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formTitle}>Create {accountType} Account</Text>
                <Text style={styles.formSubtitle}>Add a new account to your chart of accounts</Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalOpen(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {formError ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color="#DC2626" />
                <Text style={styles.errorBannerText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.formBody}>
              <Text style={styles.inputLabel}>Account Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder={`e.g. ${accountType === 'ASSET' ? 'HDFC Bank / Petty Cash' : 'Office Stationery Expense'}`}
                placeholderTextColor="#94A3B8"
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={styles.inputLabel}>Account Code (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder={`e.g. ${accountType === 'ASSET' ? '1003' : '5005'}`}
                placeholderTextColor="#94A3B8"
                value={formCode}
                onChangeText={setFormCode}
              />

              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Notes on usage or purpose"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                value={formDescription}
                onChangeText={setFormDescription}
              />
            </View>

            <View style={styles.formFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCreateModalOpen(false)}
                disabled={formLoading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveCreate}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Create &amp; Select</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- EDIT ACCOUNT MODAL --- */}
      <Modal
        visible={Boolean(editingAccount)}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingAccount(null)}
      >
        <View style={styles.innerBackdrop}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formTitle}>Edit Account</Text>
                <Text style={styles.formSubtitle}>Update account name, code or description</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingAccount(null)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {formError ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color="#DC2626" />
                <Text style={styles.errorBannerText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.formBody}>
              <Text style={styles.inputLabel}>Account Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={styles.inputLabel}>Account Code</Text>
              <TextInput
                style={styles.textInput}
                value={formCode}
                onChangeText={setFormCode}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                multiline
                numberOfLines={2}
                value={formDescription}
                onChangeText={setFormDescription}
              />
            </View>

            <View style={styles.formFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingAccount(null)}
                disabled={formLoading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEdit}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- DELETE / DEACTIVATE CONFIRMATION DIALOG --- */}
      <Modal
        visible={Boolean(deletingAccount)}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingAccount(null)}
      >
        <View style={styles.innerBackdrop}>
          <View style={[styles.formCard, { maxWidth: 360 }]}>
            <View style={styles.deleteDialogHeader}>
              <View style={styles.deleteIconWrap}>
                <Trash2 size={22} color="#DC2626" />
              </View>
              <Text style={styles.deleteDialogTitle}>
                {deletingAccount?.is_active ? 'Deactivate Account?' : 'Activate Account?'}
              </Text>
              <Text style={styles.deleteDialogDesc}>
                {deletingAccount?.is_active
                  ? `Are you sure you want to deactivate "${deletingAccount?.account_name}"? It will no longer appear for new voucher selections.`
                  : `Reactivate "${deletingAccount?.account_name}" to allow posting vouchers against it?`}
              </Text>
            </View>

            <View style={styles.formFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeletingAccount(null)}
                disabled={formLoading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  deletingAccount?.is_active && { backgroundColor: '#DC2626' },
                ]}
                onPress={handleConfirmDelete}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {deletingAccount?.is_active ? 'Deactivate' : 'Activate'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerTitleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    letterSpacing: -0.2,
  },
  typeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: AdminColors.primary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 4,
    borderRadius: BorderRadius.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  searchBarWrap: {
    flex: 1,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AdminColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    height: 44,
  },
  addNewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  rowSelected: {
    backgroundColor: '#EBF1FF',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.textPrimary,
  },
  rowCode: {
    fontSize: 11.5,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  checkIconWrap: {
    marginRight: Spacing.sm,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loaderWrap: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: AdminColors.error,
    textAlign: 'center',
    padding: Spacing.lg,
  },

  // Inner sub-modals (Create / Edit / Delete)
  innerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 32, 70, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.floating,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AdminColors.primaryDark,
  },
  formSubtitle: {
    fontSize: 11.5,
    color: AdminColors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  formBody: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.textPrimary,
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: AdminColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: AdminColors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 56,
    textAlignVertical: 'top',
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: AdminColors.textSecondary,
  },
  saveBtn: {
    backgroundColor: AdminColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteDialogHeader: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  deleteIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  deleteDialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AdminColors.primaryDark,
    marginBottom: 6,
  },
  deleteDialogDesc: {
    fontSize: 12.5,
    color: AdminColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AccountPickerModal;