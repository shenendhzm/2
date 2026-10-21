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
import { BlackBackdrop } from "./components/BlackBackdrop";
import { ThemeBackdrop } from "./components/ThemeBackdrop";
import { S1 } from "./scenes/S1";
import { S1Paper } from "./scenes/S1Paper";
import { S1Blueprint } from "./scenes/S1Blueprint";
import { S1Warm } from "./scenes/S1Warm";
import { S1Swiss } from "./scenes/S1Swiss";
import { S1Black } from "./scenes/S1Black";
import { S1Gold } from "./scenes/S1Gold";
import { S1Forest } from "./scenes/S1Forest";
import { S1Crt } from "./scenes/S1Crt";
import { S1Violet } from "./scenes/S1Violet";
import { SCORE_SRC } from "./score";
import { FONT as NEON_FONT } from "./theme";
import { FONT as PAPER_FONT, PAPER } from "./paper";
import { FONT as BLUE_FONT, PAPER as BLUE_PAPER } from "./looks/blueprint";
import { FONT as WARM_FONT, PAPER as WARM_PAPER } from "./looks/warm";
import { FONT as SWISS_FONT } from "./looks/swiss";
import { FONT as BLACK_FONT, INK as BLACK_INK } from "./looks/black";
import { FONT as GOLD_FONT, INK as GOLD_INK, PAPER as GOLD_BG, RED as GOLD_ACCENT, MUTED as GOLD_MUTED } from "./looks/gold";
import { FONT as FOREST_FONT, INK as FOREST_INK, PAPER as FOREST_BG, RED as FOREST_ACCENT, MUTED as FOREST_MUTED } from "./looks/forest";
import { FONT as CRT_FONT, INK as CRT_INK, PAPER as CRT_BG, RED as CRT_ACCENT, MUTED as CRT_MUTED } from "./looks/crt";
import { FONT as VIOLET_FONT, INK as VIOLET_INK, PAPER as VIOLET_BG, RED as VIOLET_ACCENT, MUTED as VIOLET_MUTED } from "./looks/violet";

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

/** 06 纯黑底 */
export const BlackSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg="#000000" font={BLACK_FONT}>
      <BlackBackdrop />
      <S1Black frame={frame} />
      <CaptionPaper color={BLACK_INK} scrim="0,0,0" />
    </Shell>
  );
};

/** 07 黑金 */
export const GoldSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg={GOLD_BG} font={GOLD_FONT}>
      <ThemeBackdrop bg={GOLD_BG} ink={GOLD_INK} accent={GOLD_ACCENT} muted={GOLD_MUTED} header="TAU / 01 — 换尺子" right="2026.05.25" />
      <S1Gold frame={frame} />
      <CaptionPaper color={GOLD_INK} scrim="11,9,6" />
    </Shell>
  );
};

/** 08 墨绿 */
export const ForestSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg={FOREST_BG} font={FOREST_FONT}>
      <ThemeBackdrop bg={FOREST_BG} ink={FOREST_INK} accent={FOREST_ACCENT} muted={FOREST_MUTED} header="TAU / FIELD NOTE 01" right="SHANGHAI" />
      <S1Forest frame={frame} />
      <CaptionPaper color={FOREST_INK} scrim="13,35,27" />
    </Shell>
  );
};

/** 09 CRT 终端 */
export const CrtSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg={CRT_BG} font={CRT_FONT}>
      <ThemeBackdrop bg={CRT_BG} ink={CRT_INK} accent={CRT_ACCENT} muted={CRT_MUTED} header="> TAU.SYS / RUN 01" right="READY_" scanlines />
      <S1Crt frame={frame} />
      <CaptionPaper color={CRT_INK} scrim="2,6,4" />
    </Shell>
  );
};

/** 10 深紫夜幕 */
export const VioletSample: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg={VIOLET_BG} font={VIOLET_FONT}>
      <ThemeBackdrop bg={VIOLET_BG} ink={VIOLET_INK} accent={VIOLET_ACCENT} muted={VIOLET_MUTED} header="TAU / NIGHT SIGNAL 01" right="2026.05.25" />
      <S1Violet frame={frame} />
      <CaptionPaper color={VIOLET_INK} scrim="19,11,36" />
    </Shell>
  );
};

const makeAccentSample = (accent: string): React.FC => () => {
  const frame = useCurrentFrame();
  return (
    <Shell bg={GOLD_BG} font={GOLD_FONT}>
      <ThemeBackdrop bg={GOLD_BG} ink={GOLD_INK} accent={accent} muted={GOLD_MUTED} header="TAU / 01 — 换尺子" right="2026.05.25" />
      <S1Gold frame={frame} accent={accent} />
      <CaptionPaper color={GOLD_INK} scrim="11,9,6" />
    </Shell>
  );
};

/** 11 黑青 */
export const CyanAccentSample = makeAccentSample("#35E0D0");
/** 12 黑珊瑚 */
export const CoralAccentSample = makeAccentSample("#FF7A59");
/** 13 黑紫 */
export const VioletAccentSample = makeAccentSample("#A78BFA");
/** 14 黑银 */
export const SilverAccentSample = makeAccentSample("#C9D1D9");
