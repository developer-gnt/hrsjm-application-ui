import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Spacing,
  SkeletonCard,
  StatusToneKey,
} from '../../../../core';
import { AdminStatCard } from '../../../../core/components/admin/AdminStatCard';
import {
  Banknote,
  Users,
  HeartHandshake,
  RefreshCw,
  AppIconComponent,
} from '../../../../core/components/icons';

export interface DonationStatItem {
  id: string;
  label: string;
  value: string | number;
  supportText: string;
  /** Optional change indicator, e.g. "↑ 22%" (reference design). */
  indicator?: string;
  icon?: string;
  Icon?: AppIconComponent;
  tone?: StatusToneKey;
  background?: string;
  onPress?: () => void;
}

interface DonationStatsProps {
  stats: DonationStatItem[];
  loading?: boolean;
  cardWidth?: number;
  layout?: 'scroll' | 'grid';
  onPressCard?: (statId: string) => void;
}

/**
 * Universal KPI Stat Cards for Donations matching the HRSJM official 2×2
 * reference design (Dashboard Image 1) with pastel backgrounds, solid circle
 * icon badges, large bold values, title, and trend indicators.
 */
export const DonationStats: React.FC<DonationStatsProps> = ({
  stats,
  loading = false,
  layout = 'grid',
  onPressCard,
}) => {
  // Resolves tone and Lucide icon for each card matching Dashboard 2x2 styling
  const resolveToneAndIcon = (stat: DonationStatItem, index: number) => {
    if (stat.id === 'total-donations' || index === 0) {
      return { tone: 'navy' as StatusToneKey, Icon: Banknote };
    }
    if (stat.id === 'total-donors' || index === 1) {
      return { tone: 'warning' as StatusToneKey, Icon: Users };
    }
    if (stat.id === 'one-time-donations' || index === 2) {
      return { tone: 'success' as StatusToneKey, Icon: HeartHandshake };
    }
    if (stat.id === 'recurring-donations' || index === 3) {
      return { tone: 'gold' as StatusToneKey, Icon: RefreshCw };
    }
    return { tone: 'navy' as StatusToneKey, Icon: Banknote };
  };

  const renderCard = (stat: DonationStatItem, index: number) => {
    const { tone: defaultTone, Icon: defaultIcon } = resolveToneAndIcon(stat, index);
    const activeTone = stat.tone || defaultTone;
    const ActiveIcon = stat.Icon || defaultIcon;

    // Subtext/note format: e.g. "+22% this month" or "Total donations received"
    const note = stat.indicator
      ? `${stat.indicator} ${stat.supportText}`
      : stat.supportText;

    const handlePress = () => {
      if (stat.onPress) {
        stat.onPress();
      } else if (onPressCard) {
        onPressCard(stat.id);
      }
    };

    return (
      <AdminStatCard
        key={stat.id}
        title={stat.label}
        value={stat.value}
        note={note}
        tone={activeTone}
        Icon={ActiveIcon}
        loading={loading}
        onPress={stat.onPress || onPressCard ? handlePress : undefined}
      />
    );
  };

  if (loading && layout === 'grid') {
    return (
      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={styles.skeletonWrapper}>
            <SkeletonCard height={106} />
          </View>
          <View style={styles.skeletonWrapper}>
            <SkeletonCard height={106} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.skeletonWrapper}>
            <SkeletonCard height={106} />
          </View>
          <View style={styles.skeletonWrapper}>
            <SkeletonCard height={106} />
          </View>
        </View>
      </View>
    );
  }

  // Split into 2 rows of 2 cards (2x2 grid) exactly matching Dashboard Image 1
  const row1 = stats.slice(0, 2);
  const row2 = stats.slice(2, 4);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {row1.map((stat, i) => renderCard(stat, i))}
      </View>
      {row2.length > 0 && (
        <View style={styles.row}>
          {row2.map((stat, i) => renderCard(stat, i + 2))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  skeletonWrapper: {
    flex: 1,
  },
});

export default DonationStats;