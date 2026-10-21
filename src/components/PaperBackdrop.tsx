import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { INK, MONO, MUTED, PAPER, RED } from "../paper";

/** 米白纸面 + 图纸网格 + 印刷标记 */
export const PaperBackdrop: React.FC = () => {
  useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 68%)",
        }}
      />

      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(23,20,15,.13) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.5,
        }}
      />

      {/* 版心边框 */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 44,
          right: 44,
          bottom: 44,
          border: `1px solid ${INK}26`,
        }}
      />

      {/* 四角裁切标记 */}
      {[
        { left: 44, top: 44, borderLeft: `1.5px solid ${INK}`, borderTop: `1.5px solid ${INK}` },
        { right: 44, top: 44, borderRight: `1.5px solid ${INK}`, borderTop: `1.5px solid ${INK}` },
        { left: 44, bottom: 44, borderLeft: `1.5px solid ${INK}`, borderBottom: `1.5px solid ${INK}` },
        { right: 44, bottom: 44, borderRight: `1.5px solid ${INK}`, borderBottom: `1.5px solid ${INK}` },
      ].map((c, i) => (
        <div key={i} style={{ position: "absolute", width: 18, height: 18, ...c }} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 72,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3.2,
          color: MUTED,
        }}
      >
        TECH NOTE / 01
      </div>

      <div
        style={{
          position: "absolute",
          right: 120,
          top: 72,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3.2,
          color: MUTED,
        }}
      >
        2026.05.25
      </div>

      {/* 印刷套准十字 */}
      <div
        style={{
          position: "absolute",
          right: 122,
          top: 108,
          width: 18,
          height: 18,
          opacity: 0.7,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 0,
            width: 1,
            height: 18,
            background: RED,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 8,
            width: 18,
            height: 1,
            background: RED,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
