import React from "react";
import { CYAN, MONO } from "../look";

/** 小标签：等宽、大字距、青色——全片统一的「工程标注」 */
export const Eyebrow: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
  align?: "left" | "center" | "right";
  width?: number;
}> = ({ text, x, y, size = 22, color = CYAN, opacity = 1, align = "left", width = 900 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      fontFamily: MONO,
      fontSize: size,
      letterSpacing: 4.5,
      color,
      opacity,
      textAlign: align,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

/** 正文标签（中文）：字距略收，冷白 */
export const Label: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
  align?: "left" | "center" | "right";
  width?: number;
  weight?: number;
}> = ({ text, x, y, size = 30, color, opacity = 1, align = "left", width = 900, weight = 500 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      fontSize: size,
      fontWeight: weight,
      color,
      opacity,
      textAlign: align,
      letterSpacing: 1,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

/** τ 字形：两条笔画，按 progress 逐笔写出来 */
export const TauGlyph: React.FC<{
  size: number;
  progress: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  glow?: number;
  style?: React.CSSProperties;
}> = ({ size, progress, color = CYAN, strokeWidth = 7, opacity = 1, glow = 1, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      opacity,
      filter: `drop-shadow(0 0 ${18 * glow}px ${color}66)`,
      overflow: "visible",
      ...style,
    }}
  >
    <path
      d="M14 20 H86"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - Math.min(1, progress * 2)}
    />
    <path
      d="M50 20 V58 C50 76 60 86 84 88"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - Math.max(0, Math.min(1, (progress - 0.5) * 2))}
    />
  </svg>
);

/** 细横线（可带两端刻度） */
export const Hairline: React.FC<{
  x: number;
  y: number;
  w: number;
  color?: string;
  opacity?: number;
  h?: number;
}> = ({ x, y, w, color = CYAN, opacity = 0.5, h = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: color, opacity }} />
);

/** 数据卡：等宽标题 + 大数字 */
export const StatCard: React.FC<{
  x: number;
  y: number;
  w: number;
  title: string;
  value: string;
  note?: string;
  opacity?: number;
  accent?: string;
}> = ({ x, y, w, title, value, note, opacity = 1, accent = CYAN }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      opacity,
      padding: "22px 24px",
      border: `1px solid ${accent}44`,
      background: "linear-gradient(180deg, rgba(9,16,24,.92), rgba(5,8,12,.92))",
      borderRadius: 4,
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: accent, opacity: 0.9 }}>
      {title}
    </div>
    <div
      style={{
        fontFamily: MONO,
        fontSize: 58,
        fontWeight: 700,
        color: "#E9F3FF",
        marginTop: 10,
        lineHeight: 1.05,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </div>
    {note ? (
      <div style={{ fontSize: 21, color: "rgba(233,243,255,.5)", marginTop: 8 }}>{note}</div>
    ) : null}
  </div>
);

/**
 * 网格：两条单层渐变分别画横线与竖线。
 * 不能用「一条 background-image 里塞两个 gradient」—— 出片页的栅格化只画第一层，
 * 结果就是网格只剩横线（或整块填充丢失）。
 */
export const Grid: React.FC<{
  sizeX?: number;
  sizeY?: number;
  color: string;
  inset?: number;
  style?: React.CSSProperties;
}> = ({ sizeX = 40, sizeY = 40, color, inset = 0, style }) => (
  <>
    <div
      style={{
        position: "absolute",
        inset,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: `100% ${sizeY}px`,
        ...style,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset,
        backgroundImage: `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: `${sizeX}px 100%`,
        ...style,
      }}
    />
  </>
);
