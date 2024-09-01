import { createClient } from '@supabase/supabase-js'
import { data } from './data'
import { computeLocalAccuracy, computeGlobalAccuracy } from './util'

// reset url to index, so if user refreshes they start over
history.pushState({},"","/")

const supabaseUrl = 'https://pkgxnfwivssmtjkgtmco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZ3huZndpdnNzbXRqa2d0bWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4ODY1NDAsImV4cCI6MjA0MDQ2MjU0MH0.j6OvsbNHBPhorsj7romHyvdvcXPi3vrD0xsaODz-5zM'
const supabase = createClient(supabaseUrl, supabaseKey)

if (!localStorage.getItem('user_id')) {
    localStorage.setItem('user_id', self.crypto.randomUUID())
    localStorage.setItem('job_index', 0)
    localStorage.setItem('results', JSON.stringify({ guesses: [] }))
}
const USER_ID = localStorage.getItem('user_id')
let JOB_INDEX = localStorage.getItem('job_index')
const storedResults = JSON.parse(localStorage.getItem('results'))
displayLocalAccuracy()

const jobTitleElement = document.querySelector("#job-title")
let job = data[JOB_INDEX]
jobTitleElement.innerText = job[0]

async function submitResult(choice) {
    document.querySelector("#question").style.display = 'none'
    document.querySelector("#job-title").style.display = 'none'
    document.querySelector("#result").style.display = 'flex'

    let percentBlue = Math.round(parseFloat(job[1]))
    let percentRed = Math.round(100 - percentBlue)

    let className = 'blue'
    if (choice == 'republican') className = 'red'
    else if (choice == 'mixed') className = 'mixed'

    let correctAnswer = 'democrat'
    if (percentBlue < 60 && percentBlue > 40) {
        correctAnswer = 'mixed'
    } else if (percentBlue < 50) {
        correctAnswer = 'republican'
    }
    const isCorrect = choice === correctAnswer

    storedResults.guesses.push({ correct: isCorrect, job_title: job[0], guess: choice  })

    let yourAnswer = isCorrect ? '' : `You answered: <span class="${className}">${choice}</span>. `
    
    let symbol = isCorrect ? '✅' : '❌'
    let answer = `<h1 class="centered">${symbol}</h1> 
    <p class="centered">${yourAnswer}${job[0]} is ${correctAnswer} (${percentBlue}% democrat, ${percentRed}% republican)</p>
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
    const { error } = await supabase
        .from('user_guesses')
        .insert({ user_id: USER_ID, 
                job_title: job[0].toLowerCase(), 
                guess: choice, 
                correct: isCorrect })

    const loadingText = document.querySelector("#loading-text")
    if (error) {
        loadingText.style = 'color:red'
        loadingText.innerText = "Error saving data! See browser console for more info"
        console.error(error)
    } else {
        loadingText.style.display = 'none'
    }
    JOB_INDEX++
    localStorage.setItem('job_index', JOB_INDEX)
    job = data[JOB_INDEX]
    jobTitleElement.innerText = job[0]

    localStorage.setItem('results', JSON.stringify(storedResults))
    displayLocalAccuracy()
    
    document.querySelector("#next-btn").style.display = 'block'
    document.querySelector("#next-btn").onclick = () => {        

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


computeGlobalAccuracy(supabase)
