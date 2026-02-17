import * as fs from 'fs';
import type { Proficiency, Proficiency2014, Proficiency2024 } from '../../databases/types/proficiency.types.ts';
import type { APIReference } from '../../databases/types/general.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Proficiencies.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Proficiencies.json';
const OUTPUTPATH = './data/databases/complete-data/proficiencies.json';

function writeProficiencies() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Proficiency2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: Proficiency2024[] = JSON.parse(dataString24);
    
        let processedData: Proficiency[] = [];
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

function write2014Data(dataArray14: Proficiency2014[], dataArray24: Proficiency2024[], processedData: Proficiency[]): Proficiency[] {
    dataArray14.forEach((p14: Proficiency2014) => {
        let temp: any = {
            index: p14.index,
            type: p14.type,
            name: p14.name,
            classes: p14.classes,
            species: p14.races,
            reference: p14.reference,
            urls: [p14.url]
        };
        const p24: Proficiency2024 | undefined = dataArray24.find(item => item.index === p14.index);
        if (p24) {
            temp.backgrounds = p24.backgrounds;
            p24.url && temp.urls.push(p24.url);
            // Check reference
            const referenceExists = temp.reference.index === p24.reference.index;
            if (referenceExists) {
                temp.reference.url = [temp.reference.url, p24.reference.url];
            }
            // Check class
            p24.classes.forEach((p24Class: APIReference) => {
                let existingClassIndex = temp.classes.findIndex((tempClass: APIReference) => tempClass.index === p24Class.index);
                if (existingClassIndex !== -1) {
                    temp.classes[existingClassIndex].url = [temp.classes[existingClassIndex].url, p24Class.url];
                } else {
                    temp.classes.push(p24Class);
                }
            });
            // Check species
            p24.species.forEach((p24Species: APIReference) => {
                let existingSpeciesIndex = temp.species.findIndex((tempSpecies: APIReference) => tempSpecies.index === p24Species.index);
                if (existingSpeciesIndex !== -1) {
                    temp.species[existingSpeciesIndex].url = [temp.species[existingSpeciesIndex].url, p24Species.url];
                } else {
                    temp.species.push(p24Species);
                }
            });
        } else {
            temp.backgrounds = [];
        }
        
        const newProficiency: Proficiency = {...temp};
        processedData.push(newProficiency);
    })
    return processedData
}

function write2024Data(dataArray24: Proficiency2024[], processedData: Proficiency[]): Proficiency[] {
    dataArray24.forEach(p24 => {
        const existingProficiencyIndex = processedData.findIndex(pComplete => pComplete.index === p24.index);
        if (existingProficiencyIndex === -1) {
            let tempProficiency: any = {
                index: p24.index,
                type: p24.type,
                name: p24.name,
                backgrounds: [p24.backgrounds],
                classes: p24.classes,
                species: p24.species,
                reference: p24.reference,
                urls: [p24.url]
            };

            processedData.push(tempProficiency)
        }
    });

    return processedData;
}

writeProficiencies();