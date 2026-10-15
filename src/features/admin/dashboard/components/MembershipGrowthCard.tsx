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
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';

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

const WIDTH = 330;
const HEIGHT = 160;
const PADDING = { top: 28, right: 20, bottom: 26, left: 32 };

const RANGE_OPTIONS = [
  { label: 'Last 3 Months', value: 3 },
  { label: 'Last 6 Months', value: 6 },
  { label: 'Last 12 Months', value: 12 },
];

/** Line chart card for the "Membership Growth" section with dynamic range & points. */
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
          { label: 'M1', total: 0 },
          { label: 'M2', total: 0 },
          { label: 'M3', total: 0 },
          { label: 'M4', total: 0 },
          { label: 'M5', total: 0 },
          { label: 'M6', total: 0 },
        ];

  const maxVal = Math.max(...chartPoints.map(p => p.total), 10);
  const yMax = Math.ceil(maxVal / 50) * 50 || 100;
  const stepX = innerWidth / Math.max(chartPoints.length - 1, 1);

  const coords = chartPoints.map((point, index) => {
    const x = PADDING.left + stepX * index;
    const y = PADDING.top + innerHeight - (point.total / yMax) * innerHeight;
    return { x, y, ...point };
  });

  const linePoints = coords
    .map(coord => `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`)
    .join(' ');

  const areaPath = [
    `M ${coords[0].x.toFixed(1)} ${PADDING.top + innerHeight}`,
    ...coords.map(coord => `L ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`),
    `L ${coords[coords.length - 1].x.toFixed(1)} ${PADDING.top + innerHeight}`,
    'Z',
  ].join(' ');

  const stepVal = Math.round(yMax / 4);
  const yTicks = [0, stepVal, stepVal * 2, stepVal * 3, yMax].map(val => ({
    value: val,
    y: PADDING.top + innerHeight - (val / yMax) * innerHeight,
  }));

  const activeIndex = selectedPointIndex !== null ? selectedPointIndex : coords.length - 1;
  const activePoint = coords[activeIndex] || coords[coords.length - 1];

  const selectedRangeLabel =
    RANGE_OPTIONS.find(o => o.value === selectedRangeMonths)?.label || `Last ${selectedRangeMonths} Months`;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.rangeChip}
          onPress={() => setRangeModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.rangeText}>{selectedRangeLabel}</Text>
          <Text style={styles.rangeChevron}>▾</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartWrap}>
        <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs>
            <LinearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3B82F6" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#3B82F6" stopOpacity={0.03} />
            </LinearGradient>
          </Defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map(tick => (
            <React.Fragment key={tick.value}>
              <Path
                d={`M ${PADDING.left} ${tick.y} L ${WIDTH - PADDING.right} ${tick.y}`}
                stroke="#F1F5F9"
                strokeWidth={1}
              />
              <SvgText
                x={PADDING.left - 6}
                y={tick.y + 3}
                fontSize={8.5}
                fontWeight="500"
                fill="#94A3B8"
                textAnchor="end"
              >
                {tick.value}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Area fill */}
          <Path d={areaPath} fill="url(#growthFill)" />

          {/* Blue line */}
          <Path
            d={`M ${linePoints.replace(/ /g, ' L ')}`}
            stroke="#2563EB"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {coords.map((coord, idx) => {
            const isPointActive = idx === activeIndex;
            return (
              <SvgCircle
                key={`${coord.label}-${coord.total}-${idx}`}
                cx={coord.x}
                cy={coord.y}
                r={isPointActive ? 4.5 : 3.5}
                fill={isPointActive ? '#1D4ED8' : '#2563EB'}
                stroke="#FFFFFF"
                strokeWidth={isPointActive ? 2 : 1.5}
                onPress={() => setSelectedPointIndex(idx)}
              />
            );
          })}

          {/* X-axis labels */}
          {coords.map(coord => (
            <SvgText
              key={`x-${coord.label}`}
              x={coord.x}
              y={HEIGHT - 6}
              fontSize={9}
              fontWeight="600"
              fill="#64748B"
              textAnchor="middle"
            >
              {coord.label}
            </SvgText>
          ))}
        </Svg>

        {/* Tooltip Callout on active point */}
        {activePoint ? (
          <View
            style={[
              styles.callout,
              { left: `${(activePoint.x / WIDTH) * 100}%` },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.calloutLabel}>
              {activeIndex === coords.length - 1 && latestLabel
                ? latestLabel
                : activePoint.label}
            </Text>
            <Text style={styles.calloutValue}>{activePoint.total} members</Text>
          </View>
        ) : null}
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
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2C59',
  },
  rangeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  rangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  rangeChevron: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  chartWrap: {
    position: 'relative',
  },
  callout: {
    position: 'absolute',
    top: 2,
    transform: [{ translateX: -48 }],
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  calloutLabel: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#64748B',
  },
  calloutValue: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F2C59',
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
