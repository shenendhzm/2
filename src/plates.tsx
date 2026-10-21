import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TauBackdrop } from "./components/TauBackdrop";
import { S1Tau } from "./scenes/S1Tau";
import { PLATES, TauPlate } from "./looks/tau";
import { SCORE_SRC } from "./score";

/**
 * 片头样片：同一个 S1 镜头（0–240 帧）+ 六套色板，只换视觉语言。
 */
const PlateShell: React.FC<{ plate: TauPlate }> = ({ plate }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ backgroundColor: plate.bg, fontFamily: plate.font, overflow: "hidden" }}
    >
      <Audio src={SCORE_SRC} />
      <TauBackdrop plate={plate} />
      <S1Tau plate={plate} />
    </AbsoluteFill>
  );
};

const plateOf = (id: string) => {
  const plate = PLATES.find((p) => p.id === id);
  if (!plate) throw new Error(`unknown plate: ${id}`);
  return plate;
};

/** 01 纯黑底 */
export const TauBlackSample: React.FC = () => (
  <PlateShell plate={plateOf("TauLawBlack")} />
);
/** 02 黑金 */
export const TauGoldSample: React.FC = () => (
  <PlateShell plate={plateOf("TauLawGold")} />
);
/** 03 黑点阵 */
export const TauDotsSample: React.FC = () => (
  <PlateShell plate={plateOf("TauLawDots")} />
);
/** 04 黑光晕 */
export const TauGlowSample: React.FC = () => (
  <PlateShell plate={plateOf("TauLawGlow")} />
);
/** 05 黑横线 */
export const TauLinesSample: React.FC = () => (
  <PlateShell plate={plateOf("TauLawLines")} />
);
/** 06 CRT 终端 */
export const TauCrtSample: React.FC = () => (
  <PlateShell plate={plateOf("TauLawCrt")} />
);
