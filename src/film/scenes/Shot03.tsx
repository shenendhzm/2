import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Ruler } from "../components/Ruler";
import { Stage } from "../components/Stage";
import { CLAMP, EASE_IN, EASE_OUT, MONO, TEXT } from "../look";

/** 断裂后的碎片 */
const SHARDS = [
  { x: 620, y: 300, w: 220, h: 150, dx: -420, dy: -260, rot: -38, clip: "polygon(0 0,100% 0,100% 64%,34% 100%)" },
  { x: 760, y: 240, w: 180, h: 120, dx: 260, dy: -300, rot: 44, clip: "polygon(0 12%,100% 0,86% 100%,0 78%)" },
  { x: 980, y: 280, w: 240, h: 160, dx: 420, dy: -180, rot: 62, clip: "polygon(0 0,88% 8%,100% 100%,12% 84%)" },
  { x: 520, y: 520, w: 200, h: 140, dx: -380, dy: 240, rot: 28, clip: "polygon(0 0,100% 22%,74% 100%,0 100%)" },
  { x: 900, y: 560, w: 260, h: 170, dx: 180, dy: 330, rot: -26, clip: "polygon(6% 0,100% 16%,100% 100%,0 76%)" },
  { x: 1180, y: 500, w: 190, h: 130, dx: 460, dy: 260, rot: 40, clip: "polygon(0 0,100% 0,72% 100%,0 82%)" },
  { x: 700, y: 380, w: 150, h: 110, dx: -180, dy: -360, rot: -58, clip: "polygon(0 0,100% 26%,82% 100%,0 68%)" },
  { x: 1060, y: 400, w: 170, h: 120, dx: 300, dy: -340, rot: 34, clip: "polygon(12% 0,100% 12%,100% 100%,0 88%)" },
  { x: 840, y: 660, w: 230, h: 150, dx: -300, dy: 380, rot: -34, clip: "polygon(0 0,100% 20%,88% 100%,0 100%)" },
  { x: 1240, y: 360, w: 160, h: 120, dx: 520, dy: -120, rot: 74, clip: "polygon(0 0,100% 30%,100% 100%,0 74%)" },
];

/** 镜 3：00:11.5–00:18，1nm 压扁 → 裂纹 → 崩断 */
export const Shot03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({ frame, fps, config: { damping: 13, mass: 0.6, stiffness: 220 } });
  const scale = interpolate(slam, [0, 1], [1.9, 1]) * interpolate(frame, [16, 40], [1, 1], CLAMP);
  const squashX = interpolate(frame, [14, 44], [1, 1.34], { ...CLAMP, easing: EASE_IN });
  const squashY = interpolate(frame, [14, 44], [1, 0.52], { ...CLAMP, easing: EASE_IN });
  const numOpacity = interpolate(frame, [0, 2, 40, 52], [0, 1, 1, 0], CLAMP);

  const crack = interpolate(frame, [42, 78], [0, 1], { ...CLAMP, easing: EASE_IN });
  const flash = interpolate(frame, [76, 78, 82], [0, 1, 0], CLAMP);
  const burst = interpolate(frame, [78, 150], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const fade = interpolate(frame, [150, 186], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.9 * (1 - fade)} grid={0.5 * (1 - fade)} lightX={960} lightY={600} />

      <AbsoluteFill style={{ opacity: 1 - fade }}>
        {/* 还没碎完的尺子 */}
        <Ruler
          x={120}
          y={300}
          rotate={0}
          scaleX={interpolate(frame, [0, 78], [0.5, 0.66], CLAMP)}
          opacity={interpolate(frame, [0, 78], [0.32, 0.5], CLAMP) * (1 - burst)}
        />

        {/* 1nm */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 250,
            height: 430,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            opacity: numOpacity * (1 - burst),
            transform: `scale(${scale}) scale(${squashX}, ${squashY})`,
            transformOrigin: "50% 70%",
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 470,
              lineHeight: 0.9,
              fontWeight: 700,
              color: TEXT,
              textShadow: "0 0 110px rgba(47,227,255,.4)",
            }}
          >
            1
          </span>
          <span style={{ fontFamily: MONO, fontSize: 78, color: TEXT, opacity: 0.5, marginLeft: 18 }}>
            nm
          </span>
        </div>

        {/* 裂纹 */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path
            d="M300 210 L560 330 L520 430 L760 500 L700 610 L980 660 L950 780 L1240 830 L1600 900"
            fill="none"
            stroke="#EAF8FF"
            strokeWidth={2.5}
            opacity={0.9 * crack}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - crack}
          />
          <path
            d="M760 500 L700 380 L560 340"
            fill="none"
            stroke="#EAF8FF"
            strokeWidth={1.6}
            opacity={0.55 * crack}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - crack}
          />
          <path
            d="M980 660 L1120 600 L1300 640"
            fill="none"
            stroke="#EAF8FF"
            strokeWidth={1.4}
            opacity={0.45 * crack}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - crack}
          />
        </svg>

        {/* 碎片 */}
        {SHARDS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x + s.dx * burst,
              top: s.y + s.dy * burst,
              width: s.w,
              height: s.h,
              clipPath: s.clip,
              transform: `rotate(${s.rot * burst}deg)`,
              background: "linear-gradient(150deg,#DCE6F2,#8C9BAE 46%,#5A6779 74%,#C4D0DE)",
              opacity: interpolate(burst, [0, 0.15, 0.85, 1], [0, 0.95, 0.7, 0], CLAMP),
              boxShadow: "0 20px 60px rgba(0,0,0,.6)",
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{ background: "#EAF8FF", opacity: flash * 0.85, mixBlendMode: "screen" }}
      />
      <AbsoluteFill style={{ background: "#000", opacity: fade }} />
    </AbsoluteFill>
  );
};
