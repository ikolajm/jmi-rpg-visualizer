/**
 * Room Generator — procedural room selection for dungeon progression.
 */

import { roomTypeWeights, BOSS_INTERVAL } from './encounter-config';
import type { Room, RoomType } from './game-types';

const flavorTexts: Record<RoomType, string[][]> = {
  combat: [
    ['Shadows shift in the torchlight. You are not alone.', 'The sound of scraping claws echoes from the darkness.', 'A foul stench fills the chamber. Something stirs.'],
    ['Bones crunch underfoot. The dead do not rest here.', 'Chains rattle from unseen alcoves.', 'A guttural war cry pierces the silence.'],
    ['The air crackles with hostility.', 'Gleaming eyes watch from the shadows.', 'The ground trembles beneath heavy footsteps.'],
  ],
  elite_combat: [
    ['Heavy footsteps approach... something powerful guards this passage.', 'The air grows thick with menace. A worthy foe awaits.'],
    ['An unnatural silence falls. Then — a roar.', 'Ancient runes flare crimson. A guardian awakens.'],
    ['The walls are scored with massive claw marks.', 'A low growl reverberates through the stone.'],
  ],
  boss: [
    ['The chamber opens into a vast hall. Something ancient waits at its heart.', 'A throne of bone dominates the room. Its occupant rises.'],
    ['The ground shakes. A creature of legend blocks your path.', 'Dark energy pulses from the far end of the hall.'],
    ['This is no ordinary foe. Steel yourselves.', 'The final guardian stands between you and the depths below.'],
  ],
  rest: [
    ['A quiet alcove, untouched by corruption. The party catches their breath.', 'A small campfire still smolders here. A moment of respite.'],
    ['Cool water trickles from the wall. A chance to recover.', 'An abandoned camp. The previous occupants left supplies behind.'],
    ['Silence — peaceful, for once. Rest while you can.', 'A hidden chamber, warm and dry. The dungeon offers brief mercy.'],
  ],
  treasure: [
    ['A glint of gold catches the torchlight.', 'An ornate chest sits in the center of the room, suspiciously untouched.'],
    ['Treasure spills from a collapsed wall.', 'A merchant\u2019s lost caravan, swallowed by the dungeon long ago.'],
    ['Gemstones are embedded in the walls. Someone left something behind.', 'A sealed vault. Whatever is inside was meant to stay hidden.'],
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollWeightedRoomType(): RoomType {
  const entries = Object.entries(roomTypeWeights) as [RoomType, number][];
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (const [type, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return 'combat';
}

export function generateRoom(floor: number, roomNumber: number): Room {
  const isBoss = roomNumber > 0 && roomNumber % BOSS_INTERVAL === 0;
  const type: RoomType = isBoss ? 'boss' : rollWeightedRoomType();

  const tierIndex = Math.min(
    floor - 1,
    flavorTexts[type].length - 1,
  );
  const flavorPool = flavorTexts[type][tierIndex] || flavorTexts[type][0];

  return {
    type,
    floor,
    roomNumber,
    flavorText: pickRandom(flavorPool),
    completed: false,
  };
}

/** Derive floor from room number. Floor increments every BOSS_INTERVAL rooms. */
export function floorFromRoom(roomNumber: number): number {
  return Math.max(1, Math.ceil(roomNumber / BOSS_INTERVAL));
}
