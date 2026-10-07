import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import {
  AdminColors,
  BorderRadius,
  Shadows,
  Spacing,
} from '../../../../core/theme';
import { AdminHeader } from '../../../../app/navigation/AdminHeader';
import { AppRoutes } from '../../../../core/constants/routes';
import {
  Calendar,
  ChevronDown,
  FileText,
  Heart,
  Scale,
  TrendingUp,
  Users,
} from '../../../../core/components/icons';
import { ReportDateSelector } from '../components/ReportDateSelector';
import {
  useBalanceSheetSummary,
  useProfitLossSummary,
  useReportsAnalytics,
  useTrialBalanceSummary,
} from '../hooks/useReports';
import { getDefaultDatePreset } from '../utils/reportDates';
import { formatINR } from '../../../../core/utils/currency';
import type { DatePresetKey, DateRangePreset } from '../types/reports.types';

interface ReportsScreenProps {
  onBack?: () => void;
  onNavigate?: (target: string) => void;
  onOpenTrialBalance?: () => void;
  onOpenProfitLoss?: () => void;
  onOpenBalanceSheet?: () => void;
  onOpenLedger?: () => void;
}

type ContentTab = 'Rights' | 'Blogs' | 'News';

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  onBack,
  onNavigate,
  onOpenTrialBalance,
  onOpenProfitLoss,
  onOpenBalanceSheet,
  onOpenLedger,
}) => {
  const { width } = useWindowDimensions();
  const defaultPreset = getDefaultDatePreset();
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey>(defaultPreset.key);
  const [startDate, setStartDate] = useState(defaultPreset.startDate);
  const [endDate, setEndDate] = useState(defaultPreset.endDate);
  const [asOfDate, setAsOfDate] = useState(defaultPreset.asOfDate);
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>('Rights');

  const analytics = useReportsAnalytics(startDate, endDate);
  const tbSummary = useTrialBalanceSummary(asOfDate);
  const plSummary = useProfitLossSummary(startDate, endDate);
  const bsSummary = useBalanceSheetSummary(asOfDate);

  const kpis = analytics.data?.kpis;
  const userDist = analytics.data?.user_distribution || [];
  const donationsOverview = analytics.data?.donations_overview;
  const complaintsOverview = analytics.data?.complaints_overview;
  const topContent = analytics.data?.top_content;
  const eventsOverview = analytics.data?.events_overview;
  const userGrowth = analytics.data?.user_growth || [];

  // Active top content items based on tab
  const activeContentKey = (activeContentTab.toLowerCase()) as 'rights' | 'blogs' | 'news';
  const currentContentList = topContent?.[activeContentKey] || [];

  // Donut chart calculations
  const totalUsersCount = userDist.reduce((acc, curr) => acc + curr.count, 0) || kpis?.total_users || 1;
  const CIRCUMFERENCE = 301.59; // 2 * PI * 48
  let accumulatedDonutOffset = 0;

  const handleSelectPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset.key);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
    setAsOfDate(preset.asOfDate);
  };

  const handleRefresh = async () => {
    await Promise.all([
      analytics.refetch(),
      tbSummary.refetch(),
      plSummary.refetch(),
      bsSummary.refetch(),
    ]);
  };

  const isRefreshing =
    analytics.isRefetching ||
    tbSummary.isRefetching ||
    plSummary.isRefetching ||
    bsSummary.isRefetching;

  const handleGoTrialBalance = () => {
    if (onOpenTrialBalance) onOpenTrialBalance();
    else if (onNavigate) onNavigate(AppRoutes.TRIAL_BALANCE);
  };

  const handleGoProfitLoss = () => {
    if (onOpenProfitLoss) onOpenProfitLoss();
    else if (onNavigate) onNavigate(AppRoutes.PROFIT_LOSS);
  };

  const handleGoBalanceSheet = () => {
    if (onOpenBalanceSheet) onOpenBalanceSheet();
    else if (onNavigate) onNavigate(AppRoutes.BALANCE_SHEET);
  };

  const handleGoLedger = () => {
    if (onOpenLedger) onOpenLedger();
    else if (onNavigate) onNavigate(AppRoutes.GENERAL_LEDGER);
  };

  const isSurplus = plSummary.data?.result_type === 'SURPLUS';

  // Responsive chart width
  const chartWidth = Math.min(width - 48, 560);

  // Dynamic user growth line chart points calculation
  const maxGrowthCount = Math.max(...userGrowth.map(p => p.count), 200);
  const chartPoints = userGrowth.map((point, index) => {
    const totalPoints = Math.max(userGrowth.length - 1, 1);
    const x = 30 + (index / totalPoints) * 290;
    // Map count (0 -> 125, maxGrowthCount -> 20)
    const y = 125 - ((point.count / maxGrowthCount) * 105);
    return { x, y, point };
  });

  const linePathD = chartPoints.length > 0
    ? chartPoints.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '')
    : 'M 30 125 L 320 20';
  const areaPathD = chartPoints.length > 0
    ? `${linePathD} L ${chartPoints[chartPoints.length - 1].x} 135 L ${chartPoints[0].x} 135 Z`
    : 'M 30 125 L 320 20 L 320 135 L 30 135 Z';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AdminHeader
        unreadCount={3}
        showBack={Boolean(onBack)}
        onBack={onBack}
        onNavigate={onNavigate}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={AdminColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title & Date Range Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            <Text style={styles.pageTitle}>Reports</Text>
            <Text style={styles.pageSubtitle}>
              Insights and analytics of platform activities.
            </Text>
          </View>
          <View style={styles.dateSelectorWrap}>
            <ReportDateSelector
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              subText=""
            />
          </View>
        </View>

        {/* 1. TOP 4 KPI METRIC CARDS */}
        <View style={styles.topKpiGrid}>
          {/* Card 1: Users */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Users size={18} color="#3B82F6" />
            </View>
            <Text style={styles.kpiCardLabel}>Total Users</Text>
            <Text style={styles.kpiCardValue}>
              {kpis?.total_users != null ? kpis.total_users.toLocaleString() : '—'}
            </Text>
            <View style={styles.trendRow}>
              <Text style={(kpis?.users_growth_pct ?? 0) >= 0 ? styles.trendGreen : styles.trendRed}>
                {(kpis?.users_growth_pct ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(kpis?.users_growth_pct ?? 0)}%
              </Text>
              <Text style={styles.trendSub}> vs last month</Text>
            </View>
          </View>

          {/* Card 2: Donations */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Heart size={18} color="#10B981" />
            </View>
            <Text style={styles.kpiCardLabel}>Total Donations</Text>
            <Text style={styles.kpiCardValue}>
              {kpis ? formatINR(kpis.total_donations_amount, { noDecimals: true }) : '—'}
            </Text>
            <View style={styles.trendRow}>
              <Text style={(kpis?.donations_growth_pct ?? 0) >= 0 ? styles.trendGreen : styles.trendRed}>
                {(kpis?.donations_growth_pct ?? 0) >= 0 ? '↗' : '↘'} {Math.abs(kpis?.donations_growth_pct ?? 0)}%
              </Text>
              <Text style={styles.trendSub}> vs last month</Text>
            </View>
          </View>

          {/* Card 3: Complaints */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <FileText size={18} color="#EF4444" />
            </View>
            <Text style={styles.kpiCardLabel}>Total Complaints</Text>
            <Text style={styles.kpiCardValue}>
              {kpis?.total_complaints != null ? kpis.total_complaints.toLocaleString() : '—'}
            </Text>
            <View style={styles.trendRow}>
              <Text style={(kpis?.complaints_growth_pct ?? 0) <= 0 ? styles.trendGreen : styles.trendRed}>
                {(kpis?.complaints_growth_pct ?? 0) <= 0 ? '↓' : '↑'} {Math.abs(kpis?.complaints_growth_pct ?? 0)}%
              </Text>
              <Text style={styles.trendSub}> vs last month</Text>
            </View>
          </View>

          {/* Card 4: Events */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#F5F3FF' }]}>
              <Calendar size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.kpiCardLabel}>Total Events</Text>
            <Text style={styles.kpiCardValue}>
              {kpis?.total_events != null ? kpis.total_events.toLocaleString() : '—'}
            </Text>
            <View style={styles.trendRow}>
              <Text style={(kpis?.events_growth_pct ?? 0) >= 0 ? styles.trendGreen : styles.trendRed}>
                ↑ {kpis?.events_growth_pct ?? 0}%
              </Text>
              <Text style={styles.trendSub}> vs last month</Text>
            </View>
          </View>
        </View>

        {/* 2. ANALYTICS CHARTS SECTION */}

        {/* Chart Card 1: User Growth */}
        <View style={styles.analyticsCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeadingWithIcon}>
              <Users size={18} color="#2563EB" />
              <View>
                <Text style={styles.analyticsCardTitle}>User Growth</Text>
                <Text style={styles.analyticsCardSub}>
                  New user registrations over time.
                </Text>
              </View>
            </View>
            <View style={styles.timeDropdownChip}>
              <Text style={styles.timeDropdownText}>Last 30 Days</Text>
            </View>
          </View>

          {/* SVG Line Chart */}
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={160} viewBox="0 0 330 160">
              <Defs>
                <LinearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </LinearGradient>
              </Defs>
              {/* Grid Lines */}
              <Path d="M 30 20 L 320 20 M 30 55 L 320 55 M 30 90 L 320 90 M 30 125 L 320 125" stroke="#F1F5F9" strokeWidth="1" />
              {/* Y Axis Labels */}
              <SvgText x="5" y="24" fontSize="9" fill="#94A3B8" fontWeight="600">{maxGrowthCount}</SvgText>
              <SvgText x="5" y="59" fontSize="9" fill="#94A3B8" fontWeight="600">{Math.round(maxGrowthCount * 0.75)}</SvgText>
              <SvgText x="5" y="94" fontSize="9" fill="#94A3B8" fontWeight="600">{Math.round(maxGrowthCount * 0.5)}</SvgText>
              <SvgText x="10" y="129" fontSize="9" fill="#94A3B8" fontWeight="600">0</SvgText>
              {/* Area Gradient */}
              <Path d={areaPathD} fill="url(#growthGrad)" />
              {/* Line */}
              <Path d={linePathD} fill="none" stroke="#2563EB" strokeWidth="2.5" />
              {/* Dots */}
              {chartPoints.map((pt, idx) => (
                <Circle
                  key={`dot-${idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={idx === chartPoints.length - 1 ? 4 : 3.5}
                  fill="#2563EB"
                  stroke={idx === chartPoints.length - 1 ? '#FFFFFF' : undefined}
                  strokeWidth={idx === chartPoints.length - 1 ? 1.5 : 0}
                />
              ))}
            </Svg>
            {/* X Axis labels */}
            <View style={styles.xAxisRow}>
              {userGrowth.map(pt => (
                <Text key={pt.label} style={styles.xAxisText}>{pt.label}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Chart Card 2: User Distribution */}
        <View style={styles.analyticsCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeadingWithIcon}>
              <FileText size={18} color="#0F2C59" />
              <View>
                <Text style={styles.analyticsCardTitle}>User Distribution</Text>
                <Text style={styles.analyticsCardSub}>Categorical membership breakdown.</Text>
              </View>
            </View>
            <View style={styles.timeDropdownChip}>
              <Text style={styles.timeDropdownText}>All Users</Text>
            </View>
          </View>

          <View style={styles.donutRow}>
            {/* Donut SVG */}
            <View style={styles.donutWrap}>
              <Svg width={140} height={140} viewBox="0 0 140 140">
                <G transform="rotate(-90 70 70)">
                  {userDist.map((item, idx) => {
                    const sliceFraction = item.count / totalUsersCount;
                    const dashLength = sliceFraction * CIRCUMFERENCE;
                    const offset = accumulatedDonutOffset;
                    accumulatedDonutOffset += dashLength;
                    return (
                      <Circle
                        key={`slice-${idx}`}
                        cx="70"
                        cy="70"
                        r="48"
                        stroke={item.color}
                        strokeWidth="20"
                        fill="none"
                        strokeDasharray={`${dashLength.toFixed(1)} ${CIRCUMFERENCE.toFixed(1)}`}
                        strokeDashoffset={(-offset).toFixed(1)}
                      />
                    );
                  })}
                </G>
              </Svg>
              <View style={styles.donutCenter}>
                <Text style={styles.donutCenterValue}>
                  {kpis?.total_users != null ? kpis.total_users.toLocaleString() : '—'}
                </Text>
                <Text style={styles.donutCenterLabel}>Total Users</Text>
              </View>
            </View>

            {/* Legend */}
            <View style={styles.legendWrap}>
              {userDist.map(item => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel} numberOfLines={1}>{item.label}</Text>
                  <Text style={styles.legendNumbers}>
                    <Text style={styles.legendCount}>{item.count.toLocaleString()}</Text>
                    <Text style={styles.legendPct}> ({item.pct})</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Chart Card 3: Donations Overview */}
        <View style={styles.analyticsCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeadingWithIcon}>
              <Heart size={18} color="#10B981" />
              <View>
                <Text style={styles.analyticsCardTitle}>Donations Overview</Text>
                <Text style={styles.analyticsCardSub}>Total donations received and count.</Text>
              </View>
            </View>
            <View style={styles.timeDropdownChip}>
              <Text style={styles.timeDropdownText}>Last 30 Days</Text>
            </View>
          </View>

          {/* KPI Mini-Row */}
          <View style={styles.donationsMiniRow}>
            <View>
              <Text style={styles.miniLabel}>Total Amount</Text>
              <View style={styles.miniValRow}>
                <Text style={styles.miniValue}>
                  {donationsOverview ? formatINR(donationsOverview.total_amount, { noDecimals: true }) : '—'}
                </Text>
                <Text style={styles.trendGreenSmall}> ↗ {donationsOverview?.growth_pct ?? 0}%</Text>
              </View>
            </View>
            <View style={styles.miniDivider} />
            <View>
              <Text style={styles.miniLabel}>Total Donations</Text>
              <View style={styles.miniValRow}>
                <Text style={styles.miniValue}>
                  {donationsOverview?.total_donations?.toLocaleString() ?? '—'}
                </Text>
                <Text style={styles.trendGreenSmall}> ↑ {donationsOverview?.donations_count_growth_pct ?? 0}%</Text>
              </View>
            </View>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={130} viewBox="0 0 330 130">
              {/* Y Axis Labels */}
              <SvgText x="5" y="15" fontSize="8" fill="#94A3B8" fontWeight="600">100K</SvgText>
              <SvgText x="5" y="45" fontSize="8" fill="#94A3B8" fontWeight="600">75K</SvgText>
              <SvgText x="5" y="75" fontSize="8" fill="#94A3B8" fontWeight="600">50K</SvgText>
              <SvgText x="5" y="105" fontSize="8" fill="#94A3B8" fontWeight="600">25K</SvgText>
              <SvgText x="15" y="125" fontSize="8" fill="#94A3B8" fontWeight="600">0</SvgText>
              {/* Bars */}
              <G fill="#10B981">
                <Rect x="40" y="90" width="8" height="30" rx="2" />
                <Rect x="55" y="75" width="8" height="45" rx="2" />
                <Rect x="70" y="45" width="8" height="75" rx="2" />
                <Rect x="85" y="80" width="8" height="40" rx="2" />
                <Rect x="100" y="70" width="8" height="50" rx="2" />
                <Rect x="115" y="30" width="8" height="90" rx="2" />
                <Rect x="130" y="95" width="8" height="25" rx="2" />
                <Rect x="145" y="85" width="8" height="35" rx="2" />
                <Rect x="160" y="75" width="8" height="45" rx="2" />
                <Rect x="175" y="90" width="8" height="30" rx="2" />
                <Rect x="190" y="80" width="8" height="40" rx="2" />
                <Rect x="205" y="40" width="8" height="80" rx="2" />
                <Rect x="220" y="65" width="8" height="55" rx="2" />
                <Rect x="235" y="70" width="8" height="50" rx="2" />
                <Rect x="250" y="55" width="8" height="65" rx="2" />
                <Rect x="265" y="20" width="8" height="100" rx="2" />
                <Rect x="280" y="45" width="8" height="75" rx="2" />
                <Rect x="295" y="60" width="8" height="60" rx="2" />
              </G>
            </Svg>
            <View style={styles.xAxisRow}>
              <Text style={styles.xAxisText}>1 Sep</Text>
              <Text style={styles.xAxisText}>7 Sep</Text>
              <Text style={styles.xAxisText}>14 Sep</Text>
              <Text style={styles.xAxisText}>21 Sep</Text>
              <Text style={styles.xAxisText}>28 Sep</Text>
            </View>
          </View>
        </View>

        {/* Chart Card 4: Complaints Overview */}
        <View style={styles.analyticsCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeadingWithIcon}>
              <FileText size={18} color="#EF4444" />
              <View>
                <Text style={styles.analyticsCardTitle}>Complaints Overview</Text>
                <Text style={styles.analyticsCardSub}>Total complaints and resolution status.</Text>
              </View>
            </View>
            <View style={styles.timeDropdownChip}>
              <Text style={styles.timeDropdownText}>Last 30 Days</Text>
            </View>
          </View>

          {/* Status Breakdown 4 Mini Columns */}
          <View style={styles.complaintKpiGrid}>
            <View style={styles.complaintKpiCol}>
              <Text style={styles.complaintColLabel}>Total Complaints</Text>
              <Text style={styles.complaintColVal}>
                {complaintsOverview?.total ?? 0}{' '}
                <Text style={styles.trendGreenSmall}>↑ {complaintsOverview?.growth_pct ?? 0}%</Text>
              </Text>
            </View>
            <View style={styles.complaintKpiCol}>
              <Text style={styles.complaintColLabel}>Resolved</Text>
              <Text style={styles.complaintColVal}>
                {complaintsOverview?.resolved ?? 0}{' '}
                <Text style={styles.trendGreenSmall}>↗ {complaintsOverview?.resolved_pct ?? 0}%</Text>
              </Text>
            </View>
            <View style={styles.complaintKpiCol}>
              <Text style={styles.complaintColLabel}>In Progress</Text>
              <Text style={styles.complaintColVal}>
                {complaintsOverview?.in_progress ?? 0}{' '}
                <Text style={styles.trendAmberSmall}>◆ {complaintsOverview?.in_progress_pct ?? 0}%</Text>
              </Text>
            </View>
            <View style={styles.complaintKpiCol}>
              <Text style={styles.complaintColLabel}>Pending</Text>
              <Text style={styles.complaintColVal}>
                {complaintsOverview?.pending ?? 0}{' '}
                <Text style={styles.trendRedSmall}>↓ {complaintsOverview?.pending_pct ?? 0}%</Text>
              </Text>
            </View>
          </View>

          {/* Multi-Line Chart with Legend */}
          <View style={styles.chartLegendRow}>
            <View style={styles.legendIndicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.indicatorText}>Received</Text>
            </View>
            <View style={styles.legendIndicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.indicatorText}>Resolved</Text>
            </View>
            <View style={styles.legendIndicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.indicatorText}>Pending</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={120} viewBox="0 0 330 120">
              {/* Grid */}
              <Path d="M 30 20 L 320 20 M 30 50 L 320 50 M 30 80 L 320 80 M 30 105 L 320 105" stroke="#F1F5F9" strokeWidth="1" />
              {/* Y Axis Labels */}
              <SvgText x="8" y="24" fontSize="8" fill="#94A3B8" fontWeight="600">40</SvgText>
              <SvgText x="8" y="54" fontSize="8" fill="#94A3B8" fontWeight="600">30</SvgText>
              <SvgText x="8" y="84" fontSize="8" fill="#94A3B8" fontWeight="600">20</SvgText>
              <SvgText x="8" y="109" fontSize="8" fill="#94A3B8" fontWeight="600">0</SvgText>
              {/* Line 1: Received (Blue) */}
              <Path d="M 30 90 Q 60 70 90 85 T 150 70 T 210 65 T 270 50 T 320 75" fill="none" stroke="#2563EB" strokeWidth="2" />
              {/* Line 2: Resolved (Green) */}
              <Path d="M 30 100 Q 60 90 90 95 T 150 85 T 210 75 T 270 70 T 320 85" fill="none" stroke="#10B981" strokeWidth="2" />
              {/* Line 3: Pending (Amber) */}
              <Path d="M 30 105 Q 60 102 90 104 T 150 100 T 210 102 T 270 98 T 320 100" fill="none" stroke="#F59E0B" strokeWidth="2" />
            </Svg>
            <View style={styles.xAxisRow}>
              <Text style={styles.xAxisText}>1 Sep</Text>
              <Text style={styles.xAxisText}>7 Sep</Text>
              <Text style={styles.xAxisText}>14 Sep</Text>
              <Text style={styles.xAxisText}>21 Sep</Text>
              <Text style={styles.xAxisText}>28 Sep</Text>
            </View>
          </View>
        </View>

        {/* Chart Card 5: Top Content Performance */}
        <View style={styles.analyticsCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeadingWithIcon}>
              <FileText size={18} color="#0F2C59" />
              <View>
                <Text style={styles.analyticsCardTitle}>Top Content Performance</Text>
                <Text style={styles.analyticsCardSub}>Most viewed rights, blogs and news.</Text>
              </View>
            </View>
            <View style={styles.timeDropdownChip}>
              <Text style={styles.timeDropdownText}>Last 30 Days</Text>
            </View>
          </View>

          {/* Segment Tabs */}
          <View style={styles.contentSegmentRow}>
            {(['Rights', 'Blogs', 'News'] as ContentTab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.contentTabBtn,
                  activeContentTab === tab && styles.contentTabBtnActive,
                ]}
                onPress={() => setActiveContentTab(tab)}
              >
                <Text
                  style={[
                    styles.contentTabText,
                    activeContentTab === tab && styles.contentTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, { width: 30 }]}>#</Text>
            <Text style={[styles.thText, { flex: 1 }]}>Title</Text>
            <Text style={[styles.thText, { width: 60, textAlign: 'right' }]}>Views</Text>
          </View>
          {currentContentList.map(row => (
            <View key={row.rank} style={styles.tableRow}>
              <Text style={[styles.tdRank, { width: 30 }]}>{row.rank}</Text>
              <Text style={[styles.tdTitle, { flex: 1 }]} numberOfLines={1}>
                {row.title}
              </Text>
              <Text style={[styles.tdViews, { width: 60, textAlign: 'right' }]}>
                {row.views}
              </Text>
            </View>
          ))}
          {currentContentList.length === 0 && (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#94A3B8' }}>No content available for this category</Text>
            </View>
          )}
        </View>

        {/* Chart Card 6: Events Overview */}
        <View style={styles.analyticsCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeadingWithIcon}>
              <Calendar size={18} color="#8B5CF6" />
              <View>
                <Text style={styles.analyticsCardTitle}>Events Overview</Text>
                <Text style={styles.analyticsCardSub}>Event registrations and attendance.</Text>
              </View>
            </View>
            <View style={styles.timeDropdownChip}>
              <Text style={styles.timeDropdownText}>Last 30 Days</Text>
            </View>
          </View>

          {/* KPIs */}
          <View style={styles.eventsKpiRow}>
            <View style={styles.eventKpiBox}>
              <Text style={styles.miniLabel}>Total Events</Text>
              <Text style={styles.eventKpiVal}>
                {eventsOverview?.total_events ?? 0}{' '}
                <Text style={styles.trendGreenSmall}>↑ {eventsOverview?.events_growth_pct ?? 0}%</Text>
              </Text>
            </View>
            <View style={styles.eventKpiBox}>
              <Text style={styles.miniLabel}>Total Registrations</Text>
              <Text style={styles.eventKpiVal}>
                {eventsOverview?.total_registrations?.toLocaleString() ?? '—'}{' '}
                <Text style={styles.trendGreenSmall}>↑ {eventsOverview?.registrations_growth_pct ?? 0}%</Text>
              </Text>
            </View>
            <View style={[styles.eventKpiBox, { backgroundColor: '#F5F3FF' }]}>
              <Text style={styles.miniLabel}>Avg. Attendance</Text>
              <Text style={[styles.eventKpiVal, { color: '#7C3AED' }]}>
                {eventsOverview?.avg_attendance_pct ?? 0}%
              </Text>
            </View>
          </View>

          {/* Dual Bar Chart */}
          <View style={styles.chartLegendRow}>
            <View style={styles.legendIndicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.indicatorText}>Registrations</Text>
            </View>
            <View style={styles.legendIndicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.indicatorText}>Attendance</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={120} viewBox="0 0 330 120">
              <G>
                {/* 1 Sep */}
                <Rect x="40" y="70" width="7" height="40" rx="2" fill="#2563EB" />
                <Rect x="49" y="85" width="7" height="25" rx="2" fill="#10B981" />
                {/* 7 Sep */}
                <Rect x="85" y="45" width="7" height="65" rx="2" fill="#2563EB" />
                <Rect x="94" y="60" width="7" height="50" rx="2" fill="#10B981" />
                {/* 14 Sep */}
                <Rect x="130" y="55" width="7" height="55" rx="2" fill="#2563EB" />
                <Rect x="139" y="65" width="7" height="45" rx="2" fill="#10B981" />
                {/* 21 Sep */}
                <Rect x="175" y="30" width="7" height="80" rx="2" fill="#2563EB" />
                <Rect x="184" y="50" width="7" height="60" rx="2" fill="#10B981" />
                {/* 28 Sep */}
                <Rect x="220" y="20" width="7" height="90" rx="2" fill="#2563EB" />
                <Rect x="229" y="40" width="7" height="70" rx="2" fill="#10B981" />
              </G>
            </Svg>
            <View style={styles.xAxisRow}>
              <Text style={styles.xAxisText}>1 Sep</Text>
              <Text style={styles.xAxisText}>7 Sep</Text>
              <Text style={styles.xAxisText}>14 Sep</Text>
              <Text style={styles.xAxisText}>21 Sep</Text>
              <Text style={styles.xAxisText}>28 Sep</Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 3. FINANCIAL STATEMENTS & AUDIT REPORTS LIST (BELOW THE ANALYTICS) */}
        {/* ========================================================================= */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeading}>Financial Statements & Detailed Reports</Text>
          <Text style={styles.sectionSubheading}>
            Full General Ledger statements and accounting reconciliation sheets.
          </Text>
        </View>

        {/* LIST ITEM 1: TRIAL BALANCE */}
        <TouchableOpacity
          style={styles.statementCard}
          onPress={handleGoTrialBalance}
          activeOpacity={0.8}
        >
          <View style={styles.statementHeader}>
            <View style={styles.statementTitleRow}>
              <View style={[styles.statementIcon, { backgroundColor: '#EFF6FF' }]}>
                <Scale size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.statementTitle}>Trial Balance</Text>
                <Text style={styles.statementSub}>Debit & Credit Ledger Check</Text>
              </View>
            </View>
            <View
              style={[
                styles.badge,
                tbSummary.data?.is_balanced ? styles.badgeSuccess : styles.badgeDanger,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  tbSummary.data?.is_balanced ? styles.badgeTextSuccess : styles.badgeTextDanger,
                ]}
              >
                {tbSummary.data?.is_balanced ? 'Balanced' : 'Out of Balance'}
              </Text>
            </View>
          </View>

          <View style={styles.statementMetrics}>
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>TOTAL DEBIT</Text>
              <Text style={styles.statementMetricVal}>
                {tbSummary.data ? formatINR(tbSummary.data.total_debit) : '—'}
              </Text>
            </View>
            <View style={styles.statementDivider} />
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>TOTAL CREDIT</Text>
              <Text style={styles.statementMetricVal}>
                {tbSummary.data ? formatINR(tbSummary.data.total_credit) : '—'}
              </Text>
            </View>
            <View style={styles.statementDivider} />
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>DIFFERENCE</Text>
              <Text
                style={[
                  styles.statementMetricVal,
                  (tbSummary.data?.difference ?? 0) === 0 ? styles.textSuccess : styles.textDanger,
                ]}
              >
                {tbSummary.data ? formatINR(tbSummary.data.difference) : '—'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* LIST ITEM 2: PROFIT & LOSS */}
        <TouchableOpacity
          style={styles.statementCard}
          onPress={handleGoProfitLoss}
          activeOpacity={0.8}
        >
          <View style={styles.statementHeader}>
            <View style={styles.statementTitleRow}>
              <View style={[styles.statementIcon, { backgroundColor: '#F0FDF4' }]}>
                <TrendingUp size={20} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.statementTitle}>Profit & Loss Statement</Text>
                <Text style={styles.statementSub}>Income Statement & Surplus</Text>
              </View>
            </View>
            <View
              style={[
                styles.badge,
                isSurplus ? styles.badgeSuccess : styles.badgeDanger,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isSurplus ? styles.badgeTextSuccess : styles.badgeTextDanger,
                ]}
              >
                {isSurplus ? 'Surplus' : 'Deficit'}
              </Text>
            </View>
          </View>

          <View style={styles.statementMetrics}>
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>TOTAL INCOME</Text>
              <Text style={[styles.statementMetricVal, styles.textSuccess]}>
                {plSummary.data ? formatINR(plSummary.data.total_income) : '—'}
              </Text>
            </View>
            <View style={styles.statementDivider} />
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>TOTAL EXPENSE</Text>
              <Text style={[styles.statementMetricVal, styles.textDanger]}>
                {plSummary.data ? formatINR(plSummary.data.total_expenses) : '—'}
              </Text>
            </View>
            <View style={styles.statementDivider} />
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>
                {isSurplus ? 'NET SURPLUS' : 'NET DEFICIT'}
              </Text>
              <Text
                style={[
                  styles.statementMetricVal,
                  isSurplus ? styles.textSuccess : styles.textDanger,
                ]}
              >
                {plSummary.data ? formatINR(plSummary.data.net_result) : '—'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* LIST ITEM 3: BALANCE SHEET */}
        <TouchableOpacity
          style={styles.statementCard}
          onPress={handleGoBalanceSheet}
          activeOpacity={0.8}
        >
          <View style={styles.statementHeader}>
            <View style={styles.statementTitleRow}>
              <View style={[styles.statementIcon, { backgroundColor: '#FDF4FF' }]}>
                <FileText size={20} color="#A21CAF" />
              </View>
              <View>
                <Text style={styles.statementTitle}>Balance Sheet</Text>
                <Text style={styles.statementSub}>Assets, Liabilities & Reserves</Text>
              </View>
            </View>
            <View
              style={[
                styles.badge,
                bsSummary.data?.is_balanced ? styles.badgeSuccess : styles.badgeDanger,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  bsSummary.data?.is_balanced ? styles.badgeTextSuccess : styles.badgeTextDanger,
                ]}
              >
                {bsSummary.data?.is_balanced ? 'Balanced' : 'Check Variance'}
              </Text>
            </View>
          </View>

          <View style={styles.statementMetrics}>
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>TOTAL ASSETS</Text>
              <Text style={styles.statementMetricVal}>
                {bsSummary.data ? formatINR(bsSummary.data.total_assets) : '—'}
              </Text>
            </View>
            <View style={styles.statementDivider} />
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>TOTAL LIABILITIES</Text>
              <Text style={styles.statementMetricVal}>
                {bsSummary.data ? formatINR(bsSummary.data.total_liabilities) : '—'}
              </Text>
            </View>
            <View style={styles.statementDivider} />
            <View style={styles.statementMetricItem}>
              <Text style={styles.statementMetricLabel}>TOTAL EQUITY</Text>
              <Text style={[styles.statementMetricVal, styles.textPrimary]}>
                {bsSummary.data ? formatINR(bsSummary.data.total_equity) : '—'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl + 40,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
    gap: 8,
  },
  pageHeaderLeft: {
    flex: 1,
    minWidth: 180,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dateSelectorWrap: {
    alignSelf: 'flex-start',
  },

  /* Top 4 KPI Cards */
  topKpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2C59',
    marginVertical: 3,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  trendRed: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  trendSub: {
    fontSize: 10,
    color: '#94A3B8',
  },

  /* Analytics Chart Cards */
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeadingWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  analyticsCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2C59',
  },
  analyticsCardSub: {
    fontSize: 10,
    color: '#64748B',
  },
  timeDropdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeDropdownText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 28,
    marginTop: 4,
  },
  xAxisText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
  },

  /* Donut Distribution */
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  donutWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
  },
  donutCenterLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  legendWrap: {
    flex: 1,
    paddingLeft: 16,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },
  legendNumbers: {
    fontSize: 11,
  },
  legendCount: {
    fontWeight: '700',
    color: '#0F2C59',
  },
  legendPct: {
    color: '#64748B',
  },

  /* Donations Mini Row */
  donationsMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  miniValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  miniValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2C59',
  },
  miniDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  trendGreenSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  trendRedSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  trendAmberSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },

  /* Complaints KPI Grid */
  complaintKpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  complaintKpiCol: {
    alignItems: 'center',
  },
  complaintColLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  complaintColVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2C59',
    marginTop: 2,
  },
  chartLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 4,
    marginBottom: 2,
  },
  legendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  indicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },

  /* Top Content Tabs & Table */
  contentSegmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
  },
  contentTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  contentTabBtnActive: {
    backgroundColor: '#0F2C59',
  },
  contentTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  contentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tdRank: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tdTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  tdViews: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2C59',
  },

  /* Events Overview */
  eventsKpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  eventKpiBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  eventKpiVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2C59',
    marginTop: 2,
  },

  /* Section Header */
  sectionHeaderWrap: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2C59',
  },
  sectionSubheading: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  /* Detailed Financial Statement Cards (Below analytics) */
  statementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    ...Shadows.card,
  },
  statementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statementIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2C59',
  },
  statementSub: {
    fontSize: 10,
    color: '#64748B',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: '#15803D',
  },
  badgeTextDanger: {
    color: '#B91C1C',
  },
  statementMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
  },
  statementMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  statementMetricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  statementMetricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2C59',
    marginTop: 2,
  },
  statementDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  textSuccess: {
    color: '#16A34A',
  },
  textDanger: {
    color: '#DC2626',
  },
  textPrimary: {
    color: '#0F2C59',
  },
});
