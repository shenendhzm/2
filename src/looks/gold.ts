import { Easing, interpolate } from "remotion";
export const PAPER = "#0B0906";
export const INK = "#F3E9D2";
export const RED = "#E0A94A";
export const MUTED = "#9A8767";
export const RULE = "rgba(243,233,210,.14)";
export const FONT = '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", sans-serif';
export const MONO = '"JetBrains Mono", "Roboto Mono", monospace';
export const SERIF = 'Georgia, "Times New Roman", serif';
export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);
export const fadeIn = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE_OUT });
