import { Easing, interpolate } from "remotion";
export const PAPER = "#FFFFFF";
export const INK = "#0B0B0B";
export const RED = "#E30613";
export const MUTED = "#6E6E6E";
export const RULE = "rgba(11,11,11,.14)";
export const FONT = '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", sans-serif';
export const MONO = '"JetBrains Mono", "Roboto Mono", monospace';
export const SERIF = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif';
export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);
export const fadeIn = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE_OUT });
