import { Composition } from "remotion";
import {
  BlackSample,
  CoralAccentSample,
  CyanAccentSample,
  SilverAccentSample,
  VioletAccentSample,
  CrtSample,
  ForestSample,
  GoldSample,
  VioletSample,
  BlueprintSample,
  NeonSample,
  PaperSample,
  SwissSample,
  WarmSample,
} from "./samples";

const BASE = {
  durationInFrames: 330,
  fps: 30,
  width: 1920,
  height: 1080,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TauLawBlack" component={BlackSample} {...BASE} />
      <Composition id="TauLawNeon" component={NeonSample} {...BASE} />
      <Composition id="TauLawPaper" component={PaperSample} {...BASE} />
      <Composition id="TauLawBlueprint" component={BlueprintSample} {...BASE} />
      <Composition id="TauLawWarm" component={WarmSample} {...BASE} />
      <Composition id="TauLawSwiss" component={SwissSample} {...BASE} />
      <Composition id="TauLawGold" component={GoldSample} {...BASE} />
      <Composition id="TauLawForest" component={ForestSample} {...BASE} />
      <Composition id="TauLawCrt" component={CrtSample} {...BASE} />
      <Composition id="TauLawViolet" component={VioletSample} {...BASE} />
      <Composition id="TauLawCyan" component={CyanAccentSample} {...BASE} />
      <Composition id="TauLawCoral" component={CoralAccentSample} {...BASE} />
      <Composition id="TauLawAmethyst" component={VioletAccentSample} {...BASE} />
      <Composition id="TauLawSilver" component={SilverAccentSample} {...BASE} />
    </>
  );
};
