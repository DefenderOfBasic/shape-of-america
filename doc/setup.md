# Local Setup

Run the frontend with `pnpm install` and `pnpm dev` in the root directory.

The backend is CloudFlare workers, and is optional. If not found the app will just store data locally and allow users to export it. That way you can deploy this app for free with GitHub pages and collect the data from your users with a google form or something.

The server URL in [src/util.js](../src/util.js).

### Backend

To run the backend, go in `src/server/`:

```cmd
pnpm install 

pnpm init-db # this runs init.sql to create the tables locally

pnpm dev # starts the server locally
```

To deploy the backend, login with the CloudFlare CI, update the project details in `wrangler.toml` and run `pnpm deploy-worker`. If you've never used CloudFlare before, see:

- Getting started: https://developers.cloudflare.com/d1/get-started/
- Client API for the DB: https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/

Update the server URL in [src/util.js](../src/util.js)

### Routes

The server entry point is in [index.js](../src/server/src/index.js). They're all defined as functions for a given url path

```js
const functionsForPaths = {
	'/user-data': getUserData, 
	'/user-count': getUsersCount,
	'/insert-guess': insertGuess,
```

To add a new one, just create a new entry in this map. 

### Database

The DB schema is in [init.sql](../src/server/sql/init.sql). You can make changes to it and re-run `pnpm init-db` and it will drop & recreate the table. 

This command runs locally unless you add the `--remote` flag:

```
pnpm init-db --remote
```