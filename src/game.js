import { SERVER_URL } from './util'
import job_data_subset from './data/final.json'
import { full_data } from './data/augmented_data'

import { computeLocalAccuracy, getPoliticalType,shuffle } from './util'

let job_data = job_data_subset  
const searchParams = new URLSearchParams(window.location.search);
let isInfiniteMode = false
if (searchParams.has('infinite')) {
    job_data = full_data
    isInfiniteMode = true
}

if (!localStorage.getItem('user_id')) {
    localStorage.setItem('user_id', self.crypto.randomUUID())
    localStorage.setItem('results', JSON.stringify({ guesses: [] }))
}
const unanswered_job_data = []
// remove the jobs they have already guessed, then shuffle
const results = JSON.parse(localStorage.getItem('results')).guesses 
const guessedMap = {}
results.forEach(item => guessedMap[item.job_title] = true)
for (let i = 0; i <job_data.length; i++) {
    if (guessedMap[job_data[i].job]) {
        console.log(`Skipping ${job_data[i].job}, already guessed`)
        continue
    }
    unanswered_job_data.push(job_data[i])
}
if (isInfiniteMode) {
    shuffle(unanswered_job_data)
}

let globalAccuracyMap = {}
async function getGlobalResults() {
    const results = await (await fetch(`${SERVER_URL}global-tally`)).json()

    for (let item of results) {
        const { job_title, democrat, republican, mixed, answer } = item 
        let correctCount = democrat
        if (answer == 'republican') correctCount = republican
        if (answer == 'mixed') correctCount = mixed 
        let accuracy = (correctCount) / (democrat + republican + mixed)
        let mostCommonAnswer = ''
        if (democrat > republican && democrat > mixed) mostCommonAnswer = 'democrat'
        if (republican > democrat && republican > mixed) mostCommonAnswer = 'republican'
        if (mixed > democrat && mixed > republican) mostCommonAnswer = 'mixed'

        globalAccuracyMap[job_title] = { accuracy: Math.round(accuracy * 100), mostCommonAnswer }
    }
}
getGlobalResults()


const USER_ID = localStorage.getItem('user_id')
let JOB_INDEX = 0
const storedResults = JSON.parse(localStorage.getItem('results'))
displayLocalAccuracy()

if (unanswered_job_data.length == 0) {
    // game is done! going to infinite mode
    window.location.href = 'gotoinfinite.html'
}

let job = unanswered_job_data[JOB_INDEX]
document.querySelector("#job-text").innerText = job.job
document.querySelector("#count-text").innerText = `${job_data.length - unanswered_job_data.length} / ${job_data.length}`

async function submitResult(choice) {
    document.querySelector("#question").style.display = 'none'
    document.querySelector("#job-title").style.display = 'none'
    document.querySelector("#result").style.display = 'flex'

    let percentBlue = Math.round(parseFloat(job.percentBlue))
    let percentRed = Math.round(100 - percentBlue)

    let className = 'blue'
    if (choice == 'republican') className = 'red'
    else if (choice == 'mixed') className = 'mixed'

    let correctAnswer = getPoliticalType(percentBlue)
    const isCorrect = choice === correctAnswer

    storedResults.guesses.push({ correct: isCorrect, job_title: job.job, guess: choice  })

    let yourAnswer = isCorrect ? '' : `<li>You answered: <span class="${className}">${choice}</span>.</li>`
    const globalAccuracyMapItem = globalAccuracyMap[job.job.toLowerCase()]
    const globalAccuracyMessage = globalAccuracyMapItem == undefined ? '' : 
    `<li>${globalAccuracyMapItem.accuracy}% got this question correct. Most answered ${globalAccuracyMapItem.mostCommonAnswer}</li>` 
    
    let symbol = isCorrect ? '✅' : '❌'
    let answer = `<h1 class="centered">${symbol}</h1> 
    <ul>
        ${yourAnswer}
        <li>${job.job} is ${correctAnswer} (${percentBlue}% democrat)</li>
        ${globalAccuracyMessage}
    </ul>
    <p class="centered" style="color:gray; font-size:10px;">
        (according to campaign contributions by job title, from the FEC)
    </p>
    <center>
        <p style="color:gray" id="loading-text">saving data...</p>
        <button id="next-btn" class="button" style="display:none">Next</button>
    </center>
    `
    document.querySelector("#result-answer").innerHTML = answer

    // Submit answer to DB
    const submittedJobTitle = job.job.toLowerCase()
    let result;
    try {
        result = await (await fetch(`${SERVER_URL}insert-guess`, {
            method: "POST",
            body: JSON.stringify({ 
                user_id: USER_ID, 
                guess:choice, 
                job_title: submittedJobTitle, 
                correct: isCorrect 
            }),
        })).text()
    } catch (e) {
        console.log(e)
    }
    
    const loadingText = document.querySelector("#loading-text")
    if (result != "done") {
        loadingText.style = 'color:red'
        loadingText.innerText = "Error saving data! See browser console for more info"
    } else {
        loadingText.style.display = 'none'
    }

    const isDone = (unanswered_job_data.length == JOB_INDEX + 1)
    if (!isDone) {
        JOB_INDEX++
        job = unanswered_job_data[JOB_INDEX]
        document.querySelector("#job-text").innerText = job.job
        document.querySelector("#count-text").innerText = `${job_data.length - unanswered_job_data.length + JOB_INDEX} / ${job_data.length}`
    }

    localStorage.setItem('results', JSON.stringify(storedResults))
    displayLocalAccuracy()
    
    document.querySelector("#next-btn").style.display = 'block'
    document.querySelector("#next-btn").onclick = async () => {  
        // add comment if one is found
        // const comment = document.querySelector("#comment").value 
        // if (comment.length > 0) {
        //     console.log("Submitting comment..")
        //     const result = await (await fetch(`${SERVER_URL}add-comment`, {
        //         method: "POST",
        //         body: JSON.stringify({ 
        //             user_id: USER_ID, 
        //             job_title: submittedJobTitle, 
        //             comment: comment 
        //         }),
        //     })).text()
        //     console.log("Submit comment result:", result)
        // }
        
        if (isDone) {
            window.location.href = 'results.html'
            return
        }

        document.querySelector("#question").style.display = 'flex'
        document.querySelector("#job-title").style.display = 'block'
        document.querySelector("#result").style.display = 'none'
    }
}


document.querySelector("#republican-btn").onclick = (e) => {
    submitResult("republican")
}
document.querySelector("#democrat-btn").onclick = (e) => {
    submitResult("democrat")
}
document.querySelector("#mixed-btn").onclick = (e) => {
    submitResult("mixed")
}

function makePercent(num) {
    const result = Math.round(num * 100)
    if (isNaN(result)) {
        return '_'
    }
    return result
}



function displayLocalAccuracy() {
    const result = computeLocalAccuracy()
    if (!result.accuracy) return
    const { democrat, republican, mixed, accuracy } = result 
    document.querySelector("#your-accuracy").innerText = 
    `${makePercent(accuracy)}% - D (${makePercent(democrat.correct / democrat.total)}%) - R (${makePercent(republican.correct / republican.total)}%) - M (${makePercent(mixed.correct / mixed.total)}%)`
    
}
