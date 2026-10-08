// Publica os posts de <contentDir>/posts no blog do site.
//   node publicar.mjs imagens --config <cfg>        -> imagens → WebP em <siteRepo>/<imagePublicDir>/<slug>/
//   node publicar.mjs posts --config <cfg> [filtro]  -> envia posts à API (rascunho; PUBLISH=1 publica)
//   API_URL=http://localhost:3010 ...               -> usa o servidor local em vez do site no ar
// Usa sharp e micromark do node_modules do repo do site. O segredo é lido do env do site e nunca impresso.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const ci = args.indexOf("--config");
const cfgPath = path.resolve(ci >= 0 ? args.splice(ci, 2)[1] : "marketing/blog/blog.config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const contentDir = path.dirname(cfgPath);
const [cmd, ...filters] = args;

const req = createRequire(path.join(cfg.siteRepo, "package.json"));
const sharp = req("sharp");
const { micromark } = await import(pathToFileURL(req.resolve("micromark")).href);

const SITE_URL = cfg.siteUrl.replace(/\/$/, "");
const API_URL = (process.env.API_URL || SITE_URL).replace(/\/$/, "");
const files = fs.readdirSync(path.join(contentDir, "posts"))
  .filter((f) => f.endsWith(".md") && (!filters.length || filters.some((x) => f.includes(x))));

function parse(file) {
  const raw = fs.readFileSync(path.join(contentDir, "posts", file), "utf8");
  const [, fm, body] = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const meta = {};
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (m && m[2] !== "") meta[m[1]] = m[2].replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"');
  }
  return { meta, body };
}

async function imagens() {
  const src = path.join(contentDir, "imagens");
  for (const file of files) {
    const { meta } = parse(file);
    const out = path.join(cfg.siteRepo, cfg.imagePublicDir, meta.slug);
    fs.mkdirSync(out, { recursive: true });
    for (const kind of ["capa", "1"]) {
      const input = [".png", ".jpg", ".jpeg", ".webp"].map((e) => path.join(src, `${meta.slug}-${kind}${e}`)).find(fs.existsSync);
      if (!input) { console.log(`✗ falta ${meta.slug}-${kind}`); continue; }
      await sharp(input).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out, `${kind}.webp`));
      console.log(`✓ ${meta.slug}/${kind}.webp`);
    }
  }
}

async function posts() {
  const env = fs.readFileSync(path.join(cfg.siteRepo, cfg.secretEnvFile), "utf8");
  const secret = env.match(new RegExp(`^${cfg.secretEnvVar}=(.+)$`, "m"))?.[1]?.trim().replace(/^"|"$/g, "");
  if (!secret) throw new Error(`${cfg.secretEnvVar} não encontrado em ${cfg.secretEnvFile}`);
  const publish = process.env.PUBLISH === "1";

  for (const file of files) {
    const { meta, body } = parse(file);
    const res = await fetch(`${API_URL}${cfg.apiPath}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: meta.title,
        slug: meta.slug,
        body: micromark(body),
        excerpt: meta.excerpt,
        cover_image: meta.cover, // relativa: funciona no local e no ar
        og_image: `${SITE_URL}${meta.cover}`, // absoluta para redes sociais
        category_slug: meta.category,
        category_name: cfg.categories?.[meta.category],
        meta_title: meta.meta_title,
        meta_description: meta.description,
        published: publish,
      }),
    });
    const json = await res.json().catch(() => ({}));
    console.log(res.ok ? `✓ ${json.slug ?? meta.slug} (${publish ? "publicado" : "rascunho"})` : `✗ ${file}: ${res.status} ${json.error ?? ""}`);
  }
}

if (cmd === "imagens") await imagens();
else if (cmd === "posts") await posts();
else console.log("uso: node publicar.mjs imagens|posts --config <blog.config.json> [filtros]");
