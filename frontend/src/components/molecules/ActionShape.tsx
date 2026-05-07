'use client';

import { cn } from '@/components/atoms/cn';
import { actionColors, resourceColors, featureColors } from '@/data/game-colors';

type ActionType = 'action' | 'bonusAction' | 'reaction' | 'free';

type ActionShapeProps = {
  type: ActionType;
  used?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
};

const LABELS: Record<ActionType, string> = {
  action: 'Action',
  bonusAction: 'Bonus Action',
  reaction: 'Reaction',
  free: 'Free',
};

const SIZE_MAP: Record<string, { shape: number; text: string }> = {
  sm: { shape: 10, text: 'text-[9px]' },
  md: { shape: 14, text: 'text-[10px]' },
  lg: { shape: 18, text: 'text-label-sm' },
};

/** Filled circle — Action */
function ActionCircle({ size, filled, color }: { size: number; filled: boolean; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <circle cx="8" cy="8" r="6.5" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/** Filled triangle — Bonus Action */
function BonusTriangle({ size, filled, color }: { size: number; filled: boolean; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <polygon points="8,2 14.5,13 1.5,13" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Lightning bolt — Reaction */
function ReactionBolt({ size, filled, color }: { size: number; filled: boolean; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <path d="M9.5 1.5L5 8.5H8L6.5 14.5L12 7H8.5L9.5 1.5Z" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Open circle — Free action */
function FreeCircle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  );
}

const SHAPE_MAP: Record<ActionType, (props: { size: number; filled: boolean; color: string }) => React.ReactNode> = {
  action: ({ size, filled, color }) => <ActionCircle size={size} filled={filled} color={color} />,
  bonusAction: ({ size, filled, color }) => <BonusTriangle size={size} filled={filled} color={color} />,
  reaction: ({ size, filled, color }) => <ReactionBolt size={size} filled={filled} color={color} />,
  free: ({ size, color }) => <FreeCircle size={size} color={color} />,
};

export function ActionShape({ type, used = false, size = 'md', showLabel = false, className }: ActionShapeProps) {
  const s = SIZE_MAP[size];
  const color = actionColors[type];
  const filled = !used;
  const Shape = SHAPE_MAP[type];

  return (
    <span className={cn('inline-flex items-center gap-1', used && 'opacity-40', className)}>
      {Shape({ size: s.shape, filled, color })}
      {showLabel && (
        <span className={cn(s.text, 'font-medium')} style={{ color }}>
          {LABELS[type]}
        </span>
      )}
    </span>
  );
}

/** Compact resource tracker row */
export function ResourceTracker({ actionsRemaining, actionsTotal, bonusUsed, moveUsed, spellSlotsTotal, spellSlotsUsed, className }: {
  actionsRemaining: number;
  actionsTotal: number;
  bonusUsed: boolean;
  moveUsed: boolean;
  spellSlotsTotal?: number;
  spellSlotsUsed?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span className="inline-flex items-center gap-1">
        {Array.from({ length: actionsTotal }, (_, i) => (
          <ActionShape key={i} type="action" used={i >= actionsRemaining} size="md" />
        ))}
        <span className={cn('text-[10px] font-medium ml-0.5', actionsRemaining <= 0 && 'opacity-40')} style={{ color: actionColors.action }}>
          {actionsTotal > 1 ? `Actions` : `Action`}
        </span>
      </span>
      <ActionShape type="bonusAction" used={bonusUsed} size="md" showLabel />
      <span className={cn('inline-flex items-center gap-1', moveUsed && 'opacity-40')}>
        <svg width={14} height={14} viewBox="0 0 16 16" className="shrink-0">
          <path d="M3 13L13 3M13 3H6M13 3V10" fill="none" stroke={moveUsed ? featureColors.passive : actionColors.free} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-medium" style={{ color: moveUsed ? featureColors.passive : actionColors.free }}>
          Movement
        </span>
      </span>
      {spellSlotsTotal !== undefined && spellSlotsTotal > 0 && (
        <span className="inline-flex items-center gap-1">
          {Array.from({ length: spellSlotsTotal }, (_, i) => (
            <svg key={i} width={10} height={10} viewBox="0 0 16 16" className="shrink-0">
              <rect x="3" y="3" width="10" height="10" rx="2"
                fill={i < spellSlotsTotal - (spellSlotsUsed || 0) ? resourceColors.spellSlot : 'none'}
                stroke={resourceColors.spellSlot} strokeWidth="1.5" />
            </svg>
          ))}
          <span className="text-[10px] font-medium" style={{ color: resourceColors.spellSlot }}>Slots</span>
        </span>
      )}
    </div>
  );
}
