// Monta carrossel.html (esqueleto da marca + slides.html) e renderiza cada .slide em PNG.
// Uso:
//   NODE_PATH="<repo>/node_modules" node build.js --config <instagram.config.json> <pasta> [<pasta> ...]
// Slides com classe "story" saem em 1080x1920; os demais em 1080x1350.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
let sharp = null;
try { sharp = require("sharp"); } catch {}

const args = process.argv.slice(2);
const ci = args.indexOf("--config");
const cfgPath = path.resolve(ci >= 0 ? args.splice(ci, 2)[1] : "marketing/instagram/instagram.config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const c = cfg.colors || {};
const font = cfg.font || "Inter";

// Esqueleto + variáveis da marca
let head = fs.readFileSync(path.join(__dirname, "..", "assets", "head.html"), "utf8")
  .replaceAll("{{FONT}}", font)
  .replaceAll("{{FONT_URL}}", font.replace(/ /g, "+"))
  .replaceAll("{{DARK}}", c.dark || "#0A0A0A")
  .replaceAll("{{LIGHT}}", c.light || "#FAFAF7")
  .replaceAll("{{ACCENT}}", c.accent || "#00FF88")
  .replaceAll("{{ACCENT_DARK}}", c.accentOnLight || c.accent || "#00994F")
  .replaceAll("{{ON_ACCENT}}", c.onAccent || "#0A0A0A");

async function ensureLogo(dir) {
  const dest = path.join(dir, "logo.png");
  if (fs.existsSync(dest) || !cfg.logo) return;
  const src = path.resolve(path.dirname(cfgPath), cfg.logo);
  if (sharp) await sharp(src).trim().png().toFile(dest); // remove margem transparente
  else fs.copyFileSync(src, dest);
}

(async () => {
  const browser = await chromium.launch();
  for (const dir of args.map((d) => path.resolve(d))) {
    const slidesFile = path.join(dir, "slides.html");
    if (!fs.existsSync(slidesFile)) { console.log(`✗ ${dir}: falta slides.html`); continue; }
    const body = fs.readFileSync(slidesFile, "utf8").replaceAll("{{HANDLE}}", cfg.handle || "");
    fs.writeFileSync(path.join(dir, "carrossel.html"), head + body + "\n</body>\n</html>\n", "utf8");
    await ensureLogo(dir);

    const out = path.join(dir, "instagram");
    fs.mkdirSync(out, { recursive: true });
    for (const f of fs.readdirSync(out)) if (f.endsWith(".png")) fs.unlinkSync(path.join(out, f));

    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    await page.goto("file://" + path.join(dir, "carrossel.html").replace(/\\/g, "/"));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle");
    const slides = await page.$$(".slide");
    for (let i = 0; i < slides.length; i++) {
      await slides[i].screenshot({ path: path.join(out, `slide-${String(i + 1).padStart(2, "0")}.png`) });
    }
    await page.close();
    console.log(`✓ ${path.basename(dir)}: ${slides.length} slide(s)`);
  }
  await browser.close();
})();
