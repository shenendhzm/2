import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { TauGlyph } from "../components/ui";
import { CLAMP, CYAN, EASE_IN_OUT, EASE_OUT, MUTED, TEXT } from "../look";

/** 镜 4：00:18–00:25，τ 写出 → 片名 */
export const Shot04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const write = interpolate(frame, [8, 44], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const bloom = interpolate(frame, [40, 70], [0, 1], CLAMP);
  const ring = interpolate(frame, [40, 110], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const titleIn = spring({ frame: frame - 52, fps, config: { damping: 18, mass: 0.8, stiffness: 120 } });
  const subIn = interpolate(frame, [70, 88], [0, 1], CLAMP);
  const wave = interpolate(frame, [88, 150], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const flash = interpolate(frame, [192, 204, 212], [0, 1, 0], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.55 + 0.45 * bloom} grid={0.25 + 0.2 * bloom} lightX={960} lightY={420} />

      {/* 极坐标网格 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.34 * bloom }}>
        {[220, 380, 560, 760].map((r) => (
          <circle
            key={r}
            cx={960}
            cy={430}
            r={r}
            fill="none"
            stroke={CYAN}
            strokeWidth={1}
            opacity={interpolate(ring, [0, 1], [0, 0.5], CLAMP)}
          />
        ))}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={960 + Math.cos(a) * 220}
              y1={430 + Math.sin(a) * 220}
              x2={960 + Math.cos(a) * 760}
              y2={430 + Math.sin(a) * 760}
              stroke={CYAN}
              strokeWidth={0.7}
              opacity={0.22 * ring}
            />
          );
        })}
      </svg>

      {/* τ */}
      <div style={{ position: "absolute", left: 960 - 210, top: 430 - 210 }}>
        <TauGlyph size={420} progress={write} color={CYAN} strokeWidth={6.5} glow={1 + bloom} />
      </div>

      {/* 片名 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 690,
          height: 120,
          overflow: "hidden",
          opacity: interpolate(titleIn, [0, 0.4], [0, 1], CLAMP),
        }}
      >
        <div
          style={{
            transform: `translateY(${(1 - titleIn) * 120}%)`,
            textAlign: "center",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: 6,
            color: TEXT,
            lineHeight: 1.1,
          }}
        >
          韬（τ）定律
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 820,
          textAlign: "center",
          fontSize: 32,
          letterSpacing: 3,
          color: MUTED,
          opacity: subIn,
        }}
      >
        以“时间缩微”替代“几何缩微”
      </div>

      {/* 示波器波形 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.55 * wave }}>
        <path
          d="M120 980 L260 980 L300 930 L340 1020 L380 980 L1520 980 L1560 900 L1600 980 L1800 980"
          fill="none"
          stroke={CYAN}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - wave}
        />
      </svg>

      <AbsoluteFill style={{ background: "#DFF6FF", opacity: flash * 0.7, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
