import * as fs from 'fs';
import type { APIReference } from "../../databases/types/general.types.ts";
import { EquipmentCategory2014, EquipmentCategory2024, EquipmentCategory } from '../../databases/types/equipmentCategory.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Equipment-Categories.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Equipment-Categories.json';
const OUTPUTPATH = './data/databases/complete-data/equipmentCategories.json';

function writeEquipmentCategories() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: EquipmentCategory2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: EquipmentCategory2024[] = JSON.parse(dataString24);
    
        let processedData: EquipmentCategory[] = [];
        dataArray14.forEach((ec14: EquipmentCategory2014) => {
            const index = ec14.index === "weapon" ? "weapons" : ec14.index;
            const name = ec14.name === "Weapon" ? "Weapons" : ec14.name;
            let temp: any = {
                index,
                name,
                equipment: [...ec14.equipment],
                urls: [ec14.url]
            };
            const ec24: EquipmentCategory2024 | undefined = dataArray24.find(item => item.index === temp.index);
            if (ec24) {
                ec24.url && temp.urls.push(ec24.url);

                if (ec24.equipment) {
                    ec24.equipment.forEach(item => {
                        const foundItemIndex = temp.equipment.findIndex((tempItem: APIReference) => item.index === tempItem.index);
                        if (foundItemIndex !== -1) {
                            temp.equipment[foundItemIndex].url = [temp.equipment[foundItemIndex].url, item.url];
                        } else {
                            temp.equipment.push(item);
                        }
                    })
                }
            }
            
            const newEquipmentCategory: EquipmentCategory = {...temp};
            processedData.push(newEquipmentCategory);
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
writeEquipmentCategories();