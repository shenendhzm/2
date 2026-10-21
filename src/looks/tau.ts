import { Easing, interpolate } from "remotion";

/**
 * 片头（S1）六种风格的统一色板。
 * 一套镜头代码 + 一组色板 = 六个样片，只换视觉语言，不动时间轴。
 */
export type TauSurface = "grid" | "dots" | "glow" | "lines" | "scan";

export type TauPlate = {
  /** 合成 id */
  id: string;
  /** 中文风格名 */
  label: string;
  /** 一句话说明 */
  note: string;
  bg: string;
  ink: string;
  accent: string;
  muted: string;
  surface: TauSurface;
  /** 左上角制图编号 */
  header: string;
  /** 右上角制图编号 */
  right: string;
  /** 左上角第二行小字 */
  chrome: string;
  font: string;
  mono: string;
  serif: string;
};

const CJK = '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", sans-serif';
const MONO = '"JetBrains Mono", "Roboto Mono", "SF Mono", monospace';
const SERIF = 'Georgia, "Noto Serif", "Times New Roman", serif';

export const PLATES: TauPlate[] = [
  {
    id: "TauLawBlack",
    label: "纯黑底",
    note: "黑底 · 米白制图线 · 朱红强调",
    bg: "#000000",
    ink: "#F4F1EA",
    accent: "#E5484D",
    muted: "#8A8578",
    surface: "grid",
    header: "TAU · SCALING LAW",
    right: "SHOT 01 / 08",
    chrome: "PLATE 01 · INK & RULE",
    font: CJK,
    mono: MONO,
    serif: SERIF,
  },
  {
    id: "TauLawGold",
    label: "黑金",
    note: "墨黑 · 琥珀金 · 细制图线",
    bg: "#0B0906",
    ink: "#F3E9D2",
    accent: "#E0A94A",
    muted: "#9A8767",
    surface: "grid",
    header: "TAU · GOLD",
    right: "SHOT 01 / 08",
    chrome: "PLATE 02 · AMBER EDITION",
    font: CJK,
    mono: MONO,
    serif: SERIF,
  },
  {
    id: "TauLawDots",
    label: "黑点阵",
    note: "黑底 · 34px 细点阵 · 冰蓝",
    bg: "#000000",
    ink: "#F2EDE4",
    accent: "#8FD8FF",
    muted: "#8A8272",
    surface: "dots",
    header: "TAU · GRID 34",
    right: "SHOT 01 / 08",
    chrome: "PLATE 03 · DOT MATRIX 34PX",
    font: CJK,
    mono: MONO,
    serif: SERIF,
  },
  {
    id: "TauLawGlow",
    label: "黑光晕",
    note: "黑底 · 环境光 · 琥珀",
    bg: "#000000",
    ink: "#F2EDE4",
    accent: "#E0A94A",
    muted: "#8A8272",
    surface: "glow",
    header: "TAU · LOW KEY",
    right: "SHOT 01 / 08",
    chrome: "PLATE 04 · AMBIENT GLOW",
    font: CJK,
    mono: MONO,
    serif: SERIF,
  },
  {
    id: "TauLawLines",
    label: "黑横线",
    note: "黑底 · 7px 细横纹 · 朱红",
    bg: "#000000",
    ink: "#F2EDE4",
    accent: "#FF5A4E",
    muted: "#8A8272",
    surface: "lines",
    header: "TAU · SCAN",
    right: "SHOT 01 / 08",
    chrome: "PLATE 05 · SCANLINE 7PX",
    font: CJK,
    mono: MONO,
    serif: SERIF,
  },
  {
    id: "TauLawCrt",
    label: "CRT 终端",
    note: "荧光绿 · 扫描线 · 终端绿字",
    bg: "#020604",
    ink: "#8CFFB0",
    accent: "#FF5C5C",
    muted: "#3E7A57",
    surface: "scan",
    header: "> TAU.SYS — RUN 01",
    right: "SHOT 01 / 08",
    chrome: "PLATE 06 · PHOSPHOR",
    font: CJK,
    mono: MONO,
    serif: SERIF,
  },
];

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);

export const ramp = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing = EASE_OUT,
) => interpolate(frame, input, output, { ...CLAMP, easing });
