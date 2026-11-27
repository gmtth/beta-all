import path from "node:path";

export function prependWindowsPath(environment, ...prefixes) {
  const pathKey = Object.keys(environment).find((key) => key.toLowerCase() === "path") ?? "Path";
  const existing = environment[pathKey] ?? environment.PATH ?? "";
  environment[pathKey] = [...prefixes, existing].filter(Boolean).join(path.delimiter);
}
