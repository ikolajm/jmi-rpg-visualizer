'use client';

import { Sheet, SheetContent } from '@/components/atoms/Sheet';
import { CharacterInspect } from './CharacterInspect';
import { EnemyInspect } from './EnemyInspect';
import type { Character, Enemy } from '@/data/game-types';

export function InspectSheet({ inspecting, inspectType, onClose }: {
  inspecting: Character | Enemy | null;
  inspectType: 'character' | 'enemy';
  onClose: () => void;
}) {
  return (
    <Sheet open={!!inspecting} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" size="lg" className="overflow-y-auto">
        {inspecting && inspectType === 'character' && (
          <CharacterInspect char={inspecting as Character} />
        )}
        {inspecting && inspectType === 'enemy' && (
          <EnemyInspect enemy={inspecting as Enemy} />
        )}
      </SheetContent>
    </Sheet>
  );
}
