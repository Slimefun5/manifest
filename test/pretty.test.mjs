import { test } from "node:test";
import assert from "node:assert/strict";
import { prettify } from "../src/pretty.mjs";

test("splits camelCase into words", () => {
  assert.equal(prettify("InfinityExpansion"), "Infinity Expansion");
  assert.equal(prettify("SlimefunAdvancements"), "Slimefun Advancements");
  assert.equal(prettify("LuckyBlocks"), "Lucky Blocks");
  assert.equal(prettify("ChestTerminal"), "Chest Terminal");
});

test("keeps acronyms intact", () => {
  assert.equal(prettify("SMG"), "SMG");
});

test("splits an acronym followed by a word", () => {
  assert.equal(prettify("SMGReader"), "SMG Reader");
});
