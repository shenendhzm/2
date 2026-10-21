import { Easing, interpolate } from "remotion";
export const PAPER = "#F6E9D6";
export const INK = "#243029";
export const RED = "#D9542B";
export const MUTED = "#7C6A55";
export const RULE = "rgba(36,48,41,.16)";
export const FONT = '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", sans-serif';
export const MONO = '"JetBrains Mono", "Roboto Mono", monospace';
export const SERIF = 'Georgia, "Times New Roman", "Songti SC", serif';
export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);
export const fadeIn = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE_OUT });
