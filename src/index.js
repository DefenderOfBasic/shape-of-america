import { SERVER_URL } from './util'
console.log({ SERVER_URL })

async function init() {
    const { total_rows, unique_user_count } = await (await fetch(`${SERVER_URL}user-count`)).json()

    const numberOfGuesses = new Intl.NumberFormat().format(total_rows)
    const numberOfUsers = new Intl.NumberFormat().format(unique_user_count)
    const responsesElement = document.querySelector("#responses")
    responsesElement.innerHTML = `${numberOfGuesses} responses so far from ${numberOfUsers} users`
    responsesElement.style.display = 'inline-block'

    await plotPlayerDistribution()
    document.querySelector("#chart-loading").style.display = 'none'
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

async function plotPlayerDistribution() {

    const globalUserSummary = await (await fetch(`${SERVER_URL}global-user-summary`)).json()




    function binData(data, N) {
        // Step 1: Calculate accuracy for each user
        let accuracies = data.map((item) => ({
          ...item,
          total: item.total,
          accuracy: Math.round((item.correct / item.total) * 100)
        }));
    
        // remove any that answered less than 21
        accuracies = accuracies.filter(item => item.total >= 21)
    
      
        // Step 3: Calculate the bucket size
        const bucketSize = 100 / N;
      
        // Step 4: Initialize the buckets array
        const buckets = Array.from({ length: N }, () => []);
      
        // Step 5: Distribute data into the appropriate buckets
        accuracies.forEach((item) => {
          // Determine the appropriate bucket index for each accuracy
          const bucketIndex = Math.min(
            Math.floor((item.accuracy - 0) / bucketSize),
            N - 1 // Ensure it falls within the bucket range
          );
      
          buckets[bucketIndex].push(item);
        });
    
        const binLabels = [];
        for (let i = 0; i < N; i++) {
            const lowerBound = ( i * bucketSize).toFixed(0); // Lower bound of the bin
            const upperBound = ((i + 1) * bucketSize).toFixed(0); // Upper bound of the bin
            binLabels.push(`${lowerBound} - ${upperBound}`);
          }
      
        return { buckets, labels: binLabels };
      }
    const binnedData = binData(globalUserSummary, 10)
    console.log(binnedData)
      const ctx = document.querySelector("#chart")
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: binnedData.labels,
          datasets: [{
            borderColor: '#fa6b6b',
          backgroundColor: '#fa6b6b',
            label: '',
            data: binnedData.buckets.map(item => item.length),
            borderWidth: 1
          }]
        },
        options: {
            
            plugins: {
                tooltip: {
                    enabled: false
                  },
                legend: {
                    display: false
                },
            },
          scales: {
            x: {
                title: {
                    display:true,
                    text: '% accuracy'
                },
            },
            y: {
                ticks: {
                    stepSize: 1
                  },
                title: {
                    display:true,
                    text: '# of players'
                },
              beginAtZero: true
            }
          }
        }
      });
}
