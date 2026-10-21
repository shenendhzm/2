import { staticFile } from "remotion";

/**
 * 配乐地址：
 * - 浏览器（Studio / 出片页）按当前页面地址解析，兼容 GitHub Pages 的 /2/ 子路径；
 * - CLI 渲染时回退到 public/ 下的静态文件。
 */
export const SCORE_SRC =
  typeof document !== "undefined"
    ? new URL("score-sample.m4a?v=5", document.baseURI).href
    : staticFile("score-sample.m4a");
