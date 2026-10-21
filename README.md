# Remotion Hello World（已在本机容器内跑通）

用 React 写视频的项目骨架，结构等同 Remotion 官方 `template-helloworld`：
一个 5 秒、1280×720、30fps 的合成（`HelloWorld`），带弹簧入场、光晕、进度条和帧计数。

## 现在就能看

| 用途 | 地址 | 状态 |
| --- | --- | --- |
| Remotion Studio（预览 / 拖时间轴 / 改代码热更新） | http://127.0.0.1:3033 | 已启动，已验证返回 200 |
| 浏览器渲染页（手机上直接出 MP4） | http://127.0.0.1:3034 | 已启动，**已实测出片成功** |

Studio 已经在后台跑着，直接在手机浏览器里开 `http://127.0.0.1:3033` 即可。改 `src/HelloWorld.tsx` 后 Studio 会自动热更新。

渲染页打开后点「渲染 5 秒 MP4」，它就是在这台手机的浏览器里用 WebCodecs 逐帧编码，完成后页面里能直接预览并下载（不经过容器里的 Chromium）。**本机已实测通过**：150 帧全部渲染并下载成功，走的是 `MP4 / H.264`（没触发 VP8 兜底）。

## 目录

```
src/index.ts        registerRoot 入口
src/Root.tsx        合成注册（id: HelloWorld，150 帧 / 30fps / 1280×720）
src/HelloWorld.tsx  画面本身，改这里就是改视频
web/main.tsx        浏览器渲染页（@remotion/web-renderer）
scripts/fix-network-interfaces.cjs  修 os.networkInterfaces() 在本机报 EACCES
scripts/serve-web.cjs               挂 dist-web 的极简静态服务器
dist-web/           渲染页构建产物（index.html + bundle.js）
```

## 命令

```bash
npm run studio        # 起 Studio（3033），已带网络补丁
npm run bundle        # 只打包（不需要浏览器），验证工程能否编译
npm run web:bundle    # 重新构建浏览器渲染页
npm run web:serve     # 起渲染页静态服务（3034）
npm run render        # 命令行出片 —— 见下方「已知限制」，本机跑不通
npm run still         # 导出单帧 —— 同上
```

注意：`remotion compositions`（列出合成）也要拉起浏览器，本机同样用不了，所以冒烟测试请用 `npm run bundle`。

## 换任意 GitHub 仓库的流程（已在官方模板上验证）

用官方 `remotion-dev/template-helloworld`（带 zod schema、eslint 配置，348 个依赖）实测：
下载 zip → `npm install`（2 分钟）→ 删掉 `remotion.config.ts` → `npm run bundle` 成功（33 MB 产物）。
只有拉起浏览器的步骤会失败，其余全部正常。

## 这个容器里踩到的三个坑（已绕过）

1. **`os.networkInterfaces()` 抛 EACCES**（Android 不给枚举网卡）。Remotion 起预览服务器时会调它 → 用 `NODE_OPTIONS --require ./scripts/fix-network-interfaces.cjs` 包一层，失败返回 `{}`。`npm run studio` 已内置。
2. **`remotion.config.ts` 加载失败**：Remotion 用 esbuild 编译配置文件，而本机是 LD_PRELOAD 假根（guest 路径 ↔ 宿主机 `/data/data/com.dsh.bxroot/files/linux/ubuntu`），esbuild 是静态 Go 程序，看不到 guest 绝对路径 → `Could not resolve .../remotion.config.ts`。所以本项目**不用配置文件**，需要什么就写在命令行参数里。同理，`vite build` 也会在这个环节失败，构建渲染页改用 `esbuild` CLI + 相对路径。
3. **Chromium 起不来**，因此 `npm run render` / `remotion still` 在本机无效：
   - 平台 shim 会无条件注入到每个子进程；它初始化时做 glibc livepatch，Chromium 一进来就 `free(): invalid pointer`（SIGABRT）。
   - 用静态 busybox 做跳板、`env -u LD_PRELOAD`、宿主路径直跑都试过：注入仍在（子进程 environ 里照样有 `LD_PRELOAD`），换成 `BXROOT_NO_AUTORUN=1` 则 shim 初始化被跳过，Chromium 能 `--version` 但读文件时报 ICU 错误，node 直接被 seccomp 杀。
   - 下载本身不是问题：第一次走 `www.remotion.dev` 跳转到 `playwright.download.prss.microsoft.com` 时 DNS 解析失败，但 arm64 的 `chrome-headless-shell` 可以从 `https://cdn.npmmirror.com/binaries/playwright/builds/chromium/1161/chromium-headless-shell-linux-arm64.zip` 手动下到；后来在官方模板里 Remotion 自己也成功下完了 93.6 MB（落盘 `node_modules/.remotion/`）。
   - 问题在于**下到了也跑不起来**：无论走哪个来源，Chromium 进程都在启动瞬间被 shim 干掉。
   - 结论：**容器内渲染这条路被平台堵死**，出片改走浏览器 WebCodecs（`web/main.tsx`）。到普通电脑上 `npm run render` 是正常的。

## 换成你自己的 GitHub 仓库

本机**直连 `github.com` 不通**，但 `codeload.github.com` 和几个代理可用：

```bash
# 方式一：直接下 zip（最省事）
curl -L -o repo.zip https://codeload.github.com/<owner>/<repo>/zip/refs/heads/main
unzip repo.zip && cd <repo>-main && npm install

# 方式二：走代理 clone
git clone https://ghproxy.net/https://github.com/<owner>/<repo>.git
```

装完把 `package.json` 里的 `scripts.studio` 换成：

```
NODE_OPTIONS=--require=./scripts/fix-network-interfaces.cjs remotion studio --port 3033 --no-open
```

（把本仓库的 `scripts/fix-network-interfaces.cjs` 拷过去；如果对方项目自带 `remotion.config.ts`，删掉它，配置改用命令行参数。）

## 在普通电脑上出片

```bash
npm install
npx remotion render HelloWorld out/video.mp4
```
