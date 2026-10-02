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
import { AdminColors } from '../../../../core/theme/colors';
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

const WIDTH = 320;
const HEIGHT = 160;
const PADDING = { top: 24, right: 16, bottom: 28, left: 34 };

/** Line chart card for the "Membership Growth" section (last 6 months). */
export const MembershipGrowthCard: React.FC<MembershipGrowthCardProps> = ({
  title = 'Membership Growth',
  points,
  latestLabel,
}) => {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  if (points.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>No growth data available yet.</Text>
      </View>
    );
  }

  const maxTotal = Math.max(...points.map((point) => point.total), 1);
  const yMax = Math.ceil(maxTotal / 100) * 100 || 100;
  const stepX =
    points.length > 1 ? innerWidth / (points.length - 1) : 0;

  const coords = points.map((point, index) => {
    const x = PADDING.left + stepX * index;
    const y = PADDING.top + innerHeight - (point.total / yMax) * innerHeight;
    return { x, y, ...point };
  });

  const linePoints = coords
    .map((coord) => `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`)
    .join(' ');
  const areaPath = [
    `M ${coords[0].x.toFixed(1)} ${PADDING.top + innerHeight}`,
    ...coords.map(
      (coord) => `L ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`,
    ),
    `L ${coords[coords.length - 1].x.toFixed(1)} ${PADDING.top + innerHeight}`,
    'Z',
  ].join(' ');

  const yTicks = [0, 0.5, 1].map((ratio) => ({
    value: Math.round(yMax * ratio),
    y: PADDING.top + innerHeight - ratio * innerHeight,
  }));

  const latest = coords[coords.length - 1];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rangeChip}>
          <Text style={styles.rangeText}>Last 6 Months</Text>
        </View>
      </View>

      <View style={styles.chartWrap}>
        <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs>
            <LinearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={AdminColors.info} stopOpacity={0.25} />
              <Stop offset="1" stopColor={AdminColors.info} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {yTicks.map((tick) => (
            <React.Fragment key={tick.value}>
              <Path
                d={`M ${PADDING.left} ${tick.y} L ${WIDTH - PADDING.right} ${tick.y}`}
                stroke={AdminColors.divider}
                strokeWidth={1}
              />
              <SvgText
                x={PADDING.left - 6}
                y={tick.y + 4}
                fontSize={9}
                fill={AdminColors.textMuted}
                textAnchor="end"
              >
                {tick.value}
              </SvgText>
            </React.Fragment>
          ))}

          <Path d={areaPath} fill="url(#growthFill)" />
          <Path
            d={`M ${linePoints.replace(/ /g, ' L ')}`}
            stroke={AdminColors.info}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((coord) => (
            <SvgCircle
              key={`${coord.label}-${coord.total}`}
              cx={coord.x}
              cy={coord.y}
              r={3.5}
              fill={AdminColors.cardSurface}
              stroke={AdminColors.info}
              strokeWidth={2}
            />
          ))}

          {coords.map((coord) => (
            <SvgText
              key={`x-${coord.label}`}
              x={coord.x}
              y={HEIGHT - 8}
              fontSize={9}
              fill={AdminColors.textMuted}
              textAnchor="middle"
            >
              {coord.label}
            </SvgText>
          ))}
        </Svg>

        <View
          style={[
            styles.callout,
            { left: `${(latest.x / WIDTH) * 100}%` },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.calloutLabel}>{latestLabel ?? `${latest.label} 2026`}</Text>
          <Text style={styles.calloutValue}>{latest.total} members</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.cardTitle,
    color: AdminColors.textPrimary,
  },
  rangeChip: {
    backgroundColor: AdminColors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  rangeText: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  chartWrap: {
    position: 'relative',
  },
  callout: {
    position: 'absolute',
    top: 0,
    transform: [{ translateX: -52 }],
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: AdminColors.border,
  },
  calloutLabel: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  calloutValue: {
    ...Typography.bodyBold,
    color: AdminColors.info,
  },
  empty: {
    ...Typography.body,
    color: AdminColors.textSecondary,
    marginTop: Spacing.sm,
  },
});
