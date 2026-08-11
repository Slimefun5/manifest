import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGithubLibs } from "../src/gradleDeps.mjs";

test("extracts Slimefun5 github coordinates, deduped and lowercased", () => {
  const g = [
    'githubImplementation("Slimefun5:InfinityLib:1.3.12")',
    "githubCompileOnly('Slimefun5:InfinityExpansion:1.1.2')",
    'githubImplementation("Slimefun5:InfinityLib:1.3.12")',
    'implementation("com.example:other:1.0")',
  ].join("\n");
  assert.deepEqual(parseGithubLibs(g).sort(), ["infinityexpansion", "infinitylib"]);
});

test("no github deps yields empty array", () => {
  assert.deepEqual(parseGithubLibs('implementation("a:b:1")'), []);
});
