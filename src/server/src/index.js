/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 * 
 * https://developers.cloudflare.com/d1/get-started/
 * https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/
 */

import { jobsMap } from "../../util";

const functionsForPaths = {
	'/user-data': getUserData, 
	'/user-count': getUsersCount,
	'/insert-guess': insertGuess,
	'/global-accuracy': globalAccuracy,
	'/global-tally': globalTally
}

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
	"Access-Control-Max-Age": "86400"
  };

export default {
	async fetch(request, env, ctx) {
		const { pathname } = new URL(request.url);
	
		if (functionsForPaths[pathname]) {
			return await functionsForPaths[pathname](request, env, ctx)
		}

		return new Response('');
	},
};

async function globalTally(request, env, ctx) {
	const { results } = 
	await env.DB.prepare(`
	SELECT * FROM job_data`).all();

	return Response.json(results, { headers: corsHeaders })
}


async function globalAccuracy(request, env, ctx) {
	const results = await env.DB.prepare(
		`SELECT 
			SUM(CASE WHEN correct = true THEN 1 ELSE 0 END) AS correct,
			SUM(CASE WHEN correct = false THEN 1 ELSE 0 END) AS incorrect
		FROM user_guesses;
	`,
	).first();
	return Response.json(results, { headers: corsHeaders })
}

async function insertGuess(request, env, ctx) {
	const jsonBody = await request.json()
	const { user_id, job_title, guess, correct } = jsonBody

	if (!jobsMap[job_title]) {
		const message = `Invalid job: ${job_title}`
		return new Response(message, {status: 400, statusText: message })
	}
	if (guess != 'democrat' && guess != 'republican' && guess != 'mixed') {
		const message = `Invalid guess: ${guess}`
		return new Response(message, {status: 400, statusText: message })
	}

	await env.DB.prepare(`
		INSERT INTO user_guesses (user_id, job_title, guess, correct)
		VALUES (?1, ?2, ?3, ?4)`)
	.bind(user_id, job_title, guess, correct).run();

	// keep a tally of how many global have guessed this
	const valuesMap = { 'democrat': '1, 0, 0', 'republican': '0, 1, 0', 'mixed': '0, 0, 1'}
	await env.DB.prepare(`
	INSERT INTO job_data (job_title, democrat, republican, mixed)
	VALUES (?, ${valuesMap[guess]})
	ON CONFLICT (job_title) 
	DO UPDATE SET 
		democrat = job_data.democrat + EXCLUDED.democrat,
		republican = job_data.republican + EXCLUDED.republican,
		mixed = job_data.mixed + EXCLUDED.mixed;`).bind( job_title ).run();

	return new Response("done", { headers: corsHeaders })
}

async function getUserData(request, env, ctx) {
	const jsonBody = await request.json()
	const { user_id } = jsonBody

	const { results } = await env.DB.prepare(
		`SELECT * FROM user_guesses WHERE user_id = ${user_id}`,
	).all();
	return Response.json(results, { headers: corsHeaders })
}

async function getUsersCount(request, env, ctx) {
	const results = await env.DB.prepare(`
SELECT 
    COUNT(*) AS total_rows,
    COUNT(DISTINCT user_id) AS unique_user_count
FROM user_guesses;
		`).first();
	return Response.json(results, { headers: corsHeaders })
}

