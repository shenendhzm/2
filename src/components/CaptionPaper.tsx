import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTIONS } from "../captions";
import { CLAMP, FONT, INK, PAPER } from "../paper";

/** 纸面风格字幕：黑字、无发光，底部留白 */
export const CaptionPaper: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const line = CAPTIONS.find((c) => t >= c.start && t < c.end);
  if (!line) return null;

  const inP = interpolate(t, [line.start, line.start + 0.22], [0, 1], CLAMP);
  const outP = interpolate(t, [line.end - 0.22, line.end], [1, 0], CLAMP);
  const opacity = Math.min(inP, outP);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 240,
          background: `linear-gradient(180deg, rgba(243,238,228,0) 0%, rgba(243,238,228,.86) 55%, ${PAPER} 100%)`,
          opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 180,
          right: 180,
          bottom: 88,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 42,
            lineHeight: 1.5,
            fontWeight: 500,
            letterSpacing: 1,
            color: INK,
            textAlign: "center",
            opacity,
            transform: `translateY(${(1 - opacity) * 8}px)`,
          }}
        >
          {line.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
