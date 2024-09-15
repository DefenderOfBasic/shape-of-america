import { SERVER_URL } from './util'
console.log({ SERVER_URL })

async function init() {
    const { total_rows, unique_user_count } = await (await fetch(`${SERVER_URL}user-count`)).json()

    const numberOfGuesses = new Intl.NumberFormat().format(total_rows)
    const numberOfUsers = new Intl.NumberFormat().format(unique_user_count)
    const responsesElement = document.querySelector("#responses")
    responsesElement.innerHTML = `${numberOfGuesses} responses so far from ${numberOfUsers} users`
    responsesElement.style.display = 'inline-block'
}

init()

if (localStorage.getItem('results')) {
    const results = JSON.parse(localStorage.getItem('results')) 
    if (results.guesses.length > 0) {
        document.querySelector("#results-text").innerHTML = 
        `Total answered: ${results.guesses.length}. Correct: ${results.guesses.filter(g => g.correct).length}`
    
        document.querySelector("#your-data-container").style.display = 'block'
    }

    
}
