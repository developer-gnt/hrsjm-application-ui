import React from 'react';
import { Circle, G, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { AdminColors } from '../../../../core/theme';

/**
 * Hand-crafted SVG glyph set for the user-facing Home reference UI
 * (24x24 grid, 1.8 stroke, round caps — matches the reference's thin-line
 * icon style). All glyphs are original vector paths; no emoji and no
 * third-party icon font is involved.
 *
 * Glyphs that need their own fills (play, qr, filled home) ignore the
 * inherited `fill="none"`.
 */

export interface GlyphProps {
  /** Stroke/fill color inherited from AppIcon. */
  color: string;
  strokeWidth: number;
  /** Filled treatment where a glyph supports it (home). */
  filled?: boolean;
}

const search: React.FC<GlyphProps> = () => (
  <G>
    <Circle cx={11} cy={11} r={7} />
    <Line x1={16.4} y1={16.4} x2={21} y2={21} />
  </G>
);

const eye: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M2.4 12s3.9-7.1 9.6-7.1 9.6 7.1 9.6 7.1-3.9 7.1-9.6 7.1S2.4 12 2.4 12Z" />
    <Circle cx={12} cy={12} r={2.9} />
  </G>
);

const bell: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M6.2 9.4a5.8 5.8 0 0 1 11.6 0c0 4.5 1.8 5.8 1.8 5.8H4.4s1.8-1.3 1.8-5.8Z" />
    <Path d="M10.4 18.7a1.7 1.7 0 0 0 3.2 0" />
  </G>
);

const arrowRight: React.FC<GlyphProps> = () => (
  <G>
    <Line x1={4} y1={12} x2={19.4} y2={12} />
    <Polyline points="13.5,5.6 19.9,12 13.5,18.4" />
  </G>
);

const home: React.FC<GlyphProps> = ({ color, filled }) =>
  filled ? (
    <G>
      <Path
        d="M4 10.1 12 3.5l8 6.6v9.7a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19.8Z"
        fill={color}
      />
      <Path
        d="M9.7 21v-5.9h4.6V21"
        stroke={AdminColors.textOnDark}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  ) : (
    <G>
      <Path d="M4 10.1 12 3.5l8 6.6v9.7a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19.8Z" />
      <Path d="M9.7 21v-5.5h4.6V21" />
    </G>
  );

const fileText: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M13.6 2.8H6.4a1.6 1.6 0 0 0-1.6 1.6v15.2a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6-1.6V8.4Z" />
    <Polyline points="13.6,2.8 13.6,8.4 19.2,8.4" />
    <Line x1={8.4} y1={13} x2={15.6} y2={13} />
    <Line x1={8.4} y1={16.6} x2={13.6} y2={16.6} />
  </G>
);

const scale: React.FC<GlyphProps> = () => (
  <G>
    <Line x1={12} y1={3.6} x2={12} y2={20.4} />
    <Line x1={8.4} y1={20.4} x2={15.6} y2={20.4} />
    <Line x1={4.2} y1={6.4} x2={19.8} y2={6.4} />
    <Path d="M4.2 6.4 2.1 11.3a2.7 2.7 0 0 0 5.4 0Z" />
    <Path d="M19.8 6.4l2.1 4.9a2.7 2.7 0 0 1-5.4 0Z" />
  </G>
);

const calendar: React.FC<GlyphProps> = ({ color }) => (
  <G>
    <Rect x={4} y={5.2} width={16} height={15.2} rx={1.8} />
    <Line x1={4} y1={10} x2={20} y2={10} />
    <Line x1={8.4} y1={2.8} x2={8.4} y2={6.8} />
    <Line x1={15.6} y1={2.8} x2={15.6} y2={6.8} />
    <Circle cx={8} cy={13.2} r={0.9} fill={color} stroke="none" />
    <Circle cx={12} cy={13.2} r={0.9} fill={color} stroke="none" />
    <Circle cx={16} cy={13.2} r={0.9} fill={color} stroke="none" />
    <Circle cx={8} cy={16.7} r={0.9} fill={color} stroke="none" />
    <Circle cx={12} cy={16.7} r={0.9} fill={color} stroke="none" />
    <Circle cx={16} cy={16.7} r={0.9} fill={color} stroke="none" />
  </G>
);

