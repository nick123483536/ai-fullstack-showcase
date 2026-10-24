import type { CSSProperties, ReactNode } from 'react';

/**
 * Lucide icons (lucide.dev, ISC licence), the set shadcn/ui uses.
 * Each entry is a list of shapes: a path `d`, `c:cx,cy,r` for a circle or `r:x,y,w,h,rx` for a rect.
 * A leading `*` marks the shape that takes a soft fill when the icon is shown as active.
 */
const ICONS = {
  logo: ['M19.07 4.93A10 10 0 0 0 6.99 3.34', 'M4 6h.01', 'M2.29 9.62A10 10 0 1 0 21.31 8.35', 'M16.24 7.76A6 6 0 1 0 8.23 16.67', 'M12 18h.01', 'M17.99 11.66A6 6 0 0 1 15.77 16.67', 'c:12,12,2', 'm13.41 10.59 5.66-5.66'],
  inbox: ['*M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z', 'M22 12h-6l-2 3h-4l-2-3H2'],
  briefcase: ['*r:2,6,20,14,2', 'M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2', 'M22 13a18.15 18.15 0 0 1-20 0', 'M12 12h.01'],
  bookmark: ['*m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'],
  db: ['*M3 5a9 3 0 1 0 18 0a9 3 0 1 0 -18 0', 'M3 5V19A9 3 0 0 0 21 19V5', 'M3 12A9 3 0 0 0 21 12'],
  chart: ['M3 3v16a2 2 0 0 0 2 2h16', '*m19 9-5 5-4-4-3 3'],
  settings: ['*M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'c:12,12,3'],
  search: ['c:11,11,8', 'm21 21-4.3-4.3'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  panel: ['r:3,3,18,18,2', 'M9 3v18'],
  chevLeft: ['m15 18-6-6 6-6'],
  chevRight: ['m9 18 6-6-6-6'],
  chevDown: ['m6 9 6 6 6-6'],
  chevsUpDown: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
  plus: ['M5 12h14', 'M12 5v14'],
  external: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
  check: ['M20 6 9 17l-5-5'],
  checkCircle: ['c:12,12,10', 'm9 12 2 2 4-4'],
  alert: ['c:12,12,10', 'M12 8v4', 'M12 16h.01'],
  sun: ['c:12,12,4', 'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  logout: ['m16 17 5-5-5-5', 'M21 12H9', 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'],
  filter: ['M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z'],
  sparkles: ['M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z', 'M20 3v4', 'M22 5h-4'],
  target: ['c:12,12,10', 'c:12,12,6', 'c:12,12,2'],
  trendUp: ['M16 7h6v6', 'm22 7-8.5 8.5-5-5L2 17'],
  trendDown: ['M16 17h6v-6', 'm22 17-8.5-8.5-5 5L2 7'],
  building: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4'],
  pin: ['M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0', 'c:12,10,3'],
  clock: ['c:12,12,10', 'M12 6v6l4 2'],
  more: ['c:12,12,1', 'c:12,5,1', 'c:12,19,1'],
  copy: ['r:8,8,14,14,2', 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'],
  eye: ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', 'c:12,12,3'],
  eyeOff: ['M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49', 'M14.084 14.158a3 3 0 0 1-4.242-4.242', 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143', 'm2 2 20 20'],
  help: ['c:12,12,10', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'c:12,7,4'],
  lock: ['r:3,11,18,11,2', 'M7 11V7a5 5 0 0 1 10 0v4'],
  bell: ['M10.268 21a2 2 0 0 0 3.464 0', 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'],
  monitor: ['r:2,3,20,14,2', 'M8 21h8', 'M12 17v4'],
  sliders: ['M21 4h-7', 'M10 4H3', 'M21 12h-9', 'M8 12H3', 'M21 20h-5', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4'],
  arrowRight: ['M5 12h14', 'm12 5 7 7-7 7'],
  arrowLeft: ['m12 19-7-7 7-7', 'M19 12H5'],
  zap: ['M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'],
  globe: ['c:12,12,10', 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', 'M2 12h20'],
  keyboard: ['r:2,4,20,16,2', 'M6 8h.01', 'M10 8h.01', 'M14 8h.01', 'M18 8h.01', 'M8 12h.01', 'M12 12h.01', 'M16 12h.01', 'M7 16h10'],
  history: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5', 'M12 7v5l4 2'],
  layers: ['M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z', 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12', 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17'],
  message: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Fill the icon's main shape solid (a saved bookmark). */
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}

function shape(spec: string, key: number, filled: boolean): ReactNode {
  const duo = spec.startsWith('*');
  const s = duo ? spec.slice(1) : spec;
  const cls = duo ? 'duo' : undefined;
  const fill = duo && filled ? 'currentColor' : undefined;
  if (s.startsWith('c:')) {
    const [cx, cy, r] = s.slice(2).split(',').map(Number);
    return <circle key={key} className={cls} fill={fill} cx={cx} cy={cy} r={r} />;
  }
  if (s.startsWith('r:')) {
    const [x, y, width, height, rx] = s.slice(2).split(',').map(Number);
    return <rect key={key} className={cls} fill={fill} x={x} y={y} width={width} height={height} rx={rx} />;
  }
  return <path key={key} className={cls} fill={fill} d={s} />;
}

export function Icon({ name, size = 16, strokeWidth = 1.75, filled = false, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flex: 'none', ...style }}
    >
      {ICONS[name].map((spec, i) => shape(spec, i, filled))}
    </svg>
  );
}
