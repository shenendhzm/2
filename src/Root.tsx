import { Composition } from "remotion";
import { TauLaw, TauLawSample } from "./HelloWorld";
import { FPS, SAMPLE_FRAMES, TOTAL_FRAMES } from "./film/data";
import { H, W } from "./film/look";

/**
 * 两个合成：
 * - TauLaw        整片 16 镜 / 3420 帧 / 114.000s
 * - TauLawSample  片头样片 300 帧 / 10.000s
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TauLaw"
        component={TauLaw}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="TauLawSample"
        component={TauLawSample}
        durationInFrames={SAMPLE_FRAMES}
        fps={FPS}
        width={W}
        height={H}
      />
    </>
  );
};
