export function topoSort(entries) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const seen = new Set();
  const out = [];
  const visit = (e) => {
    if (seen.has(e.id)) return;
    seen.add(e.id);
    for (const d of e.dependencies || []) if (byId.has(d)) visit(byId.get(d));
    out.push(e);
  };
  for (const e of entries) visit(e);
  return out;
}

const withMeta = (e, meta) => ({
  ...e,
  dependencies: [...new Set(e.dependencies)].sort(),
  defaultBranch: meta.defaultBranch[e.repo] || null,
  branches: (meta.branches[e.repo] || (meta.defaultBranch[e.repo] ? [meta.defaultBranch[e.repo]] : [])).slice().sort(),
});

export function buildManifest(classified, meta) {
  return {
    core: withMeta(classified.core, meta),
    libraries: classified.libraries.slice().sort((a, b) => a.id.localeCompare(b.id)).map((l) => withMeta(l, meta)),
    addons: topoSort(classified.addons).map((a) => withMeta(a, meta)),
  };
}
