import { Composition } from "remotion";
import {
  BlackSample,
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
    </>
  );
};
