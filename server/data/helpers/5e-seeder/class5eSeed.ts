import * as fs from 'fs';
import type { Class, Class2014 } from '../../databases/types/class.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Classes.json';
const OUTPUTPATH = './data/databases/complete-data/classes.json';

function seedClasses() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Class2014[] = JSON.parse(dataString14);
    
        let processedData: Class[] = [];
        dataArray14.forEach(c14 => {
            const { proficiency_choices, starting_equipment_options, spellcasting, ...trimmedClass } = c14;
            const newProficiencyChoices = proficiency_choices.map(pc => {
                const {desc, ...trimmedPC} = pc;
                const newPC = {
                    description: desc,
                    ...trimmedPC,
                }
                return newPC;
            });
            const newStartingEquipmentOptions = starting_equipment_options.map(seo => {
                const {desc, ...trimmedSEO} = seo;
                const newSEO = {
                    description: desc,
                    ...trimmedSEO,
                }
                return newSEO;
            });
            let newClass: Class = {
                ...trimmedClass,
                starting_equipment_options: newStartingEquipmentOptions,
                proficiency_choices: newProficiencyChoices
            }

            if (spellcasting) {
                const newSpellCastingInfo = spellcasting.info.map(infoObj => {
                    return {
                        name: infoObj.name,
                        description: infoObj.desc
                    }
                })
                const { info: info2014, ...trimmedSpellcasting } = spellcasting;
                newClass.spellcasting = {
                    ...trimmedSpellcasting,
                    info: newSpellCastingInfo
                };
            }

            processedData.push(newClass);
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
seedClasses();