#!/usr/bin/env node
/**
 * Build script: Combines modular source files from `src/` into `js/core.js`, `js/app.js`, and `js/parseworker.js`.
 * Usage: node scripts/build.js
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function shortHash(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex").slice(0, 8);
}

function replaceIfChanged(filePath, replacer) {
  const prev = fs.readFileSync(filePath, "utf8");
  const next = replacer(prev);
  if (next !== prev) {
    fs.writeFileSync(filePath, next, "utf8");
    return true;
  }
  return false;
}

function readDirSorted(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".js"))
    .sort()
    .map((f) => ({
      name: f,
      content: fs.readFileSync(path.join(dir, f), "utf8").trim(),
    }));
}

function buildCore() {
  const parts = readDirSorted(path.join(ROOT, "src/core"));
  const body = parts
    .map(
      (p) =>
        `  // ==========================================================================\n  // MODULE: src/core/${p.name}\n  // ==========================================================================\n  ${p.content}`,
    )
    .join("\n\n");

  const out = `/**
 * Ma'lumotnoma tuzatgich — Core Engine (SpravkaCore)
 * Auto-generated from modular sources in src/core/*.js via \`npm run build\`
 */
!(function (t) {
  "use strict";

${body}
})("undefined" != typeof window ? window : globalThis);
`;
  fs.writeFileSync(path.join(ROOT, "js/core.js"), out, "utf8");
  console.log(
    `Built js/core.js from ${parts.length} modules (${out.split("\n").length} lines)`,
  );
}

function buildApp() {
  const parts = readDirSorted(path.join(ROOT, "src/app"));
  const body = parts
    .map(
      (p) =>
        `// ============================================================================\n// MODULE: src/app/${p.name}\n// ============================================================================\n${p.content}`,
    )
    .join("\n\n");

  const out = `/**
 * Ma'lumotnoma tuzatgich — Application UI & Feature Modules
 * Auto-generated from modular sources in src/app/*.js via \`npm run build\`
 */
${body}
`;
  fs.writeFileSync(path.join(ROOT, "js/app.js"), out, "utf8");
  console.log(
    `Built js/app.js from ${parts.length} modules (${out.split("\n").length} lines)`,
  );
}

function buildWorker() {
  const src = path.join(ROOT, "src/parseworker.js");
  if (fs.existsSync(src)) {
    const content = fs.readFileSync(src, "utf8");
    fs.writeFileSync(path.join(ROOT, "js/parseworker.js"), content, "utf8");
    console.log(
      `Built js/parseworker.js (${content.split("\n").length} lines)`,
    );
  }
}

buildCore();
const coreHash = shortHash(fs.readFileSync(path.join(ROOT, "js/core.js"), "utf8"));
replaceIfChanged(path.join(ROOT, "src/parseworker.js"), (src) =>
  src.replace(/core\.js\?v=[^"']+/, `core.js?v=${coreHash}`),
);
buildWorker();
const workerHash = shortHash(fs.readFileSync(path.join(ROOT, "js/parseworker.js"), "utf8"));
replaceIfChanged(path.join(ROOT, "src/app/01-ui-review.js"), (src) =>
  src.replace(/js\/parseworker\.js\?v=[^"']+/, `js/parseworker.js?v=${workerHash}`),
);
buildApp();
const appHash = shortHash(fs.readFileSync(path.join(ROOT, "js/app.js"), "utf8"));
const cssHash = shortHash(fs.readFileSync(path.join(ROOT, "css/app.css"), "utf8"));
replaceIfChanged(path.join(ROOT, "index.html"), (html) =>
  html
    .replace(/css\/app\.css\?v=[^"']+/, `css/app.css?v=${cssHash}`)
    .replace(/js\/core\.js\?v=[^"']+/, `js/core.js?v=${coreHash}`)
    .replace(/js\/app\.js\?v=[^"']+/, `js/app.js?v=${appHash}`),
);
const swHash = shortHash(`${cssHash}:${coreHash}:${workerHash}:${appHash}`);
replaceIfChanged(path.join(ROOT, "sw.js"), (sw) =>
  sw
    .replace(/const CACHE = "malumotnoma-offline-[^"]+"/, `const CACHE = "malumotnoma-offline-${swHash}"`)
    .replace(/\.\/css\/app\.css\?v=[^"']+/, `./css/app.css?v=${cssHash}`),
);
console.log(
  `Synced cache versions: css=${cssHash} core=${coreHash} worker=${workerHash} app=${appHash} sw=${swHash}`,
);
