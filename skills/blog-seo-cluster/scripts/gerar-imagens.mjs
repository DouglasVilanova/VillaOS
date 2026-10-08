// Gera as imagens do blog via Higgsfield CLI a partir de <contentDir>/prompts-imagens.md.
// Uso:
//   node gerar-imagens.mjs --config marketing/blog/blog.config.json [trecho-do-nome ...]
//   FORCE=1 node gerar-imagens.mjs --config ... nome   -> regera mesmo se já existir
// Requer: `higgsfield auth login` feito e workspace selecionado (`higgsfield workspace set <id>`).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const ci = args.indexOf("--config");
const cfgPath = path.resolve(ci >= 0 ? args.splice(ci, 2)[1] : "marketing/blog/blog.config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const contentDir = path.dirname(cfgPath);
const outDir = path.join(contentDir, "imagens");
const MODEL = process.env.IMAGE_MODEL || cfg.imageModel || "gpt_image_2_5";
const RES = cfg.imageResolution || "2k";

// Chama a CLI pelo node direto (sem shell) para os prompts não quebrarem com aspas
const CLI = process.env.HIGGSFIELD_CLI ||
  path.join(process.env.APPDATA ?? path.join(process.env.HOME ?? "", ".npm-global/lib"), "npm/node_modules/@higgsfield/cli/bin/higgsfield.js");
const run = (a) =>
  fs.existsSync(CLI)
    ? execFileSync(process.execPath, [CLI, ...a], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 })
    : execFileSync("higgsfield", a, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });

// Pares **`arquivo.png`** + > prompt
const md = fs.readFileSync(path.join(contentDir, "prompts-imagens.md"), "utf8");
const items = [...md.matchAll(/\*\*`([^`]+\.png)`\*\*\s*\n>\s*(.+)/g)].map((m) => ({ file: m[1], prompt: m[2].trim() }));
const todo = items.filter((i) => !args.length || args.some((f) => i.file.includes(f)));
fs.mkdirSync(outDir, { recursive: true });

async function generate({ file, prompt }) {
  const base = file.replace(/\.png$/, "");
  const existing = [".png", ".jpg", ".jpeg", ".webp"].find((ext) => fs.existsSync(path.join(outDir, base + ext)));
  if (existing && !process.env.FORCE) return console.log(`= ${base}${existing} (já existe)`);

  const out = run(["generate", "create", MODEL, "--prompt", prompt, "--aspect_ratio", "16:9", "--resolution", RES, "--wait", "--json"]);
  // URL da imagem completa (a _min.webp é miniatura)
  const url = out.match(/https:\/\/[^"\s]+?(?<!_min)\.(png|jpe?g|webp)/)?.[0];
  if (!url) throw new Error(`sem URL na resposta: ${out.slice(0, 300)}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const ext = path.extname(new URL(url).pathname) || ".png";
  fs.writeFileSync(path.join(outDir, base + ext), Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${base}${ext}`);
}

console.log(`${todo.length} imagem(ns) · modelo ${MODEL} · ${RES}`);
let fail = 0;
for (const item of todo) {
  try { await generate(item); } catch (e) { fail++; console.log(`✗ ${item.file}: ${String(e.message).slice(0, 300)}`); }
}
console.log(fail ? `${fail} falha(s)` : "pronto");
