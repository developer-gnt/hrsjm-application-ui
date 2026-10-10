import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AboutColors, AboutTypography } from '../theme';

export interface AboutHeaderProps {
  onBack?: () => void;
}

/**
 * ============================================================================
 * ABOUT PAGE HEADER (page-specific variation — spec correction §4)
 * ============================================================================
 *
 * The approved reference shows a minimal header for this page: a back chevron
 * in a light circle and the serif page title centered. It deliberately has no
 * notification bell / profile avatar (those belong to the app-wide
 * AdminHeader, which stays untouched for all other screens).
 *
 * The header renders IN FLOW above the page ScrollView (flex sibling, never
 * position:fixed), so page content can never pass underneath it; the status
 * bar height comes from useSafeAreaInsets.
 */
export const AboutHeader: React.FC<AboutHeaderProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.band,
        {
          paddingTop:
            Platform.OS === 'ios'
              ? Math.max(insets.top, 12)
              : StatusBar.currentHeight
                ? StatusBar.currentHeight + 8
                : 14,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={!onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke={AboutColors.primaryNavy}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Inset by the button width on both sides so the centered serif
            title can never overlap the chevron. */}
        <View style={styles.titleWrap} pointerEvents="none">
          <Text
            accessibilityRole="header"
            style={styles.title}
            numberOfLines={1}
          >
            About HRSJM
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  band: {
    backgroundColor: AboutColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AboutColors.border,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AboutColors.softChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    position: 'absolute',
    left: 48,
    right: 48,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...AboutTypography.pageTitle,
    fontSize: 19,
    lineHeight: 24,
    color: AboutColors.primaryNavy,
  },
});
