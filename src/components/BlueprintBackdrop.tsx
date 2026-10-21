import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, MONO, MUTED, PAPER, RED } from "../looks/blueprint";

/** 蓝图风格：深蓝底、白色制图线、橙色标注 */
export const BlueprintBackdrop: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(234,243,250,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(234,243,250,.055) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(234,243,250,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(234,243,250,.10) 1px, transparent 1px)",
          backgroundSize: "200px 200px",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 44,
          top: 44,
          right: 44,
          bottom: 44,
          border: `1px solid ${INK}55`,
        }}
      />
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
        DWG. TAU-01 / SHEET 1 OF 1
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 72,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3.2,
          color: RED,
        }}
      >
        SCALE 1:1
      </div>

      <div
        style={{
          position: "absolute",
          right: 122,
          top: 108,
          width: 18,
          height: 18,
          opacity: 0.85,
        }}
      >
        <div style={{ position: "absolute", left: 8, top: 0, width: 1, height: 18, background: RED }} />
        <div style={{ position: "absolute", left: 0, top: 8, width: 18, height: 1, background: RED }} />
      </div>
    </AbsoluteFill>
  );
};
