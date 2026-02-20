import * as fs from 'fs';
import type { Equipment, Equipment2014 } from '../../databases/types/equipment.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Equipment.json';
const OUTPUTPATH = './data/databases/complete-data/equipment.json';

function seedEquipment() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Equipment2014[] = JSON.parse(dataString14);
    
        let processedData: Equipment[] = [];
        dataArray14.forEach(e14 => {
            const { desc, ...trimmedEquipment } = e14;
            let newEquipment: Equipment = {
                ...trimmedEquipment,
                description: desc,
            }

            processedData.push(newEquipment);
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
seedEquipment();