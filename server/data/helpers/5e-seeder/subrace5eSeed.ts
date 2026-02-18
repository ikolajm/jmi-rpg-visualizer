import * as fs from 'fs';
import type { Subrace, Subrace2014 } from '../../databases/types/subrace.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Subraces.json';
const OUTPUTPATH = './data/databases/complete-data/subraces.json';

function seedSubrace() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Subrace2014[] = JSON.parse(dataString14);
    
        let processedData: Subrace[] = [];
        dataArray14.forEach((s14: Subrace2014) => {
            const {index, name, desc, race, ability_bonuses, racial_traits, url} = s14;
            let newSubrace: Subrace = {
                index,
                name,
                description: desc,
                species: race,
                ability_bonuses,
                racial_traits,
                url
            };

            processedData.push(newSubrace);
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
seedSubrace();