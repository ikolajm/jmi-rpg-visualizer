import * as fs from 'fs';
import type { BreathWeapon, Trait, Trait2014 } from '../../databases/types/trait.types.ts';
import type { DifficultyClass } from '../../databases/types/general.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Traits.json';
const OUTPUTPATH = './data/databases/complete-data/traits.json';

function seedTraits() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Trait2014[] = JSON.parse(dataString14);
    
        let processedData: Trait[] = [];
        dataArray14.forEach(t14 => {
            const { races, desc, trait_specific, ...trimmedTrait } = t14;
            let newTrait: Trait = {
                ...trimmedTrait,
                species: races,
                description: desc,
            }
            if (trait_specific?.breath_weapon) {
                const { breath_weapon } = trait_specific;
                const { desc, dc, ...trimmedBreathWeapon } = breath_weapon;
                const newDC: DifficultyClass = {
                    dc_type: dc.dc_type,
                    dc_success: dc.success_type
                }
                const newBreathWeapon: BreathWeapon = {
                    ...trimmedBreathWeapon,
                    description: desc,
                    dc: newDC
                };
                newTrait.trait_specific = { breath_weapon: newBreathWeapon };
            } else if (trait_specific && !trait_specific.breath_weapon) {
                // @ts-ignore - breath_weapon is not a possibility here
                newTrait.trait_specific = trait_specific;
            }

            processedData.push(newTrait);
        });
    
        // Data obj back to JSON
        const outputJsonString = JSON.stringify(processedData, null, 2);
    
        // Write the new JSON to a new file
        fs.writeFileSync(OUTPUTPATH, outputJsonString, 'utf8');
    
        console.log(`Successfully processed data and wrote to ${OUTPUTPATH}`);
    } catch (err) {
      console.error('An error occurred:', err);
    }
}
seedTraits();