import { staticFile } from "remotion";

/**
 * 配乐与音效地址：
 * - 浏览器（Studio / 出片页）按当前页面地址解析，兼容 GitHub Pages 的 /2/ 子路径；
 * - CLI 渲染时回退到 public/ 下的静态文件。
 *
 * score-sample.m4a：11.000s 原创配乐（A 小调 pad + 55Hz 次低音 + 2.45s 卡尺咬合
 * + 6.85s 扫光 + 9.05s 低频撞击），来自 scripts/make-s1-score.py。
 * impact-open.wav：补 0.9s 的「第一击」，让 0 帧的尺子砸入有声音。
 */
const bust = "?v=2";

const url = (file: string) =>
  typeof document !== "undefined"
    ? new URL(file + bust, document.baseURI).href
    : staticFile(file);

export const SCORE_SRC = url("score-sample.m4a");
export const IMPACT_SRC = url("impact-open.wav");
