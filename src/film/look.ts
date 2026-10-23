import { Easing, interpolate } from "remotion";

/**
 * 《韬（τ）定律》技术讲解短片 · 视觉基准
 * 规格：1920×1080 / 30fps / 全片 3420 帧 = 114.000s
 * 本文件只放色板、字体与插值工具；动画只用 interpolate / spring / Easing。
 */

export const W = 1920;
export const H = 1080;

/** 底：近黑蓝，比纯黑更有空气感 */
export const BG = "#05070C";
/** 主文字：冷白 */
export const TEXT = "#E9F3FF";
/** 强调一：电光青（τ / 光 / 数据） */
export const CYAN = "#2FE3FF";
/** 强调二：朱红（断裂 / 危险 / 关键路径） */
export const RED = "#FF4D3D";
/** 次级信息 */
export const MUTED = "#6C7A8C";

export const FONT =
  '"Noto Sans CJK SC","Noto Sans CJK","Noto Sans SC","Source Han Sans SC","PingFang SC","Microsoft YaHei",sans-serif';
export const MONO =
  '"DIN Alternate","JetBrains Mono","Roboto Mono",ui-monospace,"SF Mono",monospace';

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);
export const EASE_IN = Easing.in(Easing.cubic);

/** 带缓动的区间映射（越界即钳制） */
export const ramp = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing = EASE_OUT,
) => interpolate(frame, input, output, { ...CLAMP, easing });

/** 淡入 */
export const fadeIn = (frame: number, start: number, dur = 12, easing = EASE_OUT) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing });

/** 淡出 */
export const fadeOut = (frame: number, start: number, dur = 12, easing = EASE_IN) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...CLAMP, easing });