const star: React.FC<GlyphProps> = ({ color, filled }) => (
  <Polygon
    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
    fill={filled ? color : color}
    stroke={color}
  />
);

const clock: React.FC<GlyphProps> = () => (
  <G>
    <Circle cx={12} cy={12} r={9} />
    <Polyline points="12,7 12,12 15.5,14" />
  </G>
);

const globe: React.FC<GlyphProps> = () => (
  <G>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M3.5 9h17M3.5 15h17" />
    <Path d="M12 3c2.1 2.4 3.2 5.4 3.2 9s-1.1 6.6-3.2 9c-2.1-2.4-3.2-5.4-3.2-9S9.9 5.4 12 3Z" />
  </G>
);

const lock: React.FC<GlyphProps> = () => (
  <G>
    <Rect x={4.5} y={10} width={15} height={11} rx={2} />
    <Path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <Circle cx={12} cy={15} r={1} />
    <Line x1={12} y1={16} x2={12} y2={18} />
  </G>
);

const users: React.FC<GlyphProps> = () => (
  <G>
    <Circle cx={9.2} cy={7.8} r={3.4} />
    <Path d="M3.4 20.2c.5-3.4 2.9-5.3 5.8-5.3s5.3 1.9 5.8 5.3" />
    <Circle cx={16.9} cy={8.7} r={2.6} />
    <Path d="M16.6 14.9c2.5.3 4 2 4.4 4.6" />
  </G>
);

const graduationCap: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M2.4 9.4 12 4.6l9.6 4.8L12 14.2Z" />
    <Path d="M6.4 11.6v4.5c0 1.4 2.5 2.7 5.6 2.7s5.6-1.3 5.6-2.7v-4.5" />
    <Line x1={21.6} y1={9.7} x2={21.6} y2={14.7} />
  </G>
);

const bulb: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M9 18h6M10 21h4M8.4 14.8a6.4 6.4 0 1 1 7.2 0c-.8.6-1.2 1.3-1.3 2.2h-4.6c-.1-.9-.5-1.6-1.3-2.2Z" />
  </G>
);

const megaphone: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M4.6 10.7 15 5.4v13.2L4.6 13.3a1.4 1.4 0 0 1-.8-1.3 1.4 1.4 0 0 1 .8-1.3Z" />
    <Path d="M7.2 14.5v3.2a1.2 1.2 0 0 0 2.4 0v-2.1" />
    <Path d="M18.4 9a4.4 4.4 0 0 1 0 6" />
  </G>
);

const docSearch: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M13.4 2.8H6.4a1.6 1.6 0 0 0-1.6 1.6v15.2a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6-1.6V8.6Z" />
    <Polyline points="13.4,2.8 13.4,8.6 19.2,8.6" />
    <Circle cx={10.4} cy={13.4} r={2.3} />
    <Line x1={12.2} y1={15.2} x2={14.4} y2={17.4} />
  </G>
);

const heartHands: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M12 12.6c-2.4-1.6-4.4-3-4.4-5.2A2.8 2.8 0 0 1 12 5.8a2.8 2.8 0 0 1 4.4 1.6c0 2.2-2 3.6-4.4 5.2Z" />
    <Path d="M3.8 14.2c.3 3.4 3.8 5.6 8.2 5.6s7.9-2.2 8.2-5.6" />
    <Path d="M3.8 14.2V11M20.2 14.2V11" />
  </G>
);

const ear: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M19 9a7 7 0 0 0-14 0c0 2.6 1.2 4 2.5 5.5 1.2 1.4 2.3 2.7 2.3 4.5a2.2 2.2 0 0 0 4.4 0v-.5" />
    <Path d="M10 9a2 2 0 0 1 4 0c0 1.3-.7 1.8-1.5 2.6-.8.7-1.5 1.4-1.5 2.7" />
  </G>
);

