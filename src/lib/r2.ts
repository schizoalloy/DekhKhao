import "server-only";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 through its S3 API, server side only. The token behind R2_ACCESS_KEY_ID can read
 * and write objects in the two DekhKhao buckets and nothing else (see infra/r2/README.md).
 */
function settings() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PRIVATE_BUCKET, R2_PUBLIC_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PRIVATE_BUCKET || !R2_PUBLIC_BUCKET)
    throw new Error("R2 is not configured: set the R2_* variables (see .env.example).");
  return { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PRIVATE_BUCKET, R2_PUBLIC_BUCKET };
}

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
    if ((e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return null;
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
