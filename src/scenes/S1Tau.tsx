import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN_OUT, EASE_OUT, TauPlate } from "../looks/tau";

/**
 * S1「τ 浮现」——0:00–0:08，帧 0–240（30fps）。
 * 屏幕文字严格照抄脚本：
 *   τ
 *   韬（τ）定律
 *   HUAWEI · IEEE ISCAS 2026 · SHANGHAI
 *   2026.05.25
 * 动画只用 interpolate / spring / Easing。
 */

const TAU_VIS_CY = 352; // τ 的视觉中心（含字形基线偏移后的位置）
const TAU_FONT = 380;
const TAU_TOP = 79; // τ 容器顶边：让字形视觉中心落在 TAU_VIS_CY
const TAU_BASELINE = 451; // τ 基线，基准线压在这里
const TITLE_TOP = 578;

export const S1Tau: React.FC<{ plate: TauPlate }> = ({ plate }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { ink, accent, muted, font, mono } = plate;

  // 整体缓慢推近，收在 1.035
  const camera = interpolate(frame, [0, 240], [1, 1.035], {
    ...CLAMP,
    easing: EASE_IN_OUT,
  });

  // 同心圆：两波晕开
  const ringPulse = (start: number, dur: number, strength: number) => {
    const p = interpolate(frame, [start, start + dur], [0, 1], CLAMP);
    return {
      r: interpolate(p, [0, 1], [46, 980]),
      o: interpolate(p, [0, 0.14, 1], [0, strength, 0], CLAMP),
    };
  };
  const rings = [
    { ...ringPulse(12, 78, 0.5) },
    { ...ringPulse(26, 78, 0.36) },
    { ...ringPulse(40, 78, 0.24) },
    { ...ringPulse(136, 84, 0.26) },
    { ...ringPulse(150, 84, 0.18) },
    { ...ringPulse(164, 84, 0.12) },
  ];

  // 基准线
  const ruleIn = interpolate(frame, [26, 62], [0, 1], {
    ...CLAMP,
    easing: EASE_IN_OUT,
  });

  // 巨型 τ 浮现
  const tauIn = spring({
    frame: Math.max(0, frame - 44),
    fps,
    config: { damping: 15, stiffness: 74, mass: 0.95 },
  });
  const tauScale = interpolate(tauIn, [0, 1], [0.72, 1], CLAMP);
  const tauOpacity = interpolate(tauIn, [0, 1], [0, 1], CLAMP);
  const tauSettle = interpolate(frame, [44, 240], [1.012, 1], CLAMP);

  // 红笔圈注
  const ellipseP = interpolate(frame, [78, 128], [0, 1], {
    ...CLAMP,
    easing: EASE_IN_OUT,
  });

  // 标题：遮罩内自下而上揭示
  const titleIn = spring({
    frame: Math.max(0, frame - 106),
    fps,
    config: { damping: 18, stiffness: 86, mass: 0.92 },
  });

  // 强调线
  const lineIn = interpolate(frame, [132, 168], [0, 1], {
    ...CLAMP,
    easing: EASE_IN_OUT,
  });

  // 机构行
  const metaIn = interpolate(frame, [142, 172], [0, 1], {
    ...CLAMP,
    easing: EASE_OUT,
  });

  // 日期
  const dateIn = interpolate(frame, [158, 188], [0, 1], {
    ...CLAMP,
    easing: EASE_OUT,
  });

  // 标题上扫过的光带
  const sweepX = interpolate(frame, [166, 208], [-360, 2280], {
    ...CLAMP,
    easing: EASE_IN_OUT,
  });
  const sweepO = interpolate(frame, [162, 172, 202, 212], [0, 1, 1, 0], CLAMP);

  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${camera})` }}>
      {/* 基准线 */}
      <div
        style={{
          position: "absolute",
          left: 370,
          top: TAU_BASELINE - 0.75,
          width: 1180,
          height: 1.5,
          background: `${ink}44`,
          transform: `scaleX(${ruleIn})`,
          transformOrigin: "center",
        }}
      />
      {[370, 1550].map((x) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x - 1,
            top: TAU_BASELINE - 9,
            width: 2,
            height: 18,
            background: accent,
            opacity: ruleIn * 0.9,
          }}
        />
      ))}

      {/* 同心圆 */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {rings.map((ring, i) => (
          <circle
            key={i}
            cx={960}
            cy={TAU_VIS_CY}
            r={ring.r}
            fill="none"
            stroke={i < 3 ? ink : accent}
            strokeWidth={1.2}
            opacity={ring.o}
          />
        ))}
      </svg>

      {/* τ 背后的环境光 */}
      <div
        style={{
          position: "absolute",
          left: 960 - 380,
          top: TAU_VIS_CY - 380,
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}1f 0%, ${accent}00 66%)`,
          opacity: tauOpacity,
        }}
      />

      {/* 巨型 τ */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: TAU_TOP,
          height: TAU_FONT * 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: tauOpacity,
          transform: `scale(${tauScale * tauSettle})`,
        }}
      >
        <div
          style={{
            fontFamily: font,
            fontWeight: 300,
            fontSize: TAU_FONT,
            lineHeight: 1,
            color: ink,
            textShadow: `0 0 60px ${accent}26`,
          }}
        >
          τ
        </div>
      </div>

      {/* 圈注 */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: tauOpacity }}
      >
        <ellipse
          cx={960}
          cy={TAU_VIS_CY}
          rx={220}
          ry={200}
          fill="none"
          stroke={accent}
          strokeWidth={2.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ellipseP}
          transform={`rotate(-7 960 ${TAU_VIS_CY})`}
        />
      </svg>

      {/* 标题（遮罩揭示） */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: TITLE_TOP,
          height: 158,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: font,
            fontSize: 120,
            fontWeight: 800,
            letterSpacing: 2,
            lineHeight: 1.16,
            textAlign: "center",
            color: ink,
            transform: `translateY(${(1 - titleIn) * 104}%)`,
          }}
        >
          韬（τ）定律
        </div>

        {sweepO > 0.001 && (
          <div
            style={{
              position: "absolute",
              left: sweepX,
              top: 0,
              width: 150,
              height: 158,
              transform: "skewX(-14deg)",
              background: `linear-gradient(90deg, ${ink}00, ${ink}14, ${ink}00)`,
              opacity: sweepO,
            }}
          />
        )}
      </div>

      {/* 强调线 */}
      <div
        style={{
          position: "absolute",
          left: 960 - 120,
          top: 756,
          width: 240,
          height: 3,
          background: accent,
          transform: `scaleX(${lineIn})`,
          transformOrigin: "center",
        }}
      />

      {/* 机构行 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 794,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 18.5,
          letterSpacing: 5,
          color: muted,
          opacity: metaIn,
          transform: `translateY(${(1 - metaIn) * 14}px)`,
        }}
      >
        HUAWEI · IEEE ISCAS 2026 · SHANGHAI
      </div>

      {/* 日期 */}
      <div
        style={{
          position: "absolute",
          right: 120,
          bottom: 96,
          textAlign: "right",
          opacity: dateIn,
          transform: `translateY(${(1 - dateIn) * 10}px)`,
        }}
      >
        <div
          style={{
            marginLeft: "auto",
            width: 34,
            height: 2,
            background: accent,
            marginBottom: 12,
          }}
        />
        <div
          style={{
            fontFamily: mono,
            fontSize: 17,
            letterSpacing: 3.2,
            color: muted,
          }}
        >
          2026.05.25
        </div>
      </div>
    </div>
  );
};
