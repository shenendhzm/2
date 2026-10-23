import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_IN, EASE_OUT, MUTED, RED, TEXT } from "../look";

const LATTICE = Array.from({ length: 11 * 6 }, (_, i) => ({
  x: 260 + (i % 11) * 128,
  y: 300 + Math.floor(i / 11) * 120,
}));

/** 镜 6：00:33–00:40.5，原子尺度 + 红墙压下 */
export const Shot06: React.FC = () => {
  const frame = useCurrentFrame();

  const push = interpolate(frame, [0, 120], [1, 1.22], { ...CLAMP, easing: EASE_OUT });
  const wall = interpolate(frame, [104, 124], [-700, 0], { ...CLAMP, easing: EASE_IN });
  const hit = interpolate(frame, [124, 126, 132], [0, 1, 0], CLAMP);
  const squash = interpolate(frame, [120, 150], [1, 0.42], { ...CLAMP, easing: EASE_IN });
  const words = [150, 166, 182];

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.9} grid={0.2} lightX={960} lightY={520} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${push})`,
          transformOrigin: "50% 58%",
        }}
      >
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.75 }}>
          {LATTICE.map((p, i) => (
            <g key={i}>
              {i % 11 !== 10 && (
                <line x1={p.x} y1={p.y} x2={p.x + 128} y2={p.y} stroke={CYAN} strokeWidth={1} opacity={0.16} />
              )}
              {i < 55 && (
                <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 120} stroke={CYAN} strokeWidth={1} opacity={0.16} />
              )}
              <circle cx={p.x} cy={p.y} r={7} fill="rgba(47,227,255,.55)" />
            </g>
          ))}
          {/* 电子：沿通道穿行 */}
          {[0, 1, 2].map((k) => {
            const x = interpolate(frame, [0, 120], [300 + k * 90, 1300 + k * 60], CLAMP);
            const y = 300 + (k % 3) * 240;
            return (
              <g key={k}>
                <circle cx={x} cy={y} r={14} fill="#EAF8FF" opacity={0.9} />
                <circle cx={x} cy={y} r={26} fill="#EAF8FF" opacity={0.12} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* 红墙 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 430,
          transform: `translateY(${wall}px)`,
          background:
            "linear-gradient(180deg, rgba(255,77,61,.42), rgba(255,77,61,.16) 62%, rgba(255,77,61,0))",
          borderBottom: `2px solid ${RED}`,
          boxShadow: `0 30px 90px rgba(255,77,61,${0.35 * (1 - Math.abs(wall) / 700)})`,
        }}
      />
      <AbsoluteFill style={{ background: RED, opacity: hit * 0.18, mixBlendMode: "screen" }} />

      {/* 被压平的曲线 */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, transform: `scaleY(${squash})`, transformOrigin: "50% 470px" }}
      >
        <path
          d="M180 470 C320 460 420 420 520 380 C620 340 700 320 820 310"
          fill="none"
          stroke={CYAN}
          strokeWidth={3}
          opacity={0.85}
        />
      </svg>

      <Eyebrow text="ATOMIC SCALE / LIMIT" x={120} y={470} opacity={0.7} />
      <Label text="几何缩微撞墙" x={120} y={500} size={40} color={TEXT} weight={700} />

      {["物理极限", "成本", "光刻"].map((w, i) => {
        const o = interpolate(frame, [words[i], words[i] + 12], [0, 1], CLAMP);
        const y = interpolate(frame, [words[i], words[i] + 12], [16, 0], { ...CLAMP, easing: EASE_OUT });
        return (
          <div
            key={w}
            style={{
              position: "absolute",
              left: 1180 + i * 210,
              top: 520,
              transform: `translateY(${y}px)`,
              opacity: o,
              fontSize: 34,
              color: TEXT,
              letterSpacing: 2,
              padding: "10px 18px",
              border: "1px solid rgba(255,77,61,.45)",
              background: "rgba(255,77,61,.08)",
            }}
          >
            {w}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 1180,
          top: 596,
          fontSize: 20,
          color: MUTED,
          opacity: interpolate(frame, [186, 200], [0, 0.8], CLAMP),
          letterSpacing: 1,
        }}
      >
        三条约束同时收紧，纳米尺子失效
      </div>
    </AbsoluteFill>
  );
};
