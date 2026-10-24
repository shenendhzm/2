import { staticFile } from "remotion";

/**
 * 声音资产。浏览器（Studio / 出片页）按页面地址解析，
 * 兼容 GitHub Pages 的 /2/ 子路径；CLI 渲染时回退到 public/ 下的静态文件。
 */
const bust = "?v=1";

const url = (file: string) =>
  typeof document !== "undefined"
    ? new URL(file + bust, document.baseURI).href
    : staticFile(file);

/** 开头样片 15.000s：轨道滚动底噪 → 4s 静音 → 8s 落点 → 松手滑行 → 13.3s 停住 */
export const SAMPLE_SRC = url("newton-sample.wav");
