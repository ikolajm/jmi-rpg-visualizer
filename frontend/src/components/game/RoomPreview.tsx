'use client';

import { motion } from 'motion/react';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import type { Room, FloorModifier } from '@/data/game-types';

const ROOM_CONFIG: Record<string, { icon: string; label: string; color: string; glowColor: string }> = {
  combat:       { icon: 'combat',   label: 'Encounter',            color: 'text-on-surface',  glowColor: 'var(--on-surface-variant)' },
  elite_combat: { icon: 'combat',   label: 'Dangerous Encounter',  color: 'text-warning',     glowColor: 'var(--warning)' },
  boss:         { icon: 'boss',     label: "Guardian's Chamber",   color: 'text-error',       glowColor: 'var(--error)' },
  rest:         { icon: 'rest',     label: 'Sanctuary',            color: 'text-primary',     glowColor: 'var(--primary)' },
  treasure:     { icon: 'treasure', label: 'Hidden Cache',         color: 'text-primary',     glowColor: 'var(--primary)' },
  trap:         { icon: 'trap',     label: 'Trap',                 color: 'text-warning',     glowColor: 'var(--warning)' },
};

// ─── Variants ────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeDown = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const letterVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const bgIcon = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 0.06, scale: 1, transition: { duration: 1.2, ease: 'easeOut' as const } },
};

// ─── Component ───────────────────────────────────────────────

type RoomPreviewProps = {
  room: Room;
  floorModifier: FloorModifier | null;
  onEnter: () => void;
};

export function RoomPreview({ room, floorModifier, onEnter }: RoomPreviewProps) {
  const rc = ROOM_CONFIG[room.type] || ROOM_CONFIG.combat;
  const isBoss = room.type === 'boss';
  const isElite = room.type === 'elite_combat';
  const isThreat = room.type === 'combat' || room.type === 'elite_combat' || room.type === 'boss';
  const letters = rc.label.split('');

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background icon — fills the space, very low opacity */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        variants={bgIcon}
        initial="hidden"
        animate="show"
        style={{ color: rc.glowColor }}
      >
        <GameIcon category="room" name={rc.icon} size="xl" className="w-[60%] h-[60%] max-w-[400px] max-h-[400px]" />
      </motion.div>

      {/* Boss/elite glow overlay */}
      {(isBoss || isElite) && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: isBoss ? 2 : 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(circle at center, ${rc.glowColor} 0%, transparent 70%)` }}
        />
      )}

      {/* Content — layered on top */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full gap-5 px-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Floor / Room */}
        <motion.span
          className="text-label-md uppercase tracking-widest text-on-surface-variant"
          variants={fadeDown}
        >
          Floor {room.floor} · Room {room.roomNumber}
        </motion.span>

        {/* Room name — letter tick */}
        <motion.h2
          className={`font-heading text-[clamp(1.5rem,5vw,2.5rem)] tracking-widest uppercase flex ${rc.color}`}
          variants={fadeIn}
        >
          {letters.map((char, i) => (
            <motion.span
              key={i}
              variants={letterVariant}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h2>

        {/* Flavor text */}
        <motion.p
          className="text-body-md text-on-surface-variant text-center max-w-md italic"
          variants={fadeUp}
        >
          {room.flavorText}
        </motion.p>

        {/* Floor modifier — tactical info */}
        {floorModifier && isThreat && (
          <motion.div
            className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-card bg-surface-1/80 backdrop-blur-sm border border-primary/30 max-w-sm"
            variants={fadeUp}
          >
            <span className="text-label-sm font-semibold uppercase tracking-widest text-primary">{floorModifier.name}</span>
            <span className="text-label-sm text-on-surface-variant text-center">{floorModifier.description}</span>
          </motion.div>
        )}

        {/* Enter button */}
        <motion.div variants={fadeIn}>
          <Button size="lg" onClick={onEnter}>Enter Room</Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
