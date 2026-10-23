import React from "react";
import { useCurrentFrame } from "remotion";
import { fadeIn, fadeOut, FONT, TEXT } from "../look";
import { SUBS } from "../data";

/**
 * 旁白字幕层。全片无配音，字幕是唯一的信息通道，所以：
 * 单行 ≤ 18 字、按语义断句、底边距 104px、淡入 8 帧淡出 8 帧。
 * 文本逐字来自脚本，不做任何改写。
 */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const active = SUBS.find((s) => frame >= s.from && frame < s.to);
  if (!active) return null;

  const opacity = Math.min(fadeIn(frame, active.from, 8), fadeOut(frame, active.to - 8, 8));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 104,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity,
        pointerEvents: "none",
      }}
    >
      {active.lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT,
            fontSize: 54,
            lineHeight: 1.46,
            fontWeight: 500,
            letterSpacing: 0.6,
            color: TEXT,
            textShadow: "0 2px 26px rgba(0,0,0,.92), 0 0 2px rgba(0,0,0,.95)",
            whiteSpace: "nowrap",
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};
