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
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from '../../../../core/components/icons';
import {
  exportPassbookStatement,
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

  // Transaction Type State
  const [transactionType, setTransactionType] =
    useState<PassbookTransactionType>('ALL');

  // Export Format State
  const [exportFormat, setExportFormat] =
    useState<PassbookExportFormat>('PDF');

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

  const handleExportClick = async () => {
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

    const exportOptions: PassbookExportOptions = {
      transactionType,
      format: exportFormat,
      fromDate: resolvedPeriod.fromDate,
      toDate: resolvedPeriod.toDate,
      periodLabel: resolvedPeriod.label,
    };

    if (onConfirmExport) {
      try {
        await onConfirmExport(exportOptions);
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Export failed. Please try again.',
        });
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
      });

      setStatusMessage({
        type: 'success',
        text: `Successfully exported ${res.filename}`,
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
    }
  };

  const availableYears = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
  ];

  const getTransactionTypeLabel = (type: PassbookTransactionType) => {
    switch (type) {
      case 'ALL':
        return 'All Transactions (Inflows & Outflows)';
      case 'PAYMENT_IN':
        return 'Payment In (Incoming Credits Only)';
      case 'PAYMENT_OUT':
        return 'Payment Out (Expenses Only)';
    }
  };

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
                      Filter by type, dates, and export to PDF, Excel, or CSV
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
                {/* 1. TRANSACTION TYPE SELECTOR */}
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <SlidersHorizontal size={14} color="#0F2860" />
                    <Text style={styles.sectionLabel}>Transaction Type</Text>
                  </View>

                  <View style={styles.txTypeRow}>
                    {/* ALL */}
                    <TouchableOpacity
                      style={[
                        styles.txTypeCard,
                        transactionType === 'ALL' && styles.txTypeCardActive,
                      ]}
                      onPress={() => {
                        setTransactionType('ALL');
                        setStatusMessage(null);
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.txTypeIconRow}>
                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: transactionType === 'ALL' ? '#EEF4FF' : '#F1F5F9' },
                          ]}
                        >
                          <ArrowUpDown
                            size={13}
                            color={transactionType === 'ALL' ? '#0F2860' : '#64748B'}
                          />
                        </View>
                        {transactionType === 'ALL' && (
                          <View style={styles.miniCheckWrap}>
                            <Check size={11} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.txTypeTitle,
                          transactionType === 'ALL' && styles.txTypeTitleActive,
                        ]}
                      >
                        All Transactions
                      </Text>
                      <Text style={styles.txTypeDesc}>Inflows & Outflows</Text>
                    </TouchableOpacity>

                    {/* PAYMENT IN */}
                    <TouchableOpacity
                      style={[
                        styles.txTypeCard,
                        transactionType === 'PAYMENT_IN' && styles.txTypeCardActiveGreen,
                      ]}
                      onPress={() => {
                        setTransactionType('PAYMENT_IN');
                        setStatusMessage(null);
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.txTypeIconRow}>
                        <View
                          style={[
                            styles.typeBadge,
                            {
                              backgroundColor:
                                transactionType === 'PAYMENT_IN' ? '#DCFCE7' : '#F1F5F9',
                            },
                          ]}
                        >
                          <ArrowDownLeft
                            size={13}
                            color={transactionType === 'PAYMENT_IN' ? '#15803D' : '#64748B'}
                          />
                        </View>
                        {transactionType === 'PAYMENT_IN' && (
                          <View style={[styles.miniCheckWrap, { backgroundColor: '#15803D' }]}>
                            <Check size={11} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.txTypeTitle,
                          transactionType === 'PAYMENT_IN' && styles.txTypeTitleActiveGreen,
                        ]}
                      >
                        Payment In
                      </Text>
                      <Text style={styles.txTypeDesc}>Credits Only</Text>
                    </TouchableOpacity>

                    {/* PAYMENT OUT */}
                    <TouchableOpacity
                      style={[
                        styles.txTypeCard,
                        transactionType === 'PAYMENT_OUT' && styles.txTypeCardActiveRed,
                      ]}
                      onPress={() => {
                        setTransactionType('PAYMENT_OUT');
                        setStatusMessage(null);
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.txTypeIconRow}>
                        <View
                          style={[
                            styles.typeBadge,
                            {
                              backgroundColor:
                                transactionType === 'PAYMENT_OUT' ? '#FEE2E2' : '#F1F5F9',
                            },
                          ]}
                        >
                          <ArrowUpRight
                            size={13}
                            color={transactionType === 'PAYMENT_OUT' ? '#B91C1C' : '#64748B'}
                          />
                        </View>
                        {transactionType === 'PAYMENT_OUT' && (
                          <View style={[styles.miniCheckWrap, { backgroundColor: '#B91C1C' }]}>
                            <Check size={11} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.txTypeTitle,
                          transactionType === 'PAYMENT_OUT' && styles.txTypeTitleActiveRed,
                        ]}
                      >
                        Payment Out
                      </Text>
                      <Text style={styles.txTypeDesc}>Expenses Only</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 2. EXPORT FORMAT SELECTOR */}
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <FileSpreadsheet size={14} color="#0F2860" />
                    <Text style={styles.sectionLabel}>Export Format</Text>
                  </View>

                  <View style={styles.formatRow}>
                    {/* PDF */}
                    <TouchableOpacity
                      style={[
                        styles.formatCard,
                        exportFormat === 'PDF' && styles.formatCardActive,
                      ]}
                      onPress={() => {
                        setExportFormat('PDF');
                        setStatusMessage(null);
                      }}
                      activeOpacity={0.75}
                    >
                      <FileText
                        size={16}
                        color={exportFormat === 'PDF' ? '#0F2860' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.formatCardText,
                          exportFormat === 'PDF' && styles.formatCardTextActive,
                        ]}
                      >
                        PDF Document
                      </Text>
                      <Text style={styles.formatCardSub}>Official A4</Text>
                    </TouchableOpacity>

                    {/* EXCEL */}
                    <TouchableOpacity
                      style={[
                        styles.formatCard,
                        exportFormat === 'XLSX' && styles.formatCardActive,
                      ]}
                      onPress={() => {
                        setExportFormat('XLSX');
                        setStatusMessage(null);
                      }}
                      activeOpacity={0.75}
                    >
                      <FileSpreadsheet
                        size={16}
                        color={exportFormat === 'XLSX' ? '#15803D' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.formatCardText,
                          exportFormat === 'XLSX' && styles.formatCardTextActive,
                        ]}
                      >
                        Excel (XLSX)
                      </Text>
                      <Text style={styles.formatCardSub}>Full Sheet</Text>
                    </TouchableOpacity>

                    {/* CSV */}
                    <TouchableOpacity
                      style={[
                        styles.formatCard,
                        exportFormat === 'CSV' && styles.formatCardActive,
                      ]}
                      onPress={() => {
                        setExportFormat('CSV');
                        setStatusMessage(null);
                      }}
                      activeOpacity={0.75}
                    >
                      <FileText
                        size={16}
                        color={exportFormat === 'CSV' ? '#C9A227' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.formatCardText,
                          exportFormat === 'CSV' && styles.formatCardTextActive,
                        ]}
                      >
                        CSV File
                      </Text>
                      <Text style={styles.formatCardSub}>UTF-8 BOM</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. DATE RANGE SELECTOR */}
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
                        style={[styles.tabBtnText, activeTab === 'MONTH' && styles.tabBtnTextActive]}
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
                        style={[styles.tabBtnText, activeTab === 'YEAR' && styles.tabBtnTextActive]}
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

                  {/* Body Content by Tab */}
                  {/* MONTH TAB */}
                  {activeTab === 'MONTH' && (
                    <View style={styles.tabContent}>
                      <View style={styles.yearNavigator}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedYear(y => y - 1);
                            setStatusMessage(null);
                          }}
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
                          onPress={() => {
                            setSelectedYear(y => y + 1);
                            setStatusMessage(null);
                          }}
                          style={styles.navArrowBtn}
                          activeOpacity={0.7}
                        >
                          <ChevronRight size={18} color="#0F2860" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.monthsGrid}>
                        {MONTH_SHORT.map((mName, idx) => {
                          const isSelected = selectedMonth === idx;
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
                              onPress={() => {
                                setSelectedMonth(idx);
                                setStatusMessage(null);
                              }}
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
                              {isSelected && <View style={styles.selectedDot} />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* YEAR TAB */}
                  {activeTab === 'YEAR' && (
                    <View style={styles.tabContent}>
                      <View style={styles.yearTypeRow}>
                        <TouchableOpacity
                          style={[
                            styles.yearTypeBtn,
                            yearType === 'CALENDAR' && styles.yearTypeBtnActive,
                          ]}
                          onPress={() => {
                            setYearType('CALENDAR');
                            setStatusMessage(null);
                          }}
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
                          onPress={() => {
                            setYearType('FINANCIAL');
                            setStatusMessage(null);
                          }}
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
                              onPress={() => {
                                setSelectedFullYear(yr);
                                setStatusMessage(null);
                              }}
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
                                  <Check size={13} color="#FFFFFF" />
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

                {/* Period Preview Banner */}
                <View style={styles.previewBox}>
                  <View style={styles.previewHeader}>
                    <FileText size={14} color="#0F2860" />
                    <Text style={styles.previewTitle}>Export Summary & Verification</Text>
                  </View>

                  <View style={styles.previewMetaGrid}>
                    <View style={styles.previewMetaItem}>
                      <Text style={styles.metaLabel}>FILTER</Text>
                      <Text style={styles.metaVal} numberOfLines={1}>
                        {transactionType === 'ALL'
                          ? 'All Transactions'
                          : transactionType === 'PAYMENT_IN'
                          ? 'Payment In Only'
                          : 'Payment Out Only'}
                      </Text>
                    </View>

                    <View style={styles.previewMetaItem}>
                      <Text style={styles.metaLabel}>FORMAT</Text>
                      <Text style={styles.metaVal}>{exportFormat}</Text>
                    </View>
                  </View>

                  <Text style={styles.previewPeriodText}>{resolvedPeriod.label}</Text>
                  <Text style={styles.previewSubtext}>
                    {resolvedPeriod.fromDate
                      ? `Window: ${resolvedPeriod.fromDate} → ${resolvedPeriod.toDate || 'Present'}`
                      : 'Window: Lifetime historical records'}
                  </Text>
                  <Text style={styles.previewScopeNote}>
                    {transactionType === 'PAYMENT_IN' &&
                      '• Incoming only: receipts, verified donations, and membership payments.'}
                    {transactionType === 'PAYMENT_OUT' &&
                      '• Outgoing only: verified expense vouchers and disbursement items.'}
                    {transactionType === 'ALL' &&
                      '• Both incoming receipts and outgoing expense vouchers with running balance.'}
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
                      <Text style={styles.exportBtnText}>
                        Download {exportFormat} Statement
                      </Text>
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
    paddingVertical: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
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
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F2860',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  txTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  txTypeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  txTypeCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0F2860',
  },
  txTypeCardActiveGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#15803D',
  },
  txTypeCardActiveRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#B91C1C',
  },
  txTypeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCheckWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0F2860',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTypeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  txTypeTitleActive: {
    color: '#0F2860',
  },
  txTypeTitleActiveGreen: {
    color: '#15803D',
  },
  txTypeTitleActiveRed: {
    color: '#B91C1C',
  },
  txTypeDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formatCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  formatCardActive: {
    backgroundColor: '#EEF4FF',
    borderColor: '#0F2860',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  formatCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  formatCardTextActive: {
    color: '#0F2860',
  },
  formatCardSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
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
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingVertical: 2,
  },
  yearNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2860',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthChip: {
    width: '23%',
    flexGrow: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
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
    fontSize: 12,
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
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EAA224',
  },
  yearTypeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  yearTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  yearTypeBtnActive: {
    backgroundColor: '#EEF4FF',
    borderColor: '#0F2860',
  },
  yearTypeBtnText: {
    fontSize: 11,
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
    gap: 6,
  },
  yearCard: {
    width: '48%',
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  yearCardTextSelected: {
    color: '#FFFFFF',
  },
  checkIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  presetChipActive: {
    backgroundColor: '#0F2860',
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
    gap: 8,
  },
  dateInputCol: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  textInput: {
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  dateHint: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 4,
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2860',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewMetaGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  previewMetaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2860',
    marginTop: 1,
  },
  previewPeriodText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2860',
    marginTop: 2,
  },
  previewSubtext: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },
  previewScopeNote: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
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
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  exportBtn: {
    flex: 2,
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
  exportBtnDisabled: {
    opacity: 0.65,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default PassbookExportModal;
