import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_IN_OUT, MUTED, RED, TEXT } from "../look";

const MONO_F = '"DIN Alternate","JetBrains Mono","Roboto Mono",monospace';
const SIZE = 320;

/**
 * 单个仪表。
 * 注意：数值与中文标签全部用 DOM 文本，SVG 里只画线——
 * 运维备忘第 8 条：SVG 内的文本只能是 ASCII，中文会让 WebCodecs 导出失败。
 */
const Gauge: React.FC<{
  cx: number;
  cy: number;
  value: number;
  label: string;
  unit: string;
  accent?: string;
}> = ({ cx, cy, value, label, unit, accent = CYAN }) => {
  const c = SIZE / 2;
  const r = 118;
  const start = -220;
  const end = 40;
  const angle = interpolate(value, [0, 1], [start, end], CLAMP);

  return (
    <div style={{ position: "absolute", left: cx - SIZE / 2, top: cy - SIZE / 2, width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(233,243,255,.1)" strokeWidth={3} />
        <path
          d={`M ${c + r * Math.cos((start * Math.PI) / 180)} ${c + r * Math.sin((start * Math.PI) / 180)} A ${r} ${r} 0 1 1 ${c + r * Math.cos((end * Math.PI) / 180)} ${c + r * Math.sin((end * Math.PI) / 180)}`}
          fill="none"
          stroke={accent}
          strokeWidth={3}
          opacity={0.5}
        />
        <line
          x1={c}
          y1={c}
          x2={c + (r - 14) * Math.cos((angle * Math.PI) / 180)}
          y2={c + (r - 14) * Math.sin((angle * Math.PI) / 180)}
          stroke={TEXT}
          strokeWidth={4}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${accent}88)` }}
        />
        <circle cx={c} cy={c} r={7} fill={TEXT} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: c + 56,
          textAlign: "center",
          fontFamily: MONO_F,
          fontSize: 46,
          fontWeight: 700,
          color: accent === RED ? RED : TEXT,
        }}
      >
        {Math.round(value * 100)}%
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: c + 112, textAlign: "center", fontSize: 24, color: "rgba(233,243,255,.62)" }}>
        {label}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: c + 146, textAlign: "center", fontFamily: MONO_F, fontSize: 15, letterSpacing: 2.4, color: MUTED }}>
        {unit}
      </div>
    </div>
  );
};

/** 镜 11：01:11.5–01:18.5，三个仪表回落，频率抬升 */
export const Shot11: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drop = (delay: number, to: number) =>
    interpolate(
      spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.7, stiffness: 90 } }),
      [0, 1],
      [1, to],
      CLAMP,
    );

  const len = drop(24, 0.38);
  const rc = drop(36, 0.31);
  const tau = drop(48, 0.27);
  const rise = interpolate(frame, [120, 190], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.9} grid={0.45} lightX={900} lightY={520} />

      <Gauge cx={360} cy={430} value={len} label="走线长度" unit="WIRE LENGTH" />
      <Gauge cx={720} cy={430} value={rc} label="寄生 RC" unit="RC LOAD" />
      <Gauge cx={1080} cy={430} value={tau} label="τ" unit="TIME CONSTANT" accent={RED} />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M1380 830 L1820 830 M1380 830 L1380 560" stroke="rgba(233,243,255,.22)" strokeWidth={1.4} fill="none" />
        <path
          d="M1390 820 C1470 790 1530 730 1610 680 C1680 636 1740 600 1806 574"
          fill="none"
          stroke={CYAN}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - rise}
          style={{ filter: "drop-shadow(0 0 16px rgba(47,227,255,.45))" }}
        />
      </svg>

      <Label text="频率 ↑" x={1640} y={500} size={34} color={CYAN} opacity={interpolate(frame, [130, 150], [0, 1], CLAMP)} />

      <Eyebrow text="τ DOWN / FREQUENCY UP" x={120} y={120} opacity={0.72} />
      <Label text="同一制程，更高的频率" x={120} y={152} size={40} color={TEXT} weight={700} />

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 720,
          fontSize: 26,
          color: MUTED,
          letterSpacing: 1,
          opacity: interpolate(frame, [90, 115], [0, 1], CLAMP),
        }}
      >
        导线短了，电容小了，τ 就小了。
      </div>
    </AbsoluteFill>
  );
};
