import { staticFile } from "remotion";

/**
 * 声音资产（三个文件分工）：
 * - score-sample.m4a：11.000s 原创配乐，只铺片头 0–11s
 * - impact-open.wav：0.9s 金属撞击，第 0 帧的「尺子砸入」，也复用在几个转场上
 * - score-bed.wav：114.000s 全片铺底（Am–F–C–G 六段，24kHz 单声道），从 10s 起接棒
 *
 * 浏览器（Studio / 出片页）按页面地址解析，兼容 GitHub Pages 的 /2/ 子路径；
 * CLI 渲染时回退到 public/ 下的静态文件。
 */
const bust = "?v=3";

const url = (file: string) =>
  typeof document !== "undefined"
    ? new URL(file + bust, document.baseURI).href
    : staticFile(file);

export const SCORE_SRC = url("score-sample.m4a");
export const IMPACT_SRC = url("impact-open.wav");
export const BED_SRC = url("score-bed.wav");
