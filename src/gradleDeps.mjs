export function parseGithubLibs(text) {
  const re = /github(?:Implementation|CompileOnly)\(\s*["']Slimefun5:([A-Za-z0-9_-]+)/g;
  const out = new Set();
  let m;
  while ((m = re.exec(text)) !== null) out.add(m[1].toLowerCase());
  return [...out];
}
