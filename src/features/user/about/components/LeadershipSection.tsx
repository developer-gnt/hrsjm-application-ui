import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Spacing } from '../../../../core/theme/spacing';
import { AppModal } from '../../../../core';
import { ABOUT_CONTENT } from '../content/aboutContent';
import {
  AboutColors,
  AboutFonts,
  AboutLayout,
  AboutRadius,
  AboutStyles,
  AboutTypography,
} from '../theme';
import type { AboutLeader } from '../content/aboutContent';

/**
 * Leadership (spec Phase 9): white bordered cards with the approved portrait
 * filling the card top, name + role, and the gold arrow chip from the
 * reference. Every control works: "View All →" opens the leadership sheet
 * with all approved members, and each card's chip opens that leader's sheet —
 * approved data only (photo, name, role), via the shared AppModal.
 */
export const LeadershipSection: React.FC = () => {
  const { width } = useWindowDimensions();
  const { heading, lead, members } = ABOUT_CONTENT.leadership;
  const [allVisible, setAllVisible] = useState(false);
  const [sheetLeader, setSheetLeader] = useState<AboutLeader | null>(null);

  const columns = width < 360 ? 2 : 3;
  const contentWidth =
    Math.min(width, AboutLayout.contentMaxWidth) - AboutLayout.gutter * 2;
  const gap = Spacing.base - 4;
  const cardWidth = (contentWidth - (columns - 1) * gap) / columns;

  return (
    <View style={AboutStyles.section}>
      <View style={styles.headingRow}>
        <Text
          accessibilityRole="header"
          style={[AboutTypography.pageTitle, styles.heading]}
        >
          {heading}
        </Text>
        <TouchableOpacity
          style={styles.viewAll}
          onPress={() => setAllVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="View all leadership members"
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Text style={styles.viewAllArrow}>{'\u2192'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[AboutTypography.sectionLead, styles.lead]}>{lead}</Text>

      <View style={styles.row}>
        {members.map(member => (
          <View
            key={member.name}
            style={[AboutStyles.cardBordered, styles.card, { width: cardWidth }]}
          >
            {member.source ? (
              <Image
                source={member.source}
                style={styles.portrait}
                resizeMode="cover"
                fadeDuration={0}
                accessibilityLabel={`Portrait of ${member.name}`}
              />
            ) : (
              <View style={styles.portraitFallback} accessible={false}>
                <Text style={styles.initials}>{memberInitials(member.name)}</Text>
              </View>
            )}

            <View style={styles.cardBody}>
              <Text style={[AboutTypography.leaderName, styles.memberName]}>
                {member.name}
              </Text>
              <Text style={[AboutTypography.leaderRole, styles.memberRole]}>
                {member.role}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.arrowChip}
              onPress={() => setSheetLeader(member)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`View ${member.name}, ${member.role}`}
            >
              <Text style={styles.arrowGlyph}>{'\u2192'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* All members sheet ("View All") */}
      <AppModal
        visible={allVisible}
        onClose={() => setAllVisible(false)}
        title="Leadership"
      >
        <View>
          {members.map(member => (
            <View style={styles.sheetRow} key={member.name}>
              {member.source ? (
                <Image
                  source={member.source}
                  style={styles.sheetPortrait}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              ) : (
                <View style={[styles.sheetPortrait, styles.portraitFallback]}>
                  <Text style={styles.sheetInitials}>
                    {memberInitials(member.name)}
                  </Text>
                </View>
              )}
              <View style={styles.sheetText}>
                <Text style={[AboutTypography.cardTitle, styles.sheetName]}>
                  {member.name}
                </Text>
                <Text style={[AboutTypography.leaderRole, styles.sheetRole]}>
                  {member.role}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </AppModal>

      {/* Single leader sheet (card arrow chip) */}
      <AppModal
        visible={sheetLeader !== null}
        onClose={() => setSheetLeader(null)}
        title={sheetLeader?.name}
      >
        {sheetLeader ? (
          <View style={styles.sheetLeaderWrap}>
            {sheetLeader.source ? (
              <Image
                source={sheetLeader.source}
                style={styles.sheetLeaderPortrait}
                resizeMode="cover"
                fadeDuration={0}
              />
            ) : (
              <View style={[styles.sheetLeaderPortrait, styles.portraitFallback]}>
                <Text style={styles.sheetInitials}>
                  {memberInitials(sheetLeader.name)}
                </Text>
              </View>
            )}
            <Text
              style={[AboutTypography.cardTitle, styles.sheetLeaderName]}
              accessibilityRole="header"
            >
              {sheetLeader.name}
            </Text>
            <Text
              style={[AboutTypography.leaderRole, styles.sheetLeaderRole]}
            >
              {sheetLeader.role}
            </Text>
          </View>
        ) : null}
      </AppModal>
    </View>
  );
};

/** Initials for the fallback portrait field (approved names only; honorifics
 * like Dr./Adv. are not name initials). */
const HONORIFICS = new Set(['dr', 'adv', 'mr', 'mrs', 'ms', 'prof']);
const memberInitials = (name: string): string => {
  const parts = name
    .replace(/\./g, '')
    .split(' ')
    .filter(part => part && !HONORIFICS.has(part.toLowerCase()));
  const picked = parts.length >= 2
    ? [parts[0][0], parts[parts.length - 1][0]]
    : parts.slice(0, 2).map(part => part[0]);
  return picked.join('').toUpperCase();
};

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    color: AboutColors.primaryNavy,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: AboutColors.primaryNavy,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  viewAllArrow: {
    color: AboutColors.primaryNavy,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    marginLeft: 5,
  },
  lead: {
    color: AboutColors.bodyText,
    marginTop: AboutLayout.blockGap - 4,
    maxWidth: 720,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base - 4,
    marginTop: AboutLayout.sectionGap - 8,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    minHeight: 210,
  },
  portrait: {
    width: '100%',
    height: 128,
  },
  portraitFallback: {
    backgroundColor: AboutColors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: AboutFonts.serif,
    fontSize: 30,
    fontWeight: '700',
    color: AboutColors.primaryNavy,
  },
  cardBody: {
    padding: Spacing.md,
    paddingTop: Spacing.sm + 2,
  },
  memberName: {
    color: AboutColors.primaryNavy,
  },
  memberRole: {
    color: AboutColors.mutedText,
    marginTop: 2,
  },
  arrowChip: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AboutColors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlyph: {
    color: AboutColors.textOnGold,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  sheetPortrait: {
    width: 64,
    height: 52,
    borderRadius: AboutRadius.md,
  },
  sheetInitials: {
    fontFamily: AboutFonts.serif,
    fontSize: 16,
    fontWeight: '700',
    color: AboutColors.primaryNavy,
  },
  sheetText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sheetName: {
    color: AboutColors.primaryNavy,
  },
  sheetRole: {
    color: AboutColors.mutedText,
    marginTop: 2,
  },
  sheetLeaderWrap: {
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  sheetLeaderPortrait: {
    width: 210,
    height: 166,
    borderRadius: AboutRadius.lg,
  },
  sheetLeaderName: {
    color: AboutColors.primaryNavy,
    marginTop: Spacing.md,
  },
  sheetLeaderRole: {
    color: AboutColors.mutedText,
    marginTop: 4,
  },
});
