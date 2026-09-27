/**
 * Processes raw sources in assets-src/ into web-ready files in public/, driven by
 * src/content/assets.manifest.json.
 *
 *   node scripts/build-assets.mjs
 *
 * Models are normalised so the AR view is TRUE TO SIZE:
 *   - units are metres (glTF standard, what AR viewers use for real-world scale)
 *   - the model is uniformly scaled so its `realSize` dimension matches the menu exactly
 *   - it is centred on X/Z and rests on Y = 0, so it sits on the table instead of floating
 */
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, getBounds, prune, quantize, simplify, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = (p) => path.join(root, "assets-src", p);
const pub = (p) => path.join(root, "public", p);
const manifest = JSON.parse(await fs.readFile(path.join(root, "src/content/assets.manifest.json"), "utf8"));
const dims = {};

const TO_METRES = { in: 0.0254, cm: 0.01, mm: 0.001, m: 1 };

async function ensureDir(file) {
  await fs.mkdir(path.dirname(file), { recursive: true });
}

// ---------- photos ----------
for (const [id, p] of Object.entries(manifest.photos)) {
  const out = pub(p.file);
  await ensureDir(out);
  const info = await sharp(src(p.file))
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out);
  dims[`photos.${id}`] = { width: info.width, height: info.height };
  console.log("photo  ", id, info.width, "x", info.height, Math.round(info.size / 1024) + "KB");
}

// ---------- textures ----------
{
  const t = manifest.textures.table;
  const out = pub(t.file);
  await ensureDir(out);
  const info = await sharp(src(t.source)).resize(2048, 2048).modulate({ brightness: 0.78, saturation: 0.85 }).jpeg({ quality: 78, mozjpeg: true }).toFile(out);
  dims["textures.table"] = { width: info.width, height: info.height };
  console.log("texture table", Math.round(info.size / 1024) + "KB");

  const e = manifest.textures.environment;
  await ensureDir(pub(e.file));
  await fs.copyFile(src(e.source), pub(e.file));
}

// ---------- models ----------
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.simplifier": MeshoptSimplifier });

for (const [id, m] of Object.entries(manifest.models)) {
  /** @type {Document} */
  const doc = await io.read(src(m.source));
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];

  // Wrap everything in one node so we can scale + translate the whole model.
  const wrapper = doc.createNode(`${id}-true-size`);
  for (const child of scene.listChildren()) {
    scene.removeChild(child);
    wrapper.addChild(child);
  }
  scene.addChild(wrapper);

  const b0 = getBounds(scene);
  const size = [0, 1, 2].map((i) => b0.max[i] - b0.min[i]);
  const target = m.realSize.dimension === "asScanned" ? Math.max(size[0], size[2]) : m.realSize.value * TO_METRES[m.realSize.unit];
  // "diameter"/"width" = the larger horizontal extent (X/Z); "height" = Y
  const measured = m.realSize.dimension === "height" ? size[1] : Math.max(size[0], size[2]);
  // "asScanned": the scan itself is the real dish, already in metres — keep it 1:1.
  const s = m.realSize.dimension === "asScanned" ? 1 : target / measured;
  const cx = (b0.min[0] + b0.max[0]) / 2;
  const cz = (b0.min[2] + b0.max[2]) / 2;
  wrapper.setScale([s, s, s]).setTranslation([-cx * s, -b0.min[1] * s, -cz * s]);

  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.55, error: 0.0008 }),
    dedup(),
    prune(),
    quantize(),
    // Colour gets full resolution; normal / occlusion / roughness maps can be smaller.
    textureCompress({ encoder: sharp, targetFormat: "webp", slots: /^baseColor/, resize: [2048, 2048], quality: 84 }),
    textureCompress({ encoder: sharp, targetFormat: "webp", slots: /^(?!baseColor)/, resize: [1024, 1024], quality: 80 }),
  );

  const b1 = getBounds(scene);
  const final = [0, 1, 2].map((i) => +((b1.max[i] - b1.min[i]) * 100).toFixed(2));
  const out = pub(m.file);
  await ensureDir(out);
  await io.write(out, doc);
  const bytes = (await fs.stat(out)).size;
  dims[`models.${id}`] = { widthCm: final[0], heightCm: final[1], depthCm: final[2] };
  console.log(
    "model  ",
    id,
    `scan ${(measured * 100).toFixed(1)}cm → ${(target * 100).toFixed(2)}cm (×${s.toFixed(4)})`,
    `final ${final.join(" × ")} cm`,
    Math.round(bytes / 1024) + "KB",
  );
}

await fs.writeFile(path.join(root, "src/content/assets.generated.json"), JSON.stringify(dims, null, 2) + "\n");
console.log("wrote src/content/assets.generated.json");
