import { Composition } from "remotion";
import { NewtonSample } from "./HelloWorld";
import { FPS, SAMPLE_FRAMES } from "./newton/data";
import { H, W } from "./newton/look";
import { TauFilm } from "./film/TauFilm";
import { TOTAL_FRAMES } from "./film/data";
import { TauVertical } from "./marketing/TauVertical";
import { Cover43, Cover169 } from "./marketing/Cover";
import { VerticalChrome } from "./marketing/VerticalChrome";
import { VibeJam } from "./vibe/JamSample";
import { FRAMES as VIBE_FRAMES, W as VIBE_W, H as VIBE_H } from "./vibe/jam";

/**
 * 合成注册表
 *
 * 成片
 * - TauFilm        《韬（τ）定律》全片：16 镜 / 3420 帧 / 114.000s / 1920×1080
 * - TauVertical    同片竖屏版：1080×1920，抖音 / 小红书 / 视频号
 *
 * 静态物料
 * - Cover43        封面 1080×1440（3:4，抖音 / 小红书）
 * - Cover169       封面 1920×1080（16:9，B站 / 西瓜）
 *
 * 在制
 * - NewtonSample   《牛顿第一定律》开头样片：300 帧 / 10.000s
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TauFilm"
        component={TauFilm}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="TauVertical"
        component={TauVertical}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="VerticalChrome"
        component={VerticalChrome}
        durationInFrames={1}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition id="Cover43" component={Cover43} durationInFrames={1} fps={FPS} width={1080} height={1440} />
      <Composition id="Cover169" component={Cover169} durationInFrames={1} fps={FPS} width={1920} height={1080} />
      <Composition
        id="VibeJam"
        component={VibeJam}
        durationInFrames={VIBE_FRAMES}
        fps={FPS}
        width={VIBE_W}
        height={VIBE_H}
      />
      <Composition
        id="NewtonSample"
        component={NewtonSample}
        durationInFrames={SAMPLE_FRAMES}
        fps={FPS}
        width={W}
        height={H}
      />
    </>
  );
};
