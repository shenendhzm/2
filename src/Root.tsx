import { Composition } from "remotion";
import { TauLawSample } from "./HelloWorld";
import { FPS, SAMPLE_FRAMES, TOTAL_FRAMES } from "./film/data";
import { H, W } from "./film/look";

/**
 * 合成注册。
 * 现在只挂样片（300 帧 = 10.000s）；整片 16 镜做齐后，再把
 * <Composition id="TauLaw" ... durationInFrames={TOTAL_FRAMES} /> 挂上。
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
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

/** 整片规格，供 Studio 与出片页对齐 */
export const FULL_FILM = { fps: FPS, width: W, height: H, durationInFrames: TOTAL_FRAMES };
