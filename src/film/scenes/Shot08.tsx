import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_IN_OUT, EASE_OUT, RED, TEXT } from "../look";

const GATES = Array.from({ length: 14 * 8 }, (_, i) => ({
  x: 520 + (i % 14) * 68,
  y: 320 + Math.floor(i / 14) * 62,
}));

const PATH =
  "M440 376 H700 V556 H980 V700 H1240 V432 H1480";

/** 镜 8：00:48.5–00:56.5，关键路径 */
export const Shot08: React.FC = () => {
  const frame = useCurrentFrame();

  const dieIn = interpolate(frame, [0, 18], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const route = interpolate(frame, [18, 110], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const dot = interpolate(frame, [104, 214], [1, 0], { ...CLAMP, easing: EASE_IN_OUT });
  const label = interpolate(frame, [120, 145], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.85} grid={0.45} lightX={960} lightY={520} />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: dieIn }}>
        {/* 版图 */}
        <rect x={340} y={250} width={1240} height={580} fill="rgba(9,16,24,.72)" stroke="rgba(47,227,255,.28)" />
        <g opacity={0.5}>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={"v" + i} x1={380 + i * 96} y1={260} x2={380 + i * 96} y2={820} stroke="rgba(47,227,255,.07)" />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={"h" + i} x1={345} y1={300 + i * 80} x2={1575} y2={300 + i * 80} stroke="rgba(47,227,255,.07)" />
          ))}
        </g>

        {/* 寄存器列 */}
        {[0, 1, 2, 3].map((i) => (
          <g key={"L" + i}>
            <rect x={372} y={330 + i * 120} width={70} height={72} fill="rgba(47,227,255,.12)" stroke={CYAN} strokeWidth={1.2} />
            <rect x={1478} y={330 + i * 120} width={70} height={72} fill="rgba(47,227,255,.12)" stroke={CYAN} strokeWidth={1.2} />
          </g>
        ))}

        {/* 逻辑门阵列 */}
        {GATES.map((g, i) => (
          <rect key={i} x={g.x} y={g.y} width={22} height={22} fill="rgba(233,243,255,.14)" stroke="rgba(233,243,255,.28)" strokeWidth={0.8} />
        ))}

        {/* 其它路径（暗） */}
        <path d="M440 496 H860 V376 H1480" fill="none" stroke="rgba(233,243,255,.16)" strokeWidth={2} />
        <path d="M440 736 H1080 V616 H1480" fill="none" stroke="rgba(233,243,255,.16)" strokeWidth={2} />

        {/* 关键路径 */}
        <path
          d={PATH}
          fill="none"
          stroke={RED}
          strokeWidth={4}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - route}
          style={{ filter: "drop-shadow(0 0 14px rgba(255,77,61,.55))" }}
        />

        {/* 行进光点 */}
        <path
          d={PATH}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={9}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="0.006 1"
          strokeDashoffset={dot}
          opacity={0.95}
          style={{ filter: "drop-shadow(0 0 18px rgba(255,150,140,.9))" }}
        />
      </svg>

      <Eyebrow text="CRITICAL PATH" x={120} y={120} opacity={0.72} />
      <Label text="最长的那条路，决定时钟频率" x={120} y={152} size={42} color={TEXT} weight={700} />

      <div
        style={{
          position: "absolute",
          left: 1180,
          top: 862,
          fontFamily: '"DIN Alternate","JetBrains Mono","Roboto Mono",monospace',
          fontSize: 24,
          letterSpacing: 2,
          color: RED,
          opacity: label,
        }}
      >
        KEY PATH · DELAY MAX
      </div>
    </AbsoluteFill>
  );
};
