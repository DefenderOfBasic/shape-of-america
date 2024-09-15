# 🧩 Shape of America 🧩

[defenderofbasic.github.io/shape-of-america](https://defenderofbasic.github.io/shape-of-america/)

Source data for this game is from FEC campaign donations, see: [data.md](doc/data.md).

### Results

Live results are at the bottom of this page:

https://defenderofbasic.github.io/shape-of-america/results.html

You can download it as CSV as well on that page. You can also query it directly from the API:

```js
const response = await fetch("https://shape-of-america-worker.defenderofbasic.workers.dev/global-tally")
const data = await response.json()
// list of jobs and how many guesses of each category 
// [{ id: 2, job_title: 'cashier', answer: 'democrat', democrat: 12, republican: 6, mixed: 1 }, .. ]
```

### Local setup

See [setup.md](doc/setup.md). 