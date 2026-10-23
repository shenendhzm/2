import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, Grid, Label } from "../components/ui";
import { CLAMP, CYAN, EASE_IN_OUT, EASE_OUT, MUTED, TEXT } from "../look";

const SLAB = { x: 420, w: 1080, h: 92 };
const TOP_Y = 286;
const BOT_Y = 606;
const PILLARS = Array.from({ length: 6 }, (_, i) => 486 + i * 196);

/** 镜 10：01:03.5–01:11.5，剖面：垂直互连 */
export const Shot10: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 26], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const dive = interpolate(frame, [104, 168], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const scale = 1 + dive * 0.22;
  const shiftY = dive * 34;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.95} grid={0.35} lightX={960} lightY={470} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${scale}) translateY(${shiftY}px)`,
          transformOrigin: "50% 62%",
        }}
      >
        {/* 上层 */}
        <div
          style={{
            position: "absolute",
            left: SLAB.x,
            top: TOP_Y - (1 - enter) * 40,
            width: SLAB.w,
            height: SLAB.h,
            opacity: enter,
            background: "linear-gradient(180deg,#16232E,#0A121A 62%,#0D1720)",
            border: `1px solid rgba(47,227,255,.42)`,
            boxShadow: "0 24px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.12)",
          }}
        >
          <Grid inset={12} sizeX={26} sizeY={26} color="rgba(47,227,255,.13)" />
        </div>

        {/* 下层 */}
        <div
          style={{
            position: "absolute",
            left: SLAB.x,
            top: BOT_Y + (1 - enter) * 40,
            width: SLAB.w,
            height: SLAB.h,
            opacity: enter,
            background: "linear-gradient(180deg,#16232E,#0A121A 62%,#0D1720)",
            border: `1px solid rgba(47,227,255,.42)`,
            boxShadow: "0 24px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.12)",
          }}
        >
          <Grid inset={12} sizeX={26} sizeY={26} color="rgba(47,227,255,.13)" />
        </div>

        {/* 垂直互连 */}
        {PILLARS.map((x, i) => {
          const on = interpolate(frame, [34 + i * 9, 54 + i * 9], [0, 1], { ...CLAMP, easing: EASE_OUT });
          return (
            <div key={x}>
              <div
                style={{
                  position: "absolute",
                  left: x - 13,
                  top: TOP_Y + SLAB.h,
                  width: 26,
                  height: (BOT_Y - TOP_Y - SLAB.h) * on,
                  background: `linear-gradient(180deg, ${CYAN}, rgba(47,227,255,.35))`,
                  boxShadow: "0 0 22px rgba(47,227,255,.55)",
                  opacity: on,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x - 30,
                  top: TOP_Y + SLAB.h - 8,
                  width: 60,
                  height: 10,
                  background: CYAN,
                  opacity: 0.55 * on,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x - 30,
                  top: BOT_Y - 2,
                  width: 60,
                  height: 10,
                  background: CYAN,
                  opacity: 0.55 * on,
                }}
              />
            </div>
          );
        })}

        {/* 走线缩短示意 */}
        <div
          style={{
            position: "absolute",
            left: 420,
            top: 468,
            height: 2,
            width: 360,
            background: `linear-gradient(90deg, rgba(255,77,61,.0), rgba(255,77,61,.85))`,
            opacity: interpolate(frame, [150, 175], [0, 0.9], CLAMP),
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 800,
            top: 440,
            fontSize: 24,
            color: MUTED,
            letterSpacing: 1,
            opacity: interpolate(frame, [150, 175], [0, 1], CLAMP),
          }}
        >
          原本要横穿整层的走线，只剩这一小段
        </div>
      </div>

      <Eyebrow text="CROSS SECTION / HYBRID BONDING" x={120} y={120} opacity={0.7} />
      <Label text="剖面：上下两层，垂直相连" x={120} y={152} size={40} color={TEXT} weight={700} />

      <Label
        text="关键路径走线 ↓"
        x={120}
        y={330}
        size={26}
        color="rgba(233,243,255,.55)"
        opacity={interpolate(frame, [60, 80], [0, 1], CLAMP)}
      />
      <Label
        text="垂直互连 ↑"
        x={1580}
        y={520}
        size={26}
        color={CYAN}
        opacity={interpolate(frame, [70, 90], [0, 1], CLAMP)}
      />
      <div
        style={{
          position: "absolute",
          left: 1660,
          top: 800,
          fontFamily: '"DIN Alternate","JetBrains Mono","Roboto Mono",monospace',
          fontSize: 20,
          letterSpacing: 3,
          color: "rgba(233,243,255,.3)",
        }}
      >
        示意图
      </div>
    </AbsoluteFill>
  );
};
