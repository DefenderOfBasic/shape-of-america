import { full_data, getLLMExpectation } from '../src/data/augmented_data.js'
import { MIXED_THRESHOLD, getPoliticalType } from '../src/util.js'
import { writeFileSync } from 'fs';

/*
- Want a small subset ~20ish
- A mix of
    - surprising republican
    - surprising democrat
    - expected democrat
    - expected republican
    - surprising/expected mixed? 
*/
full_data.sort((A, B) => {
    return B.percentBlue - A.percentBlue
})

const expectedRepublicans = getLLMExpectation({ expected: 'republican', actual: 'republican'}).map(item => [item.job, item.percentBlue])
const surprisingRepublicans = getLLMExpectation({ expected: 'democrat', actual: 'republican'}).map(item => [item.job, item.percentBlue])
const expectedBlue = getLLMExpectation({ expected: 'democrat', actual: 'democrat'}).map(item => [item.job, item.percentBlue])
const surprisingBlue = getLLMExpectation({ expected: 'republican', actual: 'democrat'}).map(item => [item.job, item.percentBlue])
const allMixed = full_data.filter(item => 
    (item.percentBlue < MIXED_THRESHOLD && item.percentBlue > (100 - MIXED_THRESHOLD))
).map(item => [item.job, item.percentBlue])

const finalNames = [
    // surprising democrats
    [ 'Woodworker', 80.7 ],
    [ 'Coach', 77.7 ],
    [ 'Fire Fighter', 67.8 ],
    [ 'Plumber', 57.1 ],

    // surprising republicans
    [ 'Flight Instructor', 29.9 ],
    [ 'Neurosurgeon', 34.9 ], /// SCIENCE
    [ 'Mortgage Banker', 37.6 ],

    // very democrat
    [ 'Psychologist', 89.1 ],
    [ 'Scientist', 88.4 ], /// SCIENCE
    [ 'Game Designer', 91.5 ],

    // very repub
    [ 'Roofing Contractor', 12.4 ],
    [ 'Chief Of Police', 33.3 ],
    [ 'Private Investigator', 39 ],
    [ 'Funeral Director', 39.9 ],

    // mixed
    [ 'Custodian', 52.2 ],
    [ 'Pharmacist', 52.4 ],
    [ 'Soldier', 50.6 ],
    [ 'Geophysicist', 51.1 ], /// SCIENCE
    [ 'Tax Professional', 54.2 ],
    [ 'Government Affairs Researcher', 54.8 ],
    [ 'Bus Driver', 48.7 ],
]

const finalNamesMap = Object.fromEntries(
    finalNames.map(([name]) => [name, true])
);
const finalData = full_data.filter(item => finalNamesMap[item.job] != undefined)
writeFileSync('src/data/final.json', JSON.stringify(finalData, null, 2), 'utf8');
