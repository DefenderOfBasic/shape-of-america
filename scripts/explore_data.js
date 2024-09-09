import { full_data } from '../src/data/augmented_data.js'
import { MIXED_THRESHOLD, getPoliticalType } from '../src/util.js'

full_data.sort((A, B) => {
    return B.percentBlue - A.percentBlue
})
console.log("Most democrat jobs", full_data.slice(0, 15).map(item => [item.job, item.percentBlue]))
/*
  [ 'User Experience Researcher', 97.4 ],
  [ 'User Experience Designer', 96.4 ],
  [ 'Union Organizer', 96.2 ],
  [ 'Organizer', 96.2 ],
  [ 'Visual Artist', 96.2 ],
  [ 'Book Editor', 96.1 ],
  [ 'Curator', 95.6 ],
  [ 'Research Specialist', 95.6 ],
  [ 'Data Scientist', 95.1 ],
  [ 'Urban Planner', 95 ],
  [ 'Student Worker', 94.9 ],
  [ 'Graduate Student Assistant', 94.7 ],
  [ 'Senior Program Associate', 94.4 ],
  [ 'Writer/Producer', 94.2 ],
  [ 'History Professor', 94.1 ]
*/

const len = full_data.length
console.log("Most republican jobs", full_data.slice(len - 15, len).map(item => [item.job, item.percentBlue]))
/*
 [
  [ 'Aircraft Mechanic', 28.8 ],
  [ 'Construction Superintendent', 28.3 ],
  [ 'Equipment Operator', 28.2 ],
  [ 'Farm Owner Operator', 27.5 ],
  [ 'Car Sales Consultant', 27.2 ],
  [ 'Vice President Of Manufacturing', 26.7 ],
  [ 'Vice President Of Construction', 24.8 ],
  [ 'Mason', 24.8 ],
  [ 'Roofer', 21.9 ],
  [ 'Trucker', 21.5 ],
  [ 'Land Manager', 19.7 ],
  [ 'Electrical Contractor', 16.2 ],
  [ 'Logger', 13.6 ],
  [ 'Roofing Contractor', 12.4 ],
  [ 'Missionary', 11.9 ]
]
*/

const allDemocrat = full_data.filter(item => item.percentBlue > MIXED_THRESHOLD)
const allRepublican = full_data.filter(item => (100 - item.percentBlue) > MIXED_THRESHOLD).map(item => item.job)
const allMixed = full_data.filter(item => 
    (item.percentBlue < MIXED_THRESHOLD && item.percentBlue > (100 - MIXED_THRESHOLD))
)
console.log({ 
    democrat: allDemocrat.length, // 365
    republican: allRepublican.length, // 74
    mixed: allMixed.length  // 58
})

// Stuff the LLM expects is republican but is actually democrat
// total: 43
// concierge, patent agent, fire fighter, underwriter, plumber
// coach, woodworker, potter
// console.log(getLLMExpectation({ expected: 'republican', actual: 'democrat'}).length)

// Expected democrat but actually republican
// total: 51
// School Bus Driver, Police Officer, Priest, Auto Mechanic, Flight Instructor
// Orthodontist, Neurosurgeon, Anesthetist, Radiologist', Urologist, Surgeon
// console.log(getLLMExpectation({ expected: 'democrat', actual: 'republican'}).map(item => [item.job, item.percentBlue]))

// Expected democrat & indeed: 302
// console.log(getLLMExpectation({ expected: 'democrat', actual: 'democrat'}).length)

// Expected republican & indeed: 17
// Fire Captain, Barber, Private Investigator
// Mason, Roofer, Trucker, Construction Superintendent
// console.log(getLLMExpectation({ expected: 'republican', actual: 'republican'}).map(item => [item.job, item.percentBlue]))


/////////////////HELPER FUNCTIONS//////////////////////////////////

// for example:
//  getLLMExpectation({ expected: 'democrat', actual: 'republican'})
// returns all jobs that the LLM expects is democrat but is republican
function getLLMExpectation({ expected, actual }) {
    // get `actual` jobs
    const targetJobs = full_data.filter(item => {
        // include 'mixed' as an answer
        const jobType = getPoliticalType(item.percentBlue)
        if (jobType == actual) {
            return true
        }
        return false
    })
    // find all where LLM thinks it's: `expected`
    // the LLM never guesses mixed
    const final = []
    for (let item of targetJobs) {
        if (expected == 'republican' && 
            item.red_score > item.blue_score
        ) {
            final.push(item)
        }
        if (expected == 'democrat' && 
            item.red_score < item.blue_score
        ) {
            final.push(item)
        }
    }

    return final
}