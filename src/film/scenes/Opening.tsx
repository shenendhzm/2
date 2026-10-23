import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Chip } from "../components/Chip";
import { Ruler } from "../components/Ruler";
import { LightSweep, Stage } from "../components/Stage";
import { CLAMP, CYAN, EASE_IN, EASE_OUT, MONO, TEXT } from "../look";

/**
 * 第 1–2 镜（帧 0–345）。
 *
 * 重写版：不再「黑场 → 慢慢推入」，而是 0 帧就开始砸。
 * 0–11    尺子从画面右外砸到镜头前，1 帧白闪 + 16px 抖动，相机从 1.52 拉回 1.0
 * 11–73   尺子向左滑出，裸片在 73 帧（2.45s）随配乐「卡尺咬合」一记锁焦
 * 73–180  相机推近裸片，尺子退场
 * 180     硬切：尺子压成 0.5 倍竖在画面中央，数字 7 砸下来
 * 205 / 240 / 271  数字 5 / 3 / 2 依次砸下（271 = 配乐 9.05s 那记低频撞击）
 * 288–300 推近 + 压黑，样片收尾
 */
const HITS = [
  { at: 0, amp: 16 },
  { at: 73, amp: 7 },
  { at: 180, amp: 15 },
  { at: 205, amp: 12 },
  { at: 240, amp: 11 },
  { at: 271, amp: 15 },
];

const DIGITS = [
  { v: "7", at: 180 },
  { v: "5", at: 205 },
  { v: "3", at: 240 },
  { v: "2", at: 271 },
];

/** 冲击抖动：6 帧内衰减的锯齿 */
const shakeAt = (frame: number, at: number, amp: number) => {
  const l = frame - at;
  if (l < 0 || l > 6) return 0;
  return interpolate(l, [0, 1, 2, 3, 4, 5, 6], [0, -1, 0.78, -0.52, 0.32, -0.16, 0]) * amp;
};

const flashAt = (frame: number, at: number, peak = 0.5) => {
  const l = frame - at;
  if (l < 0 || l > 3) return 0;
  return interpolate(l, [0, 1, 3], [peak, peak * 0.7, 0], CLAMP);
};

