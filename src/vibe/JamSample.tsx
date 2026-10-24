import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { carsAt, COPY, H, RING_CX, RING_CY, RING_R, T, W } from "./jam";

const FONT =
  '"Noto Sans CJK SC","Noto Sans SC","Source Han Sans SC","PingFang SC","Microsoft YaHei",sans-serif';
const MONO = '"JetBrains Mono","Roboto Mono",ui-monospace,"SF Mono",monospace';

const TEXT = "#EDF2FF";
const AMBER = [232, 177, 94] as const;
const RED = [255, 77, 77] as const;

const mix = (a: readonly [number, number, number], b: readonly [number, number, number], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(
    a[2] + (b[2] - a[2]) * t,
  )})`;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 环形车道 */
const Ring: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <div
    style={{
      position: "absolute",
      left: RING_CX - RING_R,
      top: RING_CY - RING_R,
      width: RING_R * 2,
      height: RING_R * 2,
      opacity,
      transform: `scale(${scale})`,
    }}
  >
    {[RING_R * 2 - 26, RING_R * 2 + 26].map((size, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: (RING_R * 2 - size) / 2,
          top: (RING_R * 2 - size) / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          border: "1px solid rgba(150,168,196,.16)",
        }}
      />
    ))}
  </div>
);

export const VibeJam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cars = carsAt(frame);

  // 钩子
  const hookIn = spring({ frame: frame - 4, fps, config: { damping: 200, mass: 0.7 } });
  const hookOut = interpolate(frame, [T.hookOut - 10, T.hookOut], [1, 0], CLAMP);
  const hookY = interpolate(hookIn, [0, 1], [34, 0]);
  const subIn = spring({ frame: frame - 40, fps, config: { damping: 200, mass: 0.7 } });

  // 环道
  const ringA = interpolate(frame, [T.ringIn, T.ringFull], [0, 1], CLAMP);
  const ringS = interpolate(frame, [T.ringIn, T.ringFull + 16], [0.93, 1], CLAMP);
  const ringDim = interpolate(frame, [T.nameIn, T.nameIn + 24], [1, 0.45], CLAMP);

  // 字幕
  const cap1 = interpolate(frame, [112, 126, 164, 176], [0, 1, 1, 0], CLAMP);
  const cap2 = interpolate(frame, [178, 192, 230, 240], [0, 1, 1, 0], CLAMP);
  const nameIn = spring({ frame: frame - T.nameIn, fps, config: { damping: 200, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#05060A", fontFamily: FONT, overflow: "hidden" }}>
      {/* 背景光晕 */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 58% at 50% 52%, rgba(38,44,60,.55) 0%, rgba(10,12,18,.25) 45%, rgba(5,6,10,0) 72%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)",
        }}
      />

      {/* 角标 */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 48,
          fontFamily: MONO,
          fontSize: 19,
          letterSpacing: 8,
          color: "rgba(200,214,236,.42)",
        }}
      >
        {COPY.chapter}
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 48,
          fontFamily: MONO,
          fontSize: 17,
          letterSpacing: 6,
          color: "rgba(200,214,236,.26)",
        }}
      >
        SAMPLE 05 · 10s
      </div>

      {/* 环道 + 车 */}
      <Ring opacity={ringA * 0.9} scale={ringS} />
      <div style={{ position: "absolute", inset: 0, opacity: ringA * ringDim }}>
        {cars.map((car, i) => {
          const x = RING_CX + Math.cos(car.angle) * RING_R;
          const y = RING_CY + Math.sin(car.angle) * RING_R;
          const t = Math.max(0, Math.min(1, car.speed / 5));
          const c = mix(RED, AMBER, t);
          const stopped = car.speed < 0.6;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - 10,
                top: y - 4.5,
                width: 20,
                height: 9,
                borderRadius: 4.5,
                background: c,
                transform: `rotate(${(car.angle * 180) / Math.PI + 90}deg)`,
                boxShadow: stopped
                  ? `0 0 22px rgba(255,77,77,.85), 0 0 46px rgba(255,77,77,.35)`
                  : `0 0 12px ${c}66`,
                opacity: 0.72 + 0.28 * (1 - t),
              }}
            />
          );
        })}
      </div>

      {/* 钩子 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          top: 452,
          textAlign: "center",
          opacity: Math.max(0, hookIn * hookOut),
          transform: `translateY(${hookY}px)`,
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: 2, color: TEXT }}>
          {COPY.hook}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          width: "100%",
          top: 588,
          textAlign: "center",
          opacity: Math.max(0, subIn * hookOut) * 0.8,
        }}
      >
        <div style={{ fontSize: 44, letterSpacing: 1, color: "rgba(224,232,246,.86)" }}>
          {COPY.hookSub}
        </div>
      </div>

      {/* 说明字幕 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          bottom: 74,
          textAlign: "center",
          opacity: cap1,
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 1.5, color: "rgba(236,242,252,.9)" }}>
          {COPY.cap1}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          width: "100%",
          bottom: 74,
          textAlign: "center",
          opacity: cap2,
        }}
      >
        <div style={{ fontSize: 38, letterSpacing: 1.5, color: "rgba(236,242,252,.95)" }}>
          {COPY.cap2}
        </div>
      </div>

      {/* 命名 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          top: RING_CY - 86,
          textAlign: "center",
          opacity: nameIn,
          transform: `translateY(${interpolate(nameIn, [0, 1], [18, 0])}px)`,
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: 10, color: TEXT }}>
          {COPY.name}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: MONO,
            fontSize: 17,
            letterSpacing: 7,
            color: "rgba(232,177,94,.86)",
          }}
        >
          {COPY.nameEn}
        </div>
      </div>
    </AbsoluteFill>
  );
};