const heart: React.FC<GlyphProps> = () => (
  <Path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
);

const refresh: React.FC<GlyphProps> = () => (
  <G>
    <Polyline points="21.5,4.5 21.5,10 16,10" />
    <Polyline points="2.5,19.5 2.5,14 8,14" />
    <Path d="M4.2 9a8.6 8.6 0 0 1 14.2-3.2l3.1 3M2.5 14.7l3.1 3A8.6 8.6 0 0 0 19.8 14.4" />
  </G>
);

const mapPin: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M20 10.2c0 6.2-8 12-8 12s-8-5.8-8-12a8 8 0 0 1 16 0Z" />
    <Circle cx={12} cy={10.2} r={2.8} />
  </G>
);

const shieldCheck: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M12 3.2 20 6v5.1c0 5.1-3.3 8.4-8 10-4.7-1.6-8-4.9-8-10V6Z" />
    <Polyline points="8.2,12.1 10.7,14.6 15.9,9.4" />
  </G>
);

const bookOpen: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M12 7.1c-1.5-1.4-3.3-2-5.4-2-1.3 0-2.5.2-3.6.7v13.1c1.1-.5 2.3-.7 3.6-.7 2.1 0 3.9.6 5.4 2Z" />
    <Path d="M12 7.1c1.5-1.4 3.3-2 5.4-2 1.3 0 2.5.2 3.6.7v13.1c-1.1-.5-2.3-.7-3.6-.7-2.1 0-3.9.6-5.4 2Z" />
    <Line x1={6.2} y1={9} x2={9.1} y2={9} />
    <Line x1={14.9} y1={9} x2={17.8} y2={9} />
    <Line x1={6.2} y1={12} x2={9.1} y2={12} />
    <Line x1={14.9} y1={12} x2={17.8} y2={12} />
  </G>
);

const briefcase: React.FC<GlyphProps> = () => (
  <G>
    <Rect x={3.2} y={7.6} width={17.6} height={12.8} rx={1.8} />
    <Path d="M8.3 7.6V5.8a1.6 1.6 0 0 1 1.6-1.6h4.2a1.6 1.6 0 0 1 1.6 1.6v1.8M3.2 12h17.6" />
    <Path d="M10 12v2h4v-2" />
  </G>
);

const heartPulse: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M20.6 5.2a5.1 5.1 0 0 0-7.2 0L12 6.6l-1.4-1.4a5.1 5.1 0 0 0-7.2 7.2l1.2 1.2L12 21l7.4-7.4 1.2-1.2a5.1 5.1 0 0 0 0-7.2Z" />
    <Path d="M5.8 12h3l1.4-2.3 2.1 4.6 1.6-2.3h4.3" />
  </G>
);

const openHand: React.FC<GlyphProps> = () => (
  <Path d="M8 11V5.6a1.4 1.4 0 0 1 2.8 0v4.1V4.4a1.4 1.4 0 0 1 2.8 0v5.3V5.6a1.4 1.4 0 0 1 2.8 0v5.6V7.8a1.4 1.4 0 0 1 2.8 0v6.5c0 4.1-2.6 6.8-6.5 6.8h-.8c-2.7 0-4.7-1.3-5.9-3.3l-2-3.2a1.4 1.4 0 0 1 2.2-1.7L8 15Z" />
);

const play: React.FC<GlyphProps> = ({ color }) => (
  <Polygon points="9,6.6 18.4,12 9,17.4" fill={color} stroke={color} />
);

const user: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M19.6 20.6v-1.8a4 4 0 0 0-4-4H8.4a4 4 0 0 0-4 4v1.8" />
    <Circle cx={12} cy={7.4} r={3.9} />
  </G>
);

const medal: React.FC<GlyphProps> = () => (
  <G>
    <Circle cx={12} cy={8.2} r={5.9} />
    <Polyline points="8.7,13.3 6.9,21.2 12,18.2 17.1,21.2 15.3,13.3" />
  </G>
);

