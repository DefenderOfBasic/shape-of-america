import { data } from './data/data'
import { getPoliticalType, SERVER_URL } from './util'

const jobsMap = {}
for (let i = 0; i < data.length; i++) {
    const job_title = data[i][0]
    let percentBlue = Math.round(parseFloat(data[i][1]))
    let correctAnswer = getPoliticalType(percentBlue)
    jobsMap[job_title.toLowerCase()] = correctAnswer
}
async function init() {
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.has('userid')) {
        return
    }

    const userId = searchParams.get('userid')

    const results = await (await fetch(`${SERVER_URL}user-data`, {
        method: "POST",
        body: JSON.stringify({ 
            user_id: userId
        }),
    })).json()

    document.querySelector("#user-id").innerText = userId
    document.querySelector("#results-container").style.display = 'block'
    document.querySelector("#loading").style.display = 'none'

    ////////// display results in table
    displayResultsInTable(results)

    // Download button
    document.querySelector("#download-data-btn").onclick = () => {
      const csvData = jsonToCSV(results);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'shape-of-america-user-data.csv');
      a.click();
      window.URL.revokeObjectURL(url);
    }

    /// Sort table
    const localTable = document.querySelector("#results-table-container")
    localTable.querySelectorAll('th')
    .forEach(th => th.addEventListener('click', ((e) => {
        if (window.column_toggled == undefined) window.column_toggled = {}
        const idx = Number(e.target.dataset.index)
        window.column_toggled[idx] = !window.column_toggled[idx]
        sortTable(idx, localTable, window.column_toggled[idx])
    })));

}

init()

function displayResultsInTable(guesses) {
    const correct_num = guesses.filter(g => g.correct).length
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

    const democratResults = getSummary(guesses, 'democrat')
    const repulicanResults = getSummary(guesses, 'republican')
    const mixedResults = getSummary(guesses, 'mixed')

    const resultsSummaryElement = document.querySelector("#results-summary")

    resultsSummaryElement.innerHTML = 
    `Accuracy: ${accuracy}%: (${correct_num} / ${guesses.length}) correct.
    <ul>
      <li>Democrat: (${democratResults.correct}/${democratResults.total}) correct</li>
      <li>Republican: (${repulicanResults.correct}/${repulicanResults.total}) correct</li>
      <li>Mixed: (${mixedResults.correct}/${mixedResults.total}) correct</li>
    </ul>
    `
}

////////// helpers
function getSummary(guesses, filterSearchTerm) {
    const filtered = guesses.filter(g => g.answer == filterSearchTerm)
    const correct_num = filtered.filter(g => g.correct).length
    return { total: filtered.length, correct: correct_num}
  }

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

function jsonToCSV(jsonData) {
    const keys = Object.keys(jsonData[0]);
    const csvRows = [keys.join(",")];
  
    jsonData.forEach(row => {
        const values = keys.map(key => `"${row[key]}"`);
        csvRows.push(values.join(","));
    });
  
    return csvRows.join("\n");
  }
  