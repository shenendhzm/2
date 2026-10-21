import { Easing, interpolate } from "remotion";

/** 全片统一色板（与脚本《华为τ定律-旁白动画脚本-107s.md》一致） */
export const BG = "#060A12";
export const PANEL = "#0E1626";
export const CYAN = "#2BE3C9";
export const RED = "#E5484D";
export const AMBER = "#F2B33D";
export const TEXT = "#E9F0FA";
export const MUTED = "#7F93AD";

export const FONT =
  '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
export const MONO = '"DIN Alternate", "JetBrains Mono", "Roboto Mono", monospace';

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);

/** 0→1 的淡入，带 ease-out */
export const fadeIn = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...CLAMP,
    easing: EASE_OUT,
  });

/** 带缓动的区间映射 */
export const ramp = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing = EASE_OUT,
) => interpolate(frame, input, output, { ...CLAMP, easing });
