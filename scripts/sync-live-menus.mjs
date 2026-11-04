/**
 * Compares the live menu copies in R2 (menus/<slug>.json in the public bucket, which customer pages
 * read) with the database's published_menus, which records what should be live.
 *
 *   npm run menus:sync            report only; exits 1 if anything differs
 *   npm run menus:sync -- --write make R2 match the database
 *
 * Publishing and unpublishing keep the two in step. Use this after a publish reported that the
 * live menu couldn't be updated, or to rebuild the copies from the database. Never prints
 * credentials.
 */
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const write = process.argv.includes("--write");
const env = process.env;
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PUBLIC_BUCKET",
];
const missing = required.filter((k) => !env[k]);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});
const Bucket = env.R2_PUBLIC_BUCKET;
const PREFIX = "menus/";

// Same read customers' menus were checked against: the anonymous key sees published menus only.
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: published, error } = await supabase.from("published_menus").select("slug, snapshot");
if (error) {
  console.error(`Couldn't read published_menus: ${error.message}`);
  process.exit(1);
}

const inR2 = new Set();
for (let token; ; ) {
  const page = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: PREFIX, ContinuationToken: token }));
  for (const o of page.Contents ?? []) if (o.Key.endsWith(".json")) inR2.add(o.Key.slice(PREFIX.length, -".json".length));
  if (!page.IsTruncated) break;
  token = page.NextContinuationToken;
}

/** JSON with sorted keys, so the comparison ignores key order. */
const canonical = (v) =>
  Array.isArray(v)
    ? `[${v.map(canonical).join(",")}]`
    : v && typeof v === "object"
      ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`
      : JSON.stringify(v);

let drift = 0;
const fix = async (label, action) => {
  drift++;
  console.log(`${write ? "FIX " : "DIFF"}  ${label}`);
  if (write) await action();
};

for (const { slug, snapshot } of published) {
  const Key = `${PREFIX}${slug}.json`;
  const put = () =>
    s3.send(
      new PutObjectCommand({ Bucket, Key, Body: JSON.stringify(snapshot), ContentType: "application/json", CacheControl: "public, max-age=60" }),
    );
  if (!inR2.has(slug)) {
    await fix(`${slug}: live in the database (v${snapshot.version}) but has no copy in R2`, put);
    continue;
  }
  const res = await s3.send(new GetObjectCommand({ Bucket, Key }));
  const copy = JSON.parse(await res.Body.transformToString());
  if (canonical(copy) === canonical(snapshot)) console.log(`OK    ${slug}: v${snapshot.version}`);
  else await fix(`${slug}: R2 has v${copy.version}, the database has v${snapshot.version}`, put);
}

const live = new Set(published.map((p) => p.slug));
for (const slug of inR2) {
  if (!live.has(slug))
    await fix(`${slug}: not published, but customers can still open its R2 copy`, () =>
      s3.send(new DeleteObjectCommand({ Bucket, Key: `${PREFIX}${slug}.json` })),
    );
}

console.log(
  drift === 0
    ? `\n${published.length} live menu(s), all in step.`
    : write
      ? `\nFixed ${drift} difference(s).`
      : `\n${drift} difference(s). Run npm run menus:sync -- --write to fix them.`,
);
process.exit(drift && !write ? 1 : 0);
