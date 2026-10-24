import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Ball } from "../components/Ball";
import { HorizonLine, Track, VanishingGlow } from "../components/Track";
import { Rule, Stage } from "../components/Stage";
import { FOLLOW_U, HORIZON_Y, SCROLL_RATE } from "../geometry";
import { CLAMP, CYAN, EASE_OUT, TEXT, fadeIn } from "../look";

/** 入画：第 44 帧球从画面底边滚进来，第 116 帧机位咬住它 */
const ENTER_FROM = 44;
const ENTER_TO = 116;

/**
 * 镜 1（0–240，8.000s）· 提问
 *
 * 0–10    纯黑起幅
 * 10–58   轨道由近及远生长（clipPath 高度）
 * 44–116  白球从画面左下入画，机位加速追上它
 * 116–    跟拍：球钉在画面下三分之一，轨道向镜头扑过来
 * 120     问题落字，背景压暗一档，声音在同一帧被抽掉
 *
 * 球必须一直「大、亮、有落脚点」——手机竖屏刷到时，第一眼要能看见它。
 */
export const Shot01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const grow = interpolate(frame, [10, 58], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const black = interpolate(frame, [0, 10], [1, 0], CLAMP);

  // 入画：深度 u 从 1.05 收到跟拍位，横向从画面左侧回到轨道中心
  const entry = interpolate(frame, [ENTER_FROM, ENTER_TO], [0, 1], {
    ...CLAMP,
    easing: EASE_OUT,
  });
  const u = interpolate(entry, [0, 1], [1.08, FOLLOW_U]);
  const lateral = interpolate(entry, [0, 1], [-0.6, 0]);

  /**
   * 机位推进距离 s（以「枕木间距」为单位）：
   * 入画段加速追球（0 → SCROLL_RATE），之后匀速跟拍。
   * 球在跟拍位不动，轨道的枕木与灰点则被 s 推着往镜头扑。
   */
  const enterSec = (ENTER_TO - ENTER_FROM) / fps;
  const s =
    frame <= ENTER_FROM
      ? 0
      : frame <= ENTER_TO
        ? (0.5 * SCROLL_RATE * Math.pow((frame - ENTER_FROM) / fps, 2)) / enterSec
        : 0.5 * SCROLL_RATE * enterSec + SCROLL_RATE * ((frame - ENTER_TO) / fps);
  /** 滚动距离 → 球的自转（约 106° / 单位，等于触地滚过的弧长） */
  const spin = s * 106;

  const cam = interpolate(frame, [0, 240], [1.0, 1.035], { ...CLAMP, easing: EASE_OUT });
  const dim = interpolate(frame, [120, 152], [1, 0.88], { ...CLAMP, easing: EASE_OUT });

  const q = fadeIn(frame, 120, 14);
  const ruleW = interpolate(frame, [120, 150], [0, 96], { ...CLAMP, easing: EASE_OUT });
  const glow = 0.42 + 0.28 * fadeIn(frame, 110, 40);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070B12", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: dim }}>
        <Stage glow={1} grid={1} vignette={1} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${cam})`,
            transformOrigin: `50% ${HORIZON_Y}px`,
          }}
        >
          <Track grow={grow} dust={1} scroll={s} id="s1" />
          <VanishingGlow opacity={glow} />
          <HorizonLine opacity={0.5 * grow} width={1700} />
          <Ball u={u} lateral={lateral} spin={spin} opacity={fadeIn(frame, ENTER_FROM, 10)} glow={1} />
        </div>
      </div>

      {/* 问题：右侧压住画面空白，和字幕（在下方）分工不同：一个是标题，一个是旁白 */}
      <div
        style={{
          position: "absolute",
          right: 154,
          top: 296,
          width: 620,
          textAlign: "right",
          opacity: q,
          transform: `translateY(${(1 - q) * 16}px)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 36 }}>
          <Rule width={ruleW} />
        </div>
        <div
          style={{
            fontSize: 82,
            lineHeight: 1.42,
            fontWeight: 600,
            letterSpacing: 2,
            color: TEXT,
            textShadow: "0 4px 40px rgba(0,0,0,.72)",
          }}
        >
          如果摩擦，
          <br />
          突然消失？
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: '"DIN Alternate","JetBrains Mono",ui-monospace,monospace',
            fontSize: 19,
            letterSpacing: 6,
            color: CYAN,
            opacity: 0.55,
          }}
        >
          IF FRICTION VANISHED
        </div>
      </div>

      <AbsoluteFill style={{ background: "#000", opacity: black, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
