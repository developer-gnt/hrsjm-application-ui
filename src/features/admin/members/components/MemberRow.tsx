import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors, StatusTones } from '../../../../core/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../../core/theme/spacing';
import { Typography } from '../../../../core/theme/typography';
import { AppCheckbox } from '../../../../core/components/common/AppCheckbox';
import { PressableScale } from '../../../../core/components/common/PressableScale';
import { EllipsisVertical } from '../../../../core/components/icons';
import { formatDate } from '../../../../core/utils/date';
import { Member } from '../types';
import { getDaysRemaining, getValidityTone } from '../utils/members.utils';
import { Avatar } from './Avatar';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberRowProps {
  member: Member;
  selected: boolean;
  /** Wide (tablet/landscape) grid layout vs stacked phone card layout. */
  wide: boolean;
  onToggleSelect: (id: string) => void;
  onOpenActions: (member: Member) => void;
}

const AVATAR_SIZE = 40;

const renderValidityText = (member: Member) => {
  const daysRemaining = getDaysRemaining(member.validTill);
  const tone = getValidityTone(daysRemaining);
  const toneColor = StatusTones[tone].text;

  if (daysRemaining <= 0) {
    return <Text style={[styles.daysText, { color: toneColor }]}>Expired</Text>;
  }
  return (
    <Text style={[styles.daysText, { color: toneColor }]}>
      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
    </Text>
  );
};

/**
 * Member list row. Two adaptive layouts:
 *  - wide: aligned columns matching MemberListHeader
 *  - narrow: stacked card with clear text hierarchy (no clipped columns)
 */
const MemberRowComponent: React.FC<MemberRowProps> = ({
  member,
  selected,
  wide,
  onToggleSelect,
  onOpenActions,
}) => {
  if (wide) {
    return (
      <View style={[styles.card, styles.cardWide, selected && styles.cardSelected]}>
        <View style={styles.checkboxCell}>
          <AppCheckbox
            checked={selected}
            onPress={() => onToggleSelect(member.id)}
            accessibilityLabel={`Select ${member.name}`}
          />
        </View>

        <View style={styles.memberColumn}>
          <Avatar name={member.name} source={member.photo} size={AVATAR_SIZE} />
          <View style={styles.contactStack}>
            <Text style={styles.name} numberOfLines={1}>
              {member.name}
            </Text>
            <Text style={styles.contact} numberOfLines={1}>
              {member.phone}
            </Text>
            <Text style={styles.contact} numberOfLines={1}>
              {member.email}
            </Text>
          </View>
        </View>

        <View style={styles.idColumn}>
          <Text style={styles.membershipId} numberOfLines={1}>
            {member.membershipId}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            Joined: {formatDate(member.joinedDate)}
          </Text>
        </View>

        <View style={styles.validColumn}>
          <Text style={styles.validDate} numberOfLines={1}>
            {formatDate(member.validTill)}
          </Text>
          {renderValidityText(member)}
        </View>

        <View style={styles.statusColumn}>
          <MemberStatusBadge status={member.status} />
        </View>

        <View style={styles.menuColumn}>
          <PressableScale
            onPress={() => onOpenActions(member)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`More actions for ${member.name}`}
            style={styles.menuButton}
          >
            <EllipsisVertical size={20} color={BrandColors.textMuted} strokeWidth={2} />
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <PressableScale
      onPress={() => onOpenActions(member)}
      scaleTo={0.99}
      pressedOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Member ${member.name}, open actions`}
      testID={`member-row-${member.id}`}
    >
      <View style={[styles.card, selected && styles.cardSelected]}>
        <View style={styles.narrowHeaderRow}>
          <AppCheckbox
            checked={selected}
            onPress={() => onToggleSelect(member.id)}
            accessibilityLabel={`Select ${member.name}`}
          />
          <Avatar name={member.name} source={member.photo} size={AVATAR_SIZE} />
          <View style={styles.narrowNameStack}>
            <Text style={styles.name} numberOfLines={1}>
              {member.name}
            </Text>
          </View>
          <MemberStatusBadge status={member.status} />
          <PressableScale
            onPress={() => onOpenActions(member)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`More actions for ${member.name}`}
            style={styles.menuButton}
          >
            <EllipsisVertical size={20} color={BrandColors.textMuted} strokeWidth={2} />
          </PressableScale>
        </View>

        <View style={styles.narrowDetailStack}>
          <Text style={styles.contact} numberOfLines={1}>
            {member.phone} · {member.email}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {member.membershipId} · Joined: {formatDate(member.joinedDate)}
          </Text>
          <View style={styles.narrowValidityRow}>
            <Text style={styles.meta}>Valid till {formatDate(member.validTill)}</Text>
            <Text style={styles.dotSeparator}>·</Text>
            {renderValidityText(member)}
          </View>
        </View>
      </View>
    </PressableScale>
  );
};

export const MemberRow = memo(MemberRowComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  cardSelected: {
    borderColor: BrandColors.navy,
    backgroundColor: BrandColors.softBlue,
  },
  cardWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // Wide grid cells (flex values match MemberListHeader)
  checkboxCell: {
    width: 20,
  },
  memberColumn: {
    flex: 2.4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  idColumn: {
    flex: 1.9,
    gap: 2,
  },
  validColumn: {
    flex: 1.5,
    gap: 2,
  },
  statusColumn: {
    width: 96,
    alignItems: 'flex-start',
  },
  menuColumn: {
    width: 28,
    alignItems: 'flex-end',
  },
  contactStack: {
    flex: 1,
    gap: 1,
  },

  // Narrow stacked layout
  narrowHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  narrowNameStack: {
    flex: 1,
  },
  narrowDetailStack: {
    marginTop: Spacing.sm,
    paddingLeft: AVATAR_SIZE + Spacing.md + 20 + Spacing.md,
    gap: 3,
  },
  narrowValidityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Text styles
  name: {
    ...Typography.rowTitle,
    color: BrandColors.textPrimary,
  },
  contact: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: BrandColors.textSecondary,
  },
  membershipId: {
    ...Typography.bodyMedium,
    color: BrandColors.textSecondary,
  },
  meta: {
    ...Typography.secondary,
    color: BrandColors.textMuted,
  },
  validDate: {
    ...Typography.body,
    color: BrandColors.textPrimary,
  },
  daysText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  dotSeparator: {
    ...Typography.secondary,
    color: BrandColors.textMuted,
  },
  menuButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MemberRow;
