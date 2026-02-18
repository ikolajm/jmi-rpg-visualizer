import * as fs from 'fs';
import type { MagicItem, MagicItem2014 } from '../../databases/types/magicItems.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Magic-Items.json';
const OUTPUTPATH = './data/databases/complete-data/magicItems.json';

function seedMagicItems() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: MagicItem2014[] = JSON.parse(dataString14);
    
        let processedData: MagicItem[] = [];
        dataArray14.forEach((mi14: MagicItem2014) => {
            const {
                index, 
                name, 
                desc,
                rarity,
                equipment_category, 
                variant, 
                variants,
                url
            } = mi14;
            let newMagicItem: MagicItem = {
                index,
                name,
                description: desc,
                rarity: rarity.name,
                equipment_category,
                variant,
                variants,
                url,
            };

            processedData.push(newMagicItem);
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
seedMagicItems();