import "server-only";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 through its S3 API, server side only. The token behind R2_ACCESS_KEY_ID can read
 * and write objects in the two DekhKhao buckets and nothing else (see infra/r2/README.md).
 */
function readSettings() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PRIVATE_BUCKET, R2_PUBLIC_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PRIVATE_BUCKET || !R2_PUBLIC_BUCKET) return null;
  return { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PRIVATE_BUCKET, R2_PUBLIC_BUCKET };
}

function settings() {
  const s = readSettings();
  if (!s) throw new Error("R2 is not configured: set the R2_* variables (see .env.example).");
  return s;
}

export const isR2Configured = () => readSettings() !== null;

const isNotFound = (e: unknown) => (e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404;

let client: S3Client | undefined;
function s3() {
  const s = settings();
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${s.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: s.R2_ACCESS_KEY_ID, secretAccessKey: s.R2_SECRET_ACCESS_KEY },
    // R2 doesn't support the SDK's default CRC32 checksums on presigned uploads.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

const UPLOAD_URL_TTL = 10 * 60;
const PREVIEW_URL_TTL = 15 * 60;
/** Published keys never change (a replaced file gets a new key), so they can be cached for good. */
const PUBLIC_CACHE_CONTROL = "public, max-age=31536000, immutable";

/**
 * Signed URL the browser uploads one file to. Type and exact size are part of the signature,
 * so the URL can't be reused for a different kind of file or a bigger one (scripts/check-r2.mjs).
 */
export function signUpload(key: string, contentType: string, size: number) {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: settings().R2_PRIVATE_BUCKET, Key: key, ContentType: contentType, ContentLength: size }),
    { expiresIn: UPLOAD_URL_TTL, signableHeaders: new Set(["content-type", "content-length"]) },
  );
}

/** Short-lived link to a private file, for previews in the admin. */
export function signPreview(key: string) {
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: settings().R2_PRIVATE_BUCKET, Key: key }), {
    expiresIn: PREVIEW_URL_TTL,
  });
}

/** Size and type of an uploaded private file, or null if it isn't there. */
export async function headPrivate(key: string) {
  try {
    const res = await s3().send(new HeadObjectCommand({ Bucket: settings().R2_PRIVATE_BUCKET, Key: key }));
    return { size: res.ContentLength ?? 0, contentType: res.ContentType ?? "" };
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

/** First `length` bytes of a private file, to check what it really is. */
export async function readPrivateStart(key: string, length: number) {
  const res = await s3().send(
    new GetObjectCommand({ Bucket: settings().R2_PRIVATE_BUCKET, Key: key, Range: `bytes=0-${length - 1}` }),
  );
  return res.Body ? await res.Body.transformToByteArray() : new Uint8Array();
}

/** Copies a private file into the public bucket under the same key. */
export async function publishFile(key: string, contentType: string) {
  const s = settings();
  await s3().send(
    new CopyObjectCommand({
      Bucket: s.R2_PUBLIC_BUCKET,
      Key: key,
      CopySource: `${s.R2_PRIVATE_BUCKET}/${key}`,
      MetadataDirective: "REPLACE",
      ContentType: contentType,
      CacheControl: PUBLIC_CACHE_CONTROL,
    }),
  );
}

export async function deletePublicFile(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: settings().R2_PUBLIC_BUCKET, Key: key }));
}

export async function deletePrivateFile(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: settings().R2_PRIVATE_BUCKET, Key: key }));
}

/**
 * Deletes every file stored for a restaurant (keys under restaurants/<id>/) from both buckets,
 * whether or not the database still has a record of it. Public copies go first. Returns how many
 * files were deleted.
 */
export async function deleteRestaurantFiles(restaurantId: string) {
  const s = settings();
  const Prefix = `restaurants/${restaurantId}/`;
  let deleted = 0;
  for (const Bucket of [s.R2_PUBLIC_BUCKET, s.R2_PRIVATE_BUCKET]) {
    for (let token: string | undefined; ; ) {
      const page = await s3().send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken: token }));
      for (const { Key } of page.Contents ?? []) {
        if (!Key) continue;
        await s3().send(new DeleteObjectCommand({ Bucket, Key }));
        deleted++;
      }
      if (!page.IsTruncated) break;
      token = page.NextContinuationToken;
    }
  }
  return deleted;
}

/**
 * The live copy of each published menu, in the public bucket next to its files. Customer pages
 * read this copy (src/catalog/published.ts), so a paused or unreachable database never takes a QR
 * menu offline. The database's published_menus stays the record of what is live;
 * `npm run menus:sync` compares the two.
 */
const liveMenuKey = (slug: string) => `menus/${slug}.json`;

export async function writeLiveMenu(slug: string, snapshot: unknown) {
  await s3().send(
    new PutObjectCommand({
      Bucket: settings().R2_PUBLIC_BUCKET,
      Key: liveMenuKey(slug),
      Body: JSON.stringify(snapshot),
      ContentType: "application/json",
      // The app reads through the S3 API, which isn't cached; this only limits a CDN in front.
      CacheControl: "public, max-age=60",
    }),
  );
}

/** The live menu snapshot for `slug`, or null if it has none. */
export async function readLiveMenu(slug: string): Promise<unknown> {
  try {
    const res = await s3().send(new GetObjectCommand({ Bucket: settings().R2_PUBLIC_BUCKET, Key: liveMenuKey(slug) }));
    return res.Body ? JSON.parse(await res.Body.transformToString()) : null;
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

export async function deleteLiveMenu(slug: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: settings().R2_PUBLIC_BUCKET, Key: liveMenuKey(slug) }));
}
