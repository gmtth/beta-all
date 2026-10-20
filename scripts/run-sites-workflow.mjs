#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { StringDecoder } from "node:string_decoder";
import { accessSync, constants, existsSync, lstatSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  process.stdout.write(
    [
      "Executa o workflow oficial do Sites em um workspace temporário isolado.",
      "Valida projeto, dependências e destino do pacote antes do build/commit/push.",
      "No Windows, localiza o Git Bash e adapta archivePath para o empacotador.",
      "",
      "Uso:",
      "  npm run sites:workflow -- --helper <caminho-absoluto-site-workflow.mjs> --project-id <id>",
      "",
      "Envie um único objeto JSON pelo stdin. Credenciais nunca devem ir em argumentos, arquivos ou logs.",
      "Workspaces com checkout são preservados; workspaces vazios são removidos.",
      "No Windows, SITES_BASH_BIN pode apontar para bash.exe se o Git Bash não estiver no caminho padrão.",
      "",
    ].join("\n"),
  );
}

function parseArgs(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!["--helper", "--project-id"].includes(flag) || values.has(flag) || !args[index + 1]) {
      throw new Error("Use --helper e --project-id, cada um uma vez.");
    }
    values.set(flag, args[++index]);
  }

  const helper = values.get("--helper");
  const projectId = values.get("--project-id");
  if (!helper || !path.isAbsolute(helper) || !projectId || !/^[A-Za-z0-9_-]+$/.test(projectId)) {
    throw new Error("Informe o caminho absoluto do helper oficial e o project_id exato do Site.");
  }

  const helperPath = realpathSync(helper);
  if (path.basename(helperPath) !== "site-workflow.mjs" || !statSync(helperPath).isFile()) {
    throw new Error("O helper precisa apontar para um arquivo site-workflow.mjs existente.");
  }
  return { helperPath, projectId };
}

function readInput() {
  return new Promise((resolve, reject) => {
    let value = "";
    const interactive = Boolean(process.stdin.isTTY && typeof process.stdin.setRawMode === "function");
    const finish = (error) => {
      process.stdin.removeListener("data", onData);
      process.stdin.removeListener("end", onEnd);
      if (interactive) process.stdin.setRawMode(false);
      process.stdin.pause();
      error ? reject(error) : resolve(value);
    };
    const onData = (chunk) => {
      value += chunk;
      if (value.includes("\u0003")) {
        finish(new Error("Workflow cancelado."));
      } else if (value.length > 65536) {
        finish(new Error("O JSON do workflow excede o limite permitido."));
      } else if (value.includes("\n") || value.includes("\r")) {
        finish();
      }
    };
    const onEnd = () => finish();

    if (interactive) {
      process.stderr.write("Envie o JSON do workflow do Sites (entrada oculta):\n");
      process.stdin.setRawMode(true);
    }
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", onData);
    process.stdin.once("end", onEnd);
    process.stdin.resume();
  });
}

function gitBashPath() {
  if (process.platform !== "win32") return undefined;
  const configured = process.env.SITES_BASH_BIN;
  const candidates = [
    ...(configured ? [configured] : []),
    path.join(process.env.ProgramFiles || "C:\\Program Files", "Git", "bin", "bash.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Git", "bin", "bash.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Programs", "Git", "bin", "bash.exe"),
    ...((process.env.PATH || "").split(path.delimiter).map((entry) => path.join(entry, "bash.exe"))),
  ];

  for (const candidate of candidates) {
    if (candidate && path.isAbsolute(candidate) && statFile(candidate)) return realpathSync(candidate);
  }
  throw new Error("Git Bash não foi encontrado. Instale Git for Windows ou defina SITES_BASH_BIN com o caminho de bash.exe.");
}

function statFile(filePath) {
  try { return statSync(filePath).isFile(); } catch { return false; }
}

