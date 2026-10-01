/**
 * Schema + RLS tests. Applies every migration in supabase/migrations/ to an in-memory Postgres
 * (PGlite, no Docker needed) with stand-ins for Supabase's roles and auth schema, then checks
 * what anonymous visitors, admins, restaurant editors/viewers and outsiders can and can't do.
 *
 *   npm run db:test
 *
 * Run it before `supabase db push`. It doesn't touch the hosted project.
 */
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";

const migrationsDir = path.resolve(import.meta.dirname, "../migrations");
const migrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
const db = new PGlite();
console.log((await db.query("select version()")).rows[0].version.split(",")[0]);

// --- Supabase stand-ins: roles, auth schema, default privileges ---------------------------
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`);

for (const f of migrations) await db.exec(fs.readFileSync(path.join(migrationsDir, f), "utf8"));
console.log(`applied ${migrations.length} migration(s)\n`);

const U = {
  admin: "00000000-0000-0000-0000-0000000000a1",
  outsider: "00000000-0000-0000-0000-0000000000b2",
  editor: "00000000-0000-0000-0000-0000000000c3",
  viewer: "00000000-0000-0000-0000-0000000000d4",
};
for (const [k, id] of Object.entries(U)) await db.query("insert into auth.users values ($1, $2)", [id, `${k}@test`]);
await db.query("insert into public.platform_admins (user_id) values ($1)", [U.admin]);

async function as(who, sql, params = []) {
  const role = who === "anon" ? "anon" : "authenticated";
  const uid = who === "anon" ? "" : U[who];
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid]);
  await db.exec(`set role ${role}`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("reset role");
  }
}

let pass = 0, fail = 0;
async function expectOk(name, fn, check) {
  try {
    const res = await fn();
    if (check && !check(res)) throw new Error(`check failed: ${JSON.stringify(res.rows ?? res).slice(0, 300)}`);
    pass++; console.log(`PASS  ${name}`);
    return res;
  } catch (e) {
    fail++; console.log(`FAIL  ${name}\n      ${e.message}`);
  }
}
async function expectErr(name, fn, pattern) {
  try {
    const res = await fn();
    fail++; console.log(`FAIL  ${name}\n      expected an error, got ${JSON.stringify(res.rows ?? res).slice(0, 200)}`);
  } catch (e) {
    const text = `${e.message} ${e.detail ?? ""}`;
    if (pattern && !pattern.test(text)) { fail++; console.log(`FAIL  ${name}\n      wrong error: ${text}`); return; }
    pass++; console.log(`PASS  ${name}  (${e.message.split("\n")[0]})`);
  }
}
const rows = (n) => (r) => r.rows.length === n;
const affected = (n) => (r) => r.affectedRows === n;

console.log("-- anonymous visitors --");
for (const t of ["restaurants", "menu_items", "menu_categories", "assets", "menu_versions", "restaurant_members", "platform_admins"])
  await expectErr(`anon cannot read ${t}`, () => as("anon", `select * from public.${t}`), /permission denied/);
await expectOk("anon can read published_menus (empty)", () => as("anon", "select * from public.published_menus"), rows(0));
await expectErr("anon cannot call publish_menu", () => as("anon", "select public.publish_menu(gen_random_uuid())"), /permission denied/);
await expectErr("anon cannot call private helpers", () => as("anon", "select private.is_platform_admin()"), /permission denied/);

console.log("\n-- creating a restaurant --");
await expectErr("outsider cannot create a restaurant", () => as("outsider", "insert into public.restaurants (slug, name) values ('x-grill', 'X')"), /row-level security/);
await expectErr("slug 'demo' is reserved", () => as("admin", "insert into public.restaurants (slug, name) values ('demo', 'D')"), /restaurants_slug_reserved/);
{
  // Restaurant slugs are subdomains; the database must reserve everything src/lib/hosts.ts does.
  const hosts = fs.readFileSync(path.resolve(import.meta.dirname, "../../src/lib/hosts.ts"), "utf8");
  const list = hosts.slice(hosts.indexOf("RESERVED_SUBDOMAINS"), hosts.indexOf("]);"));
  const reserved = [...list.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
  const accepted = [];
  for (const slug of reserved) {
    try {
      await as("admin", "insert into public.restaurants (slug, name) values ($1, 'x')", [slug]);
      accepted.push(slug);
    } catch (e) {
      if (!/restaurants_slug_reserved/.test(e.message)) accepted.push(`${slug} (${e.message})`);
    }
  }
  accepted.length || reserved.length < 20
    ? (fail++, console.log(`FAIL  reserved subdomains match src/lib/hosts.ts\n      not rejected: ${accepted.join(", ") || "(list not found)"}`))
    : (pass++, console.log(`PASS  all ${reserved.length} reserved subdomains in src/lib/hosts.ts are rejected`));
}
await expectErr("bad slug rejected", () => as("admin", "insert into public.restaurants (slug, name) values ('Bad Slug', 'D')"), /restaurants_slug_format/);
const A = (await expectOk("admin creates restaurant A", () => as("admin", "insert into public.restaurants (slug, name, accent) values ('karachi-grill', 'Karachi Grill', '#c2410c') returning id, created_by"), (r) => r.rows[0].created_by === U.admin))?.rows[0].id;
const B = (await expectOk("admin creates restaurant B", () => as("admin", "insert into public.restaurants (slug, name) values ('lahore-bites', 'Lahore Bites') returning id")))?.rows[0].id;
await expectOk("outsider sees no restaurants", () => as("outsider", "select * from public.restaurants"), rows(0));

console.log("\n-- menu content --");
const catA = (await as("admin", "insert into public.menu_categories (restaurant_id, name) values ($1, 'BBQ') returning id", [A])).rows[0].id;
const catB = (await as("admin", "insert into public.menu_categories (restaurant_id, name) values ($1, 'Mains') returning id", [B])).rows[0].id;
const item = (await expectOk("admin adds item to A", () => as("admin", "insert into public.menu_items (restaurant_id, category_id, slug, name, description, price) values ($1, $2, 'seekh-kabab', 'Seekh Kabab', 'Draft description', 650) returning id", [A, catA])))?.rows[0].id;
await expectErr("item cannot use another restaurant's category", () => as("admin", "insert into public.menu_items (restaurant_id, category_id, slug, name) values ($1, $2, 'x', 'X')", [A, catB]), /menu_items_category_fk/);
await expectErr("verified scale requires measured source", () => as("admin", "update public.menu_items set scale_verified = true where id = $1", [item]), /menu_items_verified_needs_measured/);

console.log("\n-- publishing gates --");
await expectErr("publish refuses item with no model and no size", () => as("admin", "select public.publish_menu($1)", [A]), /needs a GLB or USDZ model[\s\S]*needs width/);
const glb = (await as("admin", "insert into public.assets (restaurant_id, kind, content_type, storage_key) values ($1, 'glb', 'model/gltf-binary', 'restaurants/a/1.glb') returning id", [A])).rows[0].id;
const glbB = (await as("admin", "insert into public.assets (restaurant_id, kind, content_type, storage_key) values ($1, 'glb', 'model/gltf-binary', 'restaurants/b/1.glb') returning id", [B])).rows[0].id;
await expectErr("asset kind must match content type", () => as("admin", "insert into public.assets (restaurant_id, kind, content_type, storage_key) values ($1, 'glb', 'text/html', 'evil.glb')", [A]), /assets_kind_content_type/);
await expectErr("item cannot use another restaurant's file", () => as("admin", "update public.menu_items set glb_asset_id = $2 where id = $1", [item, glbB]), /menu_items_glb_fk/);
await expectErr("GLB file cannot go in the poster slot", () => as("admin", "update public.menu_items set poster_asset_id = $2 where id = $1", [item, glb]), /poster_asset_id must point to an image/);
await as("admin", "update public.menu_items set glb_asset_id = $2, width_cm = 30, height_cm = 6, depth_cm = 12 where id = $1", [item, glb]);
await expectErr("publish refuses file not yet checked", () => as("admin", "select public.publish_menu($1)", [A]), /not been uploaded and checked/);
await as("admin", "update public.assets set status = 'ready', byte_size = 1049552 where id = $1", [glb]);
await expectErr("publish refuses file not copied to public bucket", () => as("admin", "select public.publish_menu($1)", [A]), /not been copied to the public bucket/);
await as("admin", "update public.assets set public_key = storage_key where id = $1", [glb]);
await expectOk("publish succeeds once everything is ready", () => as("admin", "select * from public.publish_menu($1)", [A]), (r) => r.rows[0].snapshot.version === 1);

console.log("\n-- what customers see --");
const pub = await expectOk("anon reads A's published menu by slug", () => as("anon", "select snapshot from public.published_menus where slug = 'karachi-grill'"), rows(1));
if (pub) {
  const s = pub.rows[0].snapshot;
  console.log("      snapshot:", JSON.stringify(s));
  const leaked = JSON.stringify(s).match(/storage_key|created_by|restaurant_id|is_visible|restaurants\/b/);
  leaked ? (fail++, console.log(`FAIL  snapshot leaks internal field: ${leaked[0]}`)) : (pass++, console.log("PASS  snapshot contains no internal fields"));
}
await as("admin", "update public.menu_items set description = 'Edited, not yet published' where id = $1", [item]);
await as("admin", "insert into public.menu_items (restaurant_id, category_id, slug, name, is_visible) values ($1, $2, 'secret-special', 'Secret Special', false)", [A, catA]);
await expectOk("draft edits stay private until republish", () => as("anon", "select snapshot from public.published_menus where slug = 'karachi-grill'"), (r) => r.rows[0].snapshot.items[0].description === "Draft description");
await as("admin", "insert into public.menu_items (restaurant_id, category_id, slug, name) values ($1, $2, 'half-done', 'Half Done')", [A, catA]);
await expectErr("failed republish (incomplete new item)...", () => as("admin", "select public.publish_menu($1)", [A]), /item "half-done"/);
await expectOk("...leaves the live menu untouched", () => as("anon", "select snapshot from public.published_menus where slug = 'karachi-grill'"), (r) => r.rows[0].snapshot.version === 1);
await as("admin", "update public.menu_items set is_visible = false where slug = 'half-done'");
await expectOk("republish: v2 has the edit, hidden items excluded", () => as("admin", "select snapshot from public.publish_menu($1)", [A]), (r) => r.rows[0].snapshot.version === 2 && r.rows[0].snapshot.items.length === 1 && r.rows[0].snapshot.items[0].description === "Edited, not yet published");
await expectErr("nobody can write snapshots directly", () => as("admin", "insert into public.published_menus (restaurant_id, slug, version_id, snapshot) values ($1, 'x', gen_random_uuid(), '{}')", [B]), /permission denied/);
await expectErr("nobody can write menu history directly", () => as("admin", "insert into public.menu_versions (restaurant_id, version, snapshot) values ($1, 99, '{}')", [A]), /permission denied/);

console.log("\n-- restaurant accounts (future) --");
await as("admin", "insert into public.restaurant_members (restaurant_id, user_id, role) values ($1, $2, 'editor'), ($1, $3, 'viewer')", [A, U.editor, U.viewer]);
await expectOk("editor sees only restaurant A", () => as("editor", "select slug from public.restaurants"), (r) => r.rows.length === 1 && r.rows[0].slug === "karachi-grill");
await expectOk("editor can edit A's items", () => as("editor", "update public.menu_items set name = 'Seekh Kabab (4 pcs)' where id = $1", [item]), affected(1));
await expectOk("editor cannot touch B (0 rows)", () => as("editor", "update public.restaurants set name = 'hijacked' where id = $1", [B]), affected(0));
await expectErr("editor cannot create restaurants", () => as("editor", "insert into public.restaurants (slug, name) values ('mine', 'Mine')"), /row-level security/);
await expectErr("editor cannot grant themselves more access", () => as("editor", "insert into public.restaurant_members (restaurant_id, user_id, role) values ($1, $2, 'owner')", [B, U.editor]), /row-level security/);
await expectErr("editor cannot make themselves platform admin", () => as("editor", "insert into public.platform_admins (user_id) values ($1)", [U.editor]), /permission denied/);
await expectOk("editor can publish A", () => as("editor", "select version_id from public.publish_menu($1)", [A]), rows(1));
await expectErr("editor cannot publish B", () => as("editor", "select public.publish_menu($1)", [B]), /Not allowed/);
await expectOk("viewer can read A", () => as("viewer", "select * from public.menu_items"), (r) => r.rows.length === 3);
await expectOk("viewer cannot edit (0 rows)", () => as("viewer", "update public.menu_items set name = 'x' where id = $1", [item]), affected(0));
await expectErr("viewer cannot publish", () => as("viewer", "select public.publish_menu($1)", [A]), /Not allowed/);
await expectOk("admin row visible to admin (how the app detects admins)", () => as("admin", "select * from public.platform_admins"), rows(1));
await expectOk("outsider sees no admin rows", () => as("outsider", "select * from public.platform_admins"), rows(0));

console.log("\n-- unpublishing --");
await expectOk("outsider cannot unpublish A (0 rows)", () => as("outsider", "delete from public.published_menus where restaurant_id = $1", [A]), affected(0));
await expectOk("editor unpublishes A", () => as("editor", "delete from public.published_menus where restaurant_id = $1", [A]), affected(1));
await expectOk("anon no longer sees A", () => as("anon", "select * from public.published_menus"), rows(0));
await expectOk("history kept for rollback", () => as("admin", "select version from public.menu_versions where restaurant_id = $1 order by version", [A]), rows(3));
await expectOk("updated_at moves on edit", () => as("admin", "select updated_at > created_at as moved from public.menu_items where id = $1", [item]), (r) => r.rows[0].moved === true);
await expectOk("deleting a restaurant cascades cleanly", () => as("admin", "delete from public.restaurants where id = $1", [A]), affected(1));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
