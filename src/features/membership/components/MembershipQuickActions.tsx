import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../../core';

interface MembershipQuickActionsProps {
  onMemberCardPress?: () => void;
  onBenefitsPress?: () => void;
  onDocumentsPress?: () => void;
  onRenewPress?: () => void;
}

export const MembershipQuickActions: React.FC<MembershipQuickActionsProps> = ({
  onMemberCardPress,
  onBenefitsPress,
  onDocumentsPress,
  onRenewPress,
}) => {
  return (
    <View style={styles.container} accessibilityRole="region" accessibilityLabel="Quick Actions">
      {/* 1. Member Card */}
      <TouchableOpacity
        style={styles.actionCard}
        activeOpacity={0.75}
        onPress={onMemberCardPress}
        accessibilityRole="button"
        accessibilityLabel="Member Card, View Digital Card"
      >
        <View style={styles.iconCircle}>
          <View style={styles.cardMini}>
            <View style={styles.cardMiniAvatarCol}>
              <View style={styles.cardMiniAvatarHead} />
              <View style={styles.cardMiniAvatarBody} />
            </View>
            <View style={styles.cardMiniLinesCol}>
              <View style={styles.cardMiniLineTop} />
              <View style={styles.cardMiniLineBottom} />
            </View>
          </View>
        </View>
        <Text style={styles.actionTitle} numberOfLines={1}>
          Member Card
        </Text>
        <Text style={styles.actionSubtitle} numberOfLines={2}>
          View Digital Card
        </Text>
      </TouchableOpacity>

      {/* 2. Benefits */}
      <TouchableOpacity
        style={styles.actionCard}
        activeOpacity={0.75}
        onPress={onBenefitsPress}
        accessibilityRole="button"
        accessibilityLabel="Benefits, What You Get"
      >
        <View style={styles.iconCircle}>
          <View style={styles.groupMini}>
            <View style={styles.groupSideLeft}>
              <View style={styles.groupSideHead} />
              <View style={styles.groupSideBody} />
            </View>
            <View style={styles.groupCenter}>
              <View style={styles.groupCenterHead} />
              <View style={styles.groupCenterBody} />
            </View>
            <View style={styles.groupSideRight}>
              <View style={styles.groupSideHead} />
              <View style={styles.groupSideBody} />
            </View>
          </View>
        </View>
        <Text style={styles.actionTitle} numberOfLines={1}>
          Benefits
        </Text>
        <Text style={styles.actionSubtitle} numberOfLines={2}>
          What You Get
        </Text>
      </TouchableOpacity>

      {/* 3. Documents */}
      <TouchableOpacity
        style={styles.actionCard}
        activeOpacity={0.75}
        onPress={onDocumentsPress}
        accessibilityRole="button"
        accessibilityLabel="Documents, View & Download"
      >
        <View style={styles.iconCircle}>
          <View style={styles.docMini}>
            <View style={styles.docFold} />
            <View style={styles.docLinesCol}>
              <View style={styles.docLine} />
              <View style={styles.docLineShort} />
            </View>
          </View>
        </View>
        <Text style={styles.actionTitle} numberOfLines={1}>
          Documents
        </Text>
        <Text style={styles.actionSubtitle} numberOfLines={2}>
          View & Download
        </Text>
      </TouchableOpacity>

      {/* 4. Renew */}
      <TouchableOpacity
        style={styles.actionCard}
        activeOpacity={0.75}
        onPress={onRenewPress}
        accessibilityRole="button"
        accessibilityLabel="Renew, Manage Membership"
      >
        <View style={styles.iconCircle}>
          <View style={styles.renewMini}>
            <View style={styles.renewArcTop} />
            <View style={styles.renewArrowTop} />
            <View style={styles.renewArcBottom} />
            <View style={styles.renewArrowBottom} />
          </View>
        </View>
        <Text style={styles.actionTitle} numberOfLines={1}>
          Renew
        </Text>
        <Text style={styles.actionSubtitle} numberOfLines={2}>
          Manage Membership
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 6,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F2860',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF2DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FDE4B8',
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2860',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 8.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 11,
  },

  /* Mini Custom Vector Shapes matching Reference */
  /* 1. Member Card Mini */
  cardMini: {
    width: 20,
    height: 15,
    borderRadius: 2.5,
    borderWidth: 1.6,
    borderColor: '#0A204C',
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  cardMiniAvatarCol: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  cardMiniAvatarHead: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1.1,
    borderColor: '#0A204C',
  },
  cardMiniAvatarBody: {
    width: 6,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1.1,
    borderBottomWidth: 0,
    borderColor: '#0A204C',
    marginTop: 0.8,
  },
  cardMiniLinesCol: {
    flex: 1,
    gap: 2.5,
    alignItems: 'flex-start',
    marginLeft: 1.5,
  },
  cardMiniLineTop: {
    width: 6.5,
    height: 1.4,
    backgroundColor: '#0A204C',
    borderRadius: 0.7,
  },
  cardMiniLineBottom: {
    width: 4.5,
    height: 1.4,
    backgroundColor: '#0A204C',
    borderRadius: 0.7,
  },

  /* 2. Benefits / 3 People Mini */
  groupMini: {
    width: 22,
    height: 17,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
  },
  groupCenter: {
    alignItems: 'center',
    zIndex: 2,
  },
  groupCenterHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.3,
    borderColor: '#0A204C',
  },
  groupCenterBody: {
    width: 10,
    height: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 1.3,
    borderBottomWidth: 0,
    borderColor: '#0A204C',
    marginTop: 0.8,
    backgroundColor: '#FFF2DC',
  },
  groupSideLeft: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    bottom: 1,
    zIndex: 1,
  },
  groupSideRight: {
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 1,
    zIndex: 1,
  },
  groupSideHead: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.2,
    borderColor: '#0A204C',
  },
  groupSideBody: {
    width: 7,
    height: 4,
    borderTopLeftRadius: 3.5,
    borderTopRightRadius: 3.5,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: '#0A204C',
    marginTop: 0.8,
  },

  /* 3. Documents Mini */
  docMini: {
    width: 15,
    height: 19,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#0A204C',
    padding: 2.5,
    justifyContent: 'center',
    position: 'relative',
  },
  docFold: {
    position: 'absolute',
    top: -1.5,
    right: -1.5,
    width: 4.5,
    height: 4.5,
    borderBottomWidth: 1.3,
    borderLeftWidth: 1.3,
    borderColor: '#0A204C',
    backgroundColor: '#FFF2DC',
  },
  docLinesCol: {
    gap: 2.5,
    alignItems: 'flex-start',
    marginTop: 2,
  },
  docLine: {
    width: '100%',
    height: 1.4,
    backgroundColor: '#0A204C',
    borderRadius: 0.7,
  },
  docLineShort: {
    width: '65%',
    height: 1.4,
    backgroundColor: '#0A204C',
    borderRadius: 0.7,
  },

  /* 4. Renew Circular Arrows Mini */
  renewMini: {
    width: 18,
    height: 18,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewArcTop: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.6,
    borderColor: '#0A204C',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-20deg' }],
  },
  renewArrowTop: {
    position: 'absolute',
    top: 5,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0A204C',
  },
  renewArcBottom: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.6,
    borderColor: '#0A204C',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-20deg' }],
  },
  renewArrowBottom: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0A204C',
  },
});
