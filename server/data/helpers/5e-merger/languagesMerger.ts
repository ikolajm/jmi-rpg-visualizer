import * as fs from 'fs';
import type { Language, Language2014, Language2024 } from '../../databases/types/language.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Languages.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Languages.json';
const OUTPUTPATH = './data/databases/complete-data/languages.json';

function writeLanguages() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Language2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: Language2024[] = JSON.parse(dataString24);
    
        let processedData: Language[] = [];
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

function write2014Data(dataArray14: Language2014[], dataArray24: Language2024[], processedData: Language[]): Language[] {
    dataArray14.forEach((l14: Language2014) => {
        let temp: any = {
            index: l14.index,
            name: l14.name,
            type: l14.type,
            typical_speakers: l14.typical_speakers,
            script: l14.script,
            urls: [l14.url],
            isRare: false,
            notes: []
        };
        const l24: Language2024 | undefined = dataArray24.find(item => item.index === l14.index);
        if (l24) {
            temp.isRare = l24.is_rare;
            temp.notes = l24.note ? [l24.note] : [];
            temp.urls.push(l24.url);
        }
        
        const newLanguage: Language = {...temp};
        processedData.push(newLanguage);
    });
    
    return processedData;
}

function write2024Data(dataArray24: Language2024[], processedData: Language[]): Language[] {
    dataArray24.forEach(lan24 => {
        const existingLanguageIndex = processedData.findIndex(lanComplete => lanComplete.index === lan24.index);
        if (existingLanguageIndex === -1) {
            const newLanguage: Language = {
                index: lan24.index,
                name: lan24.name,
                type: "",
                typical_speakers: [],
                script: "",
                urls: [lan24.url],
                isRare: lan24.is_rare,
                notes: lan24.note ? [lan24.note] : []
            };

            processedData.push(newLanguage);
        }
    });

    return processedData;
}

writeLanguages();