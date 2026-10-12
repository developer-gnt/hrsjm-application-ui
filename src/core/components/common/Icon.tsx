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
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-right'
  | 'plus'
  | 'search'
  | 'filter'
  | 'users'
  | 'clock'
  | 'check-circle'
  | 'x-circle'
  | 'check'
  | 'home'
  | 'file-text'
  | 'file-pdf'
  | 'heart'
  | 'message-circle'
  | 'grid'
  | 'person'
  | 'map-pin'
  | 'more-vertical'
  | 'logout'
  | 'settings'
  | 'calendar'
  | 'printer'
  | 'download'
  | 'share'
  | 'mail'
  | 'whatsapp'
  | 'award'
  | 'help-circle'
  | 'phone'
  | 'shield-check'
  | 'camera'
  | 'upload'
  | 'copy'
  | 'globe'
  | 'rotate-ccw'
  | 'refresh-cw'
  | 'building';

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
  'chevron-right': <Path d="m9 18 6-6-6-6" />,
  'chevron-left': <Path d="m15 18-6-6 6-6" />,
  'arrow-right': (
    <G>
      <Path d="M5 12h14" />
      <Path d="m12 5 7 7-7 7" />
    </G>
  ),
  award: (
    <G>
      <Circle cx={12} cy={8} r={6} />
      <Path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </G>
  ),
  'help-circle': (
    <G>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Path d="M12 17h.01" />
    </G>
  ),
  phone: (
    <G>
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </G>
  ),
  'shield-check': (
    <G>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <Path d="m9 12 2 2 4-4" />
    </G>
  ),
  camera: (
    <G>
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx={12} cy={13} r={4} />
    </G>
  ),
  upload: (
    <G>
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Path d="m17 8-5-5-5 5" />
      <Path d="M12 3v12" />
    </G>
  ),
  copy: (
    <G>
      <Rect x={9} y={9} width={13} height={13} rx={2} ry={2} />
      <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </G>
  ),
  globe: (
    <G>
      <Circle cx={12} cy={12} r={10} />
      <Path d="M2 12h20" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </G>
  ),
  building: (
    <G>
      <Path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
      <Path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
      <Path d="M8 7h2" />
      <Path d="M14 7h2" />
      <Path d="M8 11h2" />
      <Path d="M14 11h2" />
    </G>
  ),
  'rotate-ccw': (
    <G>
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <Path d="M3 3v5h5" />
    </G>
  ),
  'refresh-cw': (
    <G>
      <Path d="M21 2v6h-6" />
      <Path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <Path d="M3 22v-6h6" />
      <Path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </G>
  ),
  check: <Path d="m5 12 5 5L20 7" />,
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
  'file-pdf': (
    <G>
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Path d="M14 2v6h6" />
      <Path d="M9 15h2a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H9v4z" />
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
  calendar: (
    <G>
      <Rect x={3} y={4} width={18} height={17} rx={2} />
      <Path d="M16 2v4" />
      <Path d="M8 2v4" />
      <Path d="M3 10h18" />
    </G>
  ),
  printer: (
    <G>
      <Path d="M6 9V3h12v6" />
      <Path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <Rect x={6} y={14} width={12} height={8} rx={1} />
    </G>
  ),
  download: (
    <G>
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Path d="m7 10 5 5 5-5" />
      <Path d="M12 15V3" />
    </G>
  ),
  share: (
    <G>
      <Circle cx={18} cy={5} r={3} />
      <Circle cx={6} cy={12} r={3} />
      <Circle cx={18} cy={19} r={3} />
      <Path d="m8.59 13.51 6.83 3.98" />
      <Path d="m15.41 6.51-6.82 3.98" />
    </G>
  ),
  mail: (
    <G>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Path d="m3 7 9 6 9-6" />
    </G>
  ),
  whatsapp: (
    <G>
      <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
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
