import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import {
  CLAMP,
  EASE_IN_OUT,
  EASE_OUT,
  FONT,
  INK,
  MONO,
  MUTED,
  PAPER,
  RED,
  RULE,
  SERIF,
} from "../looks/forest";

const DIE = { left: 700, top: 300, size: 500 };
const RAIL_Y = 170;
const TICKS = [
  { x: 620, label: "7nm" },
  { x: 960, label: "5nm" },
  { x: 1300, label: "3nm" },
];

const Die: React.FC<{ frame: number; clampPulse: number }> = ({ frame, clampPulse }) => {
  const scan = interpolate(frame % 120, [0, 120], [0, DIE.size], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        left: DIE.left,
        top: DIE.top,
        width: DIE.size,
        height: DIE.size,
        border: `2px solid ${INK}`,
        background: PAPER,
        backgroundImage: `repeating-linear-gradient(0deg, ${RULE} 0 1px, transparent 1px 50px), repeating-linear-gradient(90deg, ${RULE} 0 1px, transparent 1px 50px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 22,
          border: `1px solid ${INK}55`,
        }}
      />

      {/* 版图节点 */}
      {[
        [90, 120],
        [180, 120],
        [300, 120],
        [410, 120],
        [120, 260],
        [250, 260],
        [380, 260],
        [180, 390],
        [320, 390],
      ].map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: i % 3 === 0 ? 10 : 7,
            height: i % 3 === 0 ? 10 : 7,
            background: i % 4 === 0 ? RED : INK,
          }}
        />
      ))}

      {/* 扫描线 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scan,
          height: 1,
          background: `${INK}55`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 10,
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: 2,
          color: MUTED,
        }}
      >
        DIE 01
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 0 4px ${RED}`,
          opacity: clampPulse,
        }}
      />
    </div>
  );
};

