import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const CONFIG = ".oxlintrc.json";
const RULE = "wrap-it-up/no-comments";
const accept = process.argv.includes("--accept");

type Diagnostic = { code: string; filename: string; message: string };

const runLint = (): Diagnostic[] => {
  let stdout: string;
  try {
    stdout = execFileSync(
      "npm",
      ["run", "--silent", "lint", "--", "-f", "json"],
      {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      },
    );
  } catch (error) {
    stdout = (error as { stdout: string }).stdout;
  }
  return JSON.parse(stdout).diagnostics;
};

const config = JSON.parse(readFileSync(CONFIG, "utf8"));
const [severity, options = {}] = config.rules[RULE];
const allowed: Record<string, number> = { ...options.allowed };
const before = { ...allowed };

for (const file of Object.keys(allowed)) {
  if (!existsSync(file)) {
    delete allowed[file];
  }
}

for (const { code, filename, message } of runLint()) {
  if (code !== `wrap-it-up(no-comments)`) {
    continue;
  }
  const tooFew = message.match(/^Ratchet : (\d+) commentaire/);
  const forbidden = message.match(/^Commentaire interdit \((\d+) pour/);
  if (tooFew) {
    allowed[filename] = Number(tooFew[1]);
  } else if (forbidden && accept) {
    allowed[filename] = Number(forbidden[1]);
  }
}

for (const [file, count] of Object.entries(allowed)) {
  if (count === 0) {
    delete allowed[file];
  }
}

const sorted = Object.fromEntries(
  Object.entries(allowed).toSorted(([a], [b]) => a.localeCompare(b)),
);
config.rules[RULE] = [severity, { ...options, allowed: sorted }];
writeFileSync(CONFIG, `${JSON.stringify(config, null, 2)}\n`);
execFileSync("npx", ["oxfmt", CONFIG], { stdio: "inherit" });

for (const file of new Set([...Object.keys(before), ...Object.keys(sorted)])) {
  if (before[file] !== sorted[file]) {
    console.log(`${file} : ${before[file] ?? 0} → ${sorted[file] ?? 0}`);
  }
}
const total = Object.values(sorted).reduce((sum, count) => sum + count, 0);
console.log(
  `${total} commentaire(s) toléré(s) dans ${Object.keys(sorted).length} fichier(s).`,
);
