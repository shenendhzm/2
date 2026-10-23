import React from "react";
import { MONO } from "../look";

const TICK_STEP = 36;
const TICK_COUNT = 46;
const LABELS = ["90", "65", "45", "22", "14", "10", "7", "5", "3"];

/**
 * 金属直尺：全片的「空间」母题。
 * 刻度 90→3nm，越往右越密，为第 3 镜的挤压断裂埋线。
 */
export const Ruler: React.FC<{
  x: number;
  y: number;
  rotate: number;
  scaleX: number;
  opacity: number;
  width?: number;
}> = ({ x, y, rotate, scaleX, opacity, width = 1680 }) => {
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => i);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height: 196,
        borderRadius: 5,
        opacity,
        transform: `rotate(${rotate}deg) scaleX(${scaleX})`,
        transformOrigin: "50% 50%",
        background:
          "linear-gradient(180deg,#e3eaf3 0%,#b3c0d0 7%,#7c8a9d 32%,#59667a 50%,#6e7c90 70%,#a3b0c1 90%,#cdd8e6 100%)",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,255,255,.055) 0 1px, transparent 1px 4px), linear-gradient(180deg,#e3eaf3 0%,#b3c0d0 7%,#7c8a9d 32%,#59667a 50%,#6e7c90 70%,#a3b0c1 90%,#cdd8e6 100%)",
        boxShadow:
          "0 34px 70px rgba(0,0,0,.62), 0 2px 0 rgba(255,255,255,.10), inset 0 2px 0 rgba(255,255,255,.85), inset 0 -3px 6px rgba(0,0,0,.45), inset 0 0 40px rgba(0,0,0,.18)",
      }}
    >
      {/* 上：纳米刻度 */}
      <div style={{ position: "absolute", left: 12, top: 0, right: 0, height: 96 }}>
        {ticks.map((i) => {
          const major = i % 5 === 0;
          const mid = i % 5 === 2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * TICK_STEP,
                top: 0,
                width: major ? 2.5 : 1.5,
                height: major ? 62 : mid ? 40 : 24,
                background: "#0C1219",
                opacity: major ? 0.82 : mid ? 0.5 : 0.32,
              }}
            />
          );
        })}

        {LABELS.map((label, i) => (
          <div
            key={label + i}
            style={{
              position: "absolute",
              left: i * 5 * TICK_STEP - 2,
              top: 74,
              fontFamily: MONO,
              fontSize: 31,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: "#0B1118",
              opacity: 0.78,
            }}
          >
            {label}
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            right: 26,
            top: 78,
            fontFamily: MONO,
            fontSize: 26,
            letterSpacing: 2,
            color: "#0B1118",
            opacity: 0.6,
          }}
        >
          nm
        </div>
      </div>

      {/* 中：分界线 */}
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          top: 108,
          height: 1,
          background: "rgba(11,17,24,.28)",
        }}
      />

      {/* 下：厘米刻度（真实直尺的背面刻度，增加「物件」的可信度） */}
      <div style={{ position: "absolute", left: 12, top: 112, right: 0, bottom: 0 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: i * 168,
                top: 0,
                width: 1.5,
                height: 26,
                background: "#0C1219",
                opacity: 0.28,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: i * 168 - 5,
                top: 40,
                fontFamily: MONO,
                fontSize: 19,
                color: "#0B1118",
                opacity: 0.42,
              }}
            >
              {i}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
