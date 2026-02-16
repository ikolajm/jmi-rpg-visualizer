import * as fs from 'fs';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Damage-Types.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Damage-Types.json';
const OUTPUTPATH = './data/databases/complete-data/damageTypes.json';

interface BaseDamageType {
    index: string
    name: string
    url: string
}

interface DamageType2014 extends BaseDamageType {
    desc: string[]
}

interface DamageType2024 extends BaseDamageType {
    description: string
}

export interface DamageType {
    index: string
    name: string
    description: string[]
    description_short: string
    urls: string[]
}

function writeDamageType() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: DamageType2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: DamageType2024[] = JSON.parse(dataString24);
    
        let processedData: DamageType[] = [];
        dataArray14.forEach((d14: DamageType2014) => {
            let temp: any = {
                index: d14.index,
                name: d14.name,
                description: [...d14.desc],
                urls: [d14.url]
            };
            const d24: DamageType2024 | undefined = dataArray24.find(item => item.index === d14.index);
            if (d24) {
                temp.description_short = d24.description ?? "";
                temp.urls.push(d24.url);
            }
            
            const newDamageType: DamageType = {...temp};
            processedData.push(newDamageType);
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
writeDamageType();