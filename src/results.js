import { data } from './data/data'
import { getPoliticalType, SERVER_URL } from './util'

const jobsMap = {}
for (let i = 0; i < data.length; i++) {
    const job_title = data[i][0]
    let percentBlue = Math.round(parseFloat(data[i][1]))
    let correctAnswer = getPoliticalType(percentBlue)
    jobsMap[job_title] = correctAnswer
}

document.querySelector("#clear-btn").onclick = () => {
    const answer = confirm("Delete local data? (server data is retained in the public dataset)");
    if (answer) {
      localStorage.clear()
      window.location.href = '/'
    }
}

function getSummary(results, filterSearchTerm) {
  const filtered = results.guesses.filter(g => g.answer == filterSearchTerm)
  const correct_num = filtered.filter(g => g.correct).length
  return { total: filtered.length, correct: correct_num}
}

const resultsSummaryElement = document.querySelector("#results-summary")
if (localStorage.getItem('results')) {
    const results = JSON.parse(localStorage.getItem('results'))
    const guesses = results.guesses
    const correct_num = results.guesses.filter(g => g.correct).length
    const accuracy = Math.round(((correct_num) / (guesses.length)) * 100)

    const resultsTable = document.querySelector("#results-table")
    for (let i = 0; i < guesses.length; i++) {
        const currentGuess = guesses[i]
        const trNode = document.createElement("tr")
        const { job_title, guess } = currentGuess
        const correctAnswer = jobsMap[job_title]
        const symbol = (correctAnswer == guess) ? '✅' : '❌'
        currentGuess.answer = correctAnswer

        let className = 'blue'
        if (correctAnswer == 'republican') className = 'red'
        else if (correctAnswer == 'mixed') className = 'mixed'

        trNode.innerHTML = 
        `<td>${symbol}${job_title}</td>
        <td>${guess}</td>
        <td class=${className}>${correctAnswer}</td>`
        resultsTable.appendChild(trNode)
    }

    const democratResults = getSummary(results, 'democrat')
    const repulicanResults = getSummary(results, 'republican')
    const mixedResults = getSummary(results, 'mixed')

    resultsSummaryElement.innerHTML = 
    `Accuracy: ${accuracy}%. Total answered: ${guesses.length}. Correct: ${correct_num}
    <ul>
      <li>Democrat: (${democratResults.correct}/${democratResults.total}) correct</li>
      <li>Republican: (${repulicanResults.correct}/${repulicanResults.total}) correct</li>
      <li>Mixed: (${mixedResults.correct}/${mixedResults.total}) correct</li>
    </ul>
    `

    document.querySelector("#download-data-btn").onclick = () => {
      const csvData = jsonToCSV(guesses);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'shape-of-america-user-data.csv');
      a.click();
      window.URL.revokeObjectURL(url);
    }
} else {
    resultsSummaryElement.textContent = 'No results found!'
}

async function getGlobalResults() {
  const results = await (await fetch(`${SERVER_URL}global-tally`)).json()
  const resultsTable = document.querySelector("#global-results-table")
  for (let item of results) {
    const { job_title, democrat, republican, mixed, answer } = item 

    let correctCount = democrat
    if (answer == 'republican') correctCount = republican
    if (answer == 'mixed') correctCount = mixed 
    let accuracy = (correctCount) / (democrat + republican + mixed)
    accuracy = Math.round(accuracy * 100)

    const trNode = document.createElement("tr")
    trNode.innerHTML = 
        `<td>${job_title}</td>
        <td>${democrat}</td>
        <td>${republican}</td>
        <td>${mixed}</td>
        <td>${accuracy}%</td>`
    resultsTable.appendChild(trNode)
  }

  
  document.querySelector("#download-global-data-btn").onclick = () => {
    const csvData = jsonToCSV(results);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'shape-of-america-global-data.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

getGlobalResults()


function sortTable(columnIndex, table, asc = true) {
    let rows, switching, i, x, y, shouldSwitch;
    switching = true;

    while (switching) {
      switching = false;
      rows = table.rows;

      for (i = 1; i < rows.length - 1; i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[columnIndex];
        y = rows[i + 1].getElementsByTagName("td")[columnIndex];

        if (!asc) {
            let z = x 
            x = y 
            y = z
        }

        let strBool = x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()
        let numBool = parseInt(x.innerHTML.toLowerCase()) > parseInt(y.innerHTML.toLowerCase())
        let bool = strBool

        if (parseInt(x.innerHTML)) {
          bool = numBool
        } 
        if (bool) {
          shouldSwitch = true;
          break;
        }
      }

      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
}

const localTable = document.querySelector("#results-table-container")
localTable.querySelectorAll('th')
.forEach(th => th.addEventListener('click', ((e) => {
    if (window.column_toggled == undefined) window.column_toggled = {}
    const idx = Number(e.target.dataset.index)
    window.column_toggled[idx] = !window.column_toggled[idx]
    sortTable(idx, localTable, window.column_toggled[idx])
})));

const globalTable = document.querySelector("#global-results-table-container")
globalTable.querySelectorAll('th')
.forEach(th => th.addEventListener('click', ((e) => {
    if (window.column_toggled_global == undefined) window.column_toggled_global = {}
    const idx = Number(e.target.dataset.index)
    window.column_toggled_global[idx] = !window.column_toggled_global[idx]
    sortTable(idx, globalTable, window.column_toggled_global[idx])
})));




//// Helpers 

function jsonToCSV(jsonData) {
  const keys = Object.keys(jsonData[0]);
  const csvRows = [keys.join(",")];

  jsonData.forEach(row => {
      const values = keys.map(key => `"${row[key]}"`);
      csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}
