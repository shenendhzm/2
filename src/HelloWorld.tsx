import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SCORE_SRC } from "./score";

const BG = "#060B18";
const CYAN = "#54C8FF";
const VIOLET = "#A06BFF";
const FONT =
  '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  x: 70 + ((i * 197) % 1780),
  y: 60 + ((i * 311) % 960),
  r: 1.2 + (i % 3) * 0.7,
  drift: 18 + (i % 7) * 9,
  phase: (i * 17) % 120,
}));

const Backdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const gridIn = interpolate(frame, [0, 30], [0, 1], CLAMP);
  const breathe = interpolate(frame % 90, [0, 45, 90], [0.72, 1, 0.72], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <div
        style={{
          position: "absolute",
          left: -180,
          top: -260,
          width: 1320,
          height: 1320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CYAN}22 0%, ${CYAN}0d 38%, transparent 68%)`,
          filter: "blur(18px)",
          opacity: gridIn * breathe,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -320,
          top: 40,
          width: 1180,
          height: 1180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${VIOLET}1c 0%, transparent 66%)`,
          filter: "blur(26px)",
          opacity: gridIn * 0.85,
        }}
      />

      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: gridIn * 0.9,
          maskImage:
            "radial-gradient(ellipse at 42% 48%, black 8%, rgba(0,0,0,.6) 55%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 42% 48%, black 8%, rgba(0,0,0,.6) 55%, transparent 88%)",
        }}
      />

      {PARTICLES.map((p, i) => {
        const twinkle = interpolate(
          (frame + p.phase) % 120,
          [0, 60, 120],
          [0.06, 0.5, 0.06],
          CLAMP,
        );
        const floatY = interpolate(frame, [0, 300], [0, -p.drift], CLAMP);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: "50%",
              backgroundColor: i % 4 === 0 ? VIOLET : CYAN,
              opacity: twinkle,
              transform: `translateY(${floatY}px)`,
              boxShadow: `0 0 8px ${i % 4 === 0 ? VIOLET : CYAN}`,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 48% 46%, transparent 38%, rgba(2,4,10,.55) 82%, #02040a 100%)`,
        }}
      />

      {/* 四角取景框 */}
      {(
        [
          { left: 56, top: 56, borderTop: `1px solid ${CYAN}88`, borderLeft: `1px solid ${CYAN}88` },
          { right: 56, top: 56, borderTop: `1px solid ${CYAN}88`, borderRight: `1px solid ${CYAN}88` },
          { left: 56, bottom: 56, borderBottom: `1px solid ${CYAN}88`, borderLeft: `1px solid ${CYAN}88` },
          { right: 56, bottom: 56, borderBottom: `1px solid ${CYAN}88`, borderRight: `1px solid ${CYAN}88` },
        ] as React.CSSProperties[]
      ).map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 58,
            height: 58,
            opacity: 0.45,
            ...c,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Ring: React.FC<{
  frame: number;
  delay: number;
  size: number;
  color: string;
  dashed?: boolean;
}> = ({ frame, delay, size, color, dashed }) => {
  const p = interpolate(frame, [delay, delay + 78], [0, 1], CLAMP);
  const scale = interpolate(p, [0, 1], [0.42, 2.05]);
  const opacity = interpolate(p, [0, 0.12, 0.7, 1], [0, 0.5, 0.24, 0], CLAMP);
  const rotate = interpolate(frame, [0, 300], [0, dashed ? -34 : 18], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        left: 560,
        top: 540,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: "50%",
        border: `1.5px ${dashed ? "dashed" : "solid"} ${color}`,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        opacity,
      }}
    />
  );
};

