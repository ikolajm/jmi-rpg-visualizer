import * as fs from 'fs';
// ===
const PATH2014EC = './data/databases/5e-Databases/2014/5e-SRD-Equipment-Categories.json';
const PATH2024EC = './data/databases/5e-Databases/2024/5e-SRD-Equipment-Categories.json';
const PATH2014EQUIPMENT = './data/databases/5e-Databases/2014/5e-SRD-Equipment.json';
const PATH2024EQUIPMENT = './data/databases/5e-Databases/2024/5e-SRD-Equipment.json';

export function check2024Entries() {
    const dataStringComplete = fs.readFileSync(PATH2014EC, 'utf8');
    const dataArrayComplete = JSON.parse(dataStringComplete);
    const dataString24EC = fs.readFileSync(PATH2024EC, 'utf8');
    const dataArray24 = JSON.parse(dataString24EC);
    const mergedDataArrays = [...dataArray24, ...dataArrayComplete];
    // ---
    const dataString14Equipment = fs.readFileSync(PATH2014EQUIPMENT, 'utf8');
    const dataArray14Equipment = JSON.parse(dataString14Equipment);
    const dataString24Equipment = fs.readFileSync(PATH2024EQUIPMENT, 'utf8');
    const dataArray24Equipment = JSON.parse(dataString24Equipment);
    const mergedEquipmentArrays = [...dataArray14Equipment, ...dataArray24Equipment];
    // ---
    let knownIndices: string[] = [];
    let equipmentCategories: any[] = [];

    // Get all known indices
    mergedDataArrays.forEach(ec => {
        const foundIndex = knownIndices.findIndex((i:any) => i === ec.index);
        if (foundIndex === -1) {
            const firstEquipmentIndex = ec.equipment[0].index;
            knownIndices.push(firstEquipmentIndex)
            
            const firstEquipment = mergedEquipmentArrays.find((equipment: any) => equipment.index === firstEquipmentIndex);
            const newEC = {
                index: ec.index,
                name: ec.name,
                equipment: [firstEquipment],
                isMagicItem: !firstEquipment
            }
            equipmentCategories.push(newEC);
        };
    });

    console.log('Known equipment categories:', equipmentCategories);
}