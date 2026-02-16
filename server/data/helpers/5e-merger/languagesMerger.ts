import * as fs from 'fs';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Languages.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Languages.json';
const OUTPUTPATH = './data/databases/complete-data/languages.json';

interface BaseLanguage {
    index: string
    name: string
    url: string
}

interface Language2014 extends BaseLanguage {
    type: string
    typical_speakers: string[]
    script: string
}

interface Language2024 extends BaseLanguage {
    isRare: boolean
    notes: string[]
}

export interface Language {
    index: string
    name: string
    type: string
    typical_speakers: string[]
    script: string
    isRare: boolean
    notes: string[]
    urls: string[]
}

function writeLanguages() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Language2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: Language2024[] = JSON.parse(dataString24);
    
        let processedData: Language[] = [];
        dataArray14.forEach((l14: Language2014) => {
            let temp: any = {
                index: l14.index,
                name: l14.name,
                type: l14.type,
                typical_speakers: l14.typical_speakers,
                script: l14.script,
                urls: [l14.url]
            };
            const l24: Language2024 | undefined = dataArray24.find(item => item.index === l14.index);
            if (l24) {
                temp.isRare = l24.isRare;
                temp.notes = l24.notes;
                temp.urls.push(l24.url);
            }
            
            const newLanguage: Language = {...temp};
            processedData.push(newLanguage);
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
writeLanguages();