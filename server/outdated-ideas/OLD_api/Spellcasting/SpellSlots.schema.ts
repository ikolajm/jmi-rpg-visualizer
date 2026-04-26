import { gql } from 'graphql-tag';

const SpellSlotSchema = gql`
  type SpellSlots {
    level1: SlotPool!
    level2: SlotPool
    level3: SlotPool
    level4: SlotPool
    level5: SlotPool
    level6: SlotPool
    level7: SlotPool
    level8: SlotPool
    level9: SlotPool
  }
`;

export default SpellSlotSchema;