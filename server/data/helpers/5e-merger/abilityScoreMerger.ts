import * as fs from 'fs';
import type { APIReference } from "../../databases/types/general.types.ts";
import type { AbilityScore, AbilityScore2014, AbilityScore2024 } from '../../databases/types/abilityScore.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Ability-Scores.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Ability-Scores.json';
const OUTPUTPATH = './data/databases/complete-data/abilityScores.json';

function writeAbilityScore() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: AbilityScore2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: AbilityScore2024[] = JSON.parse(dataString24);
    
        let processedData: AbilityScore[] = [];
        dataArray14.forEach((as14: AbilityScore2014) => {
            let temp: any = {
                index: as14.index,
                name: as14.name,
                full_name: as14.full_name,
                skills: as14.skills,
                description: [...as14.desc],
                urls: [as14.url]
            };
            const as24: AbilityScore2024 | undefined = dataArray24.find(item => item.index === as14.index);
            if (as24) {
                temp.description_short = as24.description ?? "";
                as24.url && temp.urls.push(as24.url);

                as24.skills.forEach((skill: APIReference) => {
                    const foundSkillIndex = temp.skills.findIndex((tempSkill: APIReference) => tempSkill.index === skill.index);
                    if (foundSkillIndex !== -1) {
                        const foundSkill = temp.skills[foundSkillIndex];
                        foundSkill.url = [foundSkill.url, skill.url];
                    } else {
                        temp.skills.push(skill);
                    }
                });
            }

            const newAbilityScore: AbilityScore = {...temp};
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
writeAbilityScore();