import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AdminColors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { AppButton } from '../common/AppButton';

export interface FilterOption {
  key: string;
  label: string;
}

export interface FilterSection {
  heading: string;
  note?: string;
  options?: FilterOption[];
  selected?: string[];
  disabled?: boolean;
  onToggle?: (key: string) => void;
}

export interface AdminFilterSheetProps {
  visible: boolean;
  title?: string;
  sections: FilterSection[];
  onClose: () => void;
  onApply: () => void;
  onClear?: () => void;
}

export const AdminFilterSheet: React.FC<AdminFilterSheetProps> = ({
  visible,
  title = 'Filters',
  sections,
  onClose,
  onApply,
  onClear,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {sections.map((section, idx) => (
                  <View key={idx} style={styles.section}>
                    <Text style={styles.sectionHeading}>{section.heading}</Text>
                    {section.note ? (
                      <Text style={styles.sectionNote}>{section.note}</Text>
                    ) : null}
                    {section.options && section.options.length > 0 ? (
                      <View style={styles.chipRow}>
                        {section.options.map(option => {
                          const isSelected = section.selected?.includes(option.key);
                          return (
                            <TouchableOpacity
                              key={option.key}
                              disabled={section.disabled}
                              onPress={() => section.onToggle?.(option.key)}
                              style={[
                                styles.chip,
                                isSelected ? styles.chipSelected : styles.chipUnselected,
                                section.disabled && styles.chipDisabled,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                ))}
              </ScrollView>

              <View style={styles.footer}>
                {onClear ? (
                  <AppButton
                    title="Reset"
                    onPress={onClear}
                    variant="outline"
                    size="md"
                    style={styles.footerButton}
                  />
                ) : null}
                <AppButton
                  title="Apply Filters"
                  onPress={() => {
                    onApply();
                    onClose();
                  }}
                  variant="primary"
                  size="md"
                  style={styles.footerButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    paddingBottom: Spacing.xl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: AdminColors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  title: {
    ...Typography.sectionHeader,
    color: AdminColors.textPrimary,
  },
  closeText: {
    fontSize: 18,
    color: AdminColors.textSecondary,
    fontWeight: 'bold',
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    ...Typography.cardTitle,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionNote: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: AdminColors.primaryLight,
    borderColor: AdminColors.primary,
  },
  chipUnselected: {
    backgroundColor: '#F8FAFC',
    borderColor: AdminColors.border,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    ...Typography.bodyMedium,
  },
  chipTextSelected: {
    color: AdminColors.primary,
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: AdminColors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: AdminColors.border,
  },
  footerButton: {
    flex: 1,
  },
});

export default AdminFilterSheet;
