// async function recount(request, env, ctx) {
// 	// re-update job_data from user guesses
// 	let { results } = await env.DB.prepare(
// 		`SELECT * FROM user_guesses`,
// 	).all();

// 	const user_guesses = results 

// 	for (let item of user_guesses) {
// 		const { guess, job_title } = item
// 		const valuesMap = { 'democrat': '1, 0, 0', 'republican': '0, 1, 0', 'mixed': '0, 0, 1'}
// 		await env.DB.prepare(`
// 		INSERT INTO job_data (job_title, democrat, republican, mixed)
// 		VALUES (?, ${valuesMap[guess]})
// 		ON CONFLICT (job_title) 
// 		DO UPDATE SET 
// 			democrat = job_data.democrat + EXCLUDED.democrat,
// 			republican = job_data.republican + EXCLUDED.republican,
// 			mixed = job_data.mixed + EXCLUDED.mixed;`).bind( job_title ).run();
// 	}

// 	return new Response("done", { headers: corsHeaders })
// }