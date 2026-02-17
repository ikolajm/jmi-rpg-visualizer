import * as fs from 'fs';
import type { Skill, Skill2014, Skill2024 } from '../../databases/types/skill.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Skills.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Skills.json';
const OUTPUTPATH = './data/databases/complete-data/skills.json';

function writeSkills() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Skill2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: Skill2024[] = JSON.parse(dataString24);
    
        let processedData: Skill[] = [];
        processedData = write2014Data(dataArray14, dataArray24, processedData);
        processedData = write2024Data(dataArray24, processedData);
    
        // Data obj back to JSON
        const outputJsonString = JSON.stringify(processedData, null, 2);
    
        // Write the new JSON to a new file
        fs.writeFileSync(OUTPUTPATH, outputJsonString, 'utf8');
    
        console.log(`Successfully processed data and wrote to ${OUTPUTPATH}`);
    } catch (err) {
      console.error('An error occurred:', err);
    }
}

function write2014Data(dataArray14: Skill2014[], dataArray24: Skill2024[], processedData: Skill[]): Skill[] {
    dataArray14.forEach((s14: Skill2014) => {
        let temp: any = {
            index: s14.index,
            name: s14.name,
            description: s14.desc,
            description_short: "",
            ability_score: s14.ability_score,
            urls: [s14.url]
        };
        const s24: Skill2024 | undefined = dataArray24.find(item => item.index === s14.index);
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
    
    return processedData;
}

function write2024Data(dataArray24: Skill2024[], processedData: Skill[]): Skill[] {
    dataArray24.forEach(s24 => {
        const existingSkillIndex = processedData.findIndex(sComplete => sComplete.index === s24.index);
        if (existingSkillIndex === -1) {
            let newSkill: Skill = {
                index: s24.index,
                name: s24.name,
                ability_score: s24.ability_score,
                urls: [s24.url],
                description: [s24.description],
                description_short: s24.description
            };

            processedData.push(newSkill)
        }
    });

    return processedData;
}


writeSkills();