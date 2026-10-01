# Cloudflare R2

Two buckets, both with the `apac` location hint:

| Bucket | Holds | Public? |
| --- | --- | --- |
| `dekhkhao-assets` | Every upload from the admin console (drafts and originals). Admin previews use short-lived signed URLs. | Never |
| `dekhkhao-public` | Copies of the files a published menu uses, made when a menu is published and removed when it stops being used. | Only once a delivery domain is approved and connected |

The app reaches both through the S3 API with one R2 token limited to **Object Read & Write** on these two buckets
(`R2_*` variables in `.env.example`). Bucket settings are managed with Wrangler, logged in on an admin's machine,
never by the app.

## CORS

Browsers upload straight to the private bucket with signed `PUT` URLs, and `<model-viewer>` fetches models with
`fetch`, so both buckets need CORS for the app's origins. AR Quick Look and Scene Viewer fetch natively and don't
use CORS.

```bash
npx wrangler r2 bucket cors set dekhkhao-assets --file infra/r2/cors-private.json --force
npx wrangler r2 bucket cors set dekhkhao-public --file infra/r2/cors-public.json --force
npx wrangler r2 bucket cors list dekhkhao-assets
```

Add an origin to both files and re-run these when the app gets a new domain. Vercel preview URLs aren't listed, so
uploads only work from `localhost:3000` and the production domain.

## Recreating from scratch

```bash
npx wrangler r2 bucket create dekhkhao-assets --location apac
npx wrangler r2 bucket create dekhkhao-public --location apac
# then the CORS commands above
```
