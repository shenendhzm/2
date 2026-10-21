import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, MONO, MUTED, RED } from "../looks/black";

/** 纯黑底：米白制图线 + 极淡网格 + 印刷标记 */
export const BlackBackdrop: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 34% 26%, rgba(255,255,255,.05) 0%, rgba(255,255,255,0) 58%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,241,234,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(244,241,234,.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at 50% 44%, black 8%, rgba(0,0,0,.55) 62%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 44%, black 8%, rgba(0,0,0,.55) 62%, transparent 92%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 44,
          top: 44,
          right: 44,
          bottom: 44,
          border: `1px solid ${INK}22`,
        }}
      />
      {[
        { left: 44, top: 44, borderLeft: `1.5px solid ${INK}aa`, borderTop: `1.5px solid ${INK}aa` },
        { right: 44, top: 44, borderRight: `1.5px solid ${INK}aa`, borderTop: `1.5px solid ${INK}aa` },
        { left: 44, bottom: 44, borderLeft: `1.5px solid ${INK}aa`, borderBottom: `1.5px solid ${INK}aa` },
        { right: 44, bottom: 44, borderRight: `1.5px solid ${INK}aa`, borderBottom: `1.5px solid ${INK}aa` },
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
        TAU / 01 — 换尺子
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

      <div
        style={{
          position: "absolute",
          right: 122,
          top: 108,
          width: 18,
          height: 18,
        }}
      >
        <div style={{ position: "absolute", left: 8, top: 0, width: 1, height: 18, background: RED }} />
        <div style={{ position: "absolute", left: 0, top: 8, width: 18, height: 1, background: RED }} />
      </div>
    </AbsoluteFill>
  );
};
