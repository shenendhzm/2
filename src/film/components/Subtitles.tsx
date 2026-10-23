import React from "react";
import { useCurrentFrame } from "remotion";
import { fadeIn, fadeOut, FONT, TEXT } from "../look";
import { CUES } from "../subtitles";

/**
 * 旁白字幕层。全片无配音，字幕是唯一的信息通道。
 * 节拍由 `src/film/subtitles.ts` 统一生成：5 字/秒、分句出、读完即清。
 * 入场 4 帧淡入 + 6px 上浮，出场 4 帧淡出——比上一版（8 帧）更利落。
 */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = CUES.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;

  const opacity = Math.min(fadeIn(frame, cue.from, 4), fadeOut(frame, cue.to - 4, 4));
  const y = fadeIn(frame, cue.from, 5) * 6;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 104,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${6 - y}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 56,
          lineHeight: 1.4,
          fontWeight: 500,
          letterSpacing: 0.6,
          color: TEXT,
          textShadow: "0 2px 26px rgba(0,0,0,.92), 0 0 2px rgba(0,0,0,.95)",
          whiteSpace: "nowrap",
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
