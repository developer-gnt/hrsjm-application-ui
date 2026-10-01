import React from 'react';
import Svg, {
  Circle,
  G,
  Path,
  Rect,
  type SvgProps,
} from 'react-native-svg';

export type IconName =
  | 'menu'
  | 'bell'
  | 'chevron-down'
  | 'plus'
  | 'search'
  | 'filter'
  | 'users'
  | 'clock'
  | 'check-circle'
  | 'x-circle'
  | 'home'
  | 'file-text'
  | 'heart'
  | 'message-circle'
  | 'grid'
  | 'person'
  | 'map-pin'
  | 'more-vertical'
  | 'logout'
  | 'settings';

interface IconProps extends Omit<SvgProps, 'viewBox'> {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Outline icon set (24x24 grid, round caps) matching the approved design.
const paths: Record<IconName, React.ReactNode> = {
  menu: (
    <G>
      <Path d="M4 7h16" />
      <Path d="M4 12h16" />
      <Path d="M4 17h16" />
    </G>
  ),
  bell: (
    <G>
      <Path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <Path d="M10.3 19a2 2 0 0 0 3.4 0" />
    </G>
  ),
  'chevron-down': <Path d="m6 9 6 6 6-6" />,
  plus: (
    <G>
      <Path d="M12 5v14" />
      <Path d="M5 12h14" />
    </G>
  ),
  search: (
    <G>
      <Circle cx={11} cy={11} r={7} />
      <Path d="m20 20-3.5-3.5" />
    </G>
  ),
  filter: (
    <G>
      <Path d="M4 6h16" />
      <Path d="M7 12h10" />
      <Path d="M10 18h4" />
    </G>
  ),
  users: (
    <G>
      <Circle cx={9} cy={8} r={3.2} />
      <Path d="M3.5 19c.6-3 2.9-4.6 5.5-4.6S13.9 16 14.5 19" />
      <Path d="M15.5 5.4a3.2 3.2 0 0 1 0 5.2" />
      <Path d="M17.5 14.6c1.7.7 2.7 2.1 3 4.4" />
    </G>
  ),
  clock: (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 7.5V12l3 2" />
    </G>
  ),
  'check-circle': (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="m8.2 12.3 2.6 2.6 5-5.4" />
    </G>
  ),
  'x-circle': (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="m9.2 9.2 5.6 5.6" />
      <Path d="m14.8 9.2-5.6 5.6" />
    </G>
  ),
  home: (
    <G>
      <Path d="m4 10.5 8-6.5 8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1Z" />
    </G>
  ),
  'file-text': (
    <G>
      <Path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7Z" />
      <Path d="M14 3v4h4" />
      <Path d="M9.5 12h5" />
      <Path d="M9.5 15.5h5" />
    </G>
  ),
  heart: (
    <Path d="M12 20.2 4.9 13a4.6 4.6 0 0 1 0-6.4 4.3 4.3 0 0 1 6.2 0l.9 1 .9-1a4.3 4.3 0 0 1 6.2 0 4.6 4.6 0 0 1 0 6.4Z" />
  ),
  'message-circle': (
    <G>
      <Path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.4-4.1-1L3 21l1.5-5.4A8.5 8.5 0 1 1 21 12Z" />
      <Path d="M8.5 10.5h7" />
      <Path d="M8.5 13.5h4.5" />
    </G>
  ),
  grid: (
    <G>
      <Rect x={4} y={4} width={6.5} height={6.5} rx={1.5} />
      <Rect x={13.5} y={4} width={6.5} height={6.5} rx={1.5} />
      <Rect x={4} y={13.5} width={6.5} height={6.5} rx={1.5} />
      <Rect x={13.5} y={13.5} width={6.5} height={6.5} rx={1.5} />
    </G>
  ),
  person: (
    <G>
      <Circle cx={12} cy={8} r={3.4} />
      <Path d="M5.5 20c.7-3.4 3.3-5.2 6.5-5.2s5.8 1.8 6.5 5.2" />
    </G>
  ),
  'map-pin': (
    <G>
      <Path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <Circle cx={12} cy={10} r={2.6} />
    </G>
  ),
  'more-vertical': (
    <G>
      <Circle cx={12} cy={5.5} r={1.4} />
      <Circle cx={12} cy={12} r={1.4} />
      <Circle cx={12} cy={18.5} r={1.4} />
    </G>
  ),
  logout: (
    <G>
      <Path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <Path d="m16 17 5-5-5-5" />
      <Path d="M21 12H9" />
    </G>
  ),
  settings: (
    <G>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08A1.7 1.7 0 0 0 10.09 3V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.08a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
    </G>
  ),
};

export function Icon({ name, size = 22, color = '#16274B', strokeWidth = 1.9, ...rest }: IconProps) {
  // Filled glyphs (active tab heart in the design) still render well with a
  // heavier stroke; solid fills are handled at call sites via fill + fillOpacity.
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}>
      <G stroke={color} strokeWidth={strokeWidth} fill="none">
        {paths[name]}
      </G>
    </Svg>
  );
}

export default Icon;
