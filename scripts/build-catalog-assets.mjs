/**
 * Prepares a restaurant's 3D assets for the customer app.
 *
 *   npm run catalog:assets -- <restaurant-slug> [item-slug]
 *
 * For every item in src/catalog/restaurants/<restaurant-slug>.json:
 *   1. If the item has a USDZ and a `glb` path, converts the USDZ to glTF with
 *      scripts/usdz_to_gltf.py (needs `pip install usd-core`; set USD_PYTHON to that
 *      python if it isn't the default `python`). Skipped when the GLB already exists,
 *      unless --reconvert is passed.
 *   2. Packs the glTF into a GLB sized for phones (JPEG textures, 2048px colour,
 *      1024px normal/AO maps). Geometry and scale are NOT changed.
 *   3. Renders the poster (shown while the viewer loads) and the square menu thumbnail
 *      from the GLB with <model-viewer>, using local Chrome (set CHROME_PATH if needed).
 *
 * The original USDZ is never modified.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, getBounds, prune, textureCompress } from "@gltf-transform/functions";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [restaurantSlug, onlyItem] = args.filter((a) => !a.startsWith("--"));
if (!restaurantSlug) {
  console.error("usage: npm run catalog:assets -- <restaurant-slug> [item-slug] [--reconvert]");
  process.exit(1);
}

const recordPath = path.join(root, "src/catalog/restaurants", `${restaurantSlug}.json`);
const restaurant = JSON.parse(await fs.readFile(recordPath, "utf8"));
const pub = (p) => path.join(root, "public", p.replace(/^\/+/, ""));
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const USD_PYTHON = process.env.USD_PYTHON ?? "python";
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

const cm = (b) => [0, 1, 2].map((i) => +((b.max[i] - b.min[i]) * 100).toFixed(2));

// ---------- 1 + 2: USDZ → glTF → GLB ----------
for (const item of restaurant.items) {
  if (onlyItem && item.slug !== onlyItem) continue;
  const { glb, usdz } = item.model;
  if (!glb) {
    console.log(`${item.slug}: no GLB configured (USDZ-only item), skipping conversion`);
    continue;
  }
  if (existsSync(pub(glb)) && !flags.has("--reconvert")) {
    console.log(`${item.slug}: ${glb} exists (pass --reconvert to rebuild)`);
    continue;
  }
  if (!usdz) {
    console.log(`${item.slug}: GLB missing and no USDZ to convert from; add the GLB file to public${glb}`);
    continue;
  }
  const work = path.join(root, "assets-src/catalog", restaurantSlug, item.slug);
  await fs.mkdir(work, { recursive: true });
  const conv = spawnSync(USD_PYTHON, [path.join(root, "scripts/usdz_to_gltf.py"), pub(usdz), work], { stdio: "inherit" });
  if (conv.status !== 0) {
    console.error(`${item.slug}: conversion failed. Install USD with \`pip install usd-core\` and set USD_PYTHON.`);
    process.exit(1);
  }

  const doc = await io.read(path.join(work, "model.gltf"));
  const before = cm(getBounds(doc.getRoot().listScenes()[0]));
  await doc.transform(
    dedup(),
    prune(),
    // JPEG keeps the file readable by every AR viewer (Scene Viewer included).
    textureCompress({ encoder: sharp, targetFormat: "jpeg", slots: /^baseColor/, resize: [2048, 2048], quality: 86 }),
    textureCompress({ encoder: sharp, targetFormat: "jpeg", slots: /^(?!baseColor)/, resize: [1024, 1024], quality: 88 }),
  );
  const after = cm(getBounds(doc.getRoot().listScenes()[0]));
  if (before.some((v, i) => Math.abs(v - after[i]) > 0.01)) throw new Error(`${item.slug}: size changed during packing`);
  await fs.mkdir(path.dirname(pub(glb)), { recursive: true });
  await io.write(pub(glb), doc);
  const kb = Math.round((await fs.stat(pub(glb))).size / 1024);
  console.log(`${item.slug}: wrote ${glb} (${kb} KB), size ${after.join(" x ")} cm (w x h x d)`);
  const d = item.scale?.dimensionsCm;
  if (d && [d.width, d.height, d.depth].some((v, i) => Math.abs(v - after[i]) > 0.05))
    console.warn(`  ! scale.dimensionsCm in ${restaurantSlug}.json (${d.width} x ${d.height} x ${d.depth}) differs from the model; update it.`);
}

// ---------- 3: poster + thumbnail ----------
const renderable = restaurant.items.filter((i) => (!onlyItem || i.slug === onlyItem) && i.model.glb && existsSync(pub(i.model.glb)));
if (renderable.length) {
  const page = `<!doctype html><html><body style="margin:0;background:transparent">
<script type="module" src="/node_modules/@google/model-viewer/dist/model-viewer.min.js"></script>
<model-viewer id="mv" style="width:100vw;height:100vh;background:transparent;--poster-color:transparent"
  shadow-intensity="1" shadow-softness="0.9" interaction-prompt="none"></model-viewer></body></html>`;
  const types = { ".js": "text/javascript", ".glb": "model/gltf-binary" };
  const server = http
    .createServer(async (req, res) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      if (url === "/") return res.writeHead(200, { "content-type": "text/html" }).end(page);
      try {
        const file = path.join(root, url.startsWith("/node_modules") ? url : path.join("public", url));
        const body = await fs.readFile(file);
        res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" }).end(body);
      } catch {
        res.writeHead(404).end();
      }
    })
    .listen(0);
  const port = server.address().port;
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });

  for (const item of renderable) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 1 });
    await tab.goto(`http://localhost:${port}/`, { waitUntil: "networkidle0" });
    const b64 = await tab.evaluate(
      async (src, orbit) => {
        const mv = document.getElementById("mv");
        await customElements.whenDefined("model-viewer");
        if (orbit) mv.cameraOrbit = orbit;
        mv.src = src;
        await new Promise((ok, no) => {
          mv.addEventListener("load", ok, { once: true });
          mv.addEventListener("error", () => no(new Error("model failed to load")), { once: true });
        });
        mv.jumpCameraToGoal();
        await new Promise((ok) => setTimeout(ok, 1500));
        const blob = await mv.toBlob({ mimeType: "image/png", idealAspect: false });
        const buf = new Uint8Array(await blob.arrayBuffer());
        let s = "";
        for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        return btoa(s);
      },
      item.model.glb,
      item.model.cameraOrbit ?? null,
    );
    const png = Buffer.from(b64, "base64");
    if (item.model.poster) {
      // Same framing as the live viewer, so swapping poster → model doesn't jump.
      await sharp(png).webp({ quality: 86, alphaQuality: 90 }).toFile(pub(item.model.poster));
      console.log(`${item.slug}: wrote ${item.model.poster}`);
    }
    if (item.thumbnail) {
      const trimmed = await sharp(png).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
      const side = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 1.18);
      // Two pipelines: sharp always resizes before extending, whatever the chain order.
      const padded = await sharp(trimmed.data)
        .extend({
          top: Math.floor((side - trimmed.info.height) / 2),
          bottom: Math.ceil((side - trimmed.info.height) / 2),
          left: Math.floor((side - trimmed.info.width) / 2),
          right: Math.ceil((side - trimmed.info.width) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
      await sharp(padded).resize(640, 640).webp({ quality: 84, alphaQuality: 90 }).toFile(pub(item.thumbnail));
      console.log(`${item.slug}: wrote ${item.thumbnail}`);
    }
    await tab.close();
  }
  await browser.close();
  server.close();
}
