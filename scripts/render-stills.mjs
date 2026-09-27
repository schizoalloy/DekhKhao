/**
 * Renders transparent stills of the prepared 3D models with <model-viewer>
 * (the same renderer and lighting as the live viewer on the site).
 *
 *   node scripts/render-stills.mjs          (needs Chrome; set CHROME_PATH if not in the default location)
 *
 * Output is trimmed to the model's silhouette, so a top-down render's width IS the
 * dish's diameter — the page relies on that to draw sizes to scale.
 */
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await fs.readFile(path.join(root, "src/content/assets.manifest.json"), "utf8"));
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const only = process.argv.slice(2);

const types = { ".js": "text/javascript", ".glb": "model/gltf-binary", ".hdr": "application/octet-stream", ".html": "text/html" };
const page = `<!doctype html><html><body style="margin:0;background:transparent">
<script type="module" src="/node_modules/@google/model-viewer/dist/model-viewer.min.js"></script>
<model-viewer id="mv" style="width:100vw;height:100vh;background:transparent;--poster-color:transparent"
  environment-image="/public/${manifest.textures.environment.file}" exposure="1.05" shadow-intensity="1" shadow-softness="0.8"
  interaction-prompt="none" field-of-view="18deg"></model-viewer></body></html>`;

const server = http
  .createServer(async (req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/") return res.writeHead(200, { "content-type": "text/html" }).end(page);
    try {
      const file = path.join(root, url);
      const data = await fs.readFile(file);
      res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" }).end(data);
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

const genPath = path.join(root, "src/content/assets.generated.json");
const rendered = JSON.parse(await fs.readFile(genPath, "utf8").catch(() => "{}"));

for (const [id, r] of Object.entries(manifest.renders)) {
  if (only.length && !only.includes(id)) continue;
  const model = manifest.models[r.model];
  const tab = await browser.newPage();
  await tab.setViewport({ width: r.size, height: r.size, deviceScaleFactor: 1 });
  await tab.goto(`http://localhost:${port}/`, { waitUntil: "networkidle0" });
  const b64 = await tab.evaluate(
    async (src, orbit) => {
      const mv = document.getElementById("mv");
      await customElements.whenDefined("model-viewer");
      mv.cameraOrbit = orbit;
      mv.src = src;
      await new Promise((ok) => mv.addEventListener("load", ok, { once: true }));
      mv.jumpCameraToGoal();
      await new Promise((ok) => setTimeout(ok, 1200));
      const blob = await mv.toBlob({ mimeType: "image/png", idealAspect: false });
      const buf = new Uint8Array(await blob.arrayBuffer());
      let s = "";
      for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return btoa(s);
    },
    `/public/${model.file}`,
    r.orbit,
  );
  const out = path.join(root, "public", r.file);
  await fs.mkdir(path.dirname(out), { recursive: true });
  const info = await sharp(Buffer.from(b64, "base64")).trim({ threshold: 1 }).webp({ quality: 88, alphaQuality: 90 }).toFile(out);
  rendered[`renders.${id}`] = { width: info.width, height: info.height };
  console.log("render", id, `${info.width}x${info.height}`, Math.round(info.size / 1024) + "KB");
  await tab.close();
}

await fs.writeFile(genPath, JSON.stringify(rendered, null, 2) + "\n");
await browser.close();
server.close();
