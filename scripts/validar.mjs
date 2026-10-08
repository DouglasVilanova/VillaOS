// Valida o frontmatter de skills/*/SKILL.md e agents/*.md.
// Uso: node scripts/validar.mjs   (sai com código 1 se houver erro)
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const erros = [];

function frontmatter(texto) {
  texto = texto.replace(/^﻿/, ""); // editores do Windows gravam BOM
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const campos = {};
  let chave = null;
  for (const linha of m[1].split(/\r?\n/)) {
    const kv = linha.match(/^([a-z_-]+):\s*(.*)$/i);
    if (kv) {
      chave = kv[1];
      campos[chave] = kv[2].trim();
    } else if (chave && /^\s+\S/.test(linha)) {
      campos[chave] = `${campos[chave]} ${linha.trim()}`.trim();
    }
  }
  return campos;
}

const dirSkills = join(raiz, "skills");
for (const ent of readdirSync(dirSkills, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const arq = join(dirSkills, ent.name, "SKILL.md");
  if (!existsSync(arq)) { erros.push(`skills/${ent.name}: falta SKILL.md`); continue; }
  const fm = frontmatter(readFileSync(arq, "utf8"));
  if (!fm) { erros.push(`skills/${ent.name}: SKILL.md sem frontmatter`); continue; }
  if (fm.name !== ent.name) erros.push(`skills/${ent.name}: name "${fm.name}" difere da pasta`);
  if (!fm.description || fm.description.replace(/^>\s*/, "").length < 40)
    erros.push(`skills/${ent.name}: description ausente ou curta demais`);
}

const dirAgents = join(raiz, "agents");
for (const ent of readdirSync(dirAgents, { withFileTypes: true })) {
  if (!ent.isFile() || !ent.name.endsWith(".md") || ent.name === "README.md") continue;
  const base = ent.name.replace(/\.md$/, "");
  const fm = frontmatter(readFileSync(join(dirAgents, ent.name), "utf8"));
  if (!fm) { erros.push(`agents/${ent.name}: sem frontmatter`); continue; }
  if (fm.name !== base) erros.push(`agents/${ent.name}: name "${fm.name}" difere do arquivo`);
  if (!fm.description || fm.description.length < 40) erros.push(`agents/${ent.name}: description curta`);
  if (!fm.tools) erros.push(`agents/${ent.name}: falta tools`);
  else if (/\b(Edit|Write|NotebookEdit)\b/.test(fm.tools))
    erros.push(`agents/${ent.name}: agente auditor não pode ter Edit/Write`);
}

if (erros.length) {
  console.error(erros.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log("✓ skills e agentes válidos");
