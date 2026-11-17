import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../../core';
import {
  MEMBERSHIP_POSITIONS_DATA,
  MembershipPositionItem,
} from '../constants/membershipPositions';

interface MembershipPositionSelectorProps {
  selectedPosition?: string | null;
  onSelectPosition: (position: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export const MembershipPositionSelector: React.FC<MembershipPositionSelectorProps> = ({
  selectedPosition,
  onSelectPosition,
  disabled = false,
  required = true,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedItem = useMemo(() => {
    if (!selectedPosition) return null;
    return (
      MEMBERSHIP_POSITIONS_DATA.find(
        (p) => p.name.toLowerCase() === selectedPosition.trim().toLowerCase(),
      ) || null
    );
  }, [selectedPosition]);

  const filteredPositions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MEMBERSHIP_POSITIONS_DATA;
    return MEMBERSHIP_POSITIONS_DATA.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        String(item.id).includes(q) ||
        (item.note && item.note.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  const handleSelect = (positionName: string) => {
    onSelectPosition(positionName);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {/* Field Label Header */}
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>
          Membership Position
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </Text>
        {selectedItem ? (
          <View style={styles.assignedBadge}>
            <Text style={styles.assignedBadgeText}>Position #{selectedItem.id}</Text>
          </View>
        ) : null}
      </View>

      {/* Main Trigger Button */}
      <TouchableOpacity
        style={[
          styles.selectorButton,
          selectedPosition ? styles.selectorButtonFilled : null,
          disabled ? styles.selectorButtonDisabled : null,
          error ? styles.selectorButtonError : null,
        ]}
        onPress={() => {
          if (!disabled) {
            setSearchQuery('');
            setModalVisible(true);
          }
        }}
        activeOpacity={disabled ? 1 : 0.7}
        accessibilityRole="button"
        accessibilityLabel="Select Membership Position"
      >
        <View style={styles.buttonLeft}>
          <View
            style={[
              styles.iconWrapper,
              selectedPosition ? styles.iconWrapperFilled : null,
            ]}
          >
            <Text style={styles.iconText}>🏛️</Text>
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.buttonText,
                selectedPosition ? styles.buttonTextSelected : styles.buttonTextPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedPosition || 'Select 1 of 25 Membership Positions...'}
            </Text>
            {selectedItem?.note ? (
              <Text style={styles.subNoteText} numberOfLines={1}>
                {selectedItem.note}
              </Text>
            ) : null}
          </View>
        </View>

        {!disabled && (
          <View style={styles.chevronWrapper}>
            <Text style={styles.chevronIcon}>▼</Text>
          </View>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Searchable Dropdown Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Select Membership Position</Text>
                    <Text style={styles.modalSubtitle}>
                      Assign 1 official position out of 25
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setModalVisible(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search from 25 positions..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={styles.clearSearchBtn}
                    >
                      <Text style={styles.clearSearchText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Position List */}
                <FlatList
                  data={filteredPositions}
                  keyExtractor={(item) => String(item.id)}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  renderItem={({ item }) => {
                    const isSelected =
                      selectedPosition?.toLowerCase().trim() ===
                      item.name.toLowerCase().trim();

                    return (
                      <TouchableOpacity
                        style={[
                          styles.listItem,
                          isSelected && styles.listItemSelected,
                        ]}
                        onPress={() => handleSelect(item.name)}
                        activeOpacity={0.7}
                      >
                        {/* Number Badge */}
                        <View
                          style={[
                            styles.numberBadge,
                            isSelected && styles.numberBadgeSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.numberBadgeText,
                              isSelected && styles.numberBadgeTextSelected,
                            ]}
                          >
                            {item.id}
                          </Text>
                        </View>

                        {/* Title & Notes */}
                        <View style={styles.listItemTextContainer}>
                          <Text
                            style={[
                              styles.listItemTitle,
                              isSelected && styles.listItemTitleSelected,
                            ]}
                          >
                            {item.name}
                          </Text>
                          {item.note ? (
                            <Text
                              style={[
                                styles.listItemNote,
                                isSelected && styles.listItemNoteSelected,
                              ]}
                            >
                              ({item.note})
                            </Text>
                          ) : null}
                        </View>

                        {/* Selected Indicator */}
                        {isSelected ? (
                          <View style={styles.checkCircle}>
                            <Text style={styles.checkMark}>✓</Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyIcon}>🔍</Text>
                      <Text style={styles.emptyText}>
                        No positions match "{searchQuery}"
                      </Text>
                    </View>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2860',
    letterSpacing: 0.2,
  },
  requiredStar: {
    color: '#DC2626',
    fontWeight: '800',
  },
  assignedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  assignedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  selectorButtonFilled: {
    borderColor: '#0F2860',
    backgroundColor: '#F8FAFC',
  },
  selectorButtonDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  selectorButtonError: {
    borderColor: '#EF4444',
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconWrapperFilled: {
    backgroundColor: '#FEF3C7',
  },
  iconText: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 18,
  },
  buttonTextSelected: {
    fontWeight: '700',
    color: '#0F2860',
  },
  buttonTextPlaceholder: {
    fontWeight: '400',
    color: '#64748B',
  },
  subNoteText: {
    fontSize: 11,
    color: '#B45309',
    fontStyle: 'italic',
    marginTop: 2,
  },
  chevronWrapper: {
    paddingLeft: 4,
  },
  chevronIcon: {
    fontSize: 10,
    color: '#64748B',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2860',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F2860',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  list: {
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
  },
  listItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberBadgeSelected: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  numberBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  numberBadgeTextSelected: {
    color: '#FFFFFF',
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  listItemTitleSelected: {
    fontWeight: '800',
    color: '#0F2860',
  },
  listItemNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#B45309',
    marginTop: 2,
  },
  listItemNoteSelected: {
    color: '#D97706',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkMark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
});
