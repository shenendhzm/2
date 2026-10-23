import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { TauGlyph } from "../components/ui";
import { CLAMP, CYAN, EASE_IN_OUT, EASE_OUT, MUTED, TEXT } from "../look";

/** 镜 16：01:47–01:54，引文 → 片名 → 黑场 */
export const Shot16: React.FC = () => {
  const frame = useCurrentFrame();

  const expand = interpolate(frame, [0, 46], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const band = interpolate(frame, [26, 76], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const quote = interpolate(frame, [62, 86], [0, 1], CLAMP);
  const author = interpolate(frame, [80, 98], [0, 1], CLAMP);
  const title = interpolate(frame, [112, 140], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const fade = interpolate(frame, [162, 194], [0, 1], CLAMP);
  const pulse = interpolate(frame, [188, 210], [0.18, 0.55], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      {/* τ 放大失焦，化成光带 */}
      <div
        style={{
          position: "absolute",
          left: 960 - 160,
          top: 430 - 160,
          opacity: (1 - expand) * 0.95,
          filter: `blur(${expand * 18}px)`,
          transform: `scale(${1 + expand * 1.5})`,
        }}
      >
        <TauGlyph size={320} progress={1} color={CYAN} strokeWidth={5} glow={1.4} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 960 - 760 * band,
          top: 462,
          width: 1520 * band,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${CYAN}, #EAF8FF, ${CYAN}, transparent)`,
          boxShadow: "0 0 40px rgba(47,227,255,.55)",
          opacity: band,
        }}
      />

      {/* 引文 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 268,
          textAlign: "center",
          fontSize: 44,
          lineHeight: 1.6,
          color: TEXT,
          letterSpacing: 1.5,
          opacity: quote,
        }}
      >
        “τ定律是华为可以选择的唯一一条突围道路。”
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 348,
          textAlign: "center",
          fontSize: 26,
          letterSpacing: 3,
          color: MUTED,
          opacity: author,
        }}
      >
        —— 任正非
      </div>

      {/* 片名 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 560,
          textAlign: "center",
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: 8,
          color: TEXT,
          opacity: title,
        }}
      >
        韬（τ）定律
      </div>

      <AbsoluteFill style={{ background: "#000", opacity: fade }} />

      {/* 最后一秒：只剩一个呼吸的 τ */}
      <div style={{ position: "absolute", left: 960 - 22, top: 500, opacity: pulse }}>
        <TauGlyph size={44} progress={1} color={CYAN} strokeWidth={7} glow={1.2} />
      </div>
    </AbsoluteFill>
  );
};
