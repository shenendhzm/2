#!/usr/bin/env node
/**
 * 把 dist-web/ 发布到 shenendhzm/2 的 gh-pages 分支。
 *
 * 为什么不用 git push：本机直连 github.com 时通时不通（备忘第三节补），
 * 而 api.github.com 稳定。这里用 GitHub REST 的 Git Data API 造一次提交：
 *   blob → tree → commit → PATCH ref
 * 等价于 `git push --force origin HEAD:gh-pages`，但不受 SSH/HTTPS 连通性影响。
 *
 * token：优先 env GH_TOKEN，其次 /root/.dsh/gh_token。
 * 用法：node scripts/deploy-gh-pages.mjs [--dry]
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OWNER = "shenendhzm";
const REPO = "2";
const BRANCH = "gh-pages";
const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist-web");
const API = "https://api.github.com";
const dry = process.argv.includes("--dry");

const token = process.env.GH_TOKEN || readToken();
function readToken() {
  try {
    return readFileSync("/root/.dsh/gh_token", "utf8").trim();
  } catch {
    return "";
  }
}

if (!token && !dry) {
  console.error("缺少 token：设置 GH_TOKEN，或写入 /root/.dsh/gh_token");
  process.exit(2);
}

async function api(path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(DIST).map((abs) => ({
  path: relative(DIST, abs).split("\\").join("/"),
  data: readFileSync(abs),
}));

// .nojekyll：别让 Pages 用 Jekyll 处理产物
files.push({ path: ".nojekyll", data: Buffer.from("") });

console.log(`待发布 ${files.length} 个文件：`);
for (const f of files) console.log(`  ${f.path.padEnd(24)} ${(f.data.length / 1024).toFixed(1)} KB`);

if (dry) {
  const digest = createHash("sha256");
  for (const f of files) digest.update(f.path).update(f.data);
  console.log(`dry-run ok · tree digest ${digest.digest("hex").slice(0, 12)}`);
  process.exit(0);
}

const ref = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`).catch((e) => {
  console.warn(`读取 ${BRANCH} 失败（可能是首次发布）：${e.message.slice(0, 120)}`);
  return null;
});
const parentSha = ref?.object?.sha ?? null;
console.log(`父提交：${parentSha ?? "（无，首次建分支）"}`);

const blobs = [];
for (const f of files) {
  const blob = await api(`/repos/${OWNER}/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: f.data.toString("base64"), encoding: "base64" }),
  });
  blobs.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
  process.stdout.write(".");
}
console.log(`\nblob 上传完成 ${blobs.length} 个`);

const tree = await api(`/repos/${OWNER}/${REPO}/git/trees`, {
  method: "POST",
  body: JSON.stringify({ tree: blobs }),
});

const commit = await api(`/repos/${OWNER}/${REPO}/git/commits`, {
  method: "POST",
  body: JSON.stringify({
    message: `deploy: 韬（τ）定律 片头样片 · ${new Date().toISOString()}`,
    tree: tree.sha,
    parents: parentSha ? [parentSha] : [],
  }),
});

await api(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
  method: "PATCH",
  body: JSON.stringify({ sha: commit.sha, force: true }),
});

console.log(`已推送 ${BRANCH} → ${commit.sha.slice(0, 7)}`);
console.log("https://shenendhzm.github.io/2/ 约 1 分钟后生效");
