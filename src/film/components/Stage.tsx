import React from "react";
import { AbsoluteFill } from "remotion";
import { BG, CYAN } from "../look";

/**
 * 通用舞台：底色 + 冷光 + 48px 细网格 + 暗角。
 * 所有参数都是 0–1 的强度，方便跟着镜头节奏淡入淡出。
 */
export const Stage: React.FC<{
  glow?: number;
  grid?: number;
  vignette?: number;
  /** 冷光位置 */
  lightX?: number;
  lightY?: number;
}> = ({ glow = 1, grid = 1, vignette = 1, lightX = 1180, lightY = 430 }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      {/* 冷光 */}
      <AbsoluteFill
        style={{
          opacity: glow,
          background: `radial-gradient(1100px 760px at ${lightX}px ${lightY}px, rgba(47,227,255,.13), rgba(47,227,255,.04) 46%, transparent 72%)`,
        }}
      />
      {/* 细网格 */}
      <AbsoluteFill
        style={{
          opacity: 0.55 * grid,
          backgroundImage:
            "linear-gradient(rgba(233,243,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(233,243,255,.055) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(1200px 720px at 50% 46%, #000 30%, transparent 88%)",
          WebkitMaskImage:
            "radial-gradient(1200px 720px at 50% 46%, #000 30%, transparent 88%)",
        }}
      />
      {/* 暗角 */}
      <AbsoluteFill
        style={{
          opacity: vignette,
          boxShadow: "inset 0 0 260px 90px rgba(0,0,0,.85)",
        }}
      />
    </AbsoluteFill>
  );
};

/** 一道斜向扫光，用于「冷光扫过」与转场 */
export const LightSweep: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: 520,
      height: 1500,
      transform: `translateX(${x}px) rotate(14deg)`,
      opacity,
      background:
        "linear-gradient(90deg, rgba(47,227,255,0) 0%, rgba(47,227,255,.10) 32%, rgba(233,243,255,.22) 50%, rgba(47,227,255,.10) 68%, rgba(47,227,255,0) 100%)",
      filter: "blur(6px)",
      mixBlendMode: "screen",
      pointerEvents: "none",
    }}
  />
);

/** 细十字定位标：小成本，强工程感 */
export const CrossMark: React.FC<{ x: number; y: number; size?: number; opacity?: number }> = ({
  x,
  y,
  size = 9,
  opacity = 0.5,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size,
      top: y - 0.5,
      width: size * 2,
      height: 1,
      background: CYAN,
      opacity,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: size - 0.5,
        top: -size + 0.5,
        width: 1,
        height: size * 2,
        background: CYAN,
      }}
    />
  </div>
);
