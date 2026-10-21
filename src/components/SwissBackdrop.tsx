import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, MONO, RED } from "../looks/swiss";

/** 瑞士极简：纯白、黑字、单一红块、严格分栏 */
export const SwissBackdrop: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {[480, 960, 1440].map((x) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            top: 0,
            width: 1,
            height: 1080,
            background: "rgba(11,11,11,.06)",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 64,
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 4,
          color: INK,
        }}
      >
        01 / TAU
      </div>
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 64,
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 4,
          color: INK,
        }}
      >
        2026
      </div>

      <div
        style={{
          position: "absolute",
          right: 96,
          top: 92,
          width: 64,
          height: 64,
          background: RED,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 96,
          bottom: 56,
          fontFamily: MONO,
          fontSize: 14,
          letterSpacing: 3,
          color: "rgba(11,11,11,.45)",
        }}
      >
        HUAWEI · IEEE ISCAS 2026
      </div>
    </AbsoluteFill>
  );
};
