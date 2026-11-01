import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Printer,
  TriangleAlert,
  X,
} from '../../../../core/components/icons';
import {
  exportPassbookStatement,
  PassbookExportAction,
  PassbookExportFormat,
  PassbookTransactionType,
} from '../services/passbook-export.api';

export type ExportPeriodTab = 'MONTH' | 'YEAR' | 'CUSTOM';

export interface PassbookExportPeriod {
  tab: ExportPeriodTab;
  label: string;
  fromDate?: string;
  toDate?: string;
}

export interface PassbookExportOptions {
  transactionType: PassbookTransactionType;
  format: PassbookExportFormat;
  fromDate?: string;
  toDate?: string;
  periodLabel: string;
  action?: PassbookExportAction;
}

interface PassbookExportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmExport?: (options: PassbookExportOptions) => Promise<void>;
  isExporting?: boolean;
  initialFromDate?: string;
  initialToDate?: string;
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const PassbookExportModal: React.FC<PassbookExportModalProps> = ({
  visible,
  onClose,
  onConfirmExport,
  isExporting: externalIsExporting = false,
  initialFromDate,
  initialToDate,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

  // Transaction type is always ALL (both income & expenses)
  const transactionType: PassbookTransactionType = 'ALL';

  // Export format is always PDF
  const exportFormat: PassbookExportFormat = 'PDF';

  // Date Range Tabs State
  const [activeTab, setActiveTab] = useState<ExportPeriodTab>('MONTH');

  // Month Tab State
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);

  // Year Tab State
  const [selectedFullYear, setSelectedFullYear] = useState<number>(currentYear);
  const [yearType, setYearType] = useState<'CALENDAR' | 'FINANCIAL'>('CALENDAR');

  // Custom Range State
  const defaultFrom =
    initialFromDate ||
    new Date(currentYear, currentMonthIdx, 1).toISOString().split('T')[0];
  const defaultTo =
    initialToDate ||
    new Date(currentYear, currentMonthIdx + 1, 0).toISOString().split('T')[0];

  const [customFrom, setCustomFrom] = useState<string>(defaultFrom);
  const [customTo, setCustomTo] = useState<string>(defaultTo);
  const [customPreset, setCustomPreset] = useState<string>('THIS_MONTH');

  // Local Loading & Feedback States
  const [localExporting, setLocalExporting] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<PassbookExportAction | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isExporting = externalIsExporting || localExporting;

  // Compute selected date range based on active tab
  const resolvedPeriod: PassbookExportPeriod = useMemo(() => {
    if (activeTab === 'MONTH') {
      const from = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
      const to = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
      const label = `${MONTH_FULL[selectedMonth]} ${selectedYear}`;
      return {
        tab: 'MONTH',
        label,
        fromDate: from,
        toDate: to,
      };
    }

    if (activeTab === 'YEAR') {
      if (yearType === 'CALENDAR') {
        const from = `${selectedFullYear}-01-01`;
        const to = `${selectedFullYear}-12-31`;
        const label = `Year ${selectedFullYear}`;
        return {
          tab: 'YEAR',
          label,
          fromDate: from,
          toDate: to,
        };
      }
      // Financial Year (Apr to Mar)
      const from = `${selectedFullYear}-04-01`;
      const to = `${selectedFullYear + 1}-03-31`;
      const label = `FY ${selectedFullYear}-${(selectedFullYear + 1).toString().slice(-2)}`;
      return {
        tab: 'YEAR',
        label,
        fromDate: from,
        toDate: to,
      };
    }

    // CUSTOM tab
    const cleanFrom = customFrom.trim() || undefined;
    const cleanTo = customTo.trim() || undefined;

    let label = 'Custom Range';
    if (!cleanFrom && !cleanTo) {
      label = 'All Records (All-Time)';
    } else if (cleanFrom && cleanTo) {
      const fParts = cleanFrom.split('-');
      const tParts = cleanTo.split('-');
      if (fParts.length === 3 && tParts.length === 3) {
        label = `${fParts[2]}/${fParts[1]}/${fParts[0]} – ${tParts[2]}/${tParts[1]}/${tParts[0]}`;
      } else {
        label = `${cleanFrom} to ${cleanTo}`;
      }
    } else if (cleanFrom) {
      label = `From ${cleanFrom}`;
    } else if (cleanTo) {
      label = `Up to ${cleanTo}`;
    }

    return {
      tab: 'CUSTOM',
      label,
      fromDate: cleanFrom,
      toDate: cleanTo,
    };
  }, [
    activeTab,
    selectedYear,
    selectedMonth,
    selectedFullYear,
    yearType,
    customFrom,
    customTo,
  ]);

  const handleApplyPreset = (key: string) => {
    setCustomPreset(key);
    setStatusMessage(null);
    const today = new Date();

    if (key === 'ALL_TIME') {
      setCustomFrom('');
      setCustomTo('');
    } else if (key === 'THIS_MONTH') {
      const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      setCustomFrom(from);
      setCustomTo(to);
    } else if (key === 'LAST_MONTH') {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      const to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
      setCustomFrom(from);
      setCustomTo(to);
    } else if (key === 'LAST_30') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      setCustomFrom(past.toISOString().split('T')[0]);
      setCustomTo(today.toISOString().split('T')[0]);
    } else if (key === 'LAST_90') {
      const past = new Date(today);
      past.setDate(past.getDate() - 90);
      setCustomFrom(past.toISOString().split('T')[0]);
      setCustomTo(today.toISOString().split('T')[0]);
    } else if (key === 'THIS_QUARTER') {
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      const from = new Date(today.getFullYear(), quarterStartMonth, 1).toISOString().split('T')[0];
      const to = new Date(today.getFullYear(), quarterStartMonth + 3, 0).toISOString().split('T')[0];
      setCustomFrom(from);
      setCustomTo(to);
    }
  };

  const handleExportClick = async (action: PassbookExportAction = 'download') => {
    if (isExporting) return;

    // Validate dates if custom
    if (resolvedPeriod.fromDate && resolvedPeriod.toDate) {
      if (resolvedPeriod.fromDate > resolvedPeriod.toDate) {
        setStatusMessage({
          type: 'error',
          text: 'From Date cannot be after To Date. Please select a valid range.',
        });
        return;
      }
    }

    setStatusMessage(null);
    setActiveAction(action);

    const exportOptions: PassbookExportOptions = {
      transactionType,
      format: exportFormat,
      fromDate: resolvedPeriod.fromDate,
      toDate: resolvedPeriod.toDate,
      periodLabel: resolvedPeriod.label,
      action,
    };

    if (onConfirmExport) {
      try {
        await onConfirmExport(exportOptions);
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Export failed. Please try again.',
        });
      } finally {
        setActiveAction(null);
      }
      return;
    }

    // Default internal handler
    try {
      setLocalExporting(true);
      const res = await exportPassbookStatement({
        transactionType,
        format: exportFormat,
        fromDate: resolvedPeriod.fromDate,
        toDate: resolvedPeriod.toDate,
        action,
      });

      setStatusMessage({
        type: 'success',
        text:
          action === 'print'
            ? 'PDF Statement opened for printing/preview.'
            : `Successfully downloaded ${res.filename}`,
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to download export from server. Please verify network.',
      });
    } finally {
      setLocalExporting(false);
      setActiveAction(null);
    }
  };

  const availableYears = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop touchable to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <FileText size={18} color="#0F2860" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Passbook Statement (PDF)</Text>
                <Text style={styles.modalSubtitle}>
                  Download or print official passbook statement in PDF format
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              disabled={isExporting}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* DATE RANGE SELECTOR */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Calendar size={14} color="#0F2860" />
                <Text style={styles.sectionLabel}>Date Range</Text>
              </View>

              {/* Segmented Control / Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'MONTH' && styles.tabBtnActive]}
                  onPress={() => {
                    setActiveTab('MONTH');
                    setStatusMessage(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabBtnText,
                      activeTab === 'MONTH' && styles.tabBtnTextActive,
                    ]}
                  >
                    Month
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'YEAR' && styles.tabBtnActive]}
                  onPress={() => {
                    setActiveTab('YEAR');
                    setStatusMessage(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabBtnText,
                      activeTab === 'YEAR' && styles.tabBtnTextActive,
                    ]}
                  >
                    Year
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'CUSTOM' && styles.tabBtnActive]}
                  onPress={() => {
                    setActiveTab('CUSTOM');
                    setStatusMessage(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabBtnText,
                      activeTab === 'CUSTOM' && styles.tabBtnTextActive,
                    ]}
                  >
                    Custom Range
                  </Text>
                </TouchableOpacity>
              </View>

              {/* MONTH TAB */}
              {activeTab === 'MONTH' && (
                <View style={styles.tabContent}>
                  <View style={styles.yearSwitcher}>
                    <TouchableOpacity
                      style={styles.yearNavBtn}
                      onPress={() => setSelectedYear(y => y - 1)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ChevronLeft size={16} color="#0F2860" />
                    </TouchableOpacity>
                    <Text style={styles.yearSwitcherText}>{selectedYear}</Text>
                    <TouchableOpacity
                      style={styles.yearNavBtn}
                      onPress={() => setSelectedYear(y => y + 1)}
                      disabled={selectedYear >= currentYear + 1}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ChevronRight
                        size={16}
                        color={selectedYear >= currentYear + 1 ? '#CBD5E1' : '#0F2860'}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.monthsGrid}>
                    {MONTH_SHORT.map((m, idx) => {
                      const isSelected =
                        selectedMonth === idx && selectedYear === selectedYear;
                      const isCurrentMonth =
                        idx === currentMonthIdx && selectedYear === currentYear;
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[
                            styles.monthCell,
                            isSelected && styles.monthCellActive,
                          ]}
                          onPress={() => {
                            setSelectedMonth(idx);
                            setStatusMessage(null);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.monthCellText,
                              isSelected && styles.monthCellTextActive,
                            ]}
                          >
                            {m}
                          </Text>
                          {isCurrentMonth && !isSelected && (
                            <View style={styles.currentMonthDot} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* YEAR TAB */}
              {activeTab === 'YEAR' && (
                <View style={styles.tabContent}>
                  <View style={styles.yearTypeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.yearTypeBtn,
                        yearType === 'CALENDAR' && styles.yearTypeBtnActive,
                      ]}
                      onPress={() => setYearType('CALENDAR')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.yearTypeBtnText,
                          yearType === 'CALENDAR' && styles.yearTypeBtnTextActive,
                        ]}
                      >
                        Calendar Year (Jan – Dec)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.yearTypeBtn,
                        yearType === 'FINANCIAL' && styles.yearTypeBtnActive,
                      ]}
                      onPress={() => setYearType('FINANCIAL')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.yearTypeBtnText,
                          yearType === 'FINANCIAL' && styles.yearTypeBtnTextActive,
                        ]}
                      >
                        Financial Year (Apr – Mar)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.yearGrid}>
                    {availableYears.map(yr => {
                      const isSelected = selectedFullYear === yr;
                      const label =
                        yearType === 'CALENDAR'
                          ? `${yr}`
                          : `FY ${yr}-${(yr + 1).toString().slice(-2)}`;
                      return (
                        <TouchableOpacity
                          key={yr}
                          style={[
                            styles.yearChip,
                            isSelected && styles.yearChipActive,
                          ]}
                          onPress={() => {
                            setSelectedFullYear(yr);
                            setStatusMessage(null);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.yearChipText,
                              isSelected && styles.yearChipTextActive,
                            ]}
                          >
                            {label}
                          </Text>
                          {isSelected && (
                            <View style={styles.chipCheck}>
                              <Check size={11} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* CUSTOM TAB */}
              {activeTab === 'CUSTOM' && (
                <View style={styles.tabContent}>
                  <View style={styles.presetsWrap}>
                    {[
                      { key: 'THIS_MONTH', label: 'This Month' },
                      { key: 'LAST_MONTH', label: 'Last Month' },
                      { key: 'LAST_30', label: 'Last 30 Days' },
                      { key: 'LAST_90', label: 'Last 90 Days' },
                      { key: 'THIS_QUARTER', label: 'Current Quarter' },
                      { key: 'ALL_TIME', label: 'All Records' },
                    ].map(item => {
                      const isSelected = customPreset === item.key;
                      return (
                        <TouchableOpacity
                          key={item.key}
                          style={[
                            styles.presetChip,
                            isSelected && styles.presetChipActive,
                          ]}
                          onPress={() => handleApplyPreset(item.key)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.presetChipText,
                              isSelected && styles.presetChipTextActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.dateInputsRow}>
                    <View style={styles.dateInputCol}>
                      <Text style={styles.dateInputLabel}>From Date</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94A3B8"
                        value={customFrom}
                        onChangeText={val => {
                          setCustomFrom(val);
                          setCustomPreset('');
                          setStatusMessage(null);
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <View style={styles.dateInputCol}>
                      <Text style={styles.dateInputLabel}>To Date</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94A3B8"
                        value={customTo}
                        onChangeText={val => {
                          setCustomTo(val);
                          setCustomPreset('');
                          setStatusMessage(null);
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                  <Text style={styles.dateHint}>
                    Leave blank to include complete organizational transaction history.
                  </Text>
                </View>
              )}
            </View>

            {/* Statement Summary & Verification Card */}
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <FileText size={14} color="#0F2860" />
                <Text style={styles.previewTitle}>Passbook Statement Details</Text>
              </View>

              <View style={styles.previewMetaGrid}>
                <View style={styles.previewMetaItem}>
                  <Text style={styles.metaLabel}>STATEMENT SCOPE</Text>
                  <Text style={styles.metaVal} numberOfLines={1}>
                    All Income & Expenses
                  </Text>
                </View>

                <View style={styles.previewMetaItem}>
                  <Text style={styles.metaLabel}>OUTPUT FORMAT</Text>
                  <Text style={styles.metaVal}>Official PDF Document (A4)</Text>
                </View>
              </View>

              <Text style={styles.previewPeriodText}>{resolvedPeriod.label}</Text>
              <Text style={styles.previewSubtext}>
                {resolvedPeriod.fromDate
                  ? `Period: ${resolvedPeriod.fromDate} → ${resolvedPeriod.toDate || 'Present'}`
                  : 'Period: Lifetime complete history'}
              </Text>
              <Text style={styles.previewScopeNote}>
                • Includes all credits, donations, membership fees, and expense vouchers with continuous running balance.
              </Text>
            </View>

            {/* Feedback status message */}
            {statusMessage && (
              <View
                style={[
                  styles.feedbackBox,
                  statusMessage.type === 'error'
                    ? styles.feedbackBoxError
                    : styles.feedbackBoxSuccess,
                ]}
              >
                {statusMessage.type === 'error' ? (
                  <TriangleAlert size={16} color="#DC2626" />
                ) : (
                  <CheckCircle2 size={16} color="#15803D" />
                )}
                <Text
                  style={[
                    styles.feedbackText,
                    statusMessage.type === 'error'
                      ? styles.feedbackTextError
                      : styles.feedbackTextSuccess,
                  ]}
                >
                  {statusMessage.text}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons Footer */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isExporting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.printBtn,
                isExporting && styles.btnDisabled,
              ]}
              onPress={() => handleExportClick('print')}
              disabled={isExporting}
              activeOpacity={0.8}
            >
              {isExporting && activeAction === 'print' ? (
                <ActivityIndicator size="small" color="#0F2860" />
              ) : (
                <>
                  <Printer size={15} color="#0F2860" />
                  <Text style={styles.printBtnText}>Print / View</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.exportBtn,
                isExporting && styles.btnDisabled,
              ]}
              onPress={() => handleExportClick('download')}
              disabled={isExporting}
              activeOpacity={0.8}
            >
              {isExporting && activeAction === 'download' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Download size={15} color="#FFFFFF" />
                  <Text style={styles.exportBtnText}>Download PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalBody: {
    maxHeight: 460,
  },
  sectionBlock: {
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2860',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#0F2860',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContent: {
    marginTop: 2,
  },
  yearSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  yearNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearSwitcherText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthCell: {
    width: '23%',
    aspectRatio: 1.8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monthCellActive: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  monthCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  monthCellTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  currentMonthDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EAA224',
  },
  yearTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  yearTypeBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearTypeBtnActive: {
    borderColor: '#0F2860',
    backgroundColor: '#F0F5FF',
  },
  yearTypeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  yearTypeBtnTextActive: {
    color: '#0F2860',
    fontWeight: '700',
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  yearChipActive: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  yearChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  yearChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  presetChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  dateInputCol: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0F172A',
  },
  dateHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  previewBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
  },
  previewMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 8,
  },
  previewMetaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2860',
    marginTop: 1,
  },
  previewPeriodText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2860',
  },
  previewSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  previewScopeNote: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 14,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  feedbackBoxError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  feedbackBoxSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  feedbackText: {
    fontSize: 12,
    flex: 1,
    fontWeight: '600',
  },
  feedbackTextError: {
    color: '#B91C1C',
  },
  feedbackTextSuccess: {
    color: '#15803D',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  printBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
  },
  exportBtn: {
    flex: 1.3,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#0F2860',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default PassbookExportModal;
