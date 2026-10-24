import React from "react";
import { H, W } from "../look";
import {
  HORIZON_Y,
  NEAR_Y,
  SPECKS,
  sleeperUnits,
  speckU,
  xOf,
  yOf,
} from "../geometry";

/** 轨道近端 / 远端的归一化深度 */
const U_NEAR = 1.02;
const U_FAR = 0.016;
/** 单根铁轨的横向半宽（以半轨宽为单位） */
const RAIL_W = 0.0135;

const quad = (latL: number, latR: number) => {
  const yN = yOf(U_NEAR);
  const yF = yOf(U_FAR);
  return [
    [xOf(U_NEAR, latL), yN],
    [xOf(U_NEAR, latR), yN],
    [xOf(U_FAR, latR), yF],
    [xOf(U_FAR, latL), yF],
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
};

/**
 * 轨道：全片母题。
 *
 * 所有几何都由 `geometry.ts` 的投影函数算出，没有 CSS 3D、没有随机数；
 * 生长动画用 clipPath 的矩形高度做「由近及远」的揭示，
 * 比 strokeDashoffset 更贴合「轨道从脚下铺向远处」的直觉。
 */
export const Track: React.FC<{
  /** 0 → 完全收在地平线上；1 → 铺满画面 */
  grow?: number;
  /** 摩擦灰点的浓度（0 = 干净轨道） */
  dust?: number;
  /** 跟拍滚动相位：每 +1 = 前进一根枕木的间距 */
  scroll?: number;
  /** 多实例时避免 id 冲突 */
  id?: string;
}> = ({ grow = 1, dust = 1, scroll = 0, id = "t" }) => {
  const yN = yOf(U_NEAR);
  const yF = yOf(U_FAR);
  const bottom = NEAR_Y + 120;
  const reveal = Math.max(0, Math.min(1, grow));
  const h = (bottom - HORIZON_Y) * reveal;
  const clipY = bottom - h;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={0} y={clipY} width={W} height={h} />
        </clipPath>
        <linearGradient id={`${id}-bed`} gradientUnits="userSpaceOnUse" x1={0} y1={yF} x2={0} y2={yN}>
          <stop offset="0" stopColor="#2A3A4E" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#141D2A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0A0F17" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${id}-rail`} gradientUnits="userSpaceOnUse" x1={0} y1={yF} x2={0} y2={yN}>
          <stop offset="0" stopColor="#9AAFC9" stopOpacity="0.30" />
          <stop offset="0.55" stopColor="#A9BCD4" stopOpacity="0.62" />
          <stop offset="1" stopColor="#C3D3E6" stopOpacity="0.86" />
        </linearGradient>
        <linearGradient id={`${id}-tie`} gradientUnits="userSpaceOnUse" x1={0} y1={yF} x2={0} y2={yN}>
          <stop offset="0" stopColor="#7E8FA6" stopOpacity="0.16" />
          <stop offset="1" stopColor="#8FA2BA" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        {/* 道床：把轨道从背景里托出来 */}
        <polygon points={quad(-1.5, 1.5)} fill={`url(#${id}-bed)`} />

        {/* 枕木（跟拍时随 scroll 向镜头扑） */}
        {sleeperUnits(scroll).map((u, i) => {
          const y = yOf(u);
          const w = Math.max(1.1, 7.4 * u);
          return (
            <line
              key={i}
              x1={xOf(u, -1.045)}
              y1={y}
              x2={xOf(u, 1.045)}
              y2={y}
              stroke={`url(#${id}-tie)`}
              strokeWidth={w}
              strokeLinecap="butt"
            />
          );
        })}

        {/* 两根铁轨 */}
        <polygon points={quad(-1 - RAIL_W, -1 + RAIL_W)} fill={`url(#${id}-rail)`} />
        <polygon points={quad(1 - RAIL_W, 1 + RAIL_W)} fill={`url(#${id}-rail)`} />

        {/* 轨面摩擦灰点：近处大、远处小，跟拍时一起滚动 */}
        {dust > 0 &&
          SPECKS.map((s, i) => {
            const u = speckU(s.m, scroll);
            if (u > 1.12) return null;
            return (
              <circle
                key={i}
                cx={xOf(u, s.lateral)}
                cy={yOf(u)}
                r={Math.max(0.4, s.r * u * 2.2)}
                fill="#8B98AB"
                opacity={Math.min(1, s.a * (0.18 + 0.82 * u)) * dust}
              />
            );
          })}
      </g>
    </svg>
  );
};

/** 灭点上的一个小光斑：球跑远之后，那里还留着一点光 */
export const VanishingGlow: React.FC<{ opacity: number; scale?: number }> = ({
  opacity,
  scale = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: W / 2 - 260 * scale,
      top: HORIZON_Y - 260 * scale,
      width: 520 * scale,
      height: 520 * scale,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(53,224,255,.30) 0%, rgba(53,224,255,.10) 34%, rgba(53,224,255,0) 70%)",
      opacity,
      pointerEvents: "none",
    }}
  />
);

/** 地平线：一条极细的青色线，压住画面上下两半 */
export const HorizonLine: React.FC<{ opacity: number; width: number }> = ({ opacity, width }) => (
  <div
    style={{
      position: "absolute",
      left: (W - width) / 2,
      top: HORIZON_Y,
      width,
      height: 1,
      background: "linear-gradient(90deg, rgba(53,224,255,0), rgba(53,224,255,.55), rgba(53,224,255,0))",
      opacity,
    }}
  />
);
