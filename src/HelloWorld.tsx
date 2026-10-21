import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BRAND = "#0b1020";
const ACCENT = "#54c8ff";
const ACCENT_2 = "#a06bff";

export type HelloWorldProps = {
  title: string;
};

export const HelloWorld: React.FC<HelloWorldProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // 标题：弹簧入场
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
  const titleY = interpolate(enter, [0, 1], [60, 0]);
  const titleOpacity = interpolate(enter, [0, 1], [0, 1]);

  // 副标题：稍后淡入
  const subOpacity = interpolate(frame, [24, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // 背景光晕缓慢漂移
  const drift = Math.sin(frame / 26) * 60;
  const driftY = Math.cos(frame / 31) * 40;

  // 进度条
  const progress = interpolate(
    frame,
    [0, durationInFrames - 1],
    [0, 1],
    { extrapolateRight: "clamp" },
  );

  // 结尾淡出
  const outro = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND,
        fontFamily:
          '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
        overflow: "hidden",
      }}
    >
      {/* 背景光晕 */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: width / 2 - 450 + drift,
          top: height / 2 - 450 + driftY,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}33 0%, ${ACCENT_2}22 45%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      {/* 细网格 */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(circle at 50% 50%, black 20%, transparent 75%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: outro,
        }}
      >
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "10px 22px",
              borderRadius: 999,
              border: `1px solid ${ACCENT}66`,
              color: ACCENT,
              fontSize: 22,
              letterSpacing: 2,
              marginBottom: 34,
            }}
          >
            REMOTION · 4.x
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 96,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: 4,
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: "30px 0 0",
              fontSize: 32,
              color: "rgba(255,255,255,0.72)",
              letterSpacing: 1,
              opacity: subOpacity,
            }}
          >
            用 React 写视频，用代码出片
          </p>

          <p
            style={{
              margin: "16px 0 0",
              fontSize: 22,
              color: "rgba(255,255,255,0.4)",
              opacity: subOpacity,
            }}
          >
            {width}×{height} · {fps}fps · {Math.round(durationInFrames / fps)}s
          </p>
        </div>
      </AbsoluteFill>

      {/* 进度条 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
          }}
        />
      </div>

      {/* 帧计数 */}
      <div
        style={{
          position: "absolute",
          right: 36,
          top: 32,
          fontSize: 20,
          color: "rgba(255,255,255,0.35)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(frame).padStart(3, "0")} / {durationInFrames}
      </div>
    </AbsoluteFill>
  );
};
