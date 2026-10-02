import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { AdminColors } from '../../../../core/theme/colors';
import { Typography } from '../../../../core/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';

export interface DonutSegment {
  label: string;
  count: number;
}

interface StatusDonutCardProps {
  title: string;
  segments: DonutSegment[];
}

/** Segment colors in the mockup's order (blue, gold, green, red/neutral...). */
const SEGMENT_COLORS = [
  AdminColors.info,
  AdminColors.warning,
  AdminColors.success,
  AdminColors.error,
  AdminColors.accentPurple,
];

const RADIUS = 46;
const STROKE = 16;
const SIZE = (RADIUS + STROKE / 2) * 2;

/** Donut chart card with a legend (Application Status / Complaints Overview). */
export const StatusDonutCard: React.FC<StatusDonutCardProps> = ({
  title,
  segments,
}) => {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const circumference = 2 * Math.PI * RADIUS;

  let offset = 0;
  const arcs = segments.map((segment, index) => {
    const fraction = total > 0 ? segment.count / total : 0;
    const dash = fraction * circumference;
    const arc = {
      ...segment,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      dash,
      offset,
    };
    offset += dash;
    return arc;
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.bodyRow}>
        <View style={styles.chartWrap}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <SvgCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={AdminColors.divider}
              strokeWidth={STROKE}
              fill="none"
            />
            {arcs.map((arc) =>
              arc.dash > 0 ? (
                <SvgCircle
                  key={arc.label}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={arc.color}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                  strokeDashoffset={-arc.offset}
                  strokeLinecap="butt"
                  rotation={-90}
                  origin={`${SIZE / 2}, ${SIZE / 2}`}
                />
              ) : null,
            )}
          </Svg>

          <View style={styles.center} pointerEvents="none">
            <Text style={styles.centerValue}>{total}</Text>
            <Text style={styles.centerLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.legend}>
          {arcs.map((arc) => (
            <View key={arc.label} style={styles.legendRow}>
              <View
                style={[styles.dot, { backgroundColor: arc.color }]}
              />
              <Text style={styles.legendLabel}>{arc.label}</Text>
              <Text style={styles.legendCount}>{arc.count}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: AdminColors.cardSurface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  title: {
    ...Typography.cardTitle,
    color: AdminColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chartWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerValue: {
    ...Typography.metricLarge,
    color: AdminColors.textPrimary,
  },
  centerLabel: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
  },
  legend: {
    flex: 1,
    gap: Spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    ...Typography.caption,
    color: AdminColors.textSecondary,
    flex: 1,
  },
  legendCount: {
    ...Typography.bodyBold,
    color: AdminColors.textPrimary,
  },
});
