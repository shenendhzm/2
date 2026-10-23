import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, Grid, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_IN_OUT, EASE_OUT, TEXT } from "../look";

const N = 16;
const CELLS = Array.from({ length: N * N }, (_, i) => {
  const cx = i % N;
  const cy = Math.floor(i / N);
  const d = Math.hypot(cx - (N - 1) / 2, cy - (N - 1) / 2) / (N * 0.72);
  return { cx, cy, d };
});

/** 镜 5：00:25–00:33，摩尔定律：晶体管翻倍 */
export const Shot05: React.FC = () => {
  const frame = useCurrentFrame();

  const camIn = interpolate(frame, [0, 240], [1.0, 1.07], CLAMP);
  const tip = interpolate(frame, [0, 20], [-3, 0], { ...CLAMP, easing: EASE_OUT });
  const curve = interpolate(frame, [30, 150], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const label = interpolate(frame, [150, 170], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={1} grid={0.7} lightX={1100} lightY={620} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `perspective(2200px) rotateX(${58 + tip}deg) rotateZ(-40deg) scale(${camIn})`,
          transformOrigin: "50% 56%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 960 - 560,
            top: 560 - 560,
            width: 1120,
            height: 1120,
            border: "1px solid rgba(47,227,255,.22)",
          }}
        >
          <Grid sizeX={35} sizeY={35} color="rgba(47,227,255,.1)" />
          {CELLS.map((c, i) => {
            // 每 40 帧一波，从中心向外克隆
            const born = 20 + c.d * 150;
            const on = interpolate(frame, [born, born + 12], [0, 1], CLAMP);
            if (on <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: c.cx * 70 + 2,
                  top: c.cy * 70 + 2,
                  width: 8,
                  height: 8,
                  background: CYAN,
                  opacity: on * (0.35 + 0.65 * c.d),
                  boxShadow: `0 0 ${6 + 10 * on}px rgba(47,227,255,.55)`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 对数曲线 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M160 420 L160 200 M160 420 L600 420"
          stroke="rgba(233,243,255,.28)"
          strokeWidth={1.5}
          fill="none"
        />
        <path
          d="M170 412 C260 404 330 372 380 320 C420 276 450 236 520 214"
          fill="none"
          stroke={CYAN}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - curve}
        />
      </svg>

      <Eyebrow text="MOORE / GEOMETRIC SCALING" x={120} y={120} opacity={0.75} />
      <Label text="摩尔定律 · 几何缩微" x={120} y={152} size={44} color={TEXT} weight={700} />
      <Label
        text="晶体管数量 ×2 ／ 18–24 个月"
        x={120} y={470} size={30} color="rgba(233,243,255,.66)" opacity={label}
      />
    </AbsoluteFill>
  );
};
