import { Easing, interpolate } from "remotion";
export const PAPER = "#020604";
export const INK = "#8CFFB0";
export const RED = "#FF5C5C";
export const MUTED = "#3E7A57";
export const RULE = "rgba(140,255,176,.14)";
export const FONT = '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", sans-serif';
export const MONO = '"JetBrains Mono", "Roboto Mono", monospace';
export const SERIF = 'Georgia, "Times New Roman", serif';
export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);
export const fadeIn = (frame: number, start: number, dur = 12) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASE_OUT });
