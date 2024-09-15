# Data

Extracted from: https://www.zippia.com/advice/democratic-vs-republican-jobs/

> We analyzed data from the FEC on campaign contributions by job title.

[data.js](../src/data/data.js) contains a JSON version of the table from this article. It's `[job_title, percent_democrat]`. Total: 497 jobs.

```json
[["Physician","58.5%"],["Realtor","46.7%"], ... ]
```

[augmented_data.js](../src/data/augmented_data.js) contains "LLM guesses" to democrat/republican. This is generated from creating a vector embedding for the phrases "democrat, left wing", "republican, right wing" and getting the cosine distance to each job. This helps us find jobs whose politicial orientation may be "surprising" to most people 

```json
{ 
    "job": "Campaign Director",
    "percentBlue":89.4,
    "red_score":0.7831823266945259,
    "blue_score":0.8063311308136829
}
```

### Scripts

[explore_data.js](../scripts/explore_data.js) prints various stats. Run it on commandline:

```
node scripts/explore_data.js
```

[generate_quiz_subset.js](../scripts/generate_quiz_subset.js) generates [data/final.json](../src/data/final.json) which is a handpicked subset that I thought would be most fun/interesting to guess.