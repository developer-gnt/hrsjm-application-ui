import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppAvatar } from '../../../../core/components/common/AppAvatar';
import { AppButton } from '../../../../core/components/common/AppButton';
import { AppCard } from '../../../../core/components/common/AppCard';
import { colors, spacing, typography } from '../../../../core/theme/theme';
import { formatDate, formatCurrency } from '../../../../core/utils/format';
import { shortRequestId } from '../types/assistance.types';
import type { AssistanceRequest } from '../types/assistance.types';
import { AssistanceStatusBadge } from './AssistanceStatusBadge';

interface AssistanceCardProps {
  request: AssistanceRequest;
  onPress: () => void;
}

function AssistanceCardBase({ request, onPress }: AssistanceCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <AppAvatar name={request.full_name} />
        <View style={styles.nameColumn}>
          <Text style={styles.name}>{request.full_name}</Text>
          <Text style={styles.reason} numberOfLines={1}>
            {request.reason}
          </Text>
        </View>
        <AssistanceStatusBadge status={request.status} />
      </View>

      <View style={styles.metaBlock}>
        <Text style={styles.metaLine}>
          Request <Text style={styles.metaStrong}>{shortRequestId(request.id)}</Text>
        </Text>
        <Text style={styles.metaLine}>
          Requested: <Text style={styles.metaStrong}>{formatCurrency(request.requested_amount)}</Text>
        </Text>
        <Text style={styles.metaLine}>Submitted: {formatDate(request.created_at)}</Text>
      </View>

      <AppButton title="View Details" onPress={onPress} variant="secondary" fullWidth />
    </AppCard>
  );
}

export const AssistanceCard = React.memo(AssistanceCardBase);

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nameColumn: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  name: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  reason: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaBlock: {
    marginBottom: spacing.md,
    gap: 4,
  },
  metaLine: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metaStrong: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default AssistanceCard;
