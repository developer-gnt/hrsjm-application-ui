import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../../core/theme/theme';
import { Icon } from '../../../core/components/common/Icon';

interface PrintReceiptSheetProps {
  visible: boolean;
  onClose: () => void;
  receiptNo: string;
}

const PRINTERS = [
  'Microsoft Print to PDF',
  'HP LaserJet Pro M404dn',
  'Canon PIXMA G3010',
  'Save as PDF Document',
];

export function PrintReceiptSheet({
  visible,
  onClose,
  receiptNo,
}: PrintReceiptSheetProps) {
  const [selectedPrinter, setSelectedPrinter] = useState(PRINTERS[0]);
  const [pageSelection, setPageSelection] = useState<'ALL' | 'PAGE_1'>('ALL');
  const [printerMenuOpen, setPrinterMenuOpen] = useState(false);
  const [printingStatus, setPrintingStatus] = useState<string | null>(null);

  const handlePrint = () => {
    setPrintingStatus(`Simulated: Sending ${receiptNo} to ${selectedPrinter}...`);
    setTimeout(() => {
      setPrintingStatus(null);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Print Receipt</Text>
                <TouchableOpacity
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close print sheet"
                  style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                {printingStatus ? (
                  <View style={styles.feedbackBanner}>
                    <Text style={styles.feedbackText}>{printingStatus}</Text>
                  </View>
                ) : null}

                {/* Select Printer */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Select Printer</Text>
                  <TouchableOpacity
                    onPress={() => setPrinterMenuOpen(!printerMenuOpen)}
                    accessibilityRole="combobox"
                    style={styles.dropdownBtn}>
                    <View style={styles.printerIconWrap}>
                      <Icon name="printer" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.dropdownValue}>{selectedPrinter}</Text>
                    <Icon name="chevron-down" size={18} color={colors.textPrimary} />
                  </TouchableOpacity>

                  {printerMenuOpen && (
                    <View style={styles.dropdownMenu}>
                      {PRINTERS.map(printer => {
                        const isSelected = selectedPrinter === printer;
                        return (
                          <TouchableOpacity
                            key={printer}
                            onPress={() => {
                              setSelectedPrinter(printer);
                              setPrinterMenuOpen(false);
                            }}
                            style={[
                              styles.dropdownItem,
                              isSelected && styles.dropdownItemSelected,
                            ]}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                isSelected && styles.dropdownItemTextSelected,
                              ]}>
                              {printer}
                            </Text>
                            {isSelected && (
                              <Icon name="check" size={16} color={colors.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Pages selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>Pages</Text>
                  <View style={styles.radioRow}>
                    <TouchableOpacity
                      onPress={() => setPageSelection('ALL')}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: pageSelection === 'ALL' }}
                      style={styles.radioOption}>
                      <View
                        style={[
                          styles.radioOuter,
                          pageSelection === 'ALL' && styles.radioOuterSelected,
                        ]}>
                        {pageSelection === 'ALL' ? (
                          <View style={styles.radioInner} />
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.radioLabel,
                          pageSelection === 'ALL' && styles.radioLabelSelected,
                        ]}>
                        All Pages
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setPageSelection('PAGE_1')}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: pageSelection === 'PAGE_1' }}
                      style={styles.radioOption}>
                      <View
                        style={[
                          styles.radioOuter,
                          pageSelection === 'PAGE_1' && styles.radioOuterSelected,
                        ]}>
                        {pageSelection === 'PAGE_1' ? (
                          <View style={styles.radioInner} />
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.radioLabel,
                          pageSelection === 'PAGE_1' && styles.radioLabelSelected,
                        ]}>
                        Page 1 only
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsWrap}>
                  <TouchableOpacity
                    onPress={handlePrint}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Print Receipt"
                    style={styles.printBtn}>
                    <Icon name="printer" size={18} color={colors.white} strokeWidth={2.2} />
                    <Text style={styles.printBtnText}>Print Receipt</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel print"
                    style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 96, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  feedbackBanner: {
    backgroundColor: colors.primaryLight,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  printerIconWrap: {
    marginRight: spacing.sm,
  },
  dropdownValue: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  radioLabelSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  actionsWrap: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentGold,
    borderRadius: radius.md,
    minHeight: 48,
    gap: 8,
  },
  printBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  cancelText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default PrintReceiptSheet;
