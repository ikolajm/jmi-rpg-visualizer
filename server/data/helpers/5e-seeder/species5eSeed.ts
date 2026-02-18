import * as fs from 'fs';
import type { Species, Species2014 } from '../../databases/types/species.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Races.json';
const OUTPUTPATH = './data/databases/complete-data/species.json';

function seedSpecies() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Species2014[] = JSON.parse(dataString14);
    
        let processedData: Species[] = [];
        dataArray14.forEach((s14: Species2014) => {
            let newSpecies: Species = {...s14};

            processedData.push(newSpecies);
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
seedSpecies();