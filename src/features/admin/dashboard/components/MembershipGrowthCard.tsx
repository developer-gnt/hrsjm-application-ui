import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle as SvgCircle,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';

export interface GrowthChartPoint {
  label: string;
  total: number;
}

interface MembershipGrowthCardProps {
  title?: string;
  points: GrowthChartPoint[];
  /** Callout for the latest point, e.g. "Sep 2026". */
  latestLabel?: string;
}

const WIDTH = 330;
const HEIGHT = 160;
const PADDING = { top: 28, right: 20, bottom: 26, left: 32 };

/** Line chart card for the "Membership Growth" section (last 6 months). */
export const MembershipGrowthCard: React.FC<MembershipGrowthCardProps> = ({
  title = 'Membership Growth',
  points,
  latestLabel,
}) => {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  // Fallback points matching mock if empty
  const chartPoints =
    points && points.length > 0
      ? points
      : [
          { label: 'Apr', total: 100 },
          { label: 'May', total: 140 },
          { label: 'Jun', total: 185 },
          { label: 'Jul', total: 220 },
          { label: 'Aug', total: 250 },
          { label: 'Sep', total: 342 },
        ];

  const yMax = 400;
  const stepX = innerWidth / (chartPoints.length - 1);

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

  const yTicks = [0, 100, 200, 300, 400].map(val => ({
    value: val,
    y: PADDING.top + innerHeight - (val / yMax) * innerHeight,
  }));

  const latest = coords[coords.length - 1];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rangeChip}>
          <Text style={styles.rangeText}>Last 6 Months</Text>
          <Text style={styles.rangeChevron}>▾</Text>
        </View>
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
          {coords.map(coord => (
            <SvgCircle
              key={`${coord.label}-${coord.total}`}
              cx={coord.x}
              cy={coord.y}
              r={3.5}
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          ))}

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

        {/* Tooltip Callout on latest point */}
        <View
          style={[
            styles.callout,
            { left: `${(latest.x / WIDTH) * 100}%` },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.calloutLabel}>{latestLabel ?? 'Sep 2026'}</Text>
          <Text style={styles.calloutValue}>{latest.total} members</Text>
        </View>
      </View>
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
});
