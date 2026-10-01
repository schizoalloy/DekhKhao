/**
 * Checks the app's R2 credentials do what the upload/publish flow needs, and nothing more.
 *
 *   npm run r2:check
 *
 * Writes, reads, copies and deletes one small test object under `_healthcheck/` in each bucket,
 * checks the browser upload path (signed PUT URL + CORS), and confirms the token can't manage
 * buckets. Never prints credentials. Leaves nothing behind.
 */
import {
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PRIVATE_BUCKET, R2_PUBLIC_BUCKET } = process.env;
const missing = Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PRIVATE_BUCKET, R2_PUBLIC_BUCKET })
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  // R2 doesn't support the SDK's default CRC32 checksums on presigned uploads.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

let failed = 0;
const ok = (name, detail = "") => console.log(`PASS  ${name}${detail ? `  (${detail})` : ""}`);
const bad = (name, detail) => (failed++, console.log(`FAIL  ${name}\n      ${detail}`));
async function step(name, fn) {
  try {
    const detail = await fn();
    ok(name, detail);
  } catch (e) {
    bad(name, `${e.name}: ${e.message}`);
  }
}
async function denied(name, fn) {
  try {
    await fn();
    bad(name, "expected AccessDenied, but it succeeded");
  } catch (e) {
    const status = e.$metadata?.httpStatusCode;
    status === 403 || /AccessDenied|Unauthorized/i.test(e.name) ? ok(name, `${status} ${e.name}`) : bad(name, `unexpected error ${status} ${e.name}: ${e.message}`);
  }
}

const id = randomUUID();
const privateKey = `_healthcheck/${id}.txt`;
const uploadKey = `_healthcheck/${id}-signed.glb`;
const publicKey = `_healthcheck/${id}.txt`;
const body = `dekhkhao r2 check ${new Date().toISOString()}`;

console.log("-- private bucket (server) --");
await step("put object", async () => {
  await s3.send(new PutObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: privateKey, Body: body, ContentType: "text/plain" }));
});
await step("head object", async () => {
  const h = await s3.send(new HeadObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: privateKey }));
  return `${h.ContentLength} bytes, ${h.ContentType}`;
});
await step("get object round-trips", async () => {
  const g = await s3.send(new GetObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: privateKey }));
  const text = await g.Body.transformToString();
  if (text !== body) throw new Error("content mismatch");
});

console.log("\n-- browser upload path --");
const glbBytes = Buffer.concat([Buffer.from("glTF"), Buffer.alloc(16)]);
let putUrl;
await step("sign a PUT URL locked to one content type and size", async () => {
  putUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: R2_PRIVATE_BUCKET,
      Key: uploadKey,
      ContentType: "model/gltf-binary",
      ContentLength: glbBytes.length,
    }),
    // The SDK leaves these out of the signature unless asked, which would let a browser
    // upload any type or size with the URL.
    { expiresIn: 300, signableHeaders: new Set(["content-type", "content-length"]) },
  );
  return "expires in 5 min";
});
for (const [origin, expectAllowed] of [
  ["http://localhost:3000", true],
  ["https://dekh-khao.vercel.app", true],
  ["https://not-ours.example", false],
]) {
  await step(`CORS preflight from ${origin} ${expectAllowed ? "allowed" : "refused"}`, async () => {
    const res = await fetch(putUrl, {
      method: "OPTIONS",
      headers: { Origin: origin, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type" },
    });
    const allowed = res.headers.get("access-control-allow-origin") === origin;
    if (allowed !== expectAllowed) throw new Error(`status ${res.status}, allow-origin=${res.headers.get("access-control-allow-origin")}`);
    return `status ${res.status}`;
  });
}
await step("upload through the signed URL", async () => {
  const res = await fetch(putUrl, { method: "PUT", headers: { "Content-Type": "model/gltf-binary" }, body: glbBytes });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  return `HTTP ${res.status}`;
});
await step("signed URL refuses a different content type", async () => {
  const fake = Buffer.alloc(glbBytes.length, "<");
  const res = await fetch(putUrl, { method: "PUT", headers: { "Content-Type": "text/html" }, body: fake });
  if (res.ok) throw new Error(`accepted text/html (HTTP ${res.status})`);
  return `HTTP ${res.status}`;
});
await step("signed URL refuses a different size", async () => {
  const bigger = Buffer.concat([glbBytes, Buffer.alloc(1024)]);
  const res = await fetch(putUrl, { method: "PUT", headers: { "Content-Type": "model/gltf-binary" }, body: bigger });
  if (res.ok) throw new Error(`accepted ${bigger.length} bytes (HTTP ${res.status})`);
  return `HTTP ${res.status}`;
});
await step("uploaded file keeps its content type", async () => {
  const h = await s3.send(new HeadObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: uploadKey }));
  if (h.ContentType !== "model/gltf-binary") throw new Error(`got ${h.ContentType}`);
  return h.ContentType;
});
await step("signed GET URL (admin preview) works", async () => {
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: uploadKey }), { expiresIn: 300 });
  const res = await fetch(url, { headers: { Origin: "http://localhost:3000" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const magic = Buffer.from(await res.arrayBuffer()).subarray(0, 4).toString();
  if (magic !== "glTF") throw new Error(`magic bytes ${magic}`);
  return `HTTP ${res.status}, magic "${magic}", allow-origin ${res.headers.get("access-control-allow-origin")}`;
});
await step("unsigned GET is refused", async () => {
  const res = await fetch(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_PRIVATE_BUCKET}/${uploadKey}`);
  if (res.ok) throw new Error(`private object readable without a signature (HTTP ${res.status})`);
  return `HTTP ${res.status}`;
});

console.log("\n-- publish path --");
await step("copy private -> public bucket", async () => {
  await s3.send(
    new CopyObjectCommand({ Bucket: R2_PUBLIC_BUCKET, Key: publicKey, CopySource: `${R2_PRIVATE_BUCKET}/${privateKey}` }),
  );
  const h = await s3.send(new HeadObjectCommand({ Bucket: R2_PUBLIC_BUCKET, Key: publicKey }));
  return `${h.ContentLength} bytes, ${h.ContentType}`;
});

console.log("\n-- clean up --");
await step("delete test objects", async () => {
  await s3.send(new DeleteObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: privateKey }));
  await s3.send(new DeleteObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: uploadKey }));
  await s3.send(new DeleteObjectCommand({ Bucket: R2_PUBLIC_BUCKET, Key: publicKey }));
});
await step("deleted objects are gone", async () => {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: privateKey }));
    throw new Error("still there");
  } catch (e) {
    if (e.$metadata?.httpStatusCode !== 404) throw e;
  }
});

console.log("\n-- least privilege --");
await denied("token cannot list all buckets", () => s3.send(new ListBucketsCommand({})));
await denied("token cannot create buckets", () => s3.send(new CreateBucketCommand({ Bucket: `dekhkhao-probe-${id.slice(0, 8)}` })));

console.log(failed ? `\n${failed} check(s) failed` : "\nAll R2 checks passed");
process.exit(failed ? 1 : 0);
