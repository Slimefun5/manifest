import { parsePluginYml } from "./pluginYml.mjs";
import { parseGithubLibs } from "./gradleDeps.mjs";
import { prettify } from "./pretty.mjs";

const IGNORE = new Set(["web", "manifest", "builds", "wiki", "workflows", "gradle", ".github", "bot", "slimefun5.github.io"]);
const idOf = (repo) => repo.split("/")[1].toLowerCase();

/**
 * The guide/installer icon for each known project, keyed by id.
 *
 * Lives here rather than in addons.json because classify() rebuilds every entry from scratch on each
 * generate run, so a hand-edited icon in the JSON is wiped the next time this runs - and the bundled
 * copy in core is refreshed straight from that JSON, which is how the icons were lost once already.
 * An id that is not listed falls back to a generic icon per kind in core.
 */
const ICONS = {
  slimefun: "BLAZE_POWDER",
  infinitylib: "BOOK", advancementapi: "BOOK", slimefunmetrics: "BOOK",
  infinityexpansion: "NETHER_STAR", networks: "HOPPER", exoticgarden: "MELON",
  dynatech: "FURNACE", galactifun: "FIREWORK_ROCKET", slimetinker: "ANVIL",
  fluffymachines: "PISTON", litexpansion: "REDSTONE", sensibletoolbox: "IRON_PICKAXE",
  chestterminal: "CHEST", extragear: "DIAMOND_CHESTPLATE", luckyblocks: "GOLD_BLOCK",
  missilewarfare: "TNT", slimefunadvancements: "KNOWLEDGE_BOOK", souljars: "SOUL_LANTERN",
  smg: "SMOOTH_STONE", simpleutils: "CRAFTING_TABLE", foxymachines: "BLAST_FURNACE",
  geneticchickengineering: "EGG", supreme: "DIAMOND_SWORD", fastmachines: "DISPENSER",
};

const withIcon = (entry) => (ICONS[entry.id] ? { ...entry, icon: ICONS[entry.id] } : entry);

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
      const deps = [...new Set([...p.depend, ...gLibs].filter((d) => d !== "slimefun" && d !== "slimefun5"))];
      const slimefunBuild = f.buildGradle ? /slimefun-addon\.gradle|["']Slimefun5:/.test(f.buildGradle) : false;
      if (p.depend.includes("slimefun") || slimefunBuild) {
        addons.push({ id: idOf(repo), repo, name: prettify(repo.split("/")[1]), kind: "addon", dependencies: deps, pluginName: p.name });
      }
    }
  }
  const addonIds = new Set(addons.map((a) => a.id));
  const libraries = repos
    .filter((repo) => !ignored(repo) && repo !== core.repo)
    .filter((repo) => libRefs.has(idOf(repo)) && !addonIds.has(idOf(repo)))
    .map((repo) => ({ id: idOf(repo), repo, name: prettify(repo.split("/")[1]), kind: "library", dependencies: [], pluginName: null }));
  return { core: withIcon(core), libraries: libraries.map(withIcon), addons: addons.map(withIcon) };
}
