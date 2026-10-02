import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppModal } from '../../../../core/components/common/AppModal';
import { AppLoader } from '../../../../core/components/feedback/AppLoader';
import { AppEmptyState } from '../../../../core/components/feedback/AppEmptyState';
import { AppSearchBar } from '../../../../core/components/common/AppSearchBar';
import { useDebouncedValue } from '../../../../core/hooks/useDebouncedValue';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing } from '../../../../core/theme/spacing';
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

/**
 * Bottom picker for chart-of-accounts entries, pre-filtered by account type
 * (the backend hard-enforces type + active on voucher creation).
 */
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

  const renderRow = ({ item }: { item: AccountItem }) => {
    const selected = item.id === selectedId;
    return (
      <TouchableOpacity
        style={[styles.row, selected ? styles.rowSelected : null]}
        activeOpacity={0.7}
        onPress={() => {
          onSelect(item);
          onClose();
        }}
      >
        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.account_name}
          </Text>
          {item.account_code ? (
            <Text style={styles.rowCode}>{item.account_code}</Text>
          ) : null}
        </View>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <AppModal visible={visible} onClose={onClose} title={title} maxHeight={480}>
      <AppSearchBar placeholder="Search accounts…" onSearch={setSearch} />
      {accountsQuery.isLoading ? (
        <AppLoader size="small" />
      ) : accountsQuery.isError ? (
        <Text style={styles.errorText}>
          Unable to load accounts. Try again.
        </Text>
      ) : (accountsQuery.data?.items?.length ?? 0) === 0 ? (
        <AppEmptyState
          icon="📚"
          title="No accounts found"
          description={
            debouncedSearch
              ? 'Try a different search term.'
              : 'No active accounts of this type exist yet.'
          }
        />
      ) : (
        <FlatList
          data={accountsQuery.data?.items ?? []}
          keyExtractor={item => item.id}
          renderItem={renderRow}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </AppModal>
  );
};

const styles = StyleSheet.create({
  list: {
    maxHeight: 320,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  rowSelected: {
    backgroundColor: AdminColors.primaryLight,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
  rowCode: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  check: {
    ...Typography.bodyBold,
    color: AdminColors.primary,
  },
  errorText: {
    ...Typography.body,
    color: AdminColors.error,
    textAlign: 'center',
    padding: Spacing.lg,
  },
});