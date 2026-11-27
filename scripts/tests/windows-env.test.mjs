import assert from "node:assert/strict";
import { test } from "node:test";
import { prependWindowsPath } from "../windows-env.mjs";

test("Windows PATH setup preserves the case-sensitive Path key and existing executables", () => {
  const environment = { Path: "C:\\Program Files\\Git\\cmd;C:\\Windows\\System32" };
  prependWindowsPath(environment, "C:\\Windows\\System32", "C:\\Program Files\\nodejs");
  assert.equal(Object.keys(environment).filter((key) => key.toLowerCase() === "path").length, 1);
  assert.match(environment.Path, /C:\\Program Files\\Git\\cmd/);
  assert.match(environment.Path, /^C:\\Windows\\System32;C:\\Program Files\\nodejs;/);
  assert.equal(environment.PATH, undefined);
});

test("Windows PATH setup creates a path key when the environment did not provide one", () => {
  const environment = { SYSTEMROOT: "C:\\Windows" };
  prependWindowsPath(environment, "C:\\Windows\\System32");
  assert.equal(environment.Path, "C:\\Windows\\System32");
});
