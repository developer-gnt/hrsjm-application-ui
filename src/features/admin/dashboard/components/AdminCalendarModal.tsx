import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Check, BarChart2 } from 'lucide-react-native';
import { AdminColors, BorderRadius, Spacing, Shadows, FontFamilies } from '../../../../core/theme';
import type { EventListItem } from '../../content/events/types/events.types';

export interface MonthOption {
  label: string;
  value: string; // 'YYYY-MM'
}

interface AdminCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedMonthOption: MonthOption;
  onSelectMonthOption: (option: MonthOption) => void;
  monthOptions: MonthOption[];
  selectedDate?: string; // 'YYYY-MM-DD'
  onSelectDate?: (dateStr: string) => void;
  events?: EventListItem[];
  onNavigateToEvents?: () => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AdminCalendarModal: React.FC<AdminCalendarModalProps> = ({
  visible,
  onClose,
  selectedMonthOption,
  onSelectMonthOption,
  monthOptions,
  selectedDate: initialSelectedDate,
  onSelectDate,
  events = [],
  onNavigateToEvents,
}) => {
  // Parse year and month from selectedMonthOption (e.g. '2026-10')
  const [initialYear, initialMonth] = useMemo(() => {
    if (selectedMonthOption?.value) {
      const parts = selectedMonthOption.value.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m)) return [y, m];
    }
    const now = new Date();
    return [now.getFullYear(), now.getMonth()];
  }, [selectedMonthOption]);

  const [activeTab, setActiveTab] = useState<'calendar' | 'periods'>('calendar');
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Today reference
  const today = useMemo(() => new Date(), []);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  // Currently selected date
  const [activeDateKey, setActiveDateKey] = useState<string>(
    initialSelectedDate || todayKey
  );

  // Sync view when modal opens
  React.useEffect(() => {
    if (visible) {
      setViewYear(initialYear);
      setViewMonth(initialMonth);
      if (initialSelectedDate) {
        setActiveDateKey(initialSelectedDate);
      }
    }
  }, [visible, initialYear, initialMonth, initialSelectedDate]);

  // Calendar calculations for viewYear and viewMonth
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setActiveDateKey(todayKey);
  };

  // Map of events keyed by 'YYYY-MM-DD'
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventListItem[]> = {};
    for (const ev of events) {
      if (ev.startAt) {
        const datePart = ev.startAt.slice(0, 10);
        if (!map[datePart]) map[datePart] = [];
        map[datePart].push(ev);
      }
    }
    return map;
  }, [events]);

  // Build 42 grid cells (6 rows x 7 cols) for smooth consistent layout
  const calendarCells = useMemo(() => {
    const cells: Array<{
      day: number;
      monthType: 'prev' | 'current' | 'next';
      dateKey: string;
      isToday: boolean;
      isSelected: boolean;
      eventsCount: number;
    }> = [];

    // Leading days from prev month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        monthType: 'prev',
        dateKey,
        isToday: dateKey === todayKey,
        isSelected: dateKey === activeDateKey,
        eventsCount: eventsByDate[dateKey]?.length || 0,
      });
    }

    // Days of current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        monthType: 'current',
        dateKey,
        isToday: dateKey === todayKey,
        isSelected: dateKey === activeDateKey,
        eventsCount: eventsByDate[dateKey]?.length || 0,
      });
    }

    // Trailing days from next month
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        monthType: 'next',
        dateKey,
        isToday: dateKey === todayKey,
        isSelected: dateKey === activeDateKey,
        eventsCount: eventsByDate[dateKey]?.length || 0,
      });
    }

    return cells;
  }, [viewYear, viewMonth, daysInCurrentMonth, firstDayOfWeek, daysInPrevMonth, todayKey, activeDateKey, eventsByDate]);

  // Selected date's events
  const selectedDayEvents = eventsByDate[activeDateKey] || [];

  // Format active date for display: e.g. "Friday, 23 Oct 2026"
  const formattedActiveDate = useMemo(() => {
    try {
      const [y, m, d] = activeDateKey.split('-').map((v) => parseInt(v, 10));
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return activeDateKey;
    }
  }, [activeDateKey]);

  // Apply selected month/date to parent
  const handleApplyMonth = (option: MonthOption) => {
    onSelectMonthOption(option);
    if (onSelectDate) onSelectDate(activeDateKey);
    onClose();
  };

  const handleSelectDay = (cell: (typeof calendarCells)[0]) => {
    setActiveDateKey(cell.dateKey);
    if (cell.monthType === 'prev') {
      handlePrevMonth();
    } else if (cell.monthType === 'next') {
      handleNextMonth();
    }
    // Also sync the month option
    const monthVal = cell.dateKey.slice(0, 7);
    const matched = monthOptions.find((opt) => opt.value === monthVal);
    if (matched) {
      onSelectMonthOption(matched);
    }
    if (onSelectDate) {
      onSelectDate(cell.dateKey);
    }
  };

  // Label for current viewed month
  const viewedMonthLabel = `${MONTH_NAMES[viewMonth].slice(0, 3)} ${viewYear}`;
  const viewedMonthValue = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <CalendarIcon size={18} color="#06294D" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Calendar & Schedule</Text>
                <Text style={styles.modalSubtitle}>
                  View HRSJM activities or select an analytics period
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'calendar' && styles.tabItemActive]}
              onPress={() => setActiveTab('calendar')}
              activeOpacity={0.8}
            >
              <CalendarIcon
                size={14}
                color={activeTab === 'calendar' ? '#06294D' : '#718096'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}
              >
                Interactive Calendar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'periods' && styles.tabItemActive]}
              onPress={() => setActiveTab('periods')}
              activeOpacity={0.8}
            >
              <BarChart2
                size={14}
                color={activeTab === 'periods' ? '#06294D' : '#718096'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[styles.tabText, activeTab === 'periods' && styles.tabTextActive]}
              >
                Monthly Periods
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'calendar' ? (
              <View>
                {/* Month Navigation Row */}
                <View style={styles.monthNavRow}>
                  <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={styles.navBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ChevronLeft size={20} color="#06294D" />
                  </TouchableOpacity>

                  <View style={styles.monthTitleWrap}>
                    <Text style={styles.monthTitle}>
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleNextMonth}
                    style={styles.navBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ChevronRight size={20} color="#06294D" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleJumpToToday}
                    style={styles.todayBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.todayBtnText}>Today</Text>
                  </TouchableOpacity>
                </View>

                {/* Weekdays Row */}
                <View style={styles.weekdaysRow}>
                  {WEEKDAYS.map((w, idx) => (
                    <Text
                      key={w}
                      style={[
                        styles.weekdayText,
                        (idx === 0 || idx === 6) && styles.weekendText,
                      ]}
                    >
                      {w}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {calendarCells.map((cell) => {
                    const isCurrent = cell.monthType === 'current';
                    return (
                      <TouchableOpacity
                        key={cell.dateKey}
                        style={[
                          styles.dayCell,
                          cell.isSelected && styles.dayCellSelected,
                          cell.isToday && !cell.isSelected && styles.dayCellToday,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectDay(cell)}
                      >
                        <Text
                          style={[
                            styles.dayNumber,
                            !isCurrent && styles.dayNumberDimmed,
                            cell.isSelected && styles.dayNumberSelected,
                            cell.isToday && !cell.isSelected && styles.dayNumberToday,
                          ]}
                        >
                          {cell.day}
                        </Text>
                        {cell.eventsCount > 0 && (
                          <View
                            style={[
                              styles.eventDot,
                              cell.isSelected && styles.eventDotSelected,
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Date Summary & Events */}
                <View style={styles.dayDetailsBox}>
                  <View style={styles.dayDetailsHeader}>
                    <View style={styles.dayDetailsLeft}>
                      <Text style={styles.dayDetailsTitle}>{formattedActiveDate}</Text>
                      <Text style={styles.dayDetailsSub}>
                        {selectedDayEvents.length > 0
                          ? `${selectedDayEvents.length} event(s) scheduled`
                          : 'No events scheduled for this day'}
                      </Text>
                    </View>
                    {onNavigateToEvents && (
                      <TouchableOpacity
                        onPress={() => {
                          onClose();
                          onNavigateToEvents();
                        }}
                        style={styles.allEventsLink}
                      >
                        <Text style={styles.allEventsLinkText}>All Events ›</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* List of events on this day */}
                  {selectedDayEvents.length > 0 ? (
                    <View style={styles.eventsList}>
                      {selectedDayEvents.map((ev) => (
                        <View key={ev.id} style={styles.eventItem}>
                          <View style={styles.eventAccentBar} />
                          <View style={styles.eventContent}>
                            <View style={styles.eventTopRow}>
                              <Text style={styles.eventTitle} numberOfLines={1}>
                                {ev.title}
                              </Text>
                              <View style={styles.eventStatusBadge}>
                                <Text style={styles.eventStatusText}>{ev.status}</Text>
                              </View>
                            </View>
                            <View style={styles.eventMetaRow}>
                              {ev.category && (
                                <Text style={styles.eventCategory}>{ev.category}</Text>
                              )}
                              {ev.location && (
                                <View style={styles.eventMetaItem}>
                                  <MapPin size={11} color="#718096" />
                                  <Text style={styles.eventMetaText} numberOfLines={1}>
                                    {ev.location}
                                  </Text>
                                </View>
                              )}
                              <View style={styles.eventMetaItem}>
                                <Clock size={11} color="#718096" />
                                <Text style={styles.eventMetaText}>
                                  {ev.startAt?.slice(11, 16) || 'All Day'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>

                {/* Quick Action: Select Whole Month */}
                <TouchableOpacity
                  style={styles.selectMonthBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    handleApplyMonth({
                      label: viewedMonthLabel,
                      value: viewedMonthValue,
                    });
                  }}
                >
                  <Text style={styles.selectMonthBtnText}>
                    Apply {viewedMonthLabel} to Dashboard Filter
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Periods View */
              <View style={styles.periodsWrap}>
                <Text style={styles.periodsSectionTitle}>Select Analytics Month</Text>
                <View style={styles.monthList}>
                  {monthOptions.map((option) => {
                    const isSelected = selectedMonthOption.value === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.monthOption, isSelected && styles.monthOptionActive]}
                        activeOpacity={0.7}
                        onPress={() => handleApplyMonth(option)}
                      >
                        <Text
                          style={[
                            styles.monthOptionText,
                            isSelected && styles.monthOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {isSelected && <Check size={18} color="#06294D" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.doneBtn}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={styles.doneBtnText}>Close</Text>
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
    backgroundColor: 'rgba(1, 31, 57, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#DBE5EE',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FAD465',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#718096',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    padding: 4,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.base,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
  },
  tabTextActive: {
    color: '#06294D',
    fontWeight: '700',
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleWrap: {
    alignItems: 'center',
  },
  monthTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2F52',
  },
  todayBtn: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FAD465',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06294D',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#718096',
  },
  weekendText: {
    color: '#06294D',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    backgroundColor: '#FAF7F0',
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: '#DBE5EE',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#011F39',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#FAD465',
    backgroundColor: '#FFFDF5',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2F52',
  },
  dayNumberDimmed: {
    color: '#A0AEC0',
    fontWeight: '400',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayNumberToday: {
    color: '#06294D',
    fontWeight: '800',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FAD465',
    marginTop: 2,
  },
  eventDotSelected: {
    backgroundColor: '#FAD465',
  },
  dayDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: '#DCE4EC',
    padding: Spacing.sm,
    marginTop: Spacing.md,
  },
  dayDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dayDetailsLeft: {
    flex: 1,
  },
  dayDetailsTitle: {
    fontFamily: FontFamilies.serif,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2F52',
  },
  dayDetailsSub: {
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
  },
  allEventsLink: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  allEventsLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06294D',
  },
  eventsList: {
    marginTop: Spacing.xs,
    gap: 6,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  eventAccentBar: {
    width: 4,
    backgroundColor: '#FAD465',
  },
  eventContent: {
    flex: 1,
    padding: 8,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2F52',
    flex: 1,
    marginRight: 6,
  },
  eventStatusBadge: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  eventCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06294D',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  eventMetaText: {
    fontSize: 10,
    color: '#718096',
    maxWidth: 120,
  },
  selectMonthBtn: {
    backgroundColor: '#FAD465',
    paddingVertical: 10,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  selectMonthBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#011F39',
  },
  periodsWrap: {
    paddingVertical: 4,
  },
  periodsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  monthList: {
    gap: 4,
  },
  monthOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  monthOptionActive: {
    backgroundColor: '#EDF2F7',
  },
  monthOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34516D',
  },
  monthOptionTextActive: {
    color: '#06294D',
    fontWeight: '800',
  },
  footer: {
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#DBE5EE',
    backgroundColor: '#FAF7F0',
  },
  doneBtn: {
    backgroundColor: '#011F39',
    paddingVertical: 11,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
