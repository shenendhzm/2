import React from "react";
import { AbsoluteFill } from "remotion";
import { BG, CYAN } from "../look";
import { Grid } from "./ui";

/**
 * 通用舞台：底色 + 冷光 + 细网格 + 暗角。
 * 注意：网格拆成两条单层渐变（见 ui.tsx 的 Grid），
 * 因为出片页的栅格化只画 background-image 的第一层。
 */
export const Stage: React.FC<{
  glow?: number;
  grid?: number;
  vignette?: number;
  lightX?: number;
  lightY?: number;
}> = ({ glow = 1, grid = 1, vignette = 1, lightX = 1180, lightY = 430 }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: glow,
          background: `radial-gradient(circle at ${lightX}px ${lightY}px, rgba(47,227,255,.13), rgba(47,227,255,.04) 46%, rgba(47,227,255,0) 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.55 * grid,
          maskImage: "radial-gradient(circle at 50% 46%, #000 30%, transparent 88%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 46%, #000 30%, transparent 88%)",
        }}
      >
        <Grid sizeX={48} sizeY={48} color="rgba(233,243,255,.055)" />
      </AbsoluteFill>
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
      backgroundImage:
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
      backgroundColor: CYAN,
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
        backgroundColor: CYAN,
      }}
    />
  </div>
);