export const S1Forest: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const camera = interpolate(frame, [0, 330], [1, 1.02], CLAMP);

  // 1A 基准线
  const ruleP = interpolate(frame, [4, 40], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const ruleFade = interpolate(frame, [240, 268], [1, 0], CLAMP);

  // 1B 卡尺
  const sceneB = interpolate(frame, [70, 90, 252, 268], [0, 1, 1, 0], CLAMP);
  const enter = spring({
    frame: Math.max(0, frame - 78),
    fps,
    config: { damping: 200, stiffness: 58, mass: 0.9 },
  });
  const leftX = interpolate(enter, [0, 1], [120, 674]);
  const rightX = interpolate(enter, [0, 1], [1774, 1226]);

  const jitterP = interpolate(frame, [150, 152, 162, 168], [0, 1, 1, 0], CLAMP);
  const jitter = Math.sin((frame - 150) * 2.4) * 3 * jitterP;
  const clampPulse = interpolate(frame, [148, 152, 174, 196], [0, 1, 0.6, 0], CLAMP);

  const retract = interpolate(frame, [244, 268], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const jawShift = retract * 90;

  // 落章
  const stampIn = spring({
    frame: Math.max(0, frame - 151),
    fps,
    config: { damping: 9, stiffness: 210, mass: 0.6 },
  });
  const stampScale = interpolate(stampIn, [0, 1], [1.8, 1], CLAMP);
  const stampRot = interpolate(stampIn, [0, 1], [-26, -11], CLAMP);

  // 1C 擦除
  const sweepX = interpolate(frame, [208, 254], [-320, 2140], { ...CLAMP, easing: EASE_IN_OUT });
  const sweepOpacity = interpolate(frame, [206, 212, 252, 258], [0, 1, 1, 0], CLAMP);
  const tickErase = (tickX: number) => {
    const p = Math.min(1, Math.max(0, (sweepX - tickX + 10) / 240));
    return 1 - p;
  };

  // 1D τ 与标题
  const tauIn = spring({
    frame: Math.max(0, frame - 270),
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.85 },
  });
  const tauScale = interpolate(tauIn, [0, 1], [0.7, 1], CLAMP);
  const tauOpacity = interpolate(tauIn, [0, 1], [0, 1], CLAMP);

  const ellipseP = interpolate(frame, [282, 318], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });

  const titleIn = spring({
    frame: Math.max(0, frame - 278),
    fps,
    config: { damping: 16, stiffness: 92, mass: 0.85 },
  });
  const kickerIn = interpolate(frame, [288, 306], [0, 1], CLAMP);
  const lineIn = interpolate(frame, [294, 314], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const metaIn = interpolate(frame, [302, 320], [0, 1], CLAMP);

  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${camera})` }}>
      {/* 基准线 */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 560,
          width: 1640,
          height: 1.5,
          background: INK,
          transform: `scaleX(${ruleP})`,
          transformOrigin: "left",
          opacity: ruleFade,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 551,
          width: 2,
          height: 20,
          background: RED,
          opacity: ruleP * ruleFade,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1778,
          top: 551,
          width: 2,
          height: 20,
          background: RED,
          opacity: ruleP * ruleFade,
        }}
      />

      {/* 1B */}
      <div style={{ position: "absolute", inset: 0, opacity: sceneB }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(frame, [75, 92], [0, 1], CLAMP),
            transform: `scale(${interpolate(frame, [75, 112], [0.96, 1], {
              ...CLAMP,
              easing: EASE_OUT,
            })})`,
          }}
        >
          <Die frame={frame} clampPulse={clampPulse} />
        </div>

        {/* 导轨 */}
        <div
          style={{
            position: "absolute",
            left: 200,
            top: RAIL_Y,
            width: 1520,
            height: 2,
            background: INK,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 200,
            top: RAIL_Y - 8,
            width: 2,
            height: 18,
            background: INK,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 1718,
            top: RAIL_Y - 8,
            width: 2,
            height: 18,
            background: INK,
          }}
        />
        {Array.from({ length: 61 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 210 + i * 25,
              top: RAIL_Y + 2,
              width: 1,
              height: i % 5 === 0 ? 15 : 8,
              background: i % 5 === 0 ? `${INK}aa` : `${INK}55`,
            }}
          />
        ))}

        {TICKS.map((t, i) => {
          const lit = interpolate(frame, [100 + i * 22, 108 + i * 22], [0, 1], CLAMP);
          return (
            <div
              key={t.label}
              style={{
                position: "absolute",
                left: t.x - 45,
                top: 118,
                width: 90,
                textAlign: "center",
                fontFamily: MONO,
                fontSize: 24,
                letterSpacing: 1.5,
                color: lit > 0.5 ? RED : MUTED,
                opacity: lit * tickErase(t.x),
              }}
            >
              {t.label}
            </div>
          );
        })}

        {/* 左钳口 */}
        <div
          style={{
            position: "absolute",
            left: leftX + jitter - jawShift,
            top: 200,
            width: 26,
            height: 620,
            border: `2px solid ${INK}`,
            background: PAPER,
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -66,
              bottom: -2,
              width: 66,
              height: 18,
              border: `2px solid ${INK}`,
              borderLeft: "none",
              background: PAPER,
            }}
          />
        </div>

        {/* 右钳口 */}
        <div
          style={{
            position: "absolute",
            left: rightX - jitter + jawShift,
            top: 200,
            width: 26,
            height: 620,
            border: `2px solid ${INK}`,
            background: PAPER,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -66,
              bottom: -2,
              width: 66,
              height: 18,
              border: `2px solid ${INK}`,
              borderRight: "none",
              background: PAPER,
            }}
          />
        </div>

        {/* 接触红线 */}
        {[700, 1200].map((x) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: x - 1,
              top: 320,
              width: 2,
              height: 460,
              background: RED,
              opacity: clampPulse,
            }}
          />
        ))}

        {/* 3nm 落章 */}
        <div
          style={{
            position: "absolute",
            left: 1340,
            top: 92,
            width: 54,
            height: 54,
            borderRadius: "50%",
            border: `3px solid ${RED}`,
            opacity: stampIn,
            transform: `scale(${stampScale}) rotate(${stampRot}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 8,
              width: 3,
              height: 32,
              background: RED,
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 8,
              width: 3,
              height: 32,
              background: RED,
              transform: "rotate(-45deg)",
            }}
          />
        </div>
      </div>

      {/* 1C 擦除带 */}
      {sweepOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: sweepX,
            top: 60,
            width: 240,
            height: 970,
            background: PAPER,
            borderLeft: `3px solid ${RED}`,
            boxShadow: "18px 0 40px rgba(23,20,15,.16)",
            opacity: sweepOpacity,
          }}
        />
      )}

      {/* 1D τ */}
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 170,
          width: 720,
          height: 740,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: tauOpacity,
          transform: `scale(${tauScale})`,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 560,
            lineHeight: 1,
            color: INK,
          }}
        >
          τ
        </div>
      </div>

      {/* 红笔圈注 */}
      <svg
        width={760}
        height={760}
        style={{ position: "absolute", left: 170, top: 160, opacity: tauOpacity }}
      >
        <ellipse
          cx={380}
          cy={380}
          rx={238}
          ry={286}
          fill="none"
          stroke={RED}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ellipseP}
          transform="rotate(-7 380 380)"
        />
      </svg>

      {/* 1D 标题 */}
      <div style={{ position: "absolute", left: 1030, top: 320, width: 740 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 18,
            letterSpacing: 4,
            color: RED,
            opacity: kickerIn,
            transform: `translateX(${(1 - kickerIn) * -16}px)`,
          }}
        >
          TAU SCALING LAW
        </div>

        <div style={{ overflow: "hidden", marginTop: 20 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: 2,
              lineHeight: 1.18,
              color: INK,
              transform: `translateY(${(1 - titleIn) * 100}%)`,
            }}
          >
            韬（τ）定律
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            width: 200,
            height: 3,
            background: RED,
            transform: `scaleX(${lineIn})`,
            transformOrigin: "left",
          }}
        />

        <div
          style={{
            marginTop: 24,
            fontFamily: MONO,
            fontSize: 17,
            letterSpacing: 1.6,
            lineHeight: 1.8,
            color: MUTED,
            opacity: metaIn,
          }}
        >
          HUAWEI · IEEE ISCAS 2026 · SHANGHAI
        </div>
      </div>
    </div>
  );
};
