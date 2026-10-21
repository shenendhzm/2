import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, MONO, MUTED, PAPER, RED } from "../looks/warm";

/** 暖调杂志：奶油纸色、深绿墨、陶土红 */
export const WarmBackdrop: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #FBF3E6 0%, ${PAPER} 52%, #EFDAC0 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 22% 18%, rgba(255,255,255,.7) 0%, rgba(255,255,255,0) 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 86% 92%, rgba(217,84,43,.10) 0%, rgba(217,84,43,0) 58%)",
        }}
      />

      {[300, 540, 780].map((y) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            top: y,
            height: 1,
            background: "rgba(36,48,41,.05)",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 74,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3.2,
          color: MUTED,
        }}
      >
        TAU / A FIELD NOTE
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 74,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3.2,
          color: MUTED,
        }}
      >
        NO. 01 — 2026
      </div>

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 112,
          width: 56,
          height: 6,
          background: RED,
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 120,
          bottom: 60,
          fontFamily: MONO,
          fontSize: 14,
          letterSpacing: 2,
          color: `${INK}66`,
        }}
      >
        1920 × 1080 · 30 FPS
      </div>
    </AbsoluteFill>
  );
};
