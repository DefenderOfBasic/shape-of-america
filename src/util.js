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


export function computeLocalAccuracy() {
    const results = JSON.parse(localStorage.getItem('results'))
    const accuracy = results.guesses.filter(g => g.correct).length / results.guesses.length
    return accuracy
}

export async function computeGlobalAccuracy() {
    const { correct, incorrect } = await (await fetch(`${SERVER_URL}global-accuracy`)).json()

    const globalAccuracy = correct / (correct + incorrect)
    if (globalAccuracy == undefined || isNaN(globalAccuracy)) return 
    document.querySelector("#global-accuracy").innerText = Math.round(globalAccuracy * 100)

    return globalAccuracy
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