function windowsToMsysPath(filePath) {
  if (typeof filePath !== "string" || !path.win32.isAbsolute(filePath)) {
    throw new Error("No Windows, archivePath precisa ser um caminho absoluto com letra de unidade.");
  }
  const match = /^([A-Za-z]):[\\/](.*)$/.exec(filePath);
  if (!match) throw new Error("No Windows, archivePath precisa apontar para uma unidade local.");
  return `/${match[1].toLowerCase()}/${match[2].replaceAll("\\", "/")}`;
}

function updateArchivePath(inputText) {
  if (process.platform !== "win32") return { inputText, archiveMsysPath: undefined, archiveWindowsPath: undefined };
  let request;
  try { request = JSON.parse(inputText); } catch { return { inputText, archiveMsysPath: undefined, archiveWindowsPath: undefined }; }
  if (!request || typeof request !== "object" || typeof request.archivePath !== "string") {
    return { inputText, archiveMsysPath: undefined, archiveWindowsPath: undefined };
  }
  const archiveWindowsPath = request.archivePath;
  const archiveMsysPath = windowsToMsysPath(archiveWindowsPath);
  request.archivePath = archiveMsysPath;
  return { inputText: JSON.stringify(request), archiveMsysPath, archiveWindowsPath };
}

function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function parseWorkflowInput(inputText, projectId, helperPath) {
  let request;
  try { request = JSON.parse(inputText); } catch { throw new Error("Envie um objeto JSON válido para o workflow do Sites."); }
  if (!request || typeof request !== "object" || Array.isArray(request)) throw new Error("O workflow do Sites precisa ser um objeto JSON.");
  let preflightCheckout;

  if (request.source !== undefined) {
    const checkoutPath = request.source?.checkout_path;
    if (request.source?.project_id !== projectId || typeof checkoutPath !== "string" || !path.isAbsolute(checkoutPath) || !existsSync(checkoutPath) || !statSync(checkoutPath).isDirectory()) {
      throw new Error("A abertura precisa corresponder ao project_id e apontar para um checkout existente.");
    }
    const checkout = realpathSync(checkoutPath);
    if (isWithin(monorepoRoot, checkout)) throw new Error("O checkout do Site precisa ficar fora do monorepo beta-all.");
    let gitRoot;
    try { gitRoot = realpathSync(execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: checkout, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()); }
    catch { throw new Error("O checkout do Site não tem um repositório Git válido."); }
    if (gitRoot !== checkout) throw new Error("O caminho informado não é a raiz do checkout Git do Site.");
    const manifestPath = path.join(checkout, ".openai", "hosting.json");
    let manifest;
    try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { throw new Error("O checkout não contém um .openai/hosting.json válido."); }
    if (manifest?.project_id !== projectId) throw new Error("O project_id do checkout não corresponde ao Site selecionado.");

    if (request.archivePath !== undefined) {
      if (request.commands !== undefined && !validCommands(request.commands)) {
        throw new Error("commands precisa conter comandos no formato de listas de argumentos.");
      }
      if (typeof request.archivePath !== "string" || !path.isAbsolute(request.archivePath)) throw new Error("archivePath precisa ser um caminho absoluto.");
      const archivePath = path.resolve(request.archivePath);
      const archiveParent = path.dirname(archivePath);
      if (!existsSync(archiveParent) || !statSync(archiveParent).isDirectory()) throw new Error("A pasta de destino do pacote não existe; crie-a antes de iniciar a publicação.");
      try { accessSync(archiveParent, constants.W_OK); } catch { throw new Error("A pasta de destino do pacote não permite gravação."); }
      if (existsSync(archivePath)) throw new Error("O arquivo de pacote já existe; escolha um nome de destino novo para evitar sobrescrita.");
      const actualArchivePath = path.join(realpathSync(archiveParent), path.basename(archivePath));
      if (isWithin(checkout, archivePath) || isWithin(checkout, actualArchivePath)) throw new Error("O pacote precisa ficar fora do checkout do Site para não entrar no commit.");
      const packageHelper = path.join(path.dirname(helperPath), "package-site.mjs");
      if (!statFile(packageHelper)) throw new Error("O helper package-site.mjs não foi encontrado junto ao workflow oficial.");
      request.archivePath = archivePath;
      request.commands ??= [];
      if (!Array.isArray(request.commands)) throw new Error("commands precisa ser uma lista de comandos.");
      ensureBuildCommand(request.commands, path.join(path.dirname(helperPath), "build-site.mjs"));
      preflightCheckout = checkout;
    }
  } else if (request.archivePath !== undefined) {
    throw new Error("Abra o Site primeiro e informe o resultado em source antes de publicar.");
  }

  if (request.commands !== undefined && !validCommands(request.commands)) {
    throw new Error("commands precisa conter comandos no formato de listas de argumentos.");
  }
  return { inputText: JSON.stringify(request), checkoutPath: preflightCheckout };
}

