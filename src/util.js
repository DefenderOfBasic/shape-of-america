import { data } from './data/data.js'

function isProd() {
    if (import.meta.env) {
        return import.meta.env.PROD
    }
    return false
}

const LOCAL_URL = 'http://127.0.0.1:8787/'
const PROD_URL = 'https://shape-of-america-worker.defenderofbasic.workers.dev/'
export const SERVER_URL = 
 isProd() ? PROD_URL : LOCAL_URL

 function getSummary(results, filterSearchTerm) {
    const filtered = results.guesses.filter(g => g.answer == filterSearchTerm)
    const correct_num = filtered.filter(g => g.correct).length
    return { total: filtered.length, correct: correct_num}
  }

export function computeLocalAccuracy() {
    const results = JSON.parse(localStorage.getItem('results'))
    const guesses = results.guesses

    for (let i = 0; i < guesses.length; i++) {
        const currentGuess = guesses[i]
        const { job_title } = currentGuess
        const correctAnswer = jobsMap[job_title.toLowerCase()]
        currentGuess.answer = correctAnswer
    }
    const democrat = getSummary(results, 'democrat')
    const republican = getSummary(results, 'republican')
    const mixed = getSummary(results, 'mixed')

    const accuracy = guesses.filter(g => g.correct).length / results.guesses.length
    return { accuracy, democrat, republican, mixed }
}
export const MIXED_THRESHOLD = 55


// confusing: Senior Program Associate, Tax Manager, 
// small summary, plus salary? 
export function getPoliticalType(percentBlue) {
    let correctAnswer = ''
    if (percentBlue <= MIXED_THRESHOLD && percentBlue >= (100 - MIXED_THRESHOLD)) {
        correctAnswer = 'mixed'
    } else if (percentBlue < 50) {
        correctAnswer = 'republican'
    } else {
        correctAnswer = 'democrat'
    }

    return correctAnswer
}

export function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }
  

export const jobsMap = {}
for (let i = 0; i < data.length; i++) {
    const job_title = data[i][0].toLowerCase()
    let percentBlue = Math.round(parseFloat(data[i][1]))
    let correctAnswer = getPoliticalType(percentBlue)
    jobsMap[job_title] = correctAnswer
}