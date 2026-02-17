import * as fs from 'fs';
import type { APIReference } from "../../databases/types/general.types.ts";
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Proficiencies.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Proficiencies.json';
const OUTPUTPATH = './data/databases/complete-data/proficiencies.json';

interface BaseProficiency {
    index: string
    type: string
    name: string
    classes: string[]
    reference: APIReference
    url: string
}

interface P2014 extends BaseProficiency {
    races: string[]
}

interface P2024 extends BaseProficiency {
    species: string[]
    backgrounds: APIReference[]
}

export interface Proficiency {
    index: string
    type: string
    name: string
    classes: string[]
    references: APIReference[]
    species: string[]
    backgrounds: string[]
    urls: string[]
}

function writeProficiencies() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: P2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: P2024[] = JSON.parse(dataString24);
    
        let processedData: Proficiency[] = [];
        dataArray14.forEach((p14: P2014) => {
            let temp: any = {
                index: p14.index,
                type: p14.index,
                name: p14.name,
                classes: p14.classes,
                references: [p14.reference],
                urls: [p14.url]
            };
            const p24: P2024 | undefined = dataArray24.find(item => item.index === p14.index);
            if (p24) {
                temp.backgrounds = p24.backgrounds;
                temp.species = [...new Set([...p14.races ?? [], ...p24.species ?? []])];
                p24.reference && temp.references.push(p24.reference);
                p24.url && temp.urls.push(p24.url);
            } else {
                temp.species = [...p14.races];
                temp.backgrounds = [];
            }
            
            const newProficiency: Proficiency = {...temp};
            processedData.push(newProficiency);
        })
    
        // Data obj back to JSON
        const outputJsonString = JSON.stringify(processedData, null, 2);
    
        // Write the new JSON to a new file
        fs.writeFileSync(OUTPUTPATH, outputJsonString, 'utf8');
    
        console.log(`Successfully processed data and wrote to ${OUTPUTPATH}`);
    } catch (err) {
      console.error('An error occurred:', err);
    }
}
writeProficiencies();