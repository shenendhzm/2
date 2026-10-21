import { Composition } from "remotion";
import {
  TauBlackSample,
  TauGoldSample,
  TauDotsSample,
  TauGlowSample,
  TauLinesSample,
  TauCrtSample,
} from "./plates";

/**
 * 片头样片：六种风格，同一镜头。
 * 画幅 1920×1080 / 30fps / 240 帧 = 8.000s（脚本 S1：00:00–00:08）。
 */
const S1 = {
  durationInFrames: 240,
  fps: 30,
  width: 1920,
  height: 1080,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TauLawBlack" component={TauBlackSample} {...S1} />
      <Composition id="TauLawGold" component={TauGoldSample} {...S1} />
      <Composition id="TauLawDots" component={TauDotsSample} {...S1} />
      <Composition id="TauLawGlow" component={TauGlowSample} {...S1} />
      <Composition id="TauLawLines" component={TauLinesSample} {...S1} />
      <Composition id="TauLawCrt" component={TauCrtSample} {...S1} />
    </>
  );
};
