import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pkgxnfwivssmtjkgtmco.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZ3huZndpdnNzbXRqa2d0bWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4ODY1NDAsImV4cCI6MjA0MDQ2MjU0MH0.j6OvsbNHBPhorsj7romHyvdvcXPi3vrD0xsaODz-5zM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function init() {
  const { data, error, status, count } = await supabase
      .from('user_guesses')
      .select('user_id', { count: 'exact' })

    const numberOfGuesses = new Intl.NumberFormat().format(data.length)
    const userMap = {}
    for (let i = 0; i < data.length; i++) {
        userMap[data[i].user_id] = true
    }
    const numberOfUsers = new Intl.NumberFormat().format(Object.keys(userMap).length)
    const responsesElement = document.querySelector("#responses")
    if (!error) {
        responsesElement.innerHTML = `${numberOfGuesses} responses so far from ${numberOfUsers} users`
        responsesElement.style.display = 'inline-block'
    }

    // const results = await supabase
    //   .from('job_metrics')
    //   .select('*')
    //   .eq('job_title', 'realtor')

    //   console.log(results)

}

init()