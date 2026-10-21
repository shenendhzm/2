import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, MONO } from "../looks/noir";

export type NoirVariant = "dots" | "glow" | "lines";

type Props = {
  variant: NoirVariant;
  ink: string;
  accent: string;
  muted: string;
  header: string;
  right: string;
  label: string;
};

const MASK =
  "radial-gradient(ellipse at 50% 46%, black 6%, rgba(0,0,0,.58) 60%, transparent 92%)";

/**
 * 黑底的三种背景语言（同一个镜头，只换底）：
 * - dots  点阵：细点阵 + 极简页眉，无框无裁切标记
 * - glow  光晕：两团极淡光源 + 暗角，无网格
 * - lines 横线：细密横纹 + 扫过的光带
 */
export const NoirBackdrop: React.FC<Props> = ({
  variant,
  ink,
  accent,
  muted,
  header,
  right,
  label,
}) => {
  const frame = useCurrentFrame();
  const chromeIn = interpolate(frame, [4, 26], [0, 1], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  const breathe = interpolate(frame % 300, [0, 150, 300], [0.62, 1, 0.62], CLAMP);
  const bandY = interpolate(frame % 240, [0, 240], [-160, 1180], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {variant === "dots" && (
        <>
          <AbsoluteFill
            style={{
              backgroundImage: `radial-gradient(${ink}2e 1.15px, transparent 1.35px)`,
              backgroundSize: "34px 34px",
              backgroundPosition: "18px 18px",
              maskImage: MASK,
              WebkitMaskImage: MASK,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse at 32% 24%, rgba(255,255,255,.045) 0%, rgba(255,255,255,0) 56%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 120,
              right: 120,
              top: 130,
              height: 1,
              background: `${ink}1c`,
              transform: `scaleX(${chromeIn})`,
              transformOrigin: "left",
            }}
          />
        </>
      )}

      {variant === "glow" && (
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse at 30% 30%, ${accent}1f 0%, ${accent}00 58%)`,
              opacity: breathe,
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse at 82% 76%, ${ink}14 0%, ${ink}00 52%)`,
              opacity: 0.9,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 34%, rgba(0,0,0,.62) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 120,
              right: 120,
              top: 130,
              height: 1,
              background: `linear-gradient(90deg, ${accent}00, ${accent}66, ${accent}00)`,
              opacity: chromeIn * 0.8,
            }}
          />
        </>
      )}

      {variant === "lines" && (
        <>
          <AbsoluteFill
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, ${ink}0f 0px, ${ink}0f 1px, transparent 1px, transparent 7px)`,
              maskImage: MASK,
              WebkitMaskImage: MASK,
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse at 50% 12%, ${accent}14 0%, ${accent}00 62%)`,
              opacity: breathe,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: bandY,
              height: 160,
              background: `linear-gradient(180deg, ${accent}00, ${accent}12, ${accent}00)`,
              opacity: 0.75,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 120,
              top: 160,
              width: 1,
              height: 780,
              background: `${ink}1e`,
              transform: `scaleY(${chromeIn})`,
              transformOrigin: "top",
            }}
          />
        </>
      )}

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 72,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3.2,
          color: muted,
          opacity: chromeIn,
        }}
      >
        {header}
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 72,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3.2,
          color: muted,
          opacity: chromeIn,
        }}
      >
        {right}
      </div>

      <div style={{ position: "absolute", right: 118, top: 108, width: 18, height: 18, opacity: chromeIn }}>
        <div style={{ position: "absolute", left: 8, top: 0, width: 1, height: 18, background: accent }} />
        <div style={{ position: "absolute", left: 0, top: 8, width: 18, height: 1, background: accent }} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 100,
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: 2.4,
          color: `${muted}`,
          opacity: 0.75 * chromeIn,
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
