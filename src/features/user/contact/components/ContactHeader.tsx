import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminColors, Spacing } from '../../../../core/theme';
import { AppIcon, HrsjmLogoMark } from '../../components';

interface ContactHeaderProps {
  onBack?: () => void;
  onPressSearch?: () => void;
}

/**
 * Contact screen header (reference-locked): circular back button, the
 * official HRSJM logo lockup and the search action on a white surface.
 * The top safe-area inset is applied here (hosting screen keeps
 * edges={['left', 'right']}).
 */
export const ContactHeader: React.FC<ContactHeaderProps> = ({
  onBack,
  onPressSearch,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.sm) }]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <AppIcon name="chevron-left" size={19} color={AdminColors.primaryDark} />
      </TouchableOpacity>

      <View style={styles.logoWrap}>
        <HrsjmLogoMark height={44} />
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPressSearch}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <AppIcon name="search" size={22} color={AdminColors.primaryDark} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.cardSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AdminColors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AdminColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  actionButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
