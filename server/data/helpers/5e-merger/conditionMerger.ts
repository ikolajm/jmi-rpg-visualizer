import * as fs from 'fs';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Conditions.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Conditions.json';
const OUTPUTPATH = './data/databases/complete-data/conditions.json';

interface BaseCondition {
    index: string
    name: string
    url: string
}

interface Condition2014 extends BaseCondition {
    desc: string[]
}

interface Condition2024 extends BaseCondition {
    description: string
}

export interface Condition {
    index: string
    name: string
    description_arr: string[]
    desc_formatted: string
    urls: string[]
}

function writeCondition() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Condition2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: Condition2024[] = JSON.parse(dataString24);
    
        let processedData: Condition[] = [];
        dataArray14.forEach((c14: Condition2014) => {
            let temp: any = {
                index: c14.index,
                name: c14.name,
                description_arr: [...c14.desc],
                urls: [c14.url],
            };
            const c24: Condition2024 | undefined = dataArray24.find(item => item.index === c14.index);
            if (c24) {
                temp.desc_formatted = c24.description ?? "";
                temp.urls.push(c24.url);
            }
            
            const newCondition: Condition = {...temp};
            processedData.push(newCondition);
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
writeCondition();