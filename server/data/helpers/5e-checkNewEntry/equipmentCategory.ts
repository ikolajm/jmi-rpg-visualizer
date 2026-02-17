import * as fs from 'fs';
import type { EquipmentCategory, EquipmentCategory2024 } from '../../databases/types/equipmentCategory.types.ts';
// ===
const PATHCOMPLETED = './data/databases/complete-data/equipmentCategories.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Equipment-Categories.json';
const OUTPUTPATH = './data/databases/complete-data/equipmentCategories.json';

function checkNewEquipmentCategory() {
    try {
        // Read JSON content, make parsable
        const dataStringCompleted = fs.readFileSync(PATHCOMPLETED, 'utf8');
        let completeEquipmentCategories: EquipmentCategory[] = JSON.parse(dataStringCompleted);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: EquipmentCategory2024[] = JSON.parse(dataString24);
    
        let processedData = [...completeEquipmentCategories];
        dataArray24.forEach((ec24: EquipmentCategory2024) => {
            const existingEquipmentCategoryIndex = processedData.findIndex(ecComplete => ecComplete.index === ec24.index);
            // Equipment category exists - check for new equipment entries
            // Already merged equipment items that exist in both '14 and '24 - look for '24 only
            if (existingEquipmentCategoryIndex !== -1) {
                let existingEquipmentCategory = processedData[existingEquipmentCategoryIndex];
                let newEquipmentList = existingEquipmentCategory.equipment;
                ec24.equipment.forEach(ei24 => {
                    const existingEquipmentItemIndex = newEquipmentList.findIndex(eiComplete => eiComplete.index === ei24.index);
                    // If index already exists, we have already made an array of the url reference - no action
                    if(existingEquipmentItemIndex === -1) {
                        newEquipmentList.push(ei24);
                    }
                })
            } else {
                // Category is new - push
                const newEquipmentCategory = {
                    index: ec24.index,
                    name: ec24.name,
                    equipment: [...ec24.equipment],
                    urls: [ec24.url]
                };
                processedData.push(newEquipmentCategory);
            }
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
checkNewEquipmentCategory();