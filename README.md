# 韬（τ）定律 · Remotion 视频（片头样片 8 秒 × 六风格）

本工程做完 `华为韬定律-技术解析脚本.md`（120 秒 / 8 个镜头）的**片头 S1**：
横屏 1920×1080 / 30fps / **240 帧 = 8.000s**，同一段画面配六套色板（纯黑底 / 黑金 / 黑点阵 / 黑光晕 / 黑横线 / CRT），
用来定全片风格。完整 8 镜分镜表见 `docs/分镜表.md`，确认后再做 S2–S8。

配乐由 `scripts/make-title-score.py` 用 numpy 合成（A 小调 pad + 55Hz 次低音 + 每 2s 一次低频脉冲，8.000s 收在琶音进入前）。

## 现在就能看

| 用途 | 地址 | 状态 |
| --- | --- | --- |
| Remotion Studio（预览 / 拖时间轴 / 热更新） | http://127.0.0.1:3033 | 需 `npm run studio` |
| 浏览器渲染页（手机上直接出 MP4） | http://127.0.0.1:3034 | 需 `npm run web:serve` |
| 公网出片页 | https://shenendhzm.github.io/2/ | GitHub Pages（永久） |

出片页里点风格卡片实时预览，点「渲染」在手机浏览器里用 WebCodecs 逐帧编码，
完成后直接预览和下载，不经过容器里的 Chromium。

## 目录

```
src/index.ts        registerRoot 入口
src/Root.tsx        合成注册：TauLawBlack / Gold / Dots / Glow / Lines / Crt（240 帧 / 30fps / 1920×1080）
src/looks/tau.ts    六套色板 + 缓动工具
src/components/TauBackdrop.tsx  片头背景语言（网格 / 点阵 / 光晕 / 横纹 / 扫描线）
src/scenes/S1Tau.tsx            S1「τ 浮现」镜头（帧 0–240）
src/plates.tsx      六支片头样片 = 同一镜头 × 六套色板
src/score.ts        配乐地址解析（兼容 Studio / 本地 / gh-pages 子路径）
public/score-title.m4a  8 秒原创配乐（AAC 192k）
scripts/make-title-score.py  numpy 加法合成片头配乐
web/main.tsx        出片页（@remotion/web-renderer + AAC 音频）
web/index.html      出片页入口（必须指向 ./bundle.js）
dist-web/           渲染页构建产物（index.html + bundle.js + score-title.m4a）
docs/分镜表.md       完整 8 镜分镜表 + S1 逐帧时间表
docs/运维备忘.md     换对话接手必读（部署链路 / 本机坑）
```

## 命令

```bash
npm run studio        # 起 Studio（3033），已带网络补丁
npm run bundle        # 只打包（不需要浏览器），验证工程能否编译
npm run web:bundle    # 重新构建浏览器渲染页（含配乐 M4A）
npm run web:serve     # 起渲染页静态服务（3034）
npm run score:title   # 重新合成 8 秒片头配乐并编码 M4A
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