function ensureBuildCommand(commands, buildHelperPath) {
  if (!statFile(buildHelperPath)) throw new Error("O helper build-site.mjs não foi encontrado junto ao workflow oficial.");
  const alreadyBuilds = commands.some((args) => args.some((arg) => typeof arg === "string" && /(?:^|[\\/])build-site\.mjs$/i.test(arg)));
  if (!alreadyBuilds) commands.push([process.execPath, buildHelperPath]);
}

function validCommands(commands) {
  return Array.isArray(commands) && commands.every((command) =>
    Array.isArray(command) && command.length > 0 && command.every((arg) => typeof arg === "string"),
  );
}

async function prepareSiteDependencies(checkout) {
  const packagePath = path.join(checkout, "package.json");
  const lockPath = path.join(checkout, "package-lock.json");
  let manifest;
  try { manifest = JSON.parse(readFileSync(packagePath, "utf8")); } catch { throw new Error("Pré-voo bloqueado: package.json ausente ou inválido."); }
  if (!existsSync(lockPath)) throw new Error("Pré-voo bloqueado: package-lock.json ausente; não é seguro instalar dependências sem lockfile.");
  if (manifest.packageManager && !/^npm(?:@|$)/.test(manifest.packageManager)) throw new Error("Pré-voo bloqueado: o projeto declara outro gerenciador de pacotes; ajuste o workflow para ele.");

  const dependenciesPath = path.join(checkout, "node_modules");
  const markerPath = path.join(dependenciesPath, ".beta-sites-dependencies.json");
  const fingerprint = createHash("sha256")
    .update(readFileSync(packagePath)).update("\0").update(readFileSync(lockPath)).update("\0").update(process.versions.node.split(".")[0])
    .digest("hex");
  const linkedDependencies = lstatSafe(dependenciesPath)?.isSymbolicLink() ?? false;
  const marker = linkedDependencies ? undefined : readJsonSafe(markerPath);
  const buildBinary = path.join(dependenciesPath, ".bin", process.platform === "win32" ? "vinext.cmd" : "vinext");
  if (marker?.fingerprint === fingerprint && statFile(buildBinary)) {
    process.stderr.write("Pré-voo: dependências instaladas e compatíveis com os manifests.\n");
    return;
  }
  if (linkedDependencies) {
    if (statFile(buildBinary)) {
      process.stderr.write("Pré-voo: usando dependências vinculadas existentes; instalação ignorada para preservar a pasta compartilhada.\n");
      return;
    }
    throw new Error("Pré-voo bloqueado: node_modules é um link e não contém Vinext; não vou executar npm ci sobre dependências compartilhadas.");
  }

  process.stderr.write("Pré-voo: instalando dependências com npm ci no checkout isolado...\n");
  const result = await runNpmCi(checkout);
  if (result !== 0) throw new Error("Pré-voo bloqueado: npm ci falhou; nenhum commit ou push foi iniciado.");
  if (!statFile(buildBinary)) throw new Error("Pré-voo bloqueado: npm ci terminou, mas o executável Vinext não foi encontrado.");
  writeFileSync(markerPath, `${JSON.stringify({ fingerprint }, null, 2)}\n`, { flag: "w" });
  process.stderr.write("Pré-voo: dependências prontas.\n");
}

