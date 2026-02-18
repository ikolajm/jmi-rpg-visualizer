import * as fs from 'fs';
import type { RuleSection, RuleSection2014 } from '../../databases/types/ruleSection.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Rule-Sections.json';
const OUTPUTPATH = './data/databases/complete-data/ruleSections.json';

function seedRuleSections() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: RuleSection2014[] = JSON.parse(dataString14);
    
        let processedData: RuleSection[] = [];
        dataArray14.forEach((rs14: RuleSection2014) => {
            const {index, name, desc, url} = rs14;
            let newRuleSection: RuleSection = {
                index,
                name,
                description: desc,
                url
            };

            processedData.push(newRuleSection);
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
seedRuleSections();