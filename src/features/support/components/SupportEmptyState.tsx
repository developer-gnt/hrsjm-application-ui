import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminColors, BorderRadius, Spacing } from '../../../core';

interface SupportEmptyStateProps {
  type: 'empty' | 'no-results' | 'loading';
  searchQuery?: string;
  onClearFilters?: () => void;
  onCreateTicket?: () => void;
}

export const SupportEmptyState: React.FC<SupportEmptyStateProps> = ({
  type,
  searchQuery,
  onClearFilters,
  onCreateTicket,
}) => {
  if (type === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AdminColors.primary} />
        <Text style={styles.loadingText}>Loading support tickets...</Text>
      </View>
    );
  }

  if (type === 'no-results') {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔍</Text>
        </View>
        <Text style={styles.title}>No matching tickets found</Text>
        <Text style={styles.description}>
          {searchQuery
            ? `No tickets match "${searchQuery}". Try searching with a different ID, subject or category.`
            : 'No tickets match the selected filter criteria.'}
        </Text>
        {onClearFilters && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onClearFilters}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Clear filters and search"
          >
            <Text style={styles.actionButtonText}>Clear Search & Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>🎫</Text>
      </View>
      <Text style={styles.title}>No Support Tickets Yet</Text>
      <Text style={styles.description}>
        You haven't submitted any support requests. If you have an inquiry or need assistance, raise a ticket.
      </Text>
      {onCreateTicket && (
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={onCreateTicket}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Create First Support Ticket"
        >
          <Text style={styles.primaryActionButtonText}>+ Create Ticket</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  iconText: {
    fontSize: 26,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: Spacing.md,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: Spacing.sm,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AdminColors.primary,
    backgroundColor: '#EFF6FF',
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  primaryActionButton: {
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.lg,
    backgroundColor: AdminColors.primary,
  },
  primaryActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
