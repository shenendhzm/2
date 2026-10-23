#!/usr/bin/env node
/**
 * 把工程源码同步到 shenendhzm/2 的 main 分支（只增改，不删除）。
 *
 * 背景：容器随时会被回收，gh-pages 只有构建产物；源码必须在 main 上才留得住。
 * 走 API 的原因同 deploy-gh-pages.mjs：github.com 的 git 传输不稳，api.github.com 稳。
 *
 * 用法：node scripts/push-source.mjs [--dry]
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OWNER = "shenendhzm";
const REPO = "2";
const BRANCH = "main";
const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const API = "https://api.github.com";
const SKIP = new Set(["node_modules", "dist-web", "build", "out", ".git", ".remotion"]);

const dry = process.argv.includes("--dry");
const token = process.env.GH_TOKEN || readToken();

function readToken() {
  try {
    return readFileSync("/root/.dsh/gh_token", "utf8").trim();
  } catch {
    return "";
  }
}
if (!token) {
  console.error("缺少 token");
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
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const gitSha = (buf) =>
  createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");

const local = walk(ROOT).map((abs) => {
  const buf = readFileSync(abs);
  return { path: relative(ROOT, abs).split("\\").join("/"), buf, sha: gitSha(buf) };
});

const ref = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
const head = ref.object.sha;
const commit = await api(`/repos/${OWNER}/${REPO}/git/commits/${head}`);
const baseTree = commit.tree.sha;

const remote = new Map();
let page = 1;
for (;;) {
  const t = await api(`/repos/${OWNER}/${REPO}/git/trees/${baseTree}?recursive=1&page=${page}`);
  for (const e of t.tree) remote.set(e.path, e.sha);
  if (t.tree.length === 0 || page >= 20) break;
  page += 1;
}

const changed = local.filter((f) => remote.get(f.path) !== f.sha);
const missingOnRemote = [...remote.keys()].filter((p) => !existsSync(join(ROOT, p)));

console.log(`本地 ${local.length} 个文件，远端 ${remote.size} 个；改动 ${changed.length} 个`);
for (const f of changed) console.log(`  M ${f.path}`);
if (missingOnRemote.length) console.log(`  远端独有（保留）：${missingOnRemote.length} 个`);

if (dry) process.exit(0);
if (changed.length === 0) {
  console.log("没有改动");
  process.exit(0);
}

const entries = [];
for (const f of changed) {
  const blob = await api(`/repos/${OWNER}/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: f.buf.toString("base64"), encoding: "base64" }),
  });
  entries.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
  process.stdout.write(".");
}

const tree = await api(`/repos/${OWNER}/${REPO}/git/trees`, {
  method: "POST",
  body: JSON.stringify({ base_tree: baseTree, tree: entries }),
});

const next = await api(`/repos/${OWNER}/${REPO}/git/commits`, {
  method: "POST",
  body: JSON.stringify({
    message: `feat: 片头重做（0 帧砸入 / 数字硬切 / 配乐对位）\n\n${changed
      .slice(0, 12)
      .map((f) => `- ${f.path}`)
      .join("\n")}`,
    tree: tree.sha,
    parents: [head],
  }),
});

await api(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
  method: "PATCH",
  body: JSON.stringify({ sha: next.sha, force: false }),
});

console.log(`\nmain → ${next.sha.slice(0, 7)}（${changed.length} 个文件）`);
