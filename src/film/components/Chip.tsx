import React from "react";
import { CYAN } from "../look";

/**
 * 裸片（die）：深色硅片 + 布线网格 + 发光核心。
 * 片头里它被尺子「丈量」，第 2 镜里被推近放大。
 */
export const Chip: React.FC<{
  x: number;
  y: number;
  size?: number;
  scale: number;
  blur: number;
  opacity: number;
  glow?: number;
  rotate?: number;
}> = ({ x, y, size = 330, scale, blur, opacity, glow = 1, rotate = -7 }) => {
  const cells = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        opacity,
        filter: `blur(${blur}px)`,
        transform: `perspective(1600px) rotateX(16deg) rotateZ(${rotate}deg) scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          background: "linear-gradient(148deg,#12202C 0%,#070C12 52%,#0B1620 100%)",
          border: `1px solid rgba(47,227,255,${0.5 * glow})`,
          boxShadow: `0 0 ${60 * glow}px rgba(47,227,255,${0.22 * glow}), inset 0 0 60px rgba(47,227,255,.07)`,
          overflow: "hidden",
        }}
      >
        {/* 布线网格 */}
        <div
          style={{
            position: "absolute",
            inset: 18,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(47,227,255,.16) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(47,227,255,.16) 0 1px, transparent 1px 24px)",
            opacity: 0.75,
          }}
        />
        {/* 更细的亚网格 */}
        <div
          style={{
            position: "absolute",
            inset: 18,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(233,243,255,.06) 0 1px, transparent 1px 6px)",
          }}
        />

        {/* 核心 */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: size * 0.3,
            height: size * 0.3,
            transform: "translate(-50%,-50%)",
            background: "radial-gradient(circle, rgba(47,227,255,.55), rgba(47,227,255,.08) 64%, transparent 72%)",
            border: `1px solid rgba(47,227,255,${0.75 * glow})`,
            boxShadow: `0 0 ${26 * glow}px rgba(47,227,255,${0.55 * glow})`,
          }}
        />

        {/* 四角定位标 */}
        {cells.slice(0, 4).map((i) => {
          const right = i % 2 === 1;
          const bottom = i > 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                [right ? "right" : "left"]: 10,
                [bottom ? "bottom" : "top"]: 10,
                width: 22,
                height: 22,
                borderTop: bottom ? undefined : `1.5px solid ${CYAN}`,
                borderBottom: bottom ? `1.5px solid ${CYAN}` : undefined,
                borderLeft: right ? undefined : `1.5px solid ${CYAN}`,
                borderRight: right ? `1.5px solid ${CYAN}` : undefined,
                opacity: 0.55,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* 引脚阴影，让贴片浮起来 */}
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: -26,
          height: 26,
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(47,227,255,.16), transparent 70%)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
};
