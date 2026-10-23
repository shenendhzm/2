import React from "react";
import { MONO } from "../look";

const TICK_STEP = 36;
const TICK_COUNT = 46;
const LABELS = ["90", "65", "45", "22", "14", "10", "7", "5", "3"];

/**
 * 金属直尺：全片的「空间」母题。
 *
 * 注意（渲染坑）：尺身只能用「一层渐变」。出片页栅格化时，
 * background-image 里塞两层以上只会画第一层——之前金属底就整个丢了，
 * 只剩一层 5% 白的横向细纹，看起来像"尺子不见了"。
 * 所以这里：一层金属渐变打底，拉丝纹理 / 高光 / 暗边全部拆成独立子层。
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
        backgroundColor: "#9AA8B9",
        backgroundImage:
          "linear-gradient(180deg,#EEF3F9 0%,#C6D1DE 9%,#96A4B6 34%,#7A889B 52%,#8E9CAE 70%,#B8C4D3 90%,#DCE5EF 100%)",
        boxShadow: "0 30px 60px rgba(0,0,0,.55)",
        overflow: "hidden",
      }}
    >
      {/* 拉丝纹理（单层） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0px, rgba(255,255,255,.07) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 4px)",
        }}
      />
      {/* 上高光 / 下暗边 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, backgroundColor: "rgba(255,255,255,.85)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, backgroundColor: "rgba(0,0,0,.35)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 2, height: 10, backgroundImage: "linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0))" }} />

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
                backgroundColor: "#0C1219",
                opacity: major ? 0.86 : mid ? 0.55 : 0.36,
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
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "#101820",
              opacity: 0.86,
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
            color: "#101820",
            opacity: 0.7,
          }}
        >
          nm
        </div>
      </div>

      {/* 中：分界线 */}
      <div style={{ position: "absolute", left: 10, right: 10, top: 108, height: 1, backgroundColor: "rgba(11,17,24,.3)" }} />

      {/* 下：厘米刻度 */}
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
                backgroundColor: "#0C1219",
                opacity: 0.3,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: i * 168 - 5,
                top: 40,
                fontFamily: MONO,
                fontSize: 19,
                fontWeight: 500,
                color: "#101820",
                opacity: 0.5,
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
