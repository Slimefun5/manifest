function parseList(text, key) {
  const inline = text.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]`, "m"));
  if (inline) {
    return inline[1].split(",").map((s) => s.trim()).filter(Boolean).map((s) => s.toLowerCase());
  }
  const block = text.match(new RegExp(`^${key}:\\s*\\n((?:\\s*-\\s*.+\\n?)+)`, "m"));
  if (block) {
    return block[1].split("\n").map((l) => l.replace(/^\s*-\s*/, "").trim())
      .filter(Boolean).map((s) => s.toLowerCase());
  }
  return [];
}

export function parsePluginYml(text) {
  const name = text.match(/^name:\s*(.+?)\s*$/m);
  return {
    name: name ? name[1].trim() : null,
    depend: parseList(text, "depend"),
    softdepend: parseList(text, "softdepend"),
  };
}
