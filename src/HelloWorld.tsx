import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Subtitles } from "./film/components/Subtitles";
import { CLAMP, FONT } from "./film/look";
import { Opening } from "./film/scenes/Opening";
import { Shot03 } from "./film/scenes/Shot03";
import { Shot04 } from "./film/scenes/Shot04";
import { Shot05 } from "./film/scenes/Shot05";
import { Shot06 } from "./film/scenes/Shot06";
import { Shot07 } from "./film/scenes/Shot07";
import { Shot08 } from "./film/scenes/Shot08";
import { Shot09 } from "./film/scenes/Shot09";
import { Shot10 } from "./film/scenes/Shot10";
import { Shot11 } from "./film/scenes/Shot11";
import { Shot12 } from "./film/scenes/Shot12";
import { Shot13 } from "./film/scenes/Shot13";
import { Shot14 } from "./film/scenes/Shot14";
import { Shot15 } from "./film/scenes/Shot15";
import { Shot16 } from "./film/scenes/Shot16";
import { BED_SRC, IMPACT_SRC, SCORE_SRC } from "./score";

/**
 * 声音：片头配乐 0–11s，铺底 10s 接棒到片尾，四个转场复用「第一击」。
 * 只在两条音轨上都做音量包络，避免硬切爆音。
 */
const Soundtrack: React.FC = () => (
  <>
    <Audio src={SCORE_SRC} volume={(f) => interpolate(f, [296, 348], [1, 0], CLAMP)} />
    <Audio src={IMPACT_SRC} volume={0.9} />

    <Sequence from={300} durationInFrames={3120} name="铺底">
      <Audio
        src={BED_SRC}
        volume={(f) =>
          interpolate(f, [0, 80], [0, 1], CLAMP) * interpolate(f, [2980, 3120], [1, 0], CLAMP)
        }
      />
    </Sequence>

    {[540, 990, 1695, 2805].map((from) => (
      <Sequence key={from} from={from} durationInFrames={60} name={"转场撞击 " + from}>
        <Audio src={IMPACT_SRC} volume={0.3} />
      </Sequence>
    ))}
  </>
);

/** 整片：16 镜 / 3420 帧 / 114.000s */
export const TauLaw: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [3400, 3420], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", fontFamily: FONT, overflow: "hidden" }}>
      <Soundtrack />
      <Sequence from={0} durationInFrames={345} name="镜 1–2 · 尺子与纳米">
        <Opening />
      </Sequence>
      <Sequence from={345} durationInFrames={195} name="镜 3 · 断裂">
        <Shot03 />
      </Sequence>
      <Sequence from={540} durationInFrames={210} name="镜 4 · τ">
        <Shot04 />
      </Sequence>
      <Sequence from={750} durationInFrames={240} name="镜 5 · 摩尔">
        <Shot05 />
      </Sequence>
      <Sequence from={990} durationInFrames={225} name="镜 6 · 红墙">
        <Shot06 />
      </Sequence>
      <Sequence from={1215} durationInFrames={240} name="镜 7 · RC">
        <Shot07 />
      </Sequence>
      <Sequence from={1455} durationInFrames={240} name="镜 8 · 关键路径">
        <Shot08 />
      </Sequence>
      <Sequence from={1695} durationInFrames={210} name="镜 9 · 折叠">
        <Shot09 />
      </Sequence>
      <Sequence from={1905} durationInFrames={240} name="镜 10 · 剖面">
        <Shot10 />
      </Sequence>
      <Sequence from={2145} durationInFrames={210} name="镜 11 · 收益">
        <Shot11 />
      </Sequence>
      <Sequence from={2355} durationInFrames={210} name="镜 12 · 辨析">
        <Shot12 />
      </Sequence>
      <Sequence from={2565} durationInFrames={240} name="镜 13 · 四层">
        <Shot13 />
      </Sequence>
      <Sequence from={2805} durationInFrames={225} name="镜 14 · 证据">
        <Shot14 />
      </Sequence>
      <Sequence from={3030} durationInFrames={180} name="镜 15 · 克制">
        <Shot15 />
      </Sequence>
      <Sequence from={3210} durationInFrames={210} name="镜 16 · 收束">
        <Shot16 />
      </Sequence>

      {/* 全片统一的字幕压暗带，保证任何画面上字幕都读得清 */}
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
      {/* 全片统一的字幕压暗带，保证任何画面上字幕都读得清 */}
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
      <AbsoluteFill style={{ background: "#000", opacity: fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/** 片头样片：镜头 1–2，0–300 帧收黑 */
export const TauLawSample: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [288, 298], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", fontFamily: FONT, overflow: "hidden" }}>
      <Audio src={SCORE_SRC} volume={(f) => interpolate(f, [284, 300], [1, 0], CLAMP)} />
      <Audio src={IMPACT_SRC} volume={0.95} />
      <Sequence from={0} durationInFrames={345} name="镜 1–2">
        <Opening />
      </Sequence>
      {/* 全片统一的字幕压暗带，保证任何画面上字幕都读得清 */}
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
      <AbsoluteFill style={{ background: "#000", opacity: fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
