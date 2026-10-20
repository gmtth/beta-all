#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const componentRoot = path.join(repoRoot, "mcp", "movidesk");
const componentPrefix = "mcp/movidesk/";
const excludedPrefixes = ["work/", "legado/", "docs/", "tests/", "scripts/"];
const excludedFiles = new Set([
  "AGENTS.md",
  "DOSSIER.md",
  "CONVERSA_LEGADA.md",
  "arquitetura-base-compartilhada-beta.md",
  ".openai/hosting.json",
]);

function usage() {
  process.stdout.write(
    [
      "Sincroniza os arquivos-fonte do MCP para um checkout aberto pelo helper oficial do Sites.",
      "",
      "Uso:",
      "  npm run sites:sync -- <caminho-do-checkout-sites> [--dry-run]",
      "",
      "O comando preserva .git, .openai, arquivos ignorados e dados locais do checkout.",
      "Depois, use o helper oficial do Sites para build, push e empacotamento.",
      "",
    ].join("\n"),
  );
}

function git(cwd, args, options = {}) {
  return execFileSync("git", args, {
    cwd,
    encoding: options.encoding ?? "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

function readJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    throw new Error(`${label} ausente ou inválido: ${filePath}`);
  }
}

function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function isExcluded(relativePath) {
  return (
    excludedFiles.has(relativePath) ||
    excludedPrefixes.some((prefix) => relativePath.startsWith(prefix)) ||
    /^\.env(?:\.|$)/i.test(relativePath)
  );
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    usage();
    return;
  }

  const dryRun = args.includes("--dry-run");
  const positional = args.filter((arg) => arg !== "--dry-run");
  if (positional.length !== 1) {
    usage();
    process.exitCode = 2;
    return;
  }

  const targetRoot = path.resolve(positional[0]);
  if (!existsSync(targetRoot) || !statSync(targetRoot).isDirectory()) {
    throw new Error("O caminho do checkout Sites não existe ou não é uma pasta.");
  }
  if (isWithin(componentRoot, targetRoot) || isWithin(targetRoot, componentRoot)) {
    throw new Error("O checkout Sites não pode ser a pasta do componente nem conter a fonte canônica.");
  }

  const sourceManifest = readJson(path.join(componentRoot, ".openai", "hosting.json"), "Manifesto canônico");
  const targetManifestPath = path.join(targetRoot, ".openai", "hosting.json");
  const targetManifest = readJson(targetManifestPath, "Manifesto do checkout Sites");
  if (!sourceManifest.project_id || sourceManifest.project_id !== targetManifest.project_id) {
    throw new Error("O checkout Sites pertence a outro projeto; nenhum arquivo foi alterado.");
  }

  const targetGitRoot = path.resolve(git(targetRoot, ["rev-parse", "--show-toplevel"]).trim());
  if (targetGitRoot !== targetRoot) {
    throw new Error("O caminho informado precisa ser a raiz do checkout Git do Sites.");
  }

  const targetRemote = git(targetRoot, ["remote", "get-url", "origin"]).trim();
  const canonicalRemote = git(repoRoot, ["remote", "get-url", "origin"]).trim();
  if (!targetRemote || targetRemote === canonicalRemote || /github\.com[:/]gmtth\/beta-all(?:\.git)?$/i.test(targetRemote)) {
    throw new Error("O remote do checkout não parece ser a origem gerenciada do Sites.");
  }

  const targetStatus = git(targetRoot, ["status", "--porcelain", "--untracked-files=no"]).trim();
  if (targetStatus) {
    throw new Error("O checkout Sites tem alterações rastreadas locais. Preserve-as e abra um checkout limpo antes de sincronizar.");
  }

  const sourcePaths = git(repoRoot, ["ls-files", "-z", "--", componentPrefix], { encoding: "buffer" })
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((repoPath) => repoPath.slice(componentPrefix.length))
    .filter((relativePath) => !isExcluded(relativePath));

  const sensitivePaths = sourcePaths.filter((relativePath) => /^\.env(?:\.|$)/i.test(relativePath));
  if (sensitivePaths.length) {
    throw new Error(`A fonte contém arquivos de ambiente rastreados (${sensitivePaths.length}); remova-os do Git antes de sincronizar.`);
  }

  const sourceSet = new Set(sourcePaths);
  for (const relativePath of sourcePaths) {
    const sourcePath = path.resolve(componentRoot, ...relativePath.split("/"));
    if (!isWithin(componentRoot, sourcePath) || !existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
      throw new Error(`Arquivo rastreado ausente na fonte canônica: ${relativePath}`);
    }
  }

  const targetTracked = git(targetRoot, ["ls-files", "-z"], { encoding: "buffer" })
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((relativePath) => relativePath.replaceAll("\\", "/"));
  const stalePaths = targetTracked.filter(
    (relativePath) => !relativePath.startsWith(".openai/") && relativePath !== ".openai" && !sourceSet.has(relativePath),
  );
  const actions = [
    ...sourcePaths.map((relativePath) => ({ type: "copy", relativePath })),
    ...stalePaths.map((relativePath) => ({ type: "remove", relativePath })),
  ];

  if (dryRun) {
    process.stdout.write(
      `Simulação: ${sourcePaths.length} arquivos para copiar, ${stalePaths.length} arquivos rastreados obsoletos para remover. Nenhuma alteração feita.\n`,
    );
    return;
  }

  for (const { type, relativePath } of actions) {
    if (relativePath === ".openai" || relativePath.startsWith(".openai/")) continue;
    const targetPath = path.resolve(targetRoot, ...relativePath.split("/"));
    if (!isWithin(targetRoot, targetPath)) throw new Error("Foi detectado um caminho fora do checkout Sites.");

    if (type === "copy") {
      const sourcePath = path.resolve(componentRoot, ...relativePath.split("/"));
      mkdirSync(path.dirname(targetPath), { recursive: true });
      writeFileSync(targetPath, readFileSync(sourcePath));
    } else if (existsSync(targetPath)) {
      if (!lstatSync(targetPath).isFile()) throw new Error(`O caminho obsoleto não é um arquivo regular: ${relativePath}`);
      rmSync(targetPath);
    }
  }

  process.stdout.write(
    `Sincronização concluída para o projeto Sites ${sourceManifest.project_id}: ${sourcePaths.length} arquivos copiados, ${stalePaths.length} obsoletos removidos.\n`,
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`Falha na sincronização: ${error.message}\n`);
  process.exitCode = 1;
}