const handshake: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M2.8 11.6 6.8 7.6l3.5 2.9a2 2 0 0 0 2.7 0l3.4-2.9 4 4" />
    <Path d="M5.2 13.9l2.8 2.4a2.3 2.3 0 0 0 3 0l1-.8 1 .8a2.3 2.3 0 0 0 3 0l2.8-2.4" />
  </G>
);

const qrCode: React.FC<GlyphProps> = ({ color }) => (
  <G fill={color} stroke="none">
    <Path d="M3 3h7.2v7.2H3Zm2.2 2.2v2.8h2.8V5.2Z" fillRule="evenodd" />
    <Path d="M13.8 3H21v7.2h-7.2Zm2.2 2.2v2.8h2.8V5.2Z" fillRule="evenodd" />
    <Path d="M3 13.8h7.2V21H3Zm2.2 2.2v2.8h2.8V16Z" fillRule="evenodd" />
    <Rect x={13.8} y={13.8} width={2.4} height={2.4} />
    <Rect x={18.6} y={13.8} width={2.4} height={2.4} />
    <Rect x={13.8} y={18.6} width={2.4} height={2.4} />
    <Rect x={16.4} y={16.4} width={1.8} height={1.8} />
    <Rect x={18.8} y={18.8} width={2.2} height={2.2} />
  </G>
);

const check: React.FC<GlyphProps> = () => (
  <Polyline points="4.5,12.6 9.5,17.6 19.5,6.6" />
);

const image: React.FC<GlyphProps> = () => (
  <G>
    <Rect x={3} y={4.4} width={18} height={15.2} rx={2} />
    <Circle cx={8.6} cy={9.6} r={1.7} />
    <Polyline points="21,15.6 15.2,9.8 5.4,19.6" />
  </G>
);

const news: React.FC<GlyphProps> = () => (
  <G>
    <Rect x={3.4} y={4.6} width={17.2} height={14.8} rx={1.6} />
    <Line x1={7} y1={9} x2={17} y2={9} />
    <Line x1={7} y1={12.4} x2={17} y2={12.4} />
    <Line x1={7} y1={15.8} x2={12.8} y2={15.8} />
  </G>
);

const childCare: React.FC<GlyphProps> = () => (
  <G>
    <Circle cx={9} cy={7.2} r={3.2} />
    <Path d="M3.2 20.4c.4-3.2 2.7-5.1 5.8-5.1 1.6 0 3 .5 4 1.4" />
    <Circle cx={17.2} cy={12.6} r={2.2} />
    <Path d="M13.4 20.4c.3-2.2 1.8-3.5 3.8-3.5s3.5 1.3 3.8 3.5" />
  </G>
);

const phone: React.FC<GlyphProps> = () => (
  <Path d="M21 16.6v2.6a1.8 1.8 0 0 1-2 1.8 18 18 0 0 1-7.8-2.8 17.6 17.6 0 0 1-5.4-5.4A18 18 0 0 1 3 4.9 1.8 1.8 0 0 1 4.8 3h2.6a1.8 1.8 0 0 1 1.8 1.5c.11.85.32 1.68.62 2.48a1.8 1.8 0 0 1-.4 1.9L8.3 10a14.4 14.4 0 0 0 5.4 5.4l1.12-1.12a1.8 1.8 0 0 1 1.9-.4c.8.3 1.63.51 2.48.62A1.8 1.8 0 0 1 21 16.6Z" />
);

const email: React.FC<GlyphProps> = () => (
  <G>
    <Rect x={2.8} y={4.8} width={18.4} height={14.4} rx={2} />
    <Polyline points="4.5,7 12,13 19.5,7" />
  </G>
);

const message: React.FC<GlyphProps> = () => (
  <Path d="M21 14.6a2 2 0 0 1-2 2H7.4L3 20.6V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
);

const chevronDown: React.FC<GlyphProps> = () => (
  <Polyline points="6.5,9.5 12,15 17.5,9.5" />
);

const chevronLeft: React.FC<GlyphProps> = () => (
  <Polyline points="14.5,5.5 8,12 14.5,18.5" />
);

