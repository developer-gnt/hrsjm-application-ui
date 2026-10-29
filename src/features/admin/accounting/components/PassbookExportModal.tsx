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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  X,
} from '../../../../core/components/icons';

export type ExportPeriodTab = 'MONTH' | 'YEAR' | 'CUSTOM';

export interface PassbookExportPeriod {
  tab: ExportPeriodTab;
  label: string;
  fromDate?: string;
  toDate?: string;
}

interface PassbookExportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmExport: (period: PassbookExportPeriod) => Promise<void>;
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
  isExporting = false,
  initialFromDate,
  initialToDate,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

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

  // Compute selected range based on active tab
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

  const handleExportClick = async () => {
    if (isExporting) return;
    await onConfirmExport(resolvedPeriod);
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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconBox}>
                    <Download size={18} color="#0F2860" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Export Passbook Statement</Text>
                    <Text style={styles.modalSubtitle}>
                      Choose month, year, or custom dates for statement
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

              {/* Segmented Control / Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'MONTH' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('MONTH')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'MONTH' && styles.tabBtnTextActive]}>
                    Month
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'YEAR' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('YEAR')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'YEAR' && styles.tabBtnTextActive]}>
                    Year
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'CUSTOM' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('CUSTOM')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'CUSTOM' && styles.tabBtnTextActive]}>
                    Custom Range
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Body Content by Tab */}
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. MONTH TAB */}
                {activeTab === 'MONTH' && (
                  <View style={styles.tabContent}>
                    {/* Year Navigator */}
                    <View style={styles.yearNavigator}>
                      <TouchableOpacity
                        onPress={() => setSelectedYear(y => y - 1)}
                        style={styles.navArrowBtn}
                        activeOpacity={0.7}
                      >
                        <ChevronLeft size={18} color="#0F2860" />
                      </TouchableOpacity>
                      <View style={styles.yearDisplayBadge}>
                        <Calendar size={14} color="#0F2860" />
                        <Text style={styles.yearDisplayText}>{selectedYear}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setSelectedYear(y => y + 1)}
                        style={styles.navArrowBtn}
                        activeOpacity={0.7}
                      >
                        <ChevronRight size={18} color="#0F2860" />
                      </TouchableOpacity>
                    </View>

                    {/* 12 Months Grid */}
                    <Text style={styles.sectionLabel}>Select Month to Export</Text>
                    <View style={styles.monthsGrid}>
                      {MONTH_SHORT.map((mName, idx) => {
                        const isSelected =
                          selectedMonth === idx && selectedYear === selectedYear;
                        const isCurrentMonth =
                          idx === currentMonthIdx && selectedYear === currentYear;

                        return (
                          <TouchableOpacity
                            key={mName}
                            style={[
                              styles.monthChip,
                              isCurrentMonth && styles.monthChipCurrent,
                              isSelected && styles.monthChipSelected,
                            ]}
                            onPress={() => setSelectedMonth(idx)}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.monthChipText,
                                isCurrentMonth && styles.monthChipTextCurrent,
                                isSelected && styles.monthChipTextSelected,
                              ]}
                            >
                              {mName}
                            </Text>
                            {isSelected && (
                              <View style={styles.selectedDot} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 2. YEAR TAB */}
                {activeTab === 'YEAR' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.sectionLabel}>Year Format</Text>
                    <View style={styles.yearTypeRow}>
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

                    <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                      Select Year
                    </Text>
                    <View style={styles.yearsGrid}>
                      {availableYears.map(yr => {
                        const isSelected = selectedFullYear === yr;
                        const labelText =
                          yearType === 'CALENDAR'
                            ? `${yr}`
                            : `FY ${yr}-${(yr + 1).toString().slice(-2)}`;

                        return (
                          <TouchableOpacity
                            key={yr}
                            style={[
                              styles.yearCard,
                              isSelected && styles.yearCardSelected,
                            ]}
                            onPress={() => setSelectedFullYear(yr)}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.yearCardText,
                                isSelected && styles.yearCardTextSelected,
                              ]}
                            >
                              {labelText}
                            </Text>
                            {isSelected && (
                              <View style={styles.checkIconWrap}>
                                <Check size={14} color="#FFFFFF" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 3. CUSTOM RANGE TAB */}
                {activeTab === 'CUSTOM' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.sectionLabel}>Quick Date Shortcuts</Text>
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

                    <Text style={[styles.sectionLabel, { marginTop: 14 }]}>
                      Or Specific Date Range (YYYY-MM-DD)
                    </Text>
                    <View style={styles.dateInputsRow}>
                      <View style={styles.dateInputCol}>
                        <Text style={styles.dateInputLabel}>From Date</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="2026-10-01"
                          placeholderTextColor="#94A3B8"
                          value={customFrom}
                          onChangeText={val => {
                            setCustomFrom(val);
                            setCustomPreset('');
                          }}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      <View style={styles.dateInputCol}>
                        <Text style={styles.dateInputLabel}>To Date</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="2026-10-31"
                          placeholderTextColor="#94A3B8"
                          value={customTo}
                          onChangeText={val => {
                            setCustomTo(val);
                            setCustomPreset('');
                          }}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>
                    <Text style={styles.dateHint}>
                      Leave blank to include all historical transactions.
                    </Text>
                  </View>
                )}

                {/* Period Preview Banner */}
                <View style={styles.previewBox}>
                  <View style={styles.previewHeader}>
                    <FileText size={15} color="#0F2860" />
                    <Text style={styles.previewTitle}>Selected Export Scope</Text>
                  </View>
                  <Text style={styles.previewPeriodText}>
                    {resolvedPeriod.label}
                  </Text>
                  <Text style={styles.previewSubtext}>
                    {resolvedPeriod.fromDate
                      ? `Range: ${resolvedPeriod.fromDate} → ${resolvedPeriod.toDate || 'Present'}`
                      : 'Range: Complete lifetime organizational records'}
                  </Text>
                  <Text style={styles.previewScopeNote}>
                    Only transactions within this date window will be itemized and calculated in the PDF.
                  </Text>
                </View>
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
                  style={[styles.exportBtn, isExporting && styles.exportBtnDisabled]}
                  onPress={handleExportClick}
                  disabled={isExporting}
                  activeOpacity={0.8}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Download size={16} color="#FFFFFF" />
                      <Text style={styles.exportBtnText}>Download PDF Statement</Text>
                    </>
                  )}
                </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
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
    paddingBottom: 16,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginTop: 14,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#0F2860',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  modalBody: {
    maxHeight: 340,
  },
  tabContent: {
    paddingVertical: 4,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  yearNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  yearDisplayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yearDisplayText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2860',
    marginLeft: 4,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthChip: {
    width: '31%',
    flexGrow: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  monthChipCurrent: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  monthChipSelected: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  monthChipTextCurrent: {
    color: '#1D4ED8',
  },
  monthChipTextSelected: {
    color: '#FFFFFF',
  },
  selectedDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAA224',
  },
  yearTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  yearTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  yearTypeBtnActive: {
    backgroundColor: '#EEF4FF',
    borderColor: '#0F2860',
  },
  yearTypeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  yearTypeBtnTextActive: {
    color: '#0F2860',
  },
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearCard: {
    width: '48%',
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearCardSelected: {
    backgroundColor: '#0F2860',
    borderColor: '#0F2860',
  },
  yearCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  yearCardTextSelected: {
    color: '#FFFFFF',
  },
  checkIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: '#0F2860',
  },
  presetChipText: {
    fontSize: 12,
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
  },
  dateInputCol: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  textInput: {
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  dateHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  previewBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  previewPeriodText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 2,
  },
  previewSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },
  previewScopeNote: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  exportBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0F2860',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  exportBtnDisabled: {
    opacity: 0.65,
  },
  exportBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
  },
});

export default PassbookExportModal;
