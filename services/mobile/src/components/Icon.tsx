/**
 * Feather-style line icons, ported from the SVG paths used on the design board.
 * Stroke-based, 24x24 viewBox. Add new glyphs to GLYPHS as needed.
 */

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type IconName =
  | 'camera'
  | 'aperture'
  | 'chevron-left'
  | 'chevron-right'
  | 'lock'
  | 'home'
  | 'bar-chart'
  | 'check'
  | 'check-circle'
  | 'book'
  | 'user'
  | 'capsule'
  | 'search'
  | 'globe'
  | 'file-text'
  | 'clock'
  | 'log-out';

const GLYPHS: Record<IconName, React.ReactNode> = {
  camera: (
    <>
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx={12} cy={13} r={4} />
    </>
  ),
  aperture: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Circle cx={12} cy={12} r={3} />
    </>
  ),
  'chevron-left': <Path d="m15 18-6-6 6-6" />,
  'chevron-right': <Path d="m9 18 6-6-6-6" />,
  check: <Path d="M20 6 9 17l-5-5" />,
  lock: (
    <>
      <Rect x={4} y={10} width={16} height={11} rx={2} />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  home: (
    <>
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9.5V21h14V9.5" />
    </>
  ),
  'bar-chart': (
    <>
      <Path d="M4 20V10" />
      <Path d="M10 20V4" />
      <Path d="M16 20v-7" />
      <Path d="M20 20h-18" />
    </>
  ),
  'check-circle': (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  book: (
    <>
      <Path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" />
      <Path d="M19 3v18" />
    </>
  ),
  user: (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  capsule: (
    <>
      <Path d="M10.5 20.5 3.5 13.5a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7Z" />
      <Path d="m8.5 8.5 7 7" />
    </>
  ),
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="m21 21-4.3-4.3" />
    </>
  ),
  globe: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M3 12h18" />
      <Path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </>
  ),
  'file-text': (
    <>
      <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <Path d="M14 3v5h5" />
      <Path d="M9 13h6" />
      <Path d="M9 17h6" />
    </>
  ),
  clock: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  'log-out': (
    <>
      <Path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <Path d="M10 17l5-5-5-5" />
      <Path d="M15 12H3" />
    </>
  ),
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color = colors.ink, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS[name]}
    </Svg>
  );
}
