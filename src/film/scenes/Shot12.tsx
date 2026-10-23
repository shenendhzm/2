import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Eyebrow, Grid, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_OUT, MUTED, RED, TEXT } from "../look";

const Die: React.FC<{ x: number; y: number; w: number; h: number; opacity: number }> = ({ x, y, w, h, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      opacity,
      background: "linear-gradient(160deg,#16232E,#0A121A 60%,#101B24)",
      border: "1px solid rgba(47,227,255,.55)",
      boxShadow: "0 18px 50px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.1)",
    }}
  >
    <Grid inset={8} sizeX={22} sizeY={22} color="rgba(47,227,255,.12)" />
  </div>
);

/** 镜 12：01:18.5–01:25.5，≠ 3D 堆叠 */
export const Shot12: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(frame, [0, 20], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const x1 = spring({ frame: frame - 92, fps, config: { damping: 14, mass: 0.6, stiffness: 160 } });
  const ribbon = interpolate(frame, [24, 100], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const eq = interpolate(frame, [110, 130], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      {/* 左：两颗独立的芯片 */}
      <div style={{ position: "absolute", left: 180, top: 240, width: 700, height: 560, opacity: enter }}>
        <Die x={130} y={40} w={420} h={130} opacity={0.95} />
        <Die x={130} y={250} w={420} h={130} opacity={0.95} />

        {/* 中间缝隙 */}
        <div
          style={{
            position: "absolute",
            left: 130,
            top: 178,
            width: 420,
            height: 64,
            borderTop: "1px dashed rgba(233,243,255,.22)",
            borderBottom: "1px dashed rgba(233,243,255,.22)",
          }}
        />

        {/* 红叉 */}
        <svg width={700} height={560} style={{ position: "absolute", inset: 0 }}>
          <line
            x1={280}
            y1={160}
            x2={280 + 160 * x1}
            y2={160 + 160 * x1}
            stroke={RED} strokeWidth={10} strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 20px rgba(255,77,61,.6))" }}
          />
          <line
            x1={440}
            y1={160}
            x2={440 - 160 * x1}
            y2={160 + 160 * x1}
            stroke={RED} strokeWidth={10} strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 20px rgba(255,77,61,.6))" }}
          />
        </svg>

        <Label text="两颗芯片，各自完整" x={130} y={430} size={26} color="rgba(233,243,255,.5)" />
      </div>

      {/* 右：一颗芯片折成两层，连续 */}
      <div style={{ position: "absolute", left: 1040, top: 240, width: 760, height: 560, opacity: enter }}>
        <svg width={760} height={560} style={{ position: "absolute", inset: 0 }}>
          <path
            d="M80 150 H600 A70 70 0 0 1 600 290 H80"
            fill="none"
            stroke="#16242F"
            strokeWidth={46}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - ribbon}
          />
          <path
            d="M80 150 H600 A70 70 0 0 1 600 290 H80"
            fill="none"
            stroke={CYAN}
            strokeWidth={2.4}
            strokeLinecap="round"
            opacity={0.75}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - ribbon}
            style={{ filter: "drop-shadow(0 0 14px rgba(47,227,255,.5))" }}
          />
          <path
            d="M80 150 H600 A70 70 0 0 1 600 290 H80"
            fill="none"
            stroke="rgba(47,227,255,.35)"
            strokeWidth={1.2}
            strokeDasharray="6 10"
            strokeLinecap="round"
            pathLength={1}
            strokeDashoffset={1 - ribbon}
          />
        </svg>

        <Label text="一次成型，中间没有接缝" x={80} y={430} size={26} color="rgba(233,243,255,.5)" />
      </div>

      <Eyebrow text="≠ 3D STACKING / = ONE CONTINUOUS DIE" x={120} y={120} opacity={0.72} />
      <Label text="这不是堆叠，是折叠" x={120} y={152} size={42} color={TEXT} weight={700} />

      <div
        style={{
          position: "absolute",
          left: 180,
          top: 700,
          width: 700,
          textAlign: "center",
          fontSize: 40,
          fontWeight: 700,
          color: RED,
          opacity: eq,
        }}
      >
        ≠ 3D 堆叠
      </div>
      <div
        style={{
          position: "absolute",
          left: 1040,
          top: 700,
          width: 760,
          textAlign: "center",
          fontSize: 40,
          fontWeight: 700,
          color: CYAN,
          opacity: eq,
        }}
      >
        = 一颗连续的整体
      </div>

      <div style={{ position: "absolute", left: 920, top: 300, width: 1, height: 260, background: "rgba(233,243,255,.12)" }} />
      <div style={{ position: "absolute", left: 916, top: 300, width: 8, height: 8, borderRadius: 4, background: MUTED, opacity: 0.4 }} />
    </AbsoluteFill>
  );
};
