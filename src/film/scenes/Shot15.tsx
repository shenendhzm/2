import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Label, TauGlyph } from "../components/ui";
import { CLAMP, CYAN, EASE_OUT, MUTED, TEXT } from "../look";

const RINGS = [
  { r: 200, label: "EDA 工具", x: 556, y: 96, speed: 0.22 },
  { r: 260, label: "良率与时序", x: 912, y: 418, speed: -0.16 },
  { r: 320, label: "跨层 RC 开销", x: 470, y: 768, speed: 0.12 },
];

/** 镜 15：01:41–01:47，三个还没点亮的环 */
export const Shot15: React.FC = () => {
  const frame = useCurrentFrame();
  const dim = interpolate(frame, [0, 24], [1, 0.42], CLAMP);
  const note = interpolate(frame, [96, 118], [0, 1], { ...CLAMP, easing: EASE_OUT });

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.5} grid={0.25} lightX={620} lightY={430} />

      <div style={{ position: "absolute", left: 620 - 150, top: 430 - 150, opacity: 0.55 }}>
        <TauGlyph size={300} progress={1} color={CYAN} strokeWidth={5} glow={0.4} />
      </div>

      {RINGS.map((ring) => (
        <div
          key={ring.label}
          style={{
            position: "absolute",
            left: 620 - ring.r,
            top: 430 - ring.r,
            width: ring.r * 2,
            height: ring.r * 2,
            transform: `rotate(${frame * ring.speed}deg)`,
            transformOrigin: "50% 50%",
          }}
        >
          <svg width={ring.r * 2} height={ring.r * 2}>
            <circle
              cx={ring.r}
              cy={ring.r}
              r={ring.r - 2}
              fill="none"
              stroke={CYAN}
              strokeWidth={1.4}
              strokeDasharray="10 18"
              opacity={0.3}
            />
          </svg>
        </div>
      ))}

      {RINGS.map((ring, i) => (
        <Label
          key={ring.label}
          text={ring.label}
          x={ring.x}
          y={ring.y}
          size={26}
          color="rgba(233,243,255,.62)"
          opacity={interpolate(frame, [40 + i * 12, 60 + i * 12], [0, 1], CLAMP)}
          width={420}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 100,
          top: 120,
          fontSize: 22,
          letterSpacing: 4,
          color: MUTED,
          opacity: 0.7,
        }}
      >
        STILL UNPROVEN
      </div>
      <Label text="不是结论，是路线" x={100} y={152} size={40} color={TEXT} weight={700} opacity={0.8} />

      <div
        style={{
          position: "absolute",
          left: 1060,
          top: 720,
          fontSize: 24,
          color: "rgba(233,243,255,.4)",
          opacity: note,
          letterSpacing: 1,
        }}
      >
        三个环都还没点亮
      </div>
    </AbsoluteFill>
  );
};
