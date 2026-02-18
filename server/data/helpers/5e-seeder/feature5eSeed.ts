import * as fs from 'fs';
import type { Feature, Feature2014 } from '../../databases/types/feature.types.ts';
// ===
const PATH2024 = './data/databases/5e-Databases/2014/5e-SRD-Features.json';
const OUTPUTPATH = './data/databases/complete-data/features.json';

function seedFeatures() {
    try {
        // Read JSON content, make parsable
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: Feature2014[] = JSON.parse(dataString24);
    
        let processedData: Feature[] = [];
        dataArray24.forEach((f24: Feature2014) => {
            let newFeat: Feature = {...f24};

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
seedFeatures();