import { parsePluginYml } from "./pluginYml.mjs";
import { parseGithubLibs } from "./gradleDeps.mjs";

const IGNORE = new Set(["web", "manifest", "builds", "wiki", "workflows", "gradle", ".github", "bot", "slimefun5.github.io"]);
const idOf = (repo) => repo.split("/")[1].toLowerCase();
const ignored = (repo) => { const n = idOf(repo); return IGNORE.has(n) || n.endsWith(".wiki"); };

export function classify(repos, files) {
  const core = { id: "slimefun", repo: "Slimefun5/Slimefun5", name: "Slimefun", kind: "core", dependencies: [], pluginName: "Slimefun" };
  const addons = [];
  const libRefs = new Set();
  for (const repo of repos) {
    if (repo === core.repo || ignored(repo)) continue;
    const f = files[repo] || {};
    const gLibs = f.buildGradle ? parseGithubLibs(f.buildGradle) : [];
    gLibs.forEach((l) => libRefs.add(l));
    if (f.pluginYml) {
      const p = parsePluginYml(f.pluginYml);
      const deps = [...new Set([...p.depend, ...gLibs].filter((d) => d !== "slimefun"))];
      const slimefunBuild = f.buildGradle ? /slimefun-addon\.gradle|["']Slimefun5:/.test(f.buildGradle) : false;
      if (p.depend.includes("slimefun") || slimefunBuild) {
        addons.push({ id: idOf(repo), repo, name: p.name || idOf(repo), kind: "addon", dependencies: deps, pluginName: p.name });
      }
    }
  }
  const addonIds = new Set(addons.map((a) => a.id));
  const libraries = repos
    .filter((repo) => !ignored(repo) && repo !== core.repo)
    .filter((repo) => libRefs.has(idOf(repo)) && !addonIds.has(idOf(repo)))
    .map((repo) => ({ id: idOf(repo), repo, name: repo.split("/")[1], kind: "library", dependencies: [], pluginName: null }));
  return { core, libraries, addons };
}
