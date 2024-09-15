import { SERVER_URL } from './util'
import job_data_subset from './data/final.json'
import { full_data } from './data/augmented_data'

import { computeLocalAccuracy, 
    computeGlobalAccuracy, getPoliticalType,shuffle } from './util'

let job_data = job_data_subset  
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has('infinite')) {
    job_data = full_data
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
shuffle(unanswered_job_data)

const USER_ID = localStorage.getItem('user_id')
let JOB_INDEX = 0
const storedResults = JSON.parse(localStorage.getItem('results'))
displayLocalAccuracy()

if (unanswered_job_data.length == 0) {
    // game is done! going to infinite mode
    window.location.href = '/gotoinfinite.html'
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

    let yourAnswer = isCorrect ? '' : `You answered: <span class="${className}">${choice}</span>. `
    
    let symbol = isCorrect ? '✅' : '❌'
    let answer = `<h1 class="centered">${symbol}</h1> 
    <p class="centered">${yourAnswer}${job.job} is ${correctAnswer} (${percentBlue}% democrat, ${percentRed}% republican)</p>
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
    const result = await (await fetch(`${SERVER_URL}insert-guess`, {
        method: "POST",
        body: JSON.stringify({ 
            user_id: USER_ID, 
            guess:choice, 
            job_title: job.job.toLowerCase(), 
            correct: isCorrect 
        }),
    })).text()

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
    document.querySelector("#next-btn").onclick = () => {      
        
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

function displayLocalAccuracy() {
    const accuracy = computeLocalAccuracy()
    if (!accuracy) return
    document.querySelector("#your-accuracy").innerText = Math.round(accuracy * 100)
}


computeGlobalAccuracy()
