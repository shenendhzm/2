import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, Grid, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_IN_OUT, EASE_OUT, RED, TEXT } from "../look";

const HALF_W = 900;
const HALF_H = 260;



/** 镜 9：00:56.5–01:03.5，把路折起来 */
export const Shot09: React.FC = () => {
  const frame = useCurrentFrame();

  const fold = interpolate(frame, [34, 96], [0, -62], { ...CLAMP, easing: EASE_IN_OUT });
  const enter = interpolate(frame, [0, 22], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const glow = interpolate(frame, [90, 110], [0, 1], CLAMP);
  const zoom = interpolate(frame, [0, 210], [1, 1.06], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.9} grid={0.4} lightX={960} lightY={520} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "50% 55%",
          perspective: 1500,
        }}
      >
        {/* 下半：不动 */}
        <div
          style={{
            position: "absolute",
            left: 960 - HALF_W / 2,
            top: 560,
            width: HALF_W,
            height: HALF_H,
            border: `1px solid rgba(47,227,255,${0.45 * enter})`,
            background: "rgba(8,14,20,.75)",
            opacity: enter,
          }}
        >
          <Grid sizeX={45} sizeY={45} color="rgba(47,227,255,.12)" />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.05))",
              opacity: Math.min(1, Math.abs(fold) / 62),
            }}
          />
          <svg width={HALF_W} height={HALF_H} style={{ position: "absolute", inset: 0 }}>
            <path
              d={`M40 ${HALF_H - 70} H${HALF_W - 40}`}
              stroke={RED}
              strokeWidth={5}
              fill="none"
              strokeDasharray="1 1"
              pathLength={1}
              strokeDashoffset={1 - interpolate(frame, [16, 60], [0, 1], CLAMP)}
              style={{ filter: "drop-shadow(0 0 12px rgba(255,77,61,.6))" }}
            />
            <circle cx={HALF_W - 40} cy={HALF_H - 70} r={7} fill={RED} opacity={0.9} />
          </svg>
        </div>

        {/* 上半：沿铰链折起 */}
        <div
          style={{
            position: "absolute",
            left: 960 - HALF_W / 2,
            top: 560 - HALF_H,
            width: HALF_W,
            height: HALF_H,
            transformOrigin: "50% 100%",
            transform: `rotateX(${fold}deg)`,
            border: `1px solid rgba(47,227,255,${0.45 * enter})`,
            background: "rgba(8,14,20,.75)",
            opacity: enter,
          }}
        >
          <Grid sizeX={45} sizeY={45} color="rgba(47,227,255,.12)" />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.05))",
              opacity: Math.min(1, Math.abs(fold) / 62),
            }}
          />
          <svg width={HALF_W} height={HALF_H} style={{ position: "absolute", inset: 0 }}>
            <path
              d={`M40 ${HALF_H - 70} H${HALF_W - 40}`}
              stroke={RED}
              strokeWidth={5}
              fill="none"
              strokeDasharray="1 1"
              pathLength={1}
              strokeDashoffset={1 - interpolate(frame, [16, 60], [0, 1], CLAMP)}
              style={{ filter: "drop-shadow(0 0 12px rgba(255,77,61,.6))" }}
            />
            <circle cx={40} cy={HALF_H - 70} r={7} fill={RED} opacity={0.9} />
          </svg>
        </div>

        {/* 铰链 */}
        <div
          style={{
            position: "absolute",
            left: 960 - HALF_W / 2,
            top: 558,
            width: HALF_W,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
            opacity: 0.35 + 0.65 * glow,
            boxShadow: `0 0 ${40 * glow}px rgba(47,227,255,.6)`,
          }}
        />
      </div>

      <Eyebrow text="LOGIC FOLDING" x={120} y={120} opacity={0.72} />
      <Label text="逻辑折叠" x={120} y={152} size={44} color={TEXT} weight={700} />
      <Label
        text="关键路径上的逻辑门，分到上下两层"
        x={120}
        y={214}
        size={26}
        color="rgba(233,243,255,.55)"
        opacity={interpolate(frame, [70, 90], [0, 1], CLAMP)}
      />
    </AbsoluteFill>
  );
};
