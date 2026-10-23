import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow } from "../components/ui";
import { CLAMP, CYAN, EASE_IN, EASE_IN_OUT, EASE_OUT, MUTED, TEXT } from "../look";

/** 指数充电曲线（几何形状，不是动画） */
const CHARGE = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const x = 60 + u * 660;
    const y = 210 - (1 - Math.exp(-u * 3.4)) * 160;
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
          top: 398,
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
          top: 398,
          width: 640 * wire,
          height: 4,
          background: "linear-gradient(90deg, rgba(47,227,255,.75), rgba(47,227,255,.2))",
          boxShadow: "0 0 18px rgba(47,227,255,.35)",
        }}
      />

      {/* 电阻 R */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M560 400 L590 400 L604 372 L632 428 L660 372 L688 428 L716 372 L744 400 L770 400"
          fill="none"
          stroke="#E9F3FF"
          strokeWidth={3}
          opacity={0.9 * wire}
        />
        {/* 电容 C */}
        <line x1={1010} y1={352} x2={1010} y2={448} stroke="#E9F3FF" strokeWidth={4} opacity={0.9 * wire} />
        <line x1={1036} y1={352} x2={1036} y2={448} stroke="#E9F3FF" strokeWidth={4} opacity={0.9 * wire} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 640,
          top: 300,
          fontFamily: MONO_FALLBACK,
          fontSize: 30,
          color: CYAN,
          opacity: wire * 0.9,
          letterSpacing: 2,
        }}
      >
        R
      </div>
      <div
        style={{
          position: "absolute",
          left: 1010,
          top: 300,
          fontFamily: MONO_FALLBACK,
          fontSize: 30,
          color: CYAN,
          opacity: wire * 0.9,
          letterSpacing: 2,
        }}
      >
        C
      </div>

      {/* 信号脉冲 */}
      <div
        style={{
          position: "absolute",
          left: pulse,
          top: 382,
          width: 36,
          height: 36,
          borderRadius: 18,
          background: "#EAF8FF",
          boxShadow: "0 0 40px 12px rgba(47,227,255,.55)",
          opacity: wire,
        }}
      />

      {/* 公式 */}
      <div style={{ position: "absolute", left: 240, top: 500, display: "flex", alignItems: "baseline" }}>
        {FORMULA.map((ch, i) => (
          <span
            key={i}
            style={{
              fontFamily: MONO_FALLBACK,
              fontSize: ch === " = " || ch === " × " ? 86 : 118,
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
            fontFamily: MONO_FALLBACK,
            fontSize: 44,
            color: MUTED,
            marginLeft: 22,
            opacity: interpolate(formula, [0.8, 1], [0, 1], CLAMP),
          }}
        >
          [s]
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 244,
          top: 650,
          fontSize: 30,
          color: MUTED,
          letterSpacing: 1,
          opacity: interpolate(frame, [80, 100], [0, 1], CLAMP),
        }}
      >
        信号从跳变到稳定，所需的时间
      </div>

      {/* 示波器 */}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 720,
          width: 760,
          height: 260,
          border: "1px solid rgba(47,227,255,.22)",
          background:
            "linear-gradient(rgba(47,227,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(47,227,255,.06) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          opacity: interpolate(frame, [60, 80], [0, 1], CLAMP),
        }}
      >
        <svg width={760} height={260} style={{ position: "absolute", inset: 0 }}>
          <path
            d={CHARGE}
            fill="none"
            stroke={CYAN}
            strokeWidth={3}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - charge}
          />
        </svg>
      </div>

      <Eyebrow text="RC DELAY / TIME CONSTANT" x={1140} y={720} opacity={0.7} />
      <div
        style={{
          position: "absolute",
          left: 1140,
          top: 756,
          width: 520,
          fontSize: 30,
          lineHeight: 1.7,
          color: "rgba(233,243,255,.66)",
          opacity: interpolate(frame, [140, 160], [0, 1], CLAMP),
        }}
      >
        电阻乘电容，就是这条曲线爬完的时间常数。
      </div>
    </AbsoluteFill>
  );
};

const MONO_FALLBACK = '"DIN Alternate","JetBrains Mono","Roboto Mono",monospace';
