import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Grid } from "../components/ui";
import { CLAMP, CYAN, EASE_IN, EASE_OUT, ORANGE, TEXT, fadeIn } from "../look";

/** 上浮淡入的通用包法 */
const riseStyle = (p: number, dist = 16) => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

/** 推力箭头（纯 SVG，无文字，避免栅格化对 SVG 文本的编码限制） */
const ForceArrow: React.FC<{ x1: number; x2: number; y: number; opacity: number }> = ({
  x1,
  x2,
  y,
  opacity,
}) => {
  const head = 22;
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, opacity }}
    >
      <line x1={x1} y1={y} x2={x2 - head} y2={y} stroke={ORANGE} strokeWidth={9} strokeLinecap="round" />
      <polygon
        points={`${x2},${y} ${x2 - head},${y - head * 0.62} ${x2 - head},${y + head * 0.62}`}
        fill={ORANGE}
      />
    </svg>
  );
};

/**
 * 镜 2（240–465，7.500s）· 直觉
 *
 * 0–20    手从左侧推入，橙色 F 顶住箱子
 * 20–36   手撤回，F 消失，箱子开始滑行
 * 26–160  箱子减速滑行 250px，速度条同步归零
 * 150     「推 → 停」落字
 * 158     「运动需要力来维持」落字（加引号，暗示这是待推翻的说法）
 *
 * 15 秒样片截取 0–210（= 8.0–15.0s）：整段「推 → 松手 → 滑行 → 停」都在，
 * 结尾停在这句错误常识上，和全片镜 2 的落点一致。
 */
export const Shot02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const push = interpolate(frame, [0, 20], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const glide = interpolate(frame, [26, 160], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const settle = interpolate(frame, [160, 164, 172], [0, 1, 0], CLAMP);
  const boxX = 700 + 66 * push + 250 * glide - settle * 3;

  const handIn = spring({ frame, fps, config: { damping: 17, stiffness: 150, mass: 0.8 } });
  const handOut = interpolate(frame, [20, 36], [0, 1], { ...CLAMP, easing: EASE_IN });
  const handShift = -760 * (1 - handIn) - 620 * handOut;
  const handRight = boxX - 8 + handShift;

  const force = frame < 22 ? 1 : interpolate(frame, [22, 36], [1, 0], { ...CLAMP, easing: EASE_OUT });
  const speed = frame < 22 ? 1 : interpolate(frame, [22, 160], [1, 0], { ...CLAMP, easing: Easing.out(Easing.quad) });

  const cap = fadeIn(frame, 150, 12);
  const quote = fadeIn(frame, 158, 14);

  const fingers = [0, 1, 2, 3];

  return (
    <AbsoluteFill style={{ backgroundColor: "#080D15", overflow: "hidden" }}>
      {/* 桌面：俯视 */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 42% 32%, rgba(53,224,255,.07) 0%, rgba(53,224,255,.02) 34%, rgba(0,0,0,0) 66%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
        <Grid sizeX={96} sizeY={96} color="rgba(237,242,255,.035)" />
      </div>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 300px 110px rgba(0,0,0,.8)" }} />

      {/* 箱子 */}
      <div
        style={{
          position: "absolute",
          left: boxX + 12,
          top: 494,
          width: 216,
          height: 216,
          borderRadius: 8,
          background: "radial-gradient(ellipse at 30% 25%, rgba(0,0,0,.5), rgba(0,0,0,0) 70%)",
          filter: "blur(14px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: boxX,
          top: 470,
          width: 210,
          height: 210,
          borderRadius: 6,
          backgroundColor: "#1D2735",
          border: "1px solid rgba(190,215,245,.16)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 52%)",
          }}
        />
        {/* 封箱胶带 */}
        <div
          style={{
            position: "absolute",
            left: 92,
            top: 0,
            width: 26,
            height: 210,
            background: "rgba(237,242,255,.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 92,
            width: 210,
            height: 26,
            background: "rgba(237,242,255,.035)",
          }}
        />
      </div>

      {/* 手：掌 + 四指，从左侧推入 */}
      <div style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            left: handRight - 214,
            top: 486,
            width: 140,
            height: 158,
            borderRadius: 46,
            background: "#38465C",
            boxShadow: "inset 0 2px 0 rgba(210,230,255,.20), 0 16px 34px rgba(0,0,0,.5)",
          }}
        />
        {fingers.map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: handRight - 96,
              top: 498 + i * 31,
              width: 96,
              height: 26,
              borderRadius: 13,
              background: "#3D4C63",
              boxShadow: "inset 0 1px 0 rgba(210,230,255,.22)",
            }}
          />
        ))}
        {/* 拇指 */}
        <div
          style={{
            position: "absolute",
            left: handRight - 122,
            top: 626,
            width: 78,
            height: 30,
            borderRadius: 15,
            background: "#36445A",
            transform: "rotate(-18deg)",
          }}
        />
      </div>

      {/* F 箭头：标在箱子上沿，避开手掌 */}
      <ForceArrow x1={boxX - 172} x2={boxX - 10} y={418} opacity={force} />
      <div
        style={{
          position: "absolute",
          left: boxX - 214,
          top: 382,
          fontFamily: '"DIN Alternate","JetBrains Mono",ui-monospace,monospace',
          fontSize: 34,
          fontWeight: 700,
          color: ORANGE,
          opacity: force,
        }}
      >
        F
      </div>

      {/* 速度条 */}
      <div
        style={{
          position: "absolute",
          left: 680,
          top: 812,
          width: 560,
          height: 8,
          borderRadius: 4,
          background: "rgba(237,242,255,.10)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(90deg, ${CYAN}, #7FB3FF)`,
            transformOrigin: "left center",
            transform: `scaleX(${speed})`,
            opacity: 0.9,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 800,
          fontFamily: '"DIN Alternate","JetBrains Mono",ui-monospace,monospace',
          fontSize: 22,
          color: CYAN,
          opacity: 0.7,
        }}
      >
        v
      </div>

      {/* 结论：推 → 停 */}
      <div style={{ position: "absolute", left: 132, top: 168, ...riseStyle(cap) }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
          <span style={{ fontSize: 76, fontWeight: 600, color: TEXT, letterSpacing: 2 }}>推</span>
          <span style={{ fontSize: 54, color: CYAN, opacity: 0.85 }}>→</span>
          <span style={{ fontSize: 76, fontWeight: 600, color: TEXT, letterSpacing: 2 }}>停</span>
        </div>
      </div>

      {/* 错误常识：先立起来，后面才推得倒 */}
      <div style={{ position: "absolute", left: 136, top: 300, ...riseStyle(quote, 12) }}>
        <div
          style={{
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: 1.2,
            color: "rgba(237,242,255,.56)",
          }}
        >
          “运动需要力来维持”
        </div>
      </div>
    </AbsoluteFill>
  );
};
