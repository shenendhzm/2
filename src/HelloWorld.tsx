import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { Caption } from "./components/Caption";
import { S1 } from "./scenes/S1";
import { SCORE_SRC } from "./score";
import { BG, FONT } from "./theme";

/**
 * 第 1 镜「换尺子」：0:00–0:11（帧 0–330）。
 * 旁白不配音，字幕由 Caption 统一承载。
 */
export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      <Audio src={SCORE_SRC} />
      <Backdrop />
      <S1 frame={frame} />
      <Caption />
    </AbsoluteFill>
  );
};
