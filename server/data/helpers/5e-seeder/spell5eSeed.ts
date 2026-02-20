import * as fs from 'fs';
import type { Spell, Spell2014 } from '../../databases/types/spell.types.ts';
import { DifficultyClass } from '../../databases/types/general.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Spells.json';
const OUTPUTPATH = './data/databases/complete-data/spells.json';

function seedSpells() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Spell2014[] = JSON.parse(dataString14);
    
        let processedData: Spell[] = [];
        dataArray14.forEach((s14: Spell2014) => {
            let temp: any;
            const { dc, desc, ...trimmedSpell } = s14;
            if (dc) {
                const newDC: DifficultyClass = {
                    dc_type: dc.dc_type,
                }
                if(dc.dc_success){
                    newDC.dc_success = dc.dc_success
                }
                if(dc.desc){
                    newDC.dc_fail = dc.desc
                }
                temp = {
                    ...trimmedSpell,
                    description: desc,
                    dc: newDC
                };
            } else {
                temp = {
                    ...s14,
                    description: desc
                };
            }

            const newSpell: Spell = {...temp};
            processedData.push(newSpell);
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
seedSpells();