const chevronRight: React.FC<GlyphProps> = () => (
  <Polyline points="9.5,5.5 16,12 9.5,18.5" />
);

const close: React.FC<GlyphProps> = () => (
  <G>
    <Line x1={5.5} y1={5.5} x2={18.5} y2={18.5} />
    <Line x1={18.5} y1={5.5} x2={5.5} y2={18.5} />
  </G>
);

const send: React.FC<GlyphProps> = () => (
  <G>
    <Line x1={21} y1={3} x2={11.5} y2={12.5} />
    <Path d="M21 3 14.4 21l-2.9-8.5L3 9.6Z" />
  </G>
);

const filter: React.FC<GlyphProps> = () => (
  <Path d="M4 5h16l-6.4 7.2v5.1L10.4 19v-6.8Z" />
);

const share: React.FC<GlyphProps> = () => (
  <G>
    <Circle cx={18} cy={5} r={2.5} />
    <Circle cx={6} cy={12} r={2.5} />
    <Circle cx={18} cy={19} r={2.5} />
    <Line x1={8.2} y1={10.8} x2={15.8} y2={6.3} />
    <Line x1={8.2} y1={13.2} x2={15.8} y2={17.7} />
  </G>
);

const link: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M10 13.8a4.2 4.2 0 0 0 6.1.3l3-3a4.3 4.3 0 0 0-6.1-6.1l-1.7 1.7" />
    <Path d="M14 10.2a4.2 4.2 0 0 0-6.1-.3l-3 3A4.3 4.3 0 0 0 11 19l1.7-1.7" />
  </G>
);

const download: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M12 3.5v11" />
    <Polyline points="7.5,10.5 12,15 16.5,10.5" />
    <Path d="M4.5 17.5v2a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
  </G>
);

const bookmark: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M6 3.5h12a1 1 0 0 1 1 1v16.5l-7-3.8-7 3.8V4.5a1 1 0 0 1 1-1Z" />
  </G>
);

const idCard: React.FC<GlyphProps> = () => (
  <G>
    <Rect x={3} y={4.5} width={18} height={15} rx={2} />
    <Circle cx={8} cy={10} r={1.8} />
    <Path d="M5.5 15.5a2.5 2.5 0 0 1 5 0" />
    <Line x1={13} y1={9.5} x2={18} y2={9.5} />
    <Line x1={13} y1={13.5} x2={16.5} y2={13.5} />
  </G>
);

const quote: React.FC<GlyphProps> = () => (
  <G>
    <Path d="M4.5 11.5h5.2v7H3.4v-5.1c0-4.4 1.7-7.1 5.2-8.4v3c-2.2 1.1-3.5 2.2-4.1 3.5Z" />
    <Path d="M14.3 11.5h5.2v7h-6.3v-5.1c0-4.4 1.7-7.1 5.2-8.4v3c-2.2 1.1-3.5 2.2-4.1 3.5Z" />
  </G>
);

export const GLYPHS = {
  'arrow-right': arrowRight,
  bell,
  bookmark,
  'book-open': bookOpen,
  bulb,
  briefcase,
  check,
  calendar,
  'chevron-down': chevronDown,
  'chevron-left': chevronLeft,
  'child-care': childCare,
  'chevron-right': chevronRight,
  clock,
  close,
  download,
  'doc-search': docSearch,
  ear,
  email,
  eye,
  'file-text': fileText,
  filter,
  'graduation-cap': graduationCap,
  handshake,
  heart,
  globe,
  'heart-hands': heartHands,
  home,
  'heart-pulse': heartPulse,
  'id-card': idCard,
  image,
  lock,
  link,
  'map-pin': mapPin,
  medal,
  megaphone,
  message,
  news,
  'open-hand': openHand,
  phone,
  play,
  qr: qrCode,
  quote,
  refresh,
  scale,
  search,
  send,
  share,
  'shield-check': shieldCheck,
  star,
  user,
  users,
} as const;

export type IconName = keyof typeof GLYPHS;
