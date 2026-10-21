import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { Caption } from "./components/Caption";
import { PaperBackdrop } from "./components/PaperBackdrop";
import { CaptionPaper } from "./components/CaptionPaper";
import { BlueprintBackdrop } from "./components/BlueprintBackdrop";
import { WarmBackdrop } from "./components/WarmBackdrop";
import { SwissBackdrop } from "./components/SwissBackdrop";
import { S1 } from "./scenes/S1";
import { S1Paper } from "./scenes/S1Paper";
import { S1Blueprint } from "./scenes/S1Blueprint";
import { S1Warm } from "./scenes/S1Warm";
import { S1Swiss } from "./scenes/S1Swiss";
import { SCORE_SRC } from "./score";
import { FONT as NEON_FONT } from "./theme";
import { FONT as PAPER_FONT, PAPER } from "./paper";
import { FONT as BLUE_FONT, PAPER as BLUE_PAPER } from "./looks/blueprint";
import { FONT as WARM_FONT, PAPER as WARM_PAPER } from "./looks/warm";
import { FONT as SWISS_FONT } from "./looks/swiss";

const Shell: React.FC<{ bg: string; font: string; children: React.ReactNode }> = ({
  bg,
  font,
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: bg, fontFamily: font, overflow: "hidden" }}>
    <Audio src={SCORE_SRC} />
    {children}
  </AbsoluteFill>
);

/** 01 深色霓虹（HUD） */
export const NeonSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg="#060A12" font={NEON_FONT}>
      <Backdrop />
      <S1 frame={frame} />
      <Caption />
    </Shell>
  );
};

/** 02 纸面工程图 */
export const PaperSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg={PAPER} font={PAPER_FONT}>
      <PaperBackdrop />
      <S1Paper frame={frame} />
      <CaptionPaper />
    </Shell>
  );
};

/** 03 蓝图制图 */
export const BlueprintSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg={BLUE_PAPER} font={BLUE_FONT}>
      <BlueprintBackdrop />
      <S1Blueprint frame={frame} />
      <CaptionPaper color="#EAF3FA" scrim="10,42,70" />
    </Shell>
  );
};

/** 04 暖调杂志 */
export const WarmSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg={WARM_PAPER} font={WARM_FONT}>
      <WarmBackdrop />
      <S1Warm frame={frame} />
      <CaptionPaper />
    </Shell>
  );
};

/** 05 瑞士极简 */
export const SwissSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg="#FFFFFF" font={SWISS_FONT}>
      <SwissBackdrop />
      <S1Swiss frame={frame} />
      <CaptionPaper />
    </Shell>
  );
};
