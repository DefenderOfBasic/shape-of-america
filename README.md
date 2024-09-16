# 🧩 Shape of America 🧩

[defenderofbasic.github.io/shape-of-america](https://defenderofbasic.github.io/shape-of-america/)

Source data for this game is from FEC campaign donations, see: [data.md](doc/data.md).

### Local setup

See [setup.md](doc/setup.md). 

### Results

Live results are at the bottom of this page:

https://defenderofbasic.github.io/shape-of-america/results.html

You can download it as CSV as well on that page. Or query it directly from the API:

```js
const response = await fetch("https://shape-of-america-worker.defenderofbasic.workers.dev/global-tally")
const data = await response.json()
// list of jobs and how many guesses of each category 
// [{ id: 2, job_title: 'cashier', answer: 'democrat', democrat: 12, republican: 6, mixed: 1 }, .. ]
```

To get all user comments left on individual guesses, query `/global-user-comments`. For individual user stats, do `/global-user-summary`.

I'd like to make the actual individual user guesses available too, what's an efficient way to do this? I can manually export the DB form CloudFlare and upload snapshots of that. Could automate this somehow?