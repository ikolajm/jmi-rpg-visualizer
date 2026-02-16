import * as fs from 'fs';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Alignments.json';
const PATH2024 = './data/databases/5e-Databases/2024/5e-SRD-Alignments.json';
const OUTPUTPATH = './data/databases/complete-data/alignment.json';

interface BaseAlignment {
    index: string
    name: string
    abbreviation: string
}

interface Alignment2014 extends BaseAlignment {
    desc: string
}

interface Alignment2024 extends BaseAlignment {
    description: string
}

export interface Alignment extends BaseAlignment {
    description: string[]
}

function writeAlignment() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Alignment2014[] = JSON.parse(dataString14);
        const dataString24 = fs.readFileSync(PATH2024, 'utf8');
        const dataArray24: Alignment2024[] = JSON.parse(dataString24);
    
        let processedData: Alignment[] = [];
        dataArray14.forEach((al14: Alignment2014) => {
            let newAlignment: Alignment = {
                index: al14.index,
                name: al14.name,
                abbreviation: al14.abbreviation,
                description: [al14.desc]
            };
            const al24: Alignment2024 | undefined = dataArray24.find(Alignment => Alignment.index === al14.index);
            if (al24 && al24.description) {
                newAlignment.description.push(al24.description);
            }
            processedData.push(newAlignment);
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
writeAlignment();