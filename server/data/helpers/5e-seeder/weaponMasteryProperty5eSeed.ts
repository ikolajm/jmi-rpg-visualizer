import * as fs from 'fs';
import type { WeaponMasteryProperty, WeaponMasteryProperty2024 } from '../../databases/types/weaponMasteryProperty.types.ts';
// ===
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Weapon-Mastery-Properties.json';
const OUTPUTPATH = './data/databases/complete-data/weaponMasteryProperties.json';

function seedWeaponMasteryProperties() {
    try {
        // Read JSON content, make parsable
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: WeaponMasteryProperty2024[] = JSON.parse(dataString24);
    
        let processedData: WeaponMasteryProperty2024[] = [];
        dataArray24.forEach((wmp24: WeaponMasteryProperty2024) => {
            let newWMP: WeaponMasteryProperty = {
                index: wmp24.index,
                name: wmp24.name,
                description: wmp24.description,
                url: wmp24.url,
            };

            processedData.push(newWMP);
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

seedWeaponMasteryProperties();