import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
await build({ entryPoints: ["server/index.ts"], outfile: "dist/server/index.js", bundle: true, format: "esm", platform: "neutral", mainFields: ["module", "main"], target: "es2022", sourcemap: false });
mkdirSync("dist/.openai", { recursive: true });
cpSync(".openai/hosting.json", "dist/.openai/hosting.json");
