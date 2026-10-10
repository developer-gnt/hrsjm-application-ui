import React from 'react';
import { G, Svg } from 'react-native-svg';
import { AdminColors } from '../../../../core/theme';
import { GLYPHS } from './glyphs';
import type { IconName } from './glyphs';

export type { IconName };

interface AppIconProps {
  name: IconName;
  /** Square size in dp (defaults to 24). */
  size?: number;
  color?: string;
  /** Stroke weight of the line-icon set (defaults to 1.8). */
  strokeWidth?: number;
  /** Filled treatment for glyphs that support it (e.g. the active Home tab). */
  filled?: boolean;
}

/**
 * Line-icon renderer for the user-facing Home reference UI. Icons are drawn
 * as vectors (no emoji, no icon font) on a 24x24 grid with round caps and
 * joins, matching the thin-line style of the reference design.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  color = AdminColors.primaryDark,
  strokeWidth = 1.8,
  filled = false,
}) => {
  const Glyph = GLYPHS[name];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Glyph color={color} strokeWidth={strokeWidth} filled={filled} />
      </G>
    </Svg>
  );
};
