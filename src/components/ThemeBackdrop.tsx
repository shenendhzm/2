import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, MONO } from "../paper";

type Props = {
  bg: string;
  ink: string;
  accent: string;
  muted: string;
  header: string;
  right: string;
  scanlines?: boolean;
};

/** 深色主题通用背景：网格、版心、裁切标记，可选 CRT 扫描线 */
export const ThemeBackdrop: React.FC<Props> = ({
  bg,
  ink,
  accent,
  muted,
  header,
  right,
  scanlines,
}) => {
  const frame = useCurrentFrame();
  const band = scanlines
    ? interpolate(frame % 150, [0, 150], [-120, 1200], CLAMP)
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 34% 24%, ${accent}12 0%, ${accent}00 58%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${ink}0a 1px, transparent 1px), linear-gradient(90deg, ${ink}0a 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at 50% 44%, black 8%, rgba(0,0,0,.55) 62%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 44%, black 8%, rgba(0,0,0,.55) 62%, transparent 92%)",
        }}
      />

      {scanlines && (
        <>
          <AbsoluteFill
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,.34) 0px, rgba(0,0,0,.34) 1px, transparent 1px, transparent 3px)",
              opacity: 0.7,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: band,
              height: 120,
              background: `linear-gradient(180deg, ${ink}00, ${ink}12, ${ink}00)`,
            }}
          />
        </>
      )}

      <div
        style={{
          position: "absolute",
          left: 44,
          top: 44,
          right: 44,
          bottom: 44,
          border: `1px solid ${ink}22`,
        }}
      />
      {[
        { left: 44, top: 44, borderLeft: `1.5px solid ${ink}aa`, borderTop: `1.5px solid ${ink}aa` },
        { right: 44, top: 44, borderRight: `1.5px solid ${ink}aa`, borderTop: `1.5px solid ${ink}aa` },
        { left: 44, bottom: 44, borderLeft: `1.5px solid ${ink}aa`, borderBottom: `1.5px solid ${ink}aa` },
        { right: 44, bottom: 44, borderRight: `1.5px solid ${ink}aa`, borderBottom: `1.5px solid ${ink}aa` },
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
          color: muted,
        }}
      >
        {header}
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 72,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3.2,
          color: muted,
        }}
      >
        {right}
      </div>

      <div style={{ position: "absolute", right: 122, top: 108, width: 18, height: 18 }}>
        <div style={{ position: "absolute", left: 8, top: 0, width: 1, height: 18, background: accent }} />
        <div style={{ position: "absolute", left: 0, top: 8, width: 18, height: 1, background: accent }} />
      </div>
    </AbsoluteFill>
  );
};
