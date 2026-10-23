import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Subtitles } from "./film/components/Subtitles";
import { CLAMP, FONT } from "./film/look";
import { Opening } from "./film/scenes/Opening";
import { IMPACT_SRC, SCORE_SRC } from "./score";

/**
 * 片头样片：镜头 1–2，0–345 帧。
 * 样片在 300 帧（10.000s）处收黑；整片会继续走到 345 帧切第 3 镜。
 *
 * 声音：
 * - 0.00s 第一击（impact-open.wav）—— 尺子砸入
 * - 0.00s 起配乐（score-sample.m4a，11s，本片只用前 10s），最后 14 帧淡出
 */
export const TauLawSample: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [288, 298], [0, 1], CLAMP);
  const volume = interpolate(frame, [284, 300], [1, 0], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", fontFamily: FONT, overflow: "hidden" }}>
      <Audio src={SCORE_SRC} volume={volume} />
      <Audio src={IMPACT_SRC} volume={0.95} />

      <Sequence from={0} durationInFrames={345} name="镜 1–2 · 尺子与纳米">
        <Opening />
      </Sequence>

      <Subtitles />

      {/* 样片收尾：最后 12 帧压黑 */}
      <AbsoluteFill style={{ background: "#000", opacity: fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
