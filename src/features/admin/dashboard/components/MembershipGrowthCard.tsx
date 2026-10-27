import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Circle as SvgCircle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { ChevronDown, TrendingUp } from '../../../../core/components/icons';

export interface GrowthChartPoint {
  label: string;
  total: number;
}

interface MembershipGrowthCardProps {
  title?: string;
  points: GrowthChartPoint[];
  /** Callout for the latest point, e.g. "Oct 2026". */
  latestLabel?: string;
  selectedRangeMonths?: number;
  onRangeMonthsChange?: (months: number) => void;
}

const WIDTH = 340;
const HEIGHT = 180;
const PADDING = { top: 38, right: 20, bottom: 26, left: 32 };

const RANGE_OPTIONS = [
  { label: 'Last 3 Months', value: 3 },
  { label: 'Last 6 Months', value: 6 },
  { label: 'Last 12 Months', value: 12 },
];

/**
 * Calculates human-friendly clean integer tick scale so the graph
 * dynamically breathes and avoids flatline or awkward decimal labels.
 */
const computeNiceScale = (max: number): { yMax: number; ticks: number[] } => {
  if (max <= 0) return { yMax: 4, ticks: [0, 1, 2, 3, 4] };
  if (max <= 4) return { yMax: 4, ticks: [0, 1, 2, 3, 4] };
  if (max <= 8) return { yMax: 8, ticks: [0, 2, 4, 6, 8] };
  if (max <= 12) return { yMax: 12, ticks: [0, 3, 6, 9, 12] };
  if (max <= 20) return { yMax: 20, ticks: [0, 5, 10, 15, 20] };
  if (max <= 40) return { yMax: 40, ticks: [0, 10, 20, 30, 40] };
  if (max <= 60) return { yMax: 60, ticks: [0, 15, 30, 45, 60] };
  if (max <= 100) return { yMax: 100, ticks: [0, 25, 50, 75, 100] };

  const rawStep = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / mag) * mag;
  const yMax = step * 4;
  return {
    yMax,
    ticks: [0, step, step * 2, step * 3, yMax],
  };
};

/**
 * Generates a smooth cubic Bezier spline path across coordinate points.
 */
const buildSmoothPath = (coords: Array<{ x: number; y: number }>): string => {
  if (coords.length <= 1) return '';
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  const smoothing = 0.2;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 >= coords.length ? i + 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) * smoothing;
    const cp1y = p1.y + (p2.y - p0.y) * smoothing;

    const cp2x = p2.x - (p3.x - p1.x) * smoothing;
    const cp2y = p2.y - (p3.y - p1.y) * smoothing;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

