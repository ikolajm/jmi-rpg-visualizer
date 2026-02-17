import * as fs from 'fs';
import type { APIReference } from "../../databases/types/general.types.ts";
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Skills.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Skills.json';
const OUTPUTPATH = './data/databases/complete-data/skills.json';

interface BaseSkill {
    index: string
    name: string
    ability_score: APIReference
    url: string
}

interface S2014 extends BaseSkill {
    desc: string[]
}

interface S2024 extends BaseSkill {
    description: string
}

export interface Skill {
    index: string
    name: string
    description: string[]
    description_short: string
    ability_score: APIReference
    urls: string[]
}

function writeSkills() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: S2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: S2024[] = JSON.parse(dataString24);
    
        let processedData: Skill[] = [];
        dataArray14.forEach((s14: S2014) => {
            let temp: any = {
                index: s14.index,
                name: s14.name,
                description: s14.desc,
                description_short: "",
                ability_score: s14.ability_score,
                urls: [s14.url]
            };
            const s24: S2024 | undefined = dataArray24.find(item => item.index === s14.index);
            if (s24) {
                temp.description_short = s24.description;
                s24.url && temp.urls.push(s24.url);

                if (s24.ability_score && (s24.ability_score.index === temp.ability_score.index)) {
                    temp.ability_score.url = [temp.ability_score.url, s24.ability_score.url];
                }
            } else {
                temp.description_short = "";
            }
            
            const newSkill: Skill = {...temp};
            processedData.push(newSkill);
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
writeSkills();