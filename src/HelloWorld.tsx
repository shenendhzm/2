import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Subtitles } from "./newton/components/Subtitles";
import { Shot01 } from "./newton/scenes/Shot01";
import { Shot02 } from "./newton/scenes/Shot02";
import { CLAMP, FONT } from "./newton/look";
import { SAMPLE_FRAMES } from "./newton/data";
import { SAMPLE_SRC } from "./newton/score";

/**
 * 《牛顿第一定律》· 15 秒样片
 *
 * 0–240    镜 1 提问（8.000s）
 * 240–450  镜 2 直觉（前 7.000s）：推 → 松手 → 滑行 → 停 → 「于是我们以为」
 * 450      收黑：样片停在「运动需要力来维持」这句错误常识上
 *
 * 注意：这里的时间轴与全片严格一致（全片镜 1 = 0–240，镜 2 = 240–465），
 * 样片只是把播放头停在 450 帧，不重排任何镜头。
 */
const PreviewTag: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [20, 36], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        right: 62,
        top: 46,
        fontFamily: '"DIN Alternate","JetBrains Mono",ui-monospace,monospace',
        fontSize: 17,
        letterSpacing: 4.5,
        color: "rgba(237,242,255,.34)",
        opacity: p,
        pointerEvents: "none",
      }}
    >
      样片 PREVIEW · 15s
    </div>
  );
};

export const NewtonSample: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [SAMPLE_FRAMES - 12, SAMPLE_FRAMES], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070B12", fontFamily: FONT, overflow: "hidden" }}>
      <Audio
        src={SAMPLE_SRC}
        volume={(f) => interpolate(f, [0, 10, 436, 450], [0, 1, 1, 0], CLAMP)}
      />

      <Sequence from={0} durationInFrames={240} name="镜 1 · 提问">
        <Shot01 />
      </Sequence>
      <Sequence from={240} durationInFrames={SAMPLE_FRAMES - 240} name="镜 2 · 直觉（前 7s）">
        <Shot02 />
      </Sequence>

      {/* 全片统一的字幕压暗带 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 240,
          background: "linear-gradient(180deg, transparent, rgba(3,5,9,.86))",
          pointerEvents: "none",
        }}
      />
      <Subtitles />
      <PreviewTag />
      <AbsoluteFill style={{ background: "#000", opacity: fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
