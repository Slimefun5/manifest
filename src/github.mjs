const API = "https://api.github.com";

export function makeClient({ token, fetchImpl = fetch } = {}) {
  const headers = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const get = async (url) => {
    const res = await fetchImpl(url, { headers });
    if (res.ok) return res.json();
    if (res.status === 404) return null;
    throw new Error(`GitHub ${res.status} for ${url}`);
  };
  return {
    async listOrgRepos(org) {
      const out = [];
      for (let page = 1; ; page++) {
        const batch = await get(`${API}/orgs/${org}/repos?per_page=100&page=${page}`);
        if (!batch || batch.length === 0) break;
        for (const r of batch) out.push({ repo: r.full_name, defaultBranch: r.default_branch });
        if (batch.length < 100) break;
      }
      return out;
    },
    async getFile(repo, path, ref) {
      const data = await get(`${API}/repos/${repo}/contents/${path}?ref=${ref}`);
      if (!data || !data.content) return null;
      return Buffer.from(data.content, "base64").toString("utf8");
    },
    async getBranches(repo) {
      const data = await get(`${API}/repos/${repo}/branches?per_page=100`);
      return data ? data.map((b) => b.name).sort() : [];
    },
  };
}
