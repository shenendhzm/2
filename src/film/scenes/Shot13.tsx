import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_OUT, MUTED, TEXT } from "../look";

const LAYERS = [
  { size: 520, label: "晶体管 · 皮秒", unit: "ps", y: 340 },
  { size: 400, label: "片内互连 · 纳秒", unit: "ns", y: 420 },
  { size: 288, label: "内存访问 · 纳秒", unit: "ns", y: 500 },
  { size: 186, label: "集群互联 · 微秒", unit: "μs", y: 580 },
];

/** 镜 13：01:25.5–01:33.5，四层 τ 收敛到一个指标 */
export const Shot13: React.FC = () => {
  const frame = useCurrentFrame();
  const axis = interpolate(frame, [150, 200], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const settle = interpolate(frame, [190, 220], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.9} grid={0.4} lightX={820} lightY={470} />

      {LAYERS.map((l, i) => {
        const on = interpolate(frame, [16 + i * 34, 46 + i * 34], [0, 1], { ...CLAMP, easing: EASE_OUT });
        const edge = 820 + l.size / 2;
        return (
          <div key={l.label}>
            <div
              style={{
                position: "absolute",
                left: 820 - l.size / 2,
                top: 470 - l.size / 2,
                width: l.size,
                height: l.size,
                border: `1.5px solid rgba(47,227,255,${0.16 + 0.55 * on})`,
                boxShadow: `0 0 ${50 * on}px rgba(47,227,255,${0.14 * on}) inset`,
                opacity: 0.35 + 0.65 * on,
                borderRadius: 6,
              }}
            />
            {/* 引线 */}
            <div
              style={{
                position: "absolute",
                left: edge,
                top: l.y + 10,
                width: 1160 - edge,
                height: 1,
                background: `linear-gradient(90deg, rgba(47,227,255,${0.7 * on}), rgba(47,227,255,${0.08 * on}))`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 1166,
                top: l.y - 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: CYAN,
                opacity: on,
              }}
            />
            <Label
              text={l.label}
              x={1192}
              y={l.y - 20}
              size={30}
              color={TEXT}
              opacity={on}
            />
            <div
              style={{
                position: "absolute",
                left: 1192,
                top: l.y + 20,
                fontFamily: '"DIN Alternate","JetBrains Mono","Roboto Mono",monospace',
                fontSize: 18,
                letterSpacing: 3,
                color: MUTED,
                opacity: on,
              }}
            >
              {l.unit}
            </div>
          </div>
        );
      })}

      {/* 汇聚光轴 */}
      <div
        style={{
          position: "absolute",
          left: 818,
          top: 470 - 300 * axis,
          width: 4,
          height: 600 * axis,
          background: `linear-gradient(180deg, transparent, ${CYAN}, transparent)`,
          boxShadow: "0 0 30px rgba(47,227,255,.65)",
          opacity: axis,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 800,
          width: 360,
          textAlign: "center",
          fontSize: 34,
          letterSpacing: 2,
          color: CYAN,
          opacity: settle,
        }}
      >
        一个指标：τ
      </div>

      <Eyebrow text="ps → ns → μs" x={120} y={120} opacity={0.75} />
      <Label text="每一层，都有自己的 τ" x={120} y={152} size={40} color={TEXT} weight={700} />
    </AbsoluteFill>
  );
};