const Intro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scene = interpolate(frame, [0, 18, 232, 248], [0, 1, 1, 0], CLAMP);
  const tauIn = spring({
    frame: Math.max(0, frame - 26),
    fps,
    config: { damping: 13, mass: 0.9, stiffness: 78 },
  });
  const tauScale = interpolate(tauIn, [0, 1], [0.62, 1], CLAMP);
  const tauOpacity = interpolate(tauIn, [0, 1], [0, 1], CLAMP);
  const tauBlur = interpolate(tauIn, [0, 1], [26, 0], CLAMP);
  const tauBreath = interpolate(frame % 75, [0, 37, 75], [1, 1.012, 1], CLAMP);

  const kicker = interpolate(frame, [60, 78], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const title = spring({
    frame: Math.max(0, frame - 70),
    fps,
    config: { damping: 16, mass: 0.85, stiffness: 70 },
  });
  const line = interpolate(frame, [96, 122], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });
  const credit1 = interpolate(frame, [124, 146], [0, 1], CLAMP);
  const credit2 = interpolate(frame, [142, 164], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ opacity: scene }}>
      {/* 同心圆晕开 */}
      <Ring frame={frame} delay={10} size={430} color={`${CYAN}aa`} />
      <Ring frame={frame} delay={32} size={570} color={`${VIOLET}99`} dashed />
      <Ring frame={frame} delay={54} size={710} color={`${CYAN}66`} />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 540,
          width: 520,
          height: 520,
          marginLeft: -260,
          marginTop: -260,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,.06)",
          opacity: 0.6,
        }}
      />

      {/* 巨型 τ */}
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 190,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CYAN}30 0%, ${VIOLET}14 46%, transparent 70%)`,
          filter: "blur(28px)",
          opacity: tauOpacity * 0.9,
          transform: `scale(${tauScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 190,
          width: 700,
          height: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 700,
          fontWeight: 300,
          lineHeight: 1,
          color: "#ffffff",
          opacity: tauOpacity,
          transform: `scale(${tauScale * tauBreath})`,
          filter: `blur(${tauBlur}px)`,
          textShadow: `0 0 90px ${CYAN}66, 0 0 26px ${CYAN}44`,
        }}
      >
        τ
      </div>

      {/* 竖向分隔线 */}
      <div
        style={{
          position: "absolute",
          left: 936,
          top: 292,
          width: 1,
          height: 496,
          background: `linear-gradient(180deg, transparent, ${CYAN}55, transparent)`,
          opacity: 0.7 * scene,
        }}
      />

      {/* 标题区 */}
      <div style={{ position: "absolute", left: 1000, top: 322, width: 820 }}>
        <div
          style={{
            color: CYAN,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: 14,
            opacity: kicker,
            transform: `translateX(${(1 - kicker) * -22}px)`,
          }}
        >
          τ →
        </div>

        <div style={{ overflow: "hidden", marginTop: 10 }}>
          <div
            style={{
              fontSize: 112,
              fontWeight: 800,
              letterSpacing: 2,
              lineHeight: 1.12,
              color: "#ffffff",
              transform: `translateY(${(1 - title) * 112}%)`,
            }}
          >
            韬（τ）定律
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            width: 250,
            height: 2,
            background: `linear-gradient(90deg, ${CYAN}, ${VIOLET}, transparent)`,
            transform: `scaleX(${line})`,
            transformOrigin: "left",
          }}
        />

        <div
          style={{
            marginTop: 46,
            fontSize: 25,
            fontWeight: 500,
            letterSpacing: 3.4,
            color: "rgba(255,255,255,.56)",
            opacity: credit1,
          }}
        >
          HUAWEI · IEEE ISCAS 2026 · SHANGHAI
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 25,
            fontWeight: 500,
            letterSpacing: 3.4,
            color: "rgba(255,255,255,.36)",
            opacity: credit2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          2026.05.25
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Chart: React.FC<{ frame: number }> = ({ frame }) => {
  const scene = interpolate(frame, [232, 252], [0, 1], CLAMP);
  const panelIn = interpolate(frame, [232, 266], [26, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const axisP = interpolate(frame, [240, 298], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });
  const labelP = interpolate(frame, [250, 284], [0, 1], CLAMP);
  const titleP = interpolate(frame, [240, 262], [0, 1], CLAMP);
  const scanP = interpolate(frame, [240, 300], [0, 1], CLAMP);
  const scanX = 110 + scanP * 1400;

  const yTicks = [80, 212.5, 345, 477.5, 610];
  const yLabels = ["10K×", "1K×", "100×", "10×", "1×"];
  const years = [1990, 2000, 2010, 2015, 2026];
  const yearX = (y: number) => 110 + ((y - 1990) / 36) * 1400;

  return (
    <AbsoluteFill style={{ opacity: scene }}>
      {/* 场景标题 */}
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 150,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: titleP,
          transform: `translateY(${(1 - titleP) * 14}px)`,
        }}
      >
        <div
          style={{
            width: 4,
            height: 44,
            borderRadius: 2,
            backgroundColor: CYAN,
            boxShadow: `0 0 18px ${CYAN}88`,
          }}
        />
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#ffffff",
          }}
        >
          晶体管密度
        </div>
      </div>

      {/* 图表卡片 */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 250,
          width: 1620,
          height: 700,
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,.09)",
          background:
            "linear-gradient(180deg, rgba(84,200,255,.055) 0%, rgba(255,255,255,.012) 100%)",
          boxShadow: "0 40px 120px rgba(0,0,0,.4)",
          overflow: "hidden",
          transform: `translateY(${panelIn}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${CYAN}66, transparent)`,
          }}
        />

        <svg
          width={1620}
          height={700}
          viewBox="0 0 1620 700"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          {/* 网格 */}
          {yTicks.map((y) => (
            <line
              key={`y${y}`}
              x1={110}
              y1={y}
              x2={1510}
              y2={y}
              stroke="rgba(255,255,255,.10)"
              strokeWidth={1}
              opacity={axisP}
            />
          ))}
          {years.map((year) => (
            <line
              key={`x${year}`}
              x1={yearX(year)}
              y1={80}
              x2={yearX(year)}
              y2={610}
              stroke="rgba(255,255,255,.07)"
              strokeWidth={1}
              opacity={axisP}
            />
          ))}

          {/* 坐标轴 */}
          <path
            d="M 110 80 L 110 610 L 1510 610"
            fill="none"
            stroke="rgba(255,255,255,.45)"
            strokeWidth={2}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - axisP}
          />

          {/* 扫描线 */}
          <line
            x1={scanX}
            y1={80}
            x2={scanX}
            y2={610}
            stroke={CYAN}
            strokeWidth={2}
            opacity={0.22}
          />
          <circle cx={scanX} cy={610} r={4} fill={CYAN} opacity={0.8} />

          {/* 轴标签 */}
          {yTicks.map((y, i) => (
            <text
              key={`yl${y}`}
              x={88}
              y={y + 8}
              textAnchor="end"
              fill="rgba(255,255,255,.36)"
              fontSize={23}
              fontFamily={FONT}
              opacity={labelP}
            >
              {yLabels[i]}
            </text>
          ))}
          {years.map((year) => (
            <text
              key={`xl${year}`}
              x={yearX(year)}
              y={652}
              textAnchor="middle"
              fill={year === 2015 ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.36)"}
              fontSize={23}
              fontFamily={FONT}
              opacity={labelP}
            >
              {year}
            </text>
          ))}

          {/* 2015 提示点 */}
          <circle
            cx={yearX(2015)}
            cy={610}
            r={5}
            fill={BG}
            stroke="rgba(255,255,255,.6)"
            strokeWidth={1.5}
            opacity={labelP}
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      <Audio src={SCORE_SRC} />
      <Backdrop frame={frame} />
      <Intro frame={frame} fps={fps} />
      <Chart frame={frame} />
    </AbsoluteFill>
  );
};