/** Professional modern line chart card for Membership Growth. */
export const MembershipGrowthCard: React.FC<MembershipGrowthCardProps> = ({
  title = 'Membership Growth',
  points,
  latestLabel,
  selectedRangeMonths = 6,
  onRangeMonthsChange,
}) => {
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  // Actual backend points or fallback zero series
  const chartPoints =
    points && points.length > 0
      ? points
      : [
          { label: 'May', total: 0 },
          { label: 'Jun', total: 0 },
          { label: 'Jul', total: 0 },
          { label: 'Aug', total: 0 },
          { label: 'Sep', total: 0 },
          { label: 'Oct', total: 0 },
        ];

  const maxVal = Math.max(...chartPoints.map(p => p.total), 0);
  const { yMax, ticks } = computeNiceScale(maxVal);
  const stepX = innerWidth / Math.max(chartPoints.length - 1, 1);

  const coords = chartPoints.map((point, index) => {
    const x = PADDING.left + stepX * index;
    const y = PADDING.top + innerHeight - (point.total / yMax) * innerHeight;
    return { x, y, ...point };
  });

  const smoothLine = buildSmoothPath(coords);
  const areaPath = `${smoothLine} L ${coords[coords.length - 1].x.toFixed(1)} ${PADDING.top + innerHeight} L ${coords[0].x.toFixed(1)} ${PADDING.top + innerHeight} Z`;

  const yTicks = ticks.map(val => ({
    value: val,
    y: PADDING.top + innerHeight - (val / yMax) * innerHeight,
  }));

  const activeIndex = selectedPointIndex !== null ? selectedPointIndex : coords.length - 1;
  const activePoint = coords[activeIndex] || coords[coords.length - 1];

  const selectedRangeLabel =
    RANGE_OPTIONS.find(o => o.value === selectedRangeMonths)?.label || `Last ${selectedRangeMonths} Months`;

  // Dynamic tooltip calculation (anchored neatly above the active point)
  const tooltipWidth = 86;
  const tooltipHeight = 36;
  const clampedX = Math.max(
    PADDING.left + tooltipWidth / 2,
    Math.min(WIDTH - PADDING.right - tooltipWidth / 2, activePoint.x),
  );
  const tooltipY =
    activePoint.y - tooltipHeight - 12 < PADDING.top - 10
      ? activePoint.y + 12
      : activePoint.y - tooltipHeight - 12;

  // Growth calculation for the header metric badge
  const prevPoint = activeIndex > 0 ? coords[activeIndex - 1] : null;
  const diffFromPrev = prevPoint ? activePoint.total - prevPoint.total : activePoint.total;
  const isPositiveTrend = diffFromPrev >= 0;

  return (
    <View style={styles.card}>
      {/* Header Row: Title & Range Selector Dropdown */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {/* Live Metric Subheader */}
          <View style={styles.metricRow}>
            <Text style={styles.metricValue}>{activePoint.total}</Text>
            <Text style={styles.metricUnit}>members</Text>
            <View
              style={[
                styles.trendBadge,
                isPositiveTrend ? styles.trendBadgePositive : styles.trendBadgeNeutral,
              ]}
            >
              <TrendingUp
                size={11}
                color={isPositiveTrend ? '#059669' : '#64748B'}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.trendText,
                  isPositiveTrend ? styles.trendTextPositive : styles.trendTextNeutral,
                ]}
              >
                {diffFromPrev >= 0 ? `+${diffFromPrev}` : `${diffFromPrev}`} this period
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.rangeChip}
          onPress={() => setRangeModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.rangeText}>{selectedRangeLabel}</Text>
          <ChevronDown size={12} color="#64748B" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Modern SVG Interactive Chart */}
      <View style={styles.chartWrap}>
        <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs>
            <LinearGradient id="modernGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#2563EB" stopOpacity={0.24} />
              <Stop offset="70%" stopColor="#3B82F6" stopOpacity={0.06} />
              <Stop offset="100%" stopColor="#3B82F6" stopOpacity={0.00} />
            </LinearGradient>
          </Defs>

          {/* Clean Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map(tick => (
            <React.Fragment key={tick.value}>
              <Path
                d={`M ${PADDING.left} ${tick.y} L ${WIDTH - PADDING.right} ${tick.y}`}
                stroke="#F1F5F9"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              <SvgText
                x={PADDING.left - 8}
                y={tick.y + 3.5}
                fontSize={9}
                fontWeight="600"
                fill="#94A3B8"
                textAnchor="end"
              >
                {tick.value}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Smooth Gradient Area Fill */}
          <Path d={areaPath} fill="url(#modernGrowthFill)" />

          {/* Smooth Spline Curve Line */}
          <Path
            d={smoothLine}
            stroke="#2563EB"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Point Vertical Guideline */}
          {activePoint ? (
            <Path
              d={`M ${activePoint.x} ${PADDING.top} L ${activePoint.x} ${PADDING.top + innerHeight}`}
              stroke="#93C5FD"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          ) : null}

          {/* Data Points */}
          {coords.map((coord, idx) => {
            const isPointActive = idx === activeIndex;
            return (
              <G key={`${coord.label}-${coord.total}-${idx}`}>
                {/* Active Outer Glow Halo */}
                {isPointActive && (
                  <SvgCircle
                    cx={coord.x}
                    cy={coord.y}
                    r={9}
                    fill="rgba(37, 99, 235, 0.2)"
                  />
                )}
                {/* Crisp Point Circle */}
                <SvgCircle
                  cx={coord.x}
                  cy={coord.y}
                  r={isPointActive ? 5 : 3.5}
                  fill={isPointActive ? '#2563EB' : '#FFFFFF'}
                  stroke="#2563EB"
                  strokeWidth={isPointActive ? 2.5 : 2}
                />
                {/* Large Invisible Hit Target for Easy Finger Tapping */}
                <SvgCircle
                  cx={coord.x}
                  cy={coord.y}
                  r={18}
                  fill="transparent"
                  onPress={() => setSelectedPointIndex(idx)}
                />
              </G>
            );
          })}

          {/* Interactive Floating Tooltip Tag Anchored Directly to Point */}
          {activePoint ? (
            <G>
              {/* Tooltip Card Rect */}
              <Rect
                x={clampedX - tooltipWidth / 2}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx={8}
                fill="#0F2860"
              />
              {/* Tooltip Month Label */}
              <SvgText
                x={clampedX}
                y={tooltipY + 13}
                fontSize={8.5}
                fontWeight="600"
                fill="#94A3B8"
                textAnchor="middle"
              >
                {activeIndex === coords.length - 1 && latestLabel
                  ? latestLabel
                  : `${activePoint.label} 2026`}
              </SvgText>
              {/* Tooltip Metric Value */}
              <SvgText
                x={clampedX}
                y={tooltipY + 28}
                fontSize={11.5}
                fontWeight="800"
                fill="#FFFFFF"
                textAnchor="middle"
              >
                {`${activePoint.total} members`}
              </SvgText>
            </G>
          ) : null}

          {/* X-Axis Month Labels */}
          {coords.map((coord, idx) => {
            const isPointActive = idx === activeIndex;
            return (
              <SvgText
                key={`x-${coord.label}`}
                x={coord.x}
                y={HEIGHT - 6}
                fontSize={9.5}
                fontWeight={isPointActive ? '800' : '600'}
                fill={isPointActive ? '#0F2860' : '#64748B'}
                textAnchor="middle"
                onPress={() => setSelectedPointIndex(idx)}
              >
                {coord.label}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Time Range Selector Modal */}
      <Modal
        visible={rangeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRangeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setRangeModalVisible(false)}
        >
          <View style={styles.rangeModalCard}>
            <View style={styles.rangeModalHeader}>
              <Text style={styles.rangeModalTitle}>Select Time Range</Text>
              <TouchableOpacity
                onPress={() => setRangeModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rangeList}>
              {RANGE_OPTIONS.map(opt => {
                const isSelected = selectedRangeMonths === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.rangeOption,
                      isSelected && styles.rangeOptionActive,
                    ]}
                    onPress={() => {
                      if (onRangeMonthsChange) {
                        onRangeMonthsChange(opt.value);
                      }
                      setSelectedPointIndex(null);
                      setRangeModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.rangeOptionText,
                        isSelected && styles.rangeOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected ? <Text style={styles.rangeCheck}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: '#E8EFF8',
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleWrap: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
    letterSpacing: -0.2,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F2860',
    lineHeight: 26,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    gap: 3,
  },
  trendBadgePositive: {
    backgroundColor: '#ECFDF5',
  },
  trendBadgeNeutral: {
    backgroundColor: '#F1F5F9',
  },
  trendText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  trendTextPositive: {
    color: '#059669',
  },
  trendTextNeutral: {
    color: '#64748B',
  },
  rangeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    marginTop: 2,
  },
  rangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  chartWrap: {
    position: 'relative',
    marginTop: 4,
  },

  // Range Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  rangeModalCard: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.floating,
  },
  rangeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  rangeModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2C59',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  rangeList: {
    gap: 4,
  },
  rangeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rangeOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  rangeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  rangeOptionTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  rangeCheck: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
});
