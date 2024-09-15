import { data } from './data/data'
import { getPoliticalType } from './util'

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


const resultsSummaryElement = document.querySelector("#results-summary")
if (localStorage.getItem('results')) {
    const results = JSON.parse(localStorage.getItem('results'))
    const guesses = results.guesses
    const correct_num = results.guesses.filter(g => g.correct).length
    const accuracy = Math.round(((correct_num) / (guesses.length)) * 100)

    resultsSummaryElement.textContent = `Accuracy: ${accuracy}%. Total answered: ${guesses.length}. Correct: ${correct_num}`
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


function sortTable(columnIndex, asc = true) {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.querySelector("#results-table-container");
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

        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
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

document.querySelector("#results-table-container").querySelectorAll('th')
.forEach(th => th.addEventListener('click', ((e) => {
    if (window.column_toggled == undefined) window.column_toggled = {}
    const idx = e.target.dataset.index
    window.column_toggled[idx] = !window.column_toggled[idx]
    sortTable(idx, window.column_toggled[idx])
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