/** 裸片纵向位置：第 1 镜在尺子下方，第 2 镜被推到右侧偏上 */
const chipY = (frame: number) => interpolate(frame, [0, 180], [470, 262], CLAMP);

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ---------- 镜头 ---------- */
  const camScale = interpolate(
    frame,
    [0, 9, 40, 73, 180, 271, 300],
    [1.52, 1.0, 1.02, 1.06, 1.1, 1.16, 1.24],
    { ...CLAMP, easing: EASE_OUT },
  );

  /* ---------- 尺子 ---------- */
  const rulerX = interpolate(frame, [0, 3, 6, 10, 73, 180], [1240, 40, 112, 96, -220, -340], {
    ...CLAMP,
    easing: EASE_IN,
  });
  const rulerSlamRotate = interpolate(frame, [0, 4, 10], [-5.5, 1.2, 0], CLAMP);
  const compressed = frame >= 180;

  /* ---------- 裸片 ---------- */
  const chipIn = spring({
    frame: frame - 3,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 190 },
  });
  const focus = interpolate(frame, [70, 73], [10, 0], { ...CLAMP, easing: EASE_OUT });
  const lockPop = interpolate(frame, [73, 76, 82], [1, 1.05, 1], CLAMP);
  // 120 帧：核心再脉冲一次，把 73–180 这段撑住
  const pulse = interpolate(frame, [118, 122, 132], [1, 1.07, 1], CLAMP);

  /* ---------- 白闪 / 抖动 ---------- */
  const shakeX = HITS.reduce((sum, h) => sum + shakeAt(frame, h.at, h.amp), 0);
  const shakeY = HITS.reduce((sum, h) => sum + shakeAt(frame, h.at, h.amp * 0.62), 0);
  const flash = Math.min(
    1,
    HITS.reduce((sum, h) => sum + flashAt(frame, h.at, h.at === 0 ? 0.26 : 0.34), 0),
  );

  /* ---------- 扫光 ---------- */
  const sweepX = interpolate(frame, [1, 22], [-900, 2500], { ...CLAMP, easing: EASE_OUT });
  const sweepOpacity = interpolate(frame, [1, 6, 18, 26], [0, 1, 1, 0], CLAMP);

  /* ---------- 样片收尾 ---------- */
  const tail = interpolate(frame, [288, 298], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage
        glow={interpolate(frame, [0, 12, 180], [0.5, 1, 1.2], CLAMP)}
        grid={interpolate(frame, [0, 10], [0.35, 1], CLAMP) * (compressed ? 0.62 : 1)}
        lightX={compressed ? 960 : 1180}
        lightY={compressed ? 620 : 470}
      />

      <AbsoluteFill style={{ transform: `translate3d(${shakeX}px, ${shakeY}px, 0)` }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${camScale})`,
            transformOrigin: "50% 46%",
          }}
        >
          {compressed ? (
            <Ruler x={120} y={300} rotate={0} scaleX={0.5} opacity={0.3} />
          ) : (
            <Ruler
              x={rulerX}
              y={interpolate(frame, [0, 180], [238, 268], CLAMP)}
              rotate={rulerSlamRotate}
              scaleX={1}
              opacity={1}
            />
          )}

          <Chip
            x={compressed ? 1452 : 1316}
            y={chipY(frame)}
            scale={
              interpolate(chipIn, [0, 1], [1.42, 1]) *
              (compressed
                ? 1.5
                : (1.02 + 0.06 * interpolate(frame, [73, 180], [0, 1], CLAMP)) * lockPop)
            }
            blur={compressed ? 12 : focus}
            opacity={interpolate(frame, [0, 6], [0, 1], CLAMP) * (compressed ? 0.35 : 1)}
            glow={compressed ? 0.6 : 1.15 * pulse}
            rotate={compressed ? -4 : interpolate(frame, [0, 180], [-9.5, -5.5], CLAMP)}
          />

          <LightSweep x={sweepX} opacity={sweepOpacity * 0.95} />
        </div>

        {/* ---------------- 数字 ---------------- */}
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {DIGITS.map((d, i) => {
            const local = frame - d.at;
            if (local < 0) return null;
            const next = DIGITS[i + 1];

            const scale = interpolate(local, [0, 1, 3], [1.75, 1.06, 1], {
              ...CLAMP,
              easing: EASE_OUT,
            });
            const opacity = next === undefined ? 1 : local >= next.at - d.at ? 0 : 1;

            return (
              <div
                key={d.v}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 194,
                  height: 588,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  opacity,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 18,
                    transform: `scale(${scale})`,
                    transformOrigin: "50% 100%",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 460,
                      lineHeight: 0.9,
                      fontWeight: 700,
                      color: TEXT,
                      textShadow:
                        "0 0 120px rgba(47,227,255,.42), 0 0 34px rgba(47,227,255,.22)",
                    }}
                  >
                    {d.v}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 76,
                      fontWeight: 500,
                      letterSpacing: 4,
                      color: TEXT,
                      opacity: 0.5,
                    }}
                  >
                    nm
                  </span>
                </div>
              </div>
            );
          })}

          {DIGITS.map((d) => {
            const l = frame - d.at;
            if (l < 0 || l > 9) return null;
            const w = interpolate(l, [0, 5], [80, 1280], { ...CLAMP, easing: EASE_OUT });
            const op = interpolate(l, [0, 2, 9], [0.95, 0.55, 0], CLAMP);
            return (
              <div
                key={"shock" + d.v}
                style={{
                  position: "absolute",
                  left: 960 - w / 2,
                  top: 784,
                  width: w,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
                  opacity: op,
                }}
              />
            );
          })}
        </AbsoluteFill>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 260,
          background: "linear-gradient(180deg, transparent, rgba(3,5,9,.88))",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: "#DFF6FF",
          opacity: flash * 0.55,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill style={{ background: "#000", opacity: tail, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
