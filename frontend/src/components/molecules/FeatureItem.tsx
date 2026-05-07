'use client';

import { CircleDot, Triangle, Zap, Clock, Eye, TrendingUp, Swords, Shield, Sparkles } from 'lucide-react';
import { featureColors, actionColors } from '@/data/game-colors';
import { DetailItem } from './DetailItem';

type FeatureType = 'attack' | 'defense' | 'resource' | 'passive' | 'stat';

type FeatureItemProps = {
  name: string;
  description?: string;
  id?: string;
  className?: string;
};

function classifyFeature(name: string, desc: string): FeatureType {
  const n = name.toLowerCase();
  const d = desc.toLowerCase();

  if (n.includes('ability score')) return 'stat';
  if (/\b(attack|damage|hit|critical|strike|smite|sneak|frenzy|slayer)\b/.test(d) && !/\b(saving|ac |armor)\b/.test(d)) return 'attack';
  if (/\b(ac |armor class|resistance|saving throw|evasion|dodge|ward|defense|shield)\b/.test(d)) return 'defense';
  if (/\b(regain|rest|uses|slots|recharge|surge|wind|rage|recovery|spell slots)\b/.test(d)) return 'resource';
  return 'passive';
}

type Tag = {
  label: string;
  icon: React.ReactNode;
  color: string;
};

function extractTags(name: string, desc: string): Tag[] {
  const tags: Tag[] = [];
  const d = desc.toLowerCase();
  const n = name.toLowerCase();

  if (d.includes('bonus action')) {
    tags.push({ label: 'Bonus Action', icon: <Triangle className="size-2.5 fill-current" />, color: actionColors.bonusAction });
  } else if (d.includes('reaction')) {
    tags.push({ label: 'Reaction', icon: <Zap className="size-2.5" />, color: actionColors.reaction });
  } else if (d.includes('action') && !n.includes('action surge')) {
    tags.push({ label: 'Action', icon: <CircleDot className="size-2.5" />, color: actionColors.action });
  }

  if (/\b(once|1 use|one use)\b/.test(d) && /\b(short|long) rest\b/.test(d)) {
    if (d.includes('short rest') || d.includes('short or long rest')) {
      tags.push({ label: '1/rest', icon: <Clock className="size-2.5" />, color: actionColors.reaction });
    } else if (d.includes('long rest')) {
      tags.push({ label: '1/day', icon: <Clock className="size-2.5" />, color: actionColors.reaction });
    }
  }

  if (tags.length === 0) {
    if (d.includes('you gain') || d.includes('you have') || d.includes('while you') || d.includes('whenever') || !d.includes('on your turn')) {
      tags.push({ label: 'Passive', icon: <Eye className="size-2.5" />, color: featureColors.passive });
    }
  }

  return tags;
}

const TYPE_ICONS: Record<FeatureType, React.ReactNode> = {
  attack: <Swords className="size-3" />,
  defense: <Shield className="size-3" />,
  resource: <Sparkles className="size-3" />,
  passive: <Eye className="size-3" />,
  stat: <TrendingUp className="size-3" />,
};

export function FeatureItem({ name, description, id, className }: FeatureItemProps) {
  const desc = description || '';
  const featureType = classifyFeature(name, desc);
  const tags = extractTags(name, desc);
  const itemId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <DetailItem
      id={itemId}
      icon={<span style={{ color: featureColors[featureType] }}>{TYPE_ICONS[featureType]}</span>}
      title={name}
      meta={
        tags.length > 0 ? (
          <>
            {tags.map((tag) => (
              <span key={tag.label} className="inline-flex items-center gap-0.5 text-label-sm font-medium" style={{ color: tag.color }}>
                {tag.icon}
                {tag.label}
              </span>
            ))}
          </>
        ) : undefined
      }
      description={desc || undefined}
      borderColor={featureColors[featureType] || featureColors.passive}
      className={className}
    />
  );
}
