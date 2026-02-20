import * as fs from 'fs';
import type { Level, Level2014 } from '../../databases/types/level.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Levels.json';
const OUTPUTPATH = './data/databases/complete-data/levels.json';

function seedLevels() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Level2014[] = JSON.parse(dataString14);
    
        let processedData: Level[] = [];
        dataArray14.forEach(l14 => {
            const { prof_bonus, ...trimmedLevel } = l14;
            let newLevel: Level = {
                ...trimmedLevel,
                proficiency_bonus: prof_bonus,
            }

            processedData.push(newLevel);
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
seedLevels();