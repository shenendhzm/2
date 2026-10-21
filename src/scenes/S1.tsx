import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import {
  AMBER,
  CLAMP,
  CYAN,
  EASE_IN_OUT,
  EASE_OUT,
  FONT,
  MONO,
  MUTED,
  RED,
  TEXT,
} from "../theme";

const DIE = { left: 700, top: 280, size: 520 };
const RAIL_Y = 118;
const TICKS = [
  { x: 620, label: "7nm" },
  { x: 960, label: "5nm" },
  { x: 1300, label: "3nm" },
];

const Die: React.FC<{ frame: number; clampPulse: number }> = ({ frame, clampPulse }) => {
  const scan = interpolate(frame % 110, [0, 110], [0, DIE.size], CLAMP);
  const cells = Array.from({ length: 100 }, (_, i) => i);
  return (
    <div
      style={{
        position: "absolute",
        left: DIE.left,
        top: DIE.top,
        width: DIE.size,
        height: DIE.size,
        borderRadius: 22,
        border: `1px solid ${CYAN}3d`,
        background: "linear-gradient(155deg, #0C1828 0%, #070E1B 100%)",
        boxShadow: `0 0 90px rgba(43,227,201,.10), inset 0 0 60px rgba(43,227,201,.05)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 24,
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gap: 4,
        }}
      >
        {cells.map((i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          const hot = (row * 7 + col * 5) % 13 < 4;
          const amber = (row * 3 + col * 11) % 29 === 0;
          return (
            <div
              key={i}
              style={{
                borderRadius: 3,
                background: amber
                  ? `${AMBER}2e`
                  : hot
                    ? `${CYAN}26`
                    : "rgba(255,255,255,.035)",
                border: `1px solid ${hot ? `${CYAN}33` : "rgba(255,255,255,.04)"}`,
              }}
            />
          );
        })}
      </div>

      {/* 扫描线 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scan,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${CYAN}88 18%, ${CYAN}aa 50%, ${CYAN}88 82%, transparent)`,
          opacity: 0.55,
        }}
      />

      {/* 四角标记 */}
      {[
        { left: 14, top: 14, borderLeft: `2px solid ${CYAN}aa`, borderTop: `2px solid ${CYAN}aa` },
        { right: 14, top: 14, borderRight: `2px solid ${CYAN}aa`, borderTop: `2px solid ${CYAN}aa` },
        { left: 14, bottom: 14, borderLeft: `2px solid ${CYAN}aa`, borderBottom: `2px solid ${CYAN}aa` },
        { right: 14, bottom: 14, borderRight: `2px solid ${CYAN}aa`, borderBottom: `2px solid ${CYAN}aa` },
      ].map((c, i) => (
        <div key={i} style={{ position: "absolute", width: 22, height: 22, ...c }} />
      ))}

      {/* 夹持瞬间的红色警示 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 22,
          boxShadow: `inset 0 0 70px ${RED}66`,
          opacity: clampPulse,
        }}
      />
    </div>
  );
};

export const S1: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const camera = interpolate(frame, [0, 330], [1, 1.035], CLAMP);

  // ---- 1A 示波器基线
  const lineP = interpolate(frame, [0, 34], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const lineY = 540;

  // ---- 1B 卡尺
  const enter = spring({
    frame: Math.max(0, frame - 78),
    fps,
    config: { damping: 200, stiffness: 58, mass: 0.9 },
  });
  const leftX = interpolate(enter, [0, 1], [96, 664]);
  const rightX = interpolate(enter, [0, 1], [1790, 1222]);

  const jitterP = interpolate(frame, [150, 152, 162, 168], [0, 1, 1, 0], CLAMP);
  const jitter = Math.sin((frame - 150) * 2.4) * 3 * jitterP;

  const clampPulse = interpolate(frame, [148, 153, 172, 196], [0, 1, 0.55, 0], CLAMP);

  const retract = interpolate(frame, [242, 268], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const jawShift = retract * 90;
  const railOpacity = interpolate(frame, [240, 268], [1, 0], CLAMP);
  const sceneB = interpolate(frame, [70, 90, 250, 268], [0, 1, 1, 0], CLAMP);

  // ---- 1C 扫光
  const sweepX = interpolate(frame, [208, 256], [-320, 2200], { ...CLAMP, easing: EASE_IN_OUT });
  const sweepOpacity = interpolate(frame, [206, 214, 250, 258], [0, 1, 1, 0], CLAMP);
  const tickErase = (tickX: number) => {
    const p = Math.min(1, Math.max(0, (sweepX - tickX + 20) / 260));
    return 1 - p;
  };

  // ---- 1D τ 与标题
  const tauIn = spring({
    frame: Math.max(0, frame - 270),
    fps,
    config: { damping: 13, stiffness: 88, mass: 0.85 },
  });
  const tauScale = interpolate(tauIn, [0, 1], [0.62, 1], CLAMP);
  const tauOpacity = interpolate(tauIn, [0, 1], [0, 1], CLAMP);
  const tauBlur = interpolate(tauIn, [0, 1], [24, 0], CLAMP);

  const titleIn = spring({
    frame: Math.max(0, frame - 278),
    fps,
    config: { damping: 16, stiffness: 92, mass: 0.85 },
  });
  const lineIn = interpolate(frame, [292, 312], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const kickerIn = interpolate(frame, [286, 304], [0, 1], CLAMP);
  const subIn = interpolate(frame, [298, 316], [0, 1], CLAMP);

  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${camera})` }}>
      {/* 1A 基线 */}
      <div
        style={{
          position: "absolute",
          left: 260,
          right: 260,
          top: lineY,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${CYAN}cc, transparent)`,
          transform: `scaleX(${lineP})`,
          opacity: 1 - sceneB,
          boxShadow: `0 0 24px ${CYAN}66`,
        }}
      />

      {/* 1B 芯片与卡尺 */}
      <div style={{ position: "absolute", inset: 0, opacity: sceneB }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(frame, [75, 92], [0, 1], CLAMP),
            transform: `scale(${interpolate(frame, [75, 110], [0.94, 1], {
              ...CLAMP,
              easing: EASE_OUT,
            })})`,
          }}
        >
          <Die frame={frame} clampPulse={clampPulse} />
        </div>

        {/* 上方导轨 + 刻度 */}
        <div style={{ opacity: railOpacity }}>
          <div
            style={{
              position: "absolute",
              left: 180,
              width: 1560,
              top: RAIL_Y,
              height: 10,
              borderRadius: 5,
              background: "linear-gradient(180deg, #46566F 0%, #223047 55%, #151E2E 100%)",
              boxShadow: "0 2px 14px rgba(0,0,0,.5)",
            }}
          />
          {Array.from({ length: 61 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 190 + i * 25,
                top: RAIL_Y + 10,
                width: 1,
                height: i % 5 === 0 ? 14 : 8,
                backgroundColor: "rgba(255,255,255,.22)",
              }}
            />
          ))}

          {TICKS.map((t, i) => {
            const lit = interpolate(frame, [100 + i * 22, 108 + i * 22], [0, 1], CLAMP);
            const isThird = i === 2;
            const redMix = isThird ? clampPulse : 0;
            const color = redMix > 0.5 ? RED : lit > 0.5 ? CYAN : MUTED;
            return (
              <div
                key={t.label}
                style={{
                  position: "absolute",
                  left: t.x - 40,
                  top: RAIL_Y - 48,
                  width: 80,
                  textAlign: "center",
                  fontFamily: MONO,
                  fontSize: 26,
                  letterSpacing: 2,
                  color,
                  opacity: lit * tickErase(t.x),
                  textShadow: lit > 0.5 ? `0 0 18px ${color}66` : "none",
                }}
              >
                {t.label}
              </div>
            );
          })}
        </div>

        {/* 左钳口 */}
        <div
          style={{
            position: "absolute",
            left: leftX - jawShift + jitter,
            top: 162,
            width: 34,
            height: 646,
            borderRadius: 5,
            background: "linear-gradient(90deg, #4A5A76 0%, #2A3850 48%, #1A2434 100%)",
            border: "1px solid rgba(255,255,255,.14)",
            boxShadow: "0 10px 30px rgba(0,0,0,.45)",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -78,
              bottom: 0,
              width: 78,
              height: 22,
              background: "linear-gradient(180deg, #3B4A63, #1B2536)",
              borderTop: "1px solid rgba(255,255,255,.14)",
            }}
          />
        </div>

        {/* 右钳口 */}
        <div
          style={{
            position: "absolute",
            left: rightX + jawShift - jitter,
            top: 162,
            width: 34,
            height: 646,
            borderRadius: 5,
            background: "linear-gradient(270deg, #4A5A76 0%, #2A3850 48%, #1A2434 100%)",
            border: "1px solid rgba(255,255,255,.14)",
            boxShadow: "0 10px 30px rgba(0,0,0,.45)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -78,
              bottom: 0,
              width: 78,
              height: 22,
              background: "linear-gradient(180deg, #3B4A63, #1B2536)",
              borderTop: "1px solid rgba(255,255,255,.14)",
            }}
          />
        </div>

      </div>

      {/* 1C 扫光 */}
      {sweepOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: sweepX,
            width: 260,
            height: 960,
            transform: "skewX(-11deg)",
            background:
              "linear-gradient(90deg, rgba(43,227,201,0) 0%, rgba(43,227,201,.14) 38%, rgba(255,255,255,.5) 50%, rgba(43,227,201,.14) 62%, rgba(43,227,201,0) 100%)",
            opacity: sweepOpacity,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* 1D τ */}
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 130,
          width: 720,
          height: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: tauOpacity,
          transform: `scale(${tauScale})`,
          filter: `blur(${tauBlur}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${CYAN}2e 0%, ${CYAN}0d 48%, transparent 72%)`,
          }}
        />
        <div
          style={{
            fontFamily: FONT,
            fontSize: 580,
            fontWeight: 300,
            lineHeight: 1,
            color: "#fff",
            textShadow: `0 0 110px ${CYAN}55, 0 0 32px ${CYAN}44`,
          }}
        >
          τ
        </div>
      </div>

      {/* 1D 标题区 */}
      <div
        style={{
          position: "absolute",
          left: 1000,
          top: 320,
          width: 780,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 22,
            letterSpacing: 3.4,
            color: CYAN,
            opacity: kickerIn,
            transform: `translateX(${(1 - kickerIn) * -18}px)`,
          }}
        >
          HUAWEI · IEEE ISCAS 2026 · SHANGHAI
        </div>

        <div style={{ overflow: "hidden", marginTop: 22 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 108,
              fontWeight: 800,
              letterSpacing: 4,
              lineHeight: 1.16,
              color: TEXT,
              transform: `translateY(${(1 - titleIn) * 100}%)`,
            }}
          >
            韬（τ）定律
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            width: 260,
            height: 2,
            background: `linear-gradient(90deg, ${CYAN}, rgba(43,227,201,.15), transparent)`,
            transform: `scaleX(${lineIn})`,
            transformOrigin: "left",
          }}
        />

        <div
          style={{
            marginTop: 26,
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: 6,
            color: MUTED,
            opacity: subIn,
          }}
        >
          2026.05.25
        </div>
      </div>

      {/* 1D 竖向分隔线 */}
      <div
        style={{
          position: "absolute",
          left: 944,
          top: 300,
          width: 1,
          height: 500,
          background: `linear-gradient(180deg, transparent, ${CYAN}66, transparent)`,
          opacity: interpolate(frame, [286, 306], [0, 0.8], CLAMP),
        }}
      />
    </div>
  );
};
