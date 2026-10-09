import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Spacing } from '../../../core';
import { TicketStatsData, StatusTabKey } from '../types/ticket.types';
import {
  TotalTicketsIcon,
  ClockIcon,
  CheckCircleIcon,
  ClosedCircleIcon,
} from './SupportIcons';

interface SupportSummaryCardsProps {
  stats: TicketStatsData;
  activeTab?: StatusTabKey;
  onCardPress?: (tab: StatusTabKey) => void;
}

interface CardItem {
  key: StatusTabKey;
  count: number;
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconBgColor: string;
  renderIcon: () => React.ReactNode;
}

export const SupportSummaryCards: React.FC<SupportSummaryCardsProps> = ({
  stats,
  activeTab,
  onCardPress,
}) => {
  const cards: CardItem[] = [
    {
      key: 'all',
      count: stats.total,
      label: 'Total Tickets',
      bgColor: '#EFF6FF',
      borderColor: '#DBEAFE',
      textColor: '#1B3F8F',
      iconBgColor: '#DBEAFE',
      renderIcon: () => <TotalTicketsIcon size={18} color="#1B3F8F" />,
    },
    {
      key: 'open',
      count: stats.open,
      label: 'Open',
      bgColor: '#FFFBEB',
      borderColor: '#FEF3C7',
      textColor: '#D97706',
      iconBgColor: '#FEF3C7',
      renderIcon: () => <ClockIcon size={18} color="#D97706" />,
    },
    {
      key: 'resolved',
      count: stats.resolved,
      label: 'Resolved',
      bgColor: '#F0FDF4',
      borderColor: '#DCFCE7',
      textColor: '#16A34A',
      iconBgColor: '#DCFCE7',
      renderIcon: () => <CheckCircleIcon size={18} color="#16A34A" />,
    },
    {
      key: 'closed',
      count: stats.closed,
      label: 'Closed',
      bgColor: '#FEF2F2',
      borderColor: '#FEE2E2',
      textColor: '#DC2626',
      iconBgColor: '#FEE2E2',
      renderIcon: () => <ClosedCircleIcon size={18} color="#DC2626" />,
    },
  ];

  const renderCard = (card: CardItem) => {
    const isSelected = activeTab === card.key;
    return (
      <TouchableOpacity
        key={card.key}
        style={[
          styles.card,
          {
            backgroundColor: card.bgColor,
            borderColor: isSelected ? card.textColor : card.borderColor,
            borderWidth: isSelected ? 1.5 : 1,
          },
        ]}
        onPress={() => onCardPress?.(card.key)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${card.label}: ${card.count}`}
      >
        <View style={[styles.iconCircle, { backgroundColor: card.iconBgColor }]}>
          {card.renderIcon()}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.countText, { color: card.textColor }]}>
            {card.count}
          </Text>
          <Text style={styles.labelText} numberOfLines={1}>
            {card.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.grid}>
      {/* 2x2 Grid Layout */}
      <View style={styles.row}>
        {renderCard(cards[0])}
        {renderCard(cards[1])}
      </View>
      <View style={styles.row}>
        {renderCard(cards[2])}
        {renderCard(cards[3])}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 8,
    marginVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  countText: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
});
