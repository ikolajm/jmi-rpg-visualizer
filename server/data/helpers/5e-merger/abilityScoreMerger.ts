import * as fs from 'fs';
import type { APIReference } from "./mergerTypes.ts";
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Ability-Scores.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Ability-Scores.json';
const OUTPUTPATH = './data/databases/complete-data/abilityScores.json';

interface BaseAbilityScore {
    index: string
    name: string
    full_name: string
    skills: [APIReference]
}

interface AS2014 extends BaseAbilityScore {
    desc: string[]
}

interface AS2024 extends BaseAbilityScore {
    description: string
}

export interface AbilityScore {
    index: string
    name: string
    skills: [APIReference]
    description: string[]
    description_short: string
}

function writeAbilityScore() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: AS2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: AS2024[] = JSON.parse(dataString24);
    
        let processedData: AbilityScore[] = [];
        dataArray14.forEach((as14: AS2014) => {
            let newAbilityScore: AbilityScore = {
                index: as14.index,
                name: as14.full_name,
                skills: as14.skills,
                description: [...as14.desc],
                description_short: ""
            };
            const as24: AS2024 | undefined = dataArray24.find(abilityScore => abilityScore.index === as14.index);
            if (as24 && as24.description) {
                newAbilityScore.description_short = as24.description;
            }
            processedData.push(newAbilityScore);
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
// writeAbilityScore();