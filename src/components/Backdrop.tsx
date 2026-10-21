import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, CLAMP, CYAN, MUTED } from "../theme";

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  x: 60 + ((i * 233) % 1800),
  y: 40 + ((i * 347) % 1000),
  r: 1 + (i % 3) * 0.7,
  drift: 14 + (i % 6) * 8,
  phase: (i * 29) % 180,
}));

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 极慢的整体呼吸，不做滤镜模糊，保证 3210 帧渲染负担可控
  const breath = interpolate(frame % 180, [0, 90, 180], [0.85, 1, 0.85], CLAMP);
  const gridIn = interpolate(frame, [0, 45], [0.35, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <div
        style={{
          position: "absolute",
          left: -320,
          top: -380,
          width: 1500,
          height: 1500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CYAN}1f 0%, ${CYAN}0a 42%, transparent 70%)`,
          opacity: breath,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -520,
          bottom: -560,
          width: 1500,
          height: 1500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(46,104,255,.15) 0%, rgba(46,104,255,.05) 45%, transparent 72%)",
          opacity: breath,
        }}
      />

      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.55 * gridIn,
          maskImage:
            "radial-gradient(ellipse at 50% 46%, black 6%, rgba(0,0,0,.55) 58%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 46%, black 6%, rgba(0,0,0,.55) 58%, transparent 88%)",
        }}
      />

      {PARTICLES.map((p, i) => {
        const twinkle = interpolate(
          (frame + p.phase) % 180,
          [0, 90, 180],
          [0.04, 0.34, 0.04],
          CLAMP,
        );
        const floatY = interpolate(frame, [0, durationInFrames], [0, -p.drift], CLAMP);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: "50%",
              backgroundColor: i % 4 === 0 ? MUTED : CYAN,
              opacity: twinkle,
              transform: `translateY(${floatY}px)`,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 44%, transparent 36%, rgba(2,4,10,.5) 82%, #02040a 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
