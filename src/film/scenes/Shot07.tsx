import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, Grid, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_IN_OUT, EASE_OUT, MUTED, TEXT } from "../look";

const MONO_F = '"DIN Alternate","JetBrains Mono","Roboto Mono",monospace';

/** 指数充电曲线（示波器面板局部坐标 560×230） */
const CHARGE = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const x = 40 + u * 480;
    const y = 185 - (1 - Math.exp(-u * 3.2)) * 140;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
})();

const FORMULA = ["τ", " = ", "R", " × ", "C"];

/** 镜 7：00:40.5–00:48.5，RC 充电与 τ = R × C */
export const Shot07: React.FC = () => {
  const frame = useCurrentFrame();

  const wire = interpolate(frame, [0, 24], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const pulse = interpolate(frame, [24, 70, 120], [260, 900, 1560], { ...CLAMP, easing: EASE_IN_OUT });
  const charge = interpolate(frame, [70, 150], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const formula = interpolate(frame, [40, 90], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.95} grid={0.6} lightX={900} lightY={430} />

      {/* 导线 */}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 378,
          width: 760 * wire,
          height: 4,
          background: "linear-gradient(90deg, rgba(47,227,255,.25), rgba(47,227,255,.75))",
          boxShadow: "0 0 18px rgba(47,227,255,.35)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1000,
          top: 378,
          width: 680 * wire,
          height: 4,
          background: "linear-gradient(90deg, rgba(47,227,255,.75), rgba(47,227,255,.2))",
          boxShadow: "0 0 18px rgba(47,227,255,.35)",
        }}
      />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M560 380 L590 380 L604 352 L632 408 L660 352 L688 408 L716 352 L744 380 L770 380"
          fill="none"
          stroke="#E9F3FF"
          strokeWidth={3}
          opacity={0.9 * wire}
        />
        <line x1={1010} y1={332} x2={1010} y2={428} stroke="#E9F3FF" strokeWidth={4} opacity={0.9 * wire} />
        <line x1={1036} y1={332} x2={1036} y2={428} stroke="#E9F3FF" strokeWidth={4} opacity={0.9 * wire} />
      </svg>

      <div style={{ position: "absolute", left: 640, top: 288, fontFamily: MONO_F, fontSize: 28, color: CYAN, opacity: wire * 0.9 }}>
        R
      </div>
      <div style={{ position: "absolute", left: 1014, top: 288, fontFamily: MONO_F, fontSize: 28, color: CYAN, opacity: wire * 0.9 }}>
        C
      </div>

      {/* 信号脉冲 */}
      <div
        style={{
          position: "absolute",
          left: pulse,
          top: 362,
          width: 36,
          height: 36,
          borderRadius: 18,
          background: "#EAF8FF",
          boxShadow: "0 0 40px 12px rgba(47,227,255,.55)",
          opacity: wire,
        }}
      />

      {/* 公式 */}
      <div style={{ position: "absolute", left: 240, top: 520, display: "flex", alignItems: "baseline" }}>
        {FORMULA.map((ch, i) => (
          <span
            key={i}
            style={{
              fontFamily: MONO_F,
              fontSize: ch === " = " || ch === " × " ? 80 : 112,
              fontWeight: 700,
              color: ch === "τ" ? CYAN : TEXT,
              opacity: interpolate(formula, [i * 0.16, i * 0.16 + 0.3], [0, 1], CLAMP),
              textShadow: ch === "τ" ? "0 0 60px rgba(47,227,255,.45)" : undefined,
            }}
          >
            {ch}
          </span>
        ))}
        <span
          style={{
            fontFamily: MONO_F,
            fontSize: 42,
            color: MUTED,
            marginLeft: 22,
            opacity: interpolate(formula, [0.8, 1], [0, 1], CLAMP),
          }}
        >
          [s]
        </span>
      </div>

      <Label
        text="信号从跳变到稳定，所需的时间"
        x={244}
        y={676}
        size={28}
        color="rgba(233,243,255,.55)"
        opacity={interpolate(frame, [80, 100], [0, 1], CLAMP)}
      />

      {/* 示波器 */}
      <div
        style={{
          position: "absolute",
          left: 1140,
          top: 556,
          width: 560,
          height: 230,
          border: "1px solid rgba(47,227,255,.2)",
          opacity: interpolate(frame, [60, 80], [0, 1], CLAMP),
        }}
      >
        <Grid sizeX={32} sizeY={32} color="rgba(47,227,255,.06)" />
        <svg width={560} height={230} style={{ position: "absolute", inset: 0 }}>
          <path
            d={CHARGE}
            fill="none"
            stroke={CYAN}
            strokeWidth={3}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - charge}
            style={{ filter: "drop-shadow(0 0 10px rgba(47,227,255,.5))" }}
          />
        </svg>
      </div>

      <Eyebrow text="RC DELAY / TIME CONSTANT" x={1140} y={790} opacity={0.5} />
    </AbsoluteFill>
  );
};
