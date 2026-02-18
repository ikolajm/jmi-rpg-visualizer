import * as fs from 'fs';
import type { Rule, Rule2014 } from '../../databases/types/rules.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Rules.json';
const OUTPUTPATH = './data/databases/complete-data/rules.json';

function seedRuleSections() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Rule2014[] = JSON.parse(dataString14);
    
        let processedData: Rule[] = [];
        dataArray14.forEach((r14: Rule2014) => {
            const {index, name, desc, subsections, url} = r14;
            let newRule: Rule = {
                index,
                name,
                description: desc,
                subsections,
                url
            };

            processedData.push(newRule);
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