# Cloudflare DB Worker

Instructions from: https://developers.cloudflare.com/d1/get-started/.

Create the DB:

```
npx wrangler d1 create shape-of-america
```

Init DB locally or prod (runs `sql/init.sql`)

```
pnpm init-db
pnpm init-db --remote
```

Run it locally with `pnpm dev`. 

To deploy:

```
pnpm deploy-worker
```

