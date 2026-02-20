import * as fs from 'fs';
import type { Monster, Monster2014, MonsterAction, MonsterLegendaryAction, MonsterSpecialAbility } from '../../databases/types/monster.types.ts';
import type { DifficultyClass, DifficultyClass2014, OptionOptions, OptionSelection, OptionSelection2014, OptionSet } from '../../databases/types/general.types.ts';
// ===
const PATH2014 = './data/databases/5e-Databases/2014/5e-SRD-Monsters.json';
const OUTPUTPATH = './data/databases/complete-data/monsters.json';

function seedMonsters() {
    try {
        // Read JSON content, make parsable
        const dataString14 = fs.readFileSync(PATH2014, 'utf8');
        const dataArray14: Monster2014[] = JSON.parse(dataString14);

        function convertDC(dc: DifficultyClass2014): DifficultyClass {
            let newDC: DifficultyClass = {
                dc_type: dc.dc_type,
                dc_value: dc.dc_value
            }
            if (dc.success_type) {
                newDC.dc_success = dc.success_type
            }
            if (dc.desc) {
                newDC.dc_fail = dc.desc
            }

            return newDC;
        }

        function convertActionOptions(options: OptionSelection2014): OptionSelection {
            const { from, ...trimmedOptions } = options;
            let tempActionOptions: any = {
                ...trimmedOptions
            }
            const { options: fromOptions, ...trimmedFrom } = from;
            let tempFrom: any = {
                ...trimmedFrom
            }

            const newFromOptions = fromOptions.map(option => {
                if ("dc" in option) {
                    const { dc, ...trimmedOption } = option;
                    const newDC = convertDC(dc);
                    const newOption = {
                        dc: newDC,
                        ...trimmedOption
                    }

                    return newOption;
                } else {
                    return option;
                }
            });
            tempFrom.options = newFromOptions;
            const newFrom: OptionSet = {...tempFrom};
            tempActionOptions.from = newFrom;

            const newActionOptions: OptionSelection = {...tempActionOptions};
            return newActionOptions;
        }
    
        let processedData: Monster[] = [];
        dataArray14.forEach(m14 => {
            const { actions, desc, legendary_actions, reactions, special_abilities, ...trimmedMonster } = m14;
            const newActions = actions?.map(a14 => {
                const { dc, desc, options: actionOptions, ...trimmedAction} = a14;
                let newAction: MonsterAction = {
                    description: desc,
                    ...trimmedAction,
                }
                if (dc) {
                    newAction.dc = convertDC(dc);
                }
                if (actionOptions) {
                    newAction.options = convertActionOptions(actionOptions);
                }
                
                return newAction;
            });
            const newLegendaryActions = legendary_actions?.map(la14 => {
                const { dc, desc, ...trimmedLegendaryAction} = la14;
                let newLegendaryAction: MonsterLegendaryAction = {
                    description: desc ?? "",
                    ...trimmedLegendaryAction
                }
                if (dc) {
                    let newDC: DifficultyClass = {
                        dc_type: dc.dc_type,
                        dc_value: dc.dc_value
                    }
                    if (dc.success_type) {
                        newDC.dc_success = dc.success_type
                    }

                    newLegendaryAction.dc = newDC;
                }

                return newLegendaryAction;
            });
            const newReactions = reactions?.map(r14 => {
                const { desc, ...trimmedReaction} = r14;
                let newReaction = {
                    description: desc ?? "",
                    ...trimmedReaction
                }

                return newReaction;
            });
            const newSpecialAbilities = special_abilities?.map(sa14 => {
                const { dc, desc, ...trimmedSpecialAbility} = sa14;
                let newSpecialAbility: MonsterSpecialAbility = {
                    description: desc ?? "",
                    ...trimmedSpecialAbility
                }
                if (dc) {
                    let newDC: DifficultyClass = {
                        dc_type: dc.dc_type,
                        dc_value: dc.dc_value
                    }
                    if (dc.success_type) {
                        newDC.dc_success = dc.success_type
                    }

                    newSpecialAbility.dc = newDC;
                }

                return newSpecialAbility;
            });
            const newMonster: Monster = {
                ...trimmedMonster,
                actions: newActions ?? [],
                description: desc ?? "",
                legendary_actions: newLegendaryActions ?? [],
                reactions: newReactions ?? [],
                special_abilities: newSpecialAbilities ?? []
            }

            processedData.push(newMonster);
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
seedMonsters();