// Gera marketing/conteudo/galeria.html: grid simulado do perfil + cada post com slides, legenda e status.
// Uso: node galeria.js --config <instagram.config.json> <pasta-conteudo>   (status em <pasta-conteudo>/status.json)
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const ci = args.indexOf("--config");
const cfg = JSON.parse(fs.readFileSync(path.resolve(ci >= 0 ? args.splice(ci, 2)[1] : "marketing/instagram/instagram.config.json"), "utf8"));
const ROOT = path.resolve(args[0] || "marketing/conteudo");
const statusFile = path.join(ROOT, "status.json");
const status = fs.existsSync(statusFile) ? JSON.parse(fs.readFileSync(statusFile, "utf8")) : {};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const posts = fs.readdirSync(ROOT)
  .filter((d) => /^(carrossel-lancamento|post)-\d\d-/.test(d))
  .map((d) => {
    const num = d.match(/-(\d\d)-/)[1];
    const dir = path.join(ROOT, d);
    const slides = fs.readdirSync(path.join(dir, "instagram")).filter((f) => f.endsWith(".png")).sort().map((f) => `${d}/instagram/${f}`);
    const leg = fs.existsSync(path.join(dir, "legenda.md")) ? fs.readFileSync(path.join(dir, "legenda.md"), "utf8").replace(/^#.*\r?\n+/, "").trim() : "";
    const title = (fs.readFileSync(path.join(dir, "texto.md"), "utf8").match(/^# (.+)$/m) || [, d])[1];
    return { num, d, slides, leg, title, st: status[num] || {} };
  })
  .sort((a, b) => a.num.localeCompare(b.num));

const badge = (st) =>
  st.publicado
    ? `<span class="b ok">Publicado ${st.publicado}</span> <a href="${st.ig}" target="_blank">Instagram</a> · <a href="${st.fb}" target="_blank">Facebook</a>`
    : st.reel
      ? `<span class="b reel">Reel — falta gravar o vídeo</span>`
      : `<span class="b plan">Previsto: ${st.previsto || "—"}</span>`;

// Grid do perfil: mais recente primeiro (publicados na ordem de publicação + previstos)
const grid = [...posts].sort((a, b) => (b.st.ordem || 0) - (a.st.ordem || 0));

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Galeria Instagram ${esc(cfg.company || "")}</title>
<link href="https://fonts.googleapis.com/css2?family=${(cfg.font || "Inter").replace(/ /g, "+")}:wght@400;600;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#0A0A0A;--fg:#FAFAF7;--muted:#9a9a9a;--g:#00FF88}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:"${cfg.font || "Inter"}",sans-serif}
header{padding:32px 24px 8px;max-width:1200px;margin:auto}h1{margin:0;font-size:28px}header p{color:var(--muted);margin:6px 0 0}
section{max-width:1200px;margin:auto;padding:16px 24px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;max-width:520px}
.grid a{position:relative;display:block;aspect-ratio:4/5;overflow:hidden;background:#111}
.grid img{width:100%;height:100%;object-fit:cover;display:block}
.grid .pend img{opacity:.45}.grid .n{position:absolute;left:6px;top:6px;font-size:11px;font-weight:800;background:#000a;padding:2px 6px;border-radius:6px}
.post{border-top:1px solid #222;padding:28px 0}.post h2{margin:0 0 6px;font-size:20px}
.row{display:flex;gap:10px;overflow-x:auto;padding:12px 0;scroll-snap-type:x mandatory}
.row img{height:420px;border-radius:10px;scroll-snap-align:start;flex:none}
pre{white-space:pre-wrap;font-family:inherit;background:#141414;border-radius:12px;padding:16px;color:#ddd;max-width:760px;margin:0}
.b{display:inline-block;font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;margin-right:6px}
.ok{background:var(--g);color:#000}.plan{background:#2a2a2a;color:#ddd}.reel{background:#4a3200;color:#ffcf66}
a{color:var(--g)}
@media (max-width:700px){.row img{height:300px}}
</style></head><body>
<header><h1>Instagram ${esc(cfg.handle || "")} — galeria</h1><p>${posts.length} posts · ${posts.filter((p) => p.st.publicado).length} publicados · grid simulado com os previstos em transparência</p></header>
<section><h2 style="font-size:16px;color:var(--muted)">Grid do perfil (mais recente primeiro)</h2><div class="grid">
${grid.map((p) => `<a href="#p${p.num}" class="${p.st.publicado ? "" : "pend"}"><img src="${p.slides[0]}"><span class="n">${p.num}</span></a>`).join("\n")}
</div></section>
<section>${posts.map((p) => `<div class="post" id="p${p.num}"><h2>${esc(p.title)}</h2>${badge(p.st)}
<div class="row">${p.slides.map((s) => `<img loading="lazy" src="${s}">`).join("")}</div><pre>${esc(p.leg)}</pre></div>`).join("\n")}</section>
</body></html>`;
fs.writeFileSync(path.join(ROOT, "galeria.html"), html, "utf8");
console.log(`✓ galeria.html (${posts.length} posts)`);
