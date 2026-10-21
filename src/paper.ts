import { Easing, interpolate } from "remotion";

/** 纸面工程图风格色板 */
export const PAPER = "#F3EEE4";
export const INK = "#17140F";
export const RED = "#C8402A";
export const MUTED = "#6F675C";
export const RULE = "rgba(23,20,15,.16)";

export const FONT =
  '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
export const MONO = '"JetBrains Mono", "Roboto Mono", "DIN Alternate", monospace';
export const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);

export const fadeIn = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...CLAMP,
    easing: EASE_OUT,
  });

export const ramp = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing = EASE_OUT,
) => interpolate(frame, input, output, { ...CLAMP, easing });