function runNpmCi(cwd) {
  const command = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "npm";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm ci"] : ["ci"];
  const child = spawn(command, args, { cwd, stdio: "inherit", windowsHide: true });
  return new Promise((resolve, reject) => {
    child.once("error", () => reject(new Error("Não foi possível iniciar npm ci no checkout do Site.")));
    child.once("close", (code) => resolve(code ?? 1));
  });
}

function lstatSafe(filePath) { try { return lstatSync(filePath); } catch { return undefined; } }
function readJsonSafe(filePath) { try { return JSON.parse(readFileSync(filePath, "utf8")); } catch { return undefined; } }

function printHelperOutput(line, archiveMsysPath, archiveWindowsPath, ending = "\n") {
  let output = line;
  if (archiveMsysPath && archiveWindowsPath) {
    try {
      const result = JSON.parse(line);
      if (result?.archive === archiveMsysPath) {
        result.archive = archiveWindowsPath;
        output = JSON.stringify(result);
      }
    } catch {}
  }
  process.stdout.write(output + ending);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) return usage();

  let selected;
  try { selected = parseArgs(args); } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
    return;
  }

  const workspace = mkdtempSync(path.join(os.tmpdir(), "beta-sites-workflow-"));
  process.stderr.write(`Workspace isolado do Sites: ${workspace}\n`);

  let input;
  let adapted;
  let bashPath;
  try {
    input = await readInput();
    const validatedInput = parseWorkflowInput(input, selected.projectId, selected.helperPath);
    adapted = updateArchivePath(validatedInput.inputText);
    if (adapted.archiveMsysPath) bashPath = gitBashPath();
    if (validatedInput.checkoutPath) await prepareSiteDependencies(validatedInput.checkoutPath);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    rmSync(workspace, { recursive: true, force: true });
    process.exitCode = 1;
    return;
  }

  const environment = { ...process.env };
  if (bashPath) {
    const bashDirectory = path.dirname(bashPath);
    const nodeDirectory = path.dirname(process.execPath);
    environment.PATH = `${bashDirectory}${path.delimiter}${nodeDirectory}${path.delimiter}${environment.PATH || ""}`;
  }

  const child = spawn(process.execPath, [selected.helperPath, "--project-id", selected.projectId], {
    cwd: workspace,
    env: environment,
    stdio: ["pipe", "pipe", "inherit"],
    windowsHide: true,
  });

  const decoder = new StringDecoder("utf8");
  let pending = "";
  child.stdout.on("data", (chunk) => {
    pending += decoder.write(chunk);
    let newline;
    while ((newline = pending.indexOf("\n")) !== -1) {
      const line = pending.slice(0, newline).replace(/\r$/, "");
      printHelperOutput(line, adapted.archiveMsysPath, adapted.archiveWindowsPath);
      pending = pending.slice(newline + 1);
    }
  });
  child.once("error", () => {
    process.stderr.write("Não foi possível iniciar o helper oficial do Sites.\n");
    process.exitCode = 1;
  });
  child.once("close", (code, signal) => {
    pending += decoder.end();
    if (pending) printHelperOutput(pending, adapted.archiveMsysPath, adapted.archiveWindowsPath, "");

    const remaining = readdirSync(workspace);
    if (remaining.length === 0) {
      rmSync(workspace, { recursive: true, force: false });
    } else {
      process.stderr.write(`Workspace preservado para continuar ou recuperar o checkout: ${workspace}\n`);
    }
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 1;
  });

  child.stdin.end(`${adapted.inputText}\n`);
}

main().catch((error) => {
  process.stderr.write("O workflow do Sites não pôde ser preparado.\n");
  process.exitCode = 1;
});
