// Publica carrosséis e stories no Instagram e no Facebook via Meta Graph API. Copie para <repo-do-site>/scripts/.
//
//   node scripts/meta-post.mjs prepare <pasta-do-carrossel> <slug>
//       PNGs de <pasta>/instagram/slide-NN.png -> public/instagram/<slug>/slide-NN.jpg (o IG só aceita JPEG)
//   node scripts/meta-post.mjs check <slug>
//       confere se as imagens já respondem 200 no site (a Meta busca por URL pública)
//   node scripts/meta-post.mjs publish <pasta-do-carrossel> <slug> --confirmado [--so-ig | --so-fb]
//       posta usando <pasta>/legenda.md. Sem --confirmado, só mostra o que seria publicado.
//   node scripts/meta-post.mjs stories <slug> --confirmado
//       publica cada imagem de public/instagram/<slug>/ como story (1080x1920)
//
// Lê META_PAGE_ACCESS_TOKEN, META_PAGE_ID, META_IG_USER_ID e META_GRAPH_VERSION de .env/.env.local.
// O token nunca é impresso.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const require = createRequire(import.meta.url);

const env = Object.fromEntries(
  [".env", ".env.local"]
    .map((f) => path.join(ROOT, f))
    .filter(fs.existsSync)
    .flatMap((f) => fs.readFileSync(f, "utf8").split(/\r?\n/))
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^"|"$/g, "")])
);
const TOKEN = env.META_PAGE_ACCESS_TOKEN;
const PAGE_ID = env.META_PAGE_ID;
const IG_ID = env.META_IG_USER_ID;
const V = env.META_GRAPH_VERSION || "v23.0";
// URL pública do site onde ficam as imagens (public/instagram/...). A Meta baixa daqui.
const SITE_URL = (env.META_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const GRAPH = `https://graph.facebook.com/${V}`;

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith("--")));
const [folder, slugArg] = rest.filter((a) => !a.startsWith("--"));
const slug = cmd === "check" ? folder : slugArg;
const publicDir = (s) => path.join(ROOT, "public", "instagram", s);
const imageUrls = (s) =>
  fs.readdirSync(publicDir(s)).filter((f) => f.endsWith(".jpg")).sort().map((f) => `${SITE_URL}/instagram/${s}/${f}`);

async function graph(method, p, params = {}, token = TOKEN) {
  const body = new URLSearchParams({ ...params, access_token: token });
  const url = method === "GET" ? `${GRAPH}/${p}?${body}` : `${GRAPH}/${p}`;
  const res = await fetch(url, method === "GET" ? {} : { method, body });
  const json = await res.json();
  if (json.error) throw new Error(`${p}: ${json.error.message}`);
  return json;
}

