import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PaperBackdrop } from "./components/PaperBackdrop";
import { CaptionPaper } from "./components/CaptionPaper";
import { S1Paper } from "./scenes/S1Paper";
import { SCORE_SRC } from "./score";
import { FONT, PAPER } from "./paper";

/**
 * 第 1 镜「换尺子」：0:00–0:11（帧 0–330）。
 * 旁白不配音，字幕由 Caption 统一承载。
 */
export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      <Audio src={SCORE_SRC} />
      <PaperBackdrop />
      <S1Paper frame={frame} />
      <CaptionPaper />
    </AbsoluteFill>
  );
};
