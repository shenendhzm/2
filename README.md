# 牛顿第一定律 · Remotion 工程

> **当前状态（2026-10-24）**：工程已切到 12 镜 / 2940 帧 / 98.000s 的《牛顿第一定律》讲解片。
> 现在出的是**15 秒样片**：镜 1 + 镜 2 前 7s，合成 `NewtonSample`（450 帧 = 15.000s）。
> 新代码在 `src/newton/`，分镜见 `docs/分镜表-牛顿第一定律.md`，部署链路见 `docs/运维备忘.md`。
> 旧的《韬（τ）定律》16 镜代码仍保留在 `src/film/`、`src/plates.tsx` 等，未注册、不再使用。
> 声音：`public/newton-sample.wav`（15.000s，`scripts/make-newton-sample.py` 纯 Python 合成）。

## 现在就能看

| 用途 | 地址 | 状态 |
| --- | --- | --- |
| 公网出片页（手机浏览器直接出 MP4） | https://shenendhzm.github.io/2/ | GitHub Pages（永久） |
| Remotion Studio（预览 / 拖时间轴 / 热更新） | http://127.0.0.1:3033 | 需 `npm run studio` |
| 本地出片页 | http://127.0.0.1:3034 | 需 `npm run web:serve` |

出片页点「渲染」，浏览器用 WebCodecs 逐帧编码，完成后直接预览和下载，**不经过容器里的 Chromium**。

## 时间轴（唯一来源：`src/newton/data.ts`）

| 镜 | 帧区间 | 时间码 | 内容 |
| --- | --- | --- | --- |
| 1 | 0–240 | 00:00–00:08 | 轨道生长、球入画、抛出问题 |
| 2 | 240–465 | 00:08–00:15.5 | 推箱松手，直觉登场 |
| 3 | 465–750 | 00:15.5–00:25 | 伽利略双斜面 |
| 4 | 750–990 | 00:25–00:33 | 斜面放平，越滚越远 |
| 5 | 990–1305 | 00:33–00:43.5 | 白场，定律原文 |
| 6 | 1305–1545 | 00:43.5–00:51.5 | 惯性：那层壳 |
| 7 | 1545–1785 | 00:51.5–00:59.5 | 公交车前后倾 |
| 8 | 1785–2010 | 00:59.5–01:07 | 太空探测器 |
| 9 | 2010–2235 | 01:07–01:14.5 | 力 = 改变 |
| 10 | 2235–2460 | 01:14.5–01:22 | 惯性不是力 |
| 11 | 2460–2700 | 01:22–01:30 | 闭环：摩擦消失 |
| 12 | 2700–2940 | 01:30–01:38 | 金句与片名 |

样片 = 0–450 帧（15.000s）；全片 2940 帧 = 98.000s。字幕 33 条，与 `牛顿第一定律-旁白字幕.srt` 逐条对齐。

## 目录

```
src/index.ts                    registerRoot 入口
src/Root.tsx                    合成注册：NewtonSample（450 帧 / 30fps / 1920×1080）
src/HelloWorld.tsx              整片时间轴（镜 1 + 镜 2，含字幕层与收黑）
src/newton/look.ts              色板 / 字体 / interpolate·spring 工具
src/newton/geometry.ts          轨道透视 u = D0/d、球半径、确定性摩擦噪点
src/newton/data.ts              12 镜时间轴 + 33 条字幕（唯一时间来源）
src/newton/components/          Stage / Track / Ball / Subtitles / ui
src/newton/scenes/Shot01..02.tsx  已落地两镜
src/newton/score.ts             声音地址解析（兼容 /2/ 子路径）
web/main.tsx                    出片页（常量与 Root 同步）
web/index.html                  出片页入口（必须指向 ./bundle.js）
scripts/make-newton-sample.py   15s 声音合成
scripts/deploy-gh-pages.mjs     用 Git Data API 发 gh-pages（不依赖 git push）
docs/分镜表-牛顿第一定律.md      12 镜分镜表 + 33 条字幕轨
docs/运维备忘.md                换对话接手必读（部署链路 / 本机坑）
```

## 命令

```bash
npm run studio        # 起 Studio（3033），已带网络补丁
npm run web:bundle    # 重建出片页 dist-web/（会先清空）
npm run web:serve     # 本地出片页（3034）
npm run bundle        # 只打包，验证工程能否编译（不起浏览器）
npm run score:sample  # 重新合成 10s 声音
node scripts/deploy-gh-pages.mjs   # 发布 dist-web 到 gh-pages
npm run render        # 命令行出片 —— 本机跑不通，见下
```

## 本机的坑（已绕过）

1. **Chromium 起不来**：`remotion render` / `still` / `compositions` 都会在启动瞬间被平台 shim 杀掉（`free(): invalid pointer`）。所以本机只能走浏览器 WebCodecs 出片页。
2. **不能用 `remotion.config.ts`**：esbuild 是静态 Go 程序，看不到假根路径，配置一律写命令行参数。
3. **`os.networkInterfaces()` 抛 EACCES**：已用 `scripts/fix-network-interfaces.cjs` 打补丁，`npm run studio` 内置。
4. **esbuild 只认相对路径**：出片页用 esbuild CLI 直打，entry/outfile 用相对路径。
5. **画布栅格化的两个限制**（出片页与 Studio 可能不一致，务必按这两条写）：
   - 一个元素的多层 `background-image` 只画第一层 → 网格、金属、光带都要拆成独立子层；
   - SVG 内不放文字（渲染器用 `btoa()` 序列化，非 ASCII 会坏）。
6. **`github.com` 直连时通时不通**：发布走 `scripts/deploy-gh-pages.mjs`（api.github.com + Git Data API）。

## 出片

1. 手机浏览器打开 https://shenendhzm.github.io/2/ （或本地 3034）。
2. 页面顶部是 16:9 预览，`autoPlay + loop`，先看节奏对不对。
3. 点「渲染「开头样片」10 秒」→ WebCodecs 逐帧编码 → 完成后直接预览 / 下载 MP4。
4. 300 帧在手机上约 1–2 分钟；渲染时保持页面在前台、别锁屏。