function caption(dir) {
  const raw = fs.readFileSync(path.join(dir, "legenda.md"), "utf8").replace(/\r\n/g, "\n");
  // Junta linhas quebradas só pela largura do .md; mantém parágrafos e linhas que começam
  // com emoji, número, "-" ou "#" (listas e hashtags).
  return raw
    .replace(/^#.*\n+/, "")
    .trim()
    .split(/\n{2,}/)
    .map((par) => par.replace(/\n(?=[\p{L}"“(])/gu, " "))
    .join("\n\n");
}

async function prepare() {
  const sharp = require("sharp");
  const src = path.join(path.resolve(folder), "instagram");
  const pngs = fs.readdirSync(src).filter((f) => /^slide-\d+\.png$/.test(f)).sort();
  if (pngs.length < 1 || (pngs.length > 10 && !flags.has("--stories"))) throw new Error(`carrossel precisa de 1 a 10 slides (tem ${pngs.length})`);
  fs.mkdirSync(publicDir(slug), { recursive: true });
  for (const f of pngs) {
    await sharp(path.join(src, f)).flatten({ background: "#000" }).jpeg({ quality: 90, mozjpeg: true })
      .toFile(path.join(publicDir(slug), f.replace(".png", ".jpg")));
  }
  console.log(`✓ ${pngs.length} JPEG em public/instagram/${slug}/ — faça commit + push e rode "check ${slug}"`);
}

async function check() {
  let ok = true;
  for (const u of imageUrls(slug)) {
    const r = await fetch(u, { method: "HEAD" });
    console.log(`${r.status} ${u}`);
    if (r.status !== 200) ok = false;
  }
  console.log(ok ? "✓ todas no ar" : "✗ ainda não estão todas no ar");
  process.exitCode = ok ? 0 : 1;
}

async function waitReady(id) {
  for (let i = 0; i < 30; i++) {
    const { status_code } = await graph("GET", id, { fields: "status_code" });
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`container ${id}: ${status_code}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`container ${id}: tempo esgotado`);
}

async function postInstagram(urls, text) {
  const children = [];
  for (const image_url of urls) {
    const { id } = await graph("POST", `${IG_ID}/media`, urls.length > 1 ? { image_url, is_carousel_item: "true" } : { image_url, caption: text });
    children.push(id);
  }
  let creation = children[0];
  if (urls.length > 1) {
    for (const c of children) await waitReady(c);
    ({ id: creation } = await graph("POST", `${IG_ID}/media`, { media_type: "CAROUSEL", children: children.join(","), caption: text }));
  }
  await waitReady(creation);
  const { id } = await graph("POST", `${IG_ID}/media_publish`, { creation_id: creation });
  const { permalink } = await graph("GET", id, { fields: "permalink" });
  return permalink;
}

async function postFacebook(urls, text) {
  const { access_token: pageToken } = await graph("GET", PAGE_ID, { fields: "access_token" });
  const ids = [];
  for (const url of urls) {
    const { id } = await graph("POST", `${PAGE_ID}/photos`, { url, published: "false" }, pageToken);
    ids.push(id);
  }
  const params = { message: text };
  ids.forEach((id, i) => (params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id })));
  const { id } = await graph("POST", `${PAGE_ID}/feed`, params, pageToken);
  return `https://www.facebook.com/${id}`;
}

// Stories: cada imagem vira um story (destaques são montados depois, no app — a API não cria destaques)
async function stories() {
  if (!TOKEN || !IG_ID) throw new Error("faltam META_PAGE_ACCESS_TOKEN / META_IG_USER_ID no .env");
  const s = folder; // em "stories", o 1º argumento é o slug
  const urls = imageUrls(s);
  console.log(`${urls.length} story(s) de ${s}`);
  if (!flags.has("--confirmado")) return console.log("Prévia apenas. Para publicar, rode de novo com --confirmado.");
  for (const u of urls) if ((await fetch(u, { method: "HEAD" })).status !== 200) throw new Error(`imagem fora do ar: ${u}`);
  for (const image_url of urls) {
    const { id } = await graph("POST", `${IG_ID}/media`, { image_url, media_type: "STORIES" });
    await waitReady(id);
    await graph("POST", `${IG_ID}/media_publish`, { creation_id: id });
    console.log("✓ story", path.basename(image_url));
    await new Promise((r) => setTimeout(r, 4000));
  }
}

async function publish() {
  if (!TOKEN || !PAGE_ID || !IG_ID) throw new Error("faltam META_PAGE_ACCESS_TOKEN / META_PAGE_ID / META_IG_USER_ID no .env");
  const dir = path.resolve(folder);
  const urls = imageUrls(slug);
  const text = caption(dir);
  console.log(`${urls.length} imagem(ns) · legenda ${text.length} caracteres`);
  console.log("---\n" + text.slice(0, 300) + (text.length > 300 ? "…" : "") + "\n---");
  if (text.length > 2200) throw new Error("legenda passa de 2.200 caracteres (limite do Instagram)");
  if (!flags.has("--confirmado")) return console.log("Prévia apenas. Para publicar, rode de novo com --confirmado.");

  for (const u of urls) if ((await fetch(u, { method: "HEAD" })).status !== 200) throw new Error(`imagem fora do ar: ${u}`);
  if (!flags.has("--so-fb")) console.log("✓ Instagram:", await postInstagram(urls, text));
  if (!flags.has("--so-ig")) console.log("✓ Facebook:", await postFacebook(urls, text));
}

const run = { prepare, check, publish, stories }[cmd];
if (!run) console.log("uso: node scripts/meta-post.mjs prepare|check|publish|stories ...");
else run().catch((e) => { console.error("✗", e.message); process.exitCode = 1; });
