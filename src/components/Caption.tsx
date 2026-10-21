import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTIONS } from "../captions";
import { CLAMP, FONT, TEXT } from "../theme";

/**
 * 旁白不配音，由字幕承载。
 * 文本与时间轴全部来自 captions.ts（由 SRT 自动生成），此处只负责显隐与排版。
 */
export const Caption: React.FC = () => {
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
          height: 300,
          background:
            "linear-gradient(180deg, rgba(2,4,10,0) 0%, rgba(2,4,10,.55) 62%, rgba(2,4,10,.82) 100%)",
          opacity: opacity * 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          bottom: 92,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 44,
            lineHeight: 1.5,
            fontWeight: 500,
            letterSpacing: 1.2,
            color: TEXT,
            textAlign: "center",
            textShadow: "0 2px 14px rgba(0,0,0,.65), 0 0 34px rgba(0,0,0,.4)",
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
