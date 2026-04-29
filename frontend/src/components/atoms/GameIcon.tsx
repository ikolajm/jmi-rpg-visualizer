import { forwardRef } from 'react';
import { cn } from './cn';
import { gameIcons, type IconCategory } from './game-icons';

const sizeMap: Record<string, string> = {
  xs: 'size-3',    // 12px — icon-0
  sm: 'size-4',    // 16px — icon-1
  md: 'size-5',    // 20px — icon-2
  lg: 'size-6',    // 24px — icon-3
  xl: 'size-8',    // 32px — icon-4
};

type GameIconProps = {
  category: IconCategory;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
};

function parseRect(encoded: string) {
  const parts = encoded.replace('__rect:', '').split(',');
  const [x, y, width, height, ...transformParts] = parts;
  const transform = transformParts.join(',') || undefined;
  return { x, y, width, height, transform };
}

const GameIcon = forwardRef<SVGSVGElement, GameIconProps>(
  ({ category, name, size = 'md', className, style }, ref) => {
    const key = `${category}/${name}`;
    const icon = gameIcons[key];

    if (!icon) {
      return (
        <svg
          ref={ref}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn(sizeMap[size], 'shrink-0', className)}
          style={style}
        >
          <text x="12" y="16" textAnchor="middle" fontSize="14">?</text>
        </svg>
      );
    }

    return (
      <svg
        ref={ref}
        viewBox={icon.viewBox}
        fill="currentColor"
        className={cn(sizeMap[size], 'shrink-0', className)}
        style={style}
      >
        {icon.paths.map((d, i) =>
          d.startsWith('__rect:') ? (
            <rect key={i} {...parseRect(d)} />
          ) : (
            <path key={i} d={d} />
          )
        )}
      </svg>
    );
  }
);
GameIcon.displayName = 'GameIcon';

export { GameIcon, sizeMap as gameIconSizeMap };
export type { IconCategory };
