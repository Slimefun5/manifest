import { makeClient } from "./github.mjs";
import { classify } from "./classify.mjs";
import { buildManifest } from "./manifest.mjs";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export async function runDetect({ org, client, now }) {
  const repos = await client.listOrgRepos(org);
  const files = {};
  const meta = { generatedAt: now, defaultBranch: {}, branches: {} };
  for (const { repo, defaultBranch } of repos) {
    meta.defaultBranch[repo] = defaultBranch;
    const pluginYml = await client.getFile(repo, "plugin.yml", defaultBranch)
      || await client.getFile(repo, "src/main/resources/plugin.yml", defaultBranch);
    const buildGradle = await client.getFile(repo, "build.gradle", defaultBranch)
      || await client.getFile(repo, "build.gradle.kts", defaultBranch);
    files[repo] = { pluginYml, buildGradle };
    meta.branches[repo] = await client.getBranches(repo);
  }
  return buildManifest(classify(repos.map((r) => r.repo), files), meta);
}

async function main() {
  const client = makeClient({ token: process.env.GITHUB_TOKEN });
  const manifest = await runDetect({ org: "Slimefun5", client, now: new Date().toISOString() });
  writeFileSync(new URL("../addons.json", import.meta.url), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${manifest.addons.length} addons, ${manifest.libraries.length} libraries`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
