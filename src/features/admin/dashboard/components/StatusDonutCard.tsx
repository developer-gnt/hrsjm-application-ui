import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';

export interface DonutSegment {
  label: string;
  count: number;
}

interface StatusDonutCardProps {
  title: string;
  segments: DonutSegment[];
}

const STATUS_COLORS: Record<string, string> = {
  Approved: '#16A34A',
  Resolved: '#16A34A',
  'Under Review': '#F59E0B',
  'In Progress': '#F59E0B',
  Pending: '#3B82F6',
  Open: '#3B82F6',
  Rejected: '#EF4444',
  Closed: '#EF4444',
};

const DEFAULT_PALETTE = ['#16A34A', '#F59E0B', '#3B82F6', '#EF4444'];

const RADIUS = 30;
const STROKE = 9;
const SIZE = (RADIUS + STROKE / 2) * 2;

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
    const color =
      STATUS_COLORS[segment.label] ||
      DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
    const arc = {
      ...segment,
      color,
      dash,
      offset,
    };
    offset += dash;
    return arc;
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Donut Chart Centered */}
      <View style={styles.chartWrap}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <SvgCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#F1F5F9"
            strokeWidth={STROKE}
            fill="none"
          />
          {arcs.map(arc =>
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

      {/* Legend Grid Below */}
      <View style={styles.legendGrid}>
        {arcs.map(arc => (
          <View key={arc.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: arc.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {arc.label}
            </Text>
            <Text style={styles.legendCount}>{arc.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    ...Shadows.card,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2C59',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
  },
  chartWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2C59',
    lineHeight: 16,
  },
  centerLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#64748B',
  },
  legendGrid: {
    width: '100%',
    gap: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  legendCount: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F2C59',
  },
});
