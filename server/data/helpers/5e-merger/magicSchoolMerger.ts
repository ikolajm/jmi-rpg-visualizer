import * as fs from 'fs';
import type { APIReference } from "../../databases/types/general.types.ts";
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Magic-Schools.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Magic-Schools.json';
const OUTPUTPATH = './data/databases/complete-data/magicSchools.json';

interface BaseMagicSchool {
    index: string
    name: string
    url: string
}

interface MS2014 extends BaseMagicSchool {
    desc: string
}

interface MS2024 extends BaseMagicSchool {
    description: string
}

export interface MagicSchool {
    index: string
    name: string
    skills: [APIReference]
    description: string
    description_short: string
    urls: string[]
}

function writeMagicSchool() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: MS2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: MS2024[] = JSON.parse(dataString24);
    
        let processedData: MagicSchool[] = [];
        dataArray14.forEach((ms14: MS2014) => {
            let temp: any = {
                index: ms14.index,
                name: ms14.name,
                description: ms14.desc,
                urls: [ms14.url]
            };
            const ms24: MS2024 | undefined = dataArray24.find(item => item.index === ms14.index);
            if (ms24) {
                temp.description_short = ms24.description ?? "";
                temp.urls.push(ms24.url);
            }
            
            const newMagicSchool = {...temp};
            processedData.push(newMagicSchool);
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
writeMagicSchool();