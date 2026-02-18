import * as fs from 'fs';
import type { Feat, Feat2024 } from '../../databases/types/feat.types.ts';
// ===
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Feats.json';
const OUTPUTPATH = './data/databases/complete-data/feats.json';

function seedFeat() {
    try {
        // Read JSON content, make parsable
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: Feat2024[] = JSON.parse(dataString24);
    
        let processedData: Feat[] = [];
        dataArray24.forEach((f24: Feat2024) => {
            let newFeat: Feat = {
                index: f24.index,
                name: f24.name,
                type: f24.type,
                description: f24.description,
                url: f24.url,
            };

            processedData.push(newFeat);
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
seedFeat();