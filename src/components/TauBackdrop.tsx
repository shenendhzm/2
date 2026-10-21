import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, EASE_IN_OUT, EASE_OUT, TauPlate, ramp } from "../looks/tau";

const MASK =
  "radial-gradient(ellipse at 50% 42%, black 6%, rgba(0,0,0,.62) 58%, transparent 92%)";

/**
 * 片头背景：一套「网格 / 点阵 / 光晕 / 横纹 / 扫描线」语言，
 * 色板从 TauPlate 取，六个样片共用同一段入场时间（8–46 帧淡入）。
 */
export const TauBackdrop: React.FC<{ plate: TauPlate }> = ({ plate }) => {
  const frame = useCurrentFrame();
  const { bg, ink, accent, muted, mono, surface } = plate;

  const surfaceIn = ramp(frame, [6, 46], [0, 1], EASE_OUT);
  const chromeIn = ramp(frame, [16, 44], [0, 1], EASE_OUT);
  const drift = interpolate(frame, [0, 240], [1.045, 1], CLAMP);
  const breathe = interpolate(frame, [0, 96, 208, 240], [0.72, 1, 1, 0.88], CLAMP);

  const bandY = interpolate(frame % 210, [0, 210], [-220, 1180], CLAMP);
  const scanY = interpolate(frame % 120, [0, 120], [-80, 1160], CLAMP);
  const sweepX = interpolate(frame, [40, 130], [-620, 2120], { ...CLAMP, easing: EASE_IN_OUT });
  const sweepOn = interpolate(frame, [40, 52, 118, 132], [0, 1, 1, 0], {
    ...CLAMP,
    easing: EASE_IN_OUT,
  });

  const hasGrid = surface === "grid" || surface === "scan";
  const frameLines = surface === "grid";

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {/* 背景语言：网格 / 点阵 / 横纹 */}
      {surface !== "glow" && (
        <AbsoluteFill
          style={{
            backgroundImage:
              surface === "dots"
                ? `radial-gradient(${ink}2b 1.1px, transparent 1.35px)`
                : surface === "lines"
                  ? `repeating-linear-gradient(0deg, ${ink}0e 0px, ${ink}0e 1px, transparent 1px, transparent 7px)`
                  : `linear-gradient(${ink}0b 1px, transparent 1px), linear-gradient(90deg, ${ink}0b 1px, transparent 1px)`,
            backgroundSize:
              surface === "dots" ? "34px 34px" : surface === "lines" ? undefined : "64px 64px",
            backgroundPosition: surface === "dots" ? "17px 17px" : undefined,
            opacity: surfaceIn,
            transform: `scale(${drift})`,
            maskImage: MASK,
            WebkitMaskImage: MASK,
          }}
        />
      )}

      {/* 环境光：左上主光 + 右下补光 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 30% 26%, ${accent}${surface === "glow" ? "24" : "12"} 0%, ${accent}00 60%)`,
          opacity: breathe,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 82% 78%, ${ink}${surface === "glow" ? "12" : "0a"} 0%, ${ink}00 54%)`,
        }}
      />

      {/* 光晕风格：暗角更重 */}
      {surface === "glow" && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 30%, rgba(0,0,0,.66) 100%)",
          }}
        />
      )}

      {/* 横纹风格：缓慢下移的光带 */}
      {(surface === "lines" || surface === "scan") && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: bandY,
            height: 170,
            background: `linear-gradient(180deg, ${accent}00, ${accent}14, ${accent}00)`,
            opacity: 0.7 * surfaceIn,
          }}
        />
      )}

      {/* CRT：扫描线 + 荧光滚屏 */}
      {surface === "scan" && (
        <>
          <AbsoluteFill
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,.38) 0px, rgba(0,0,0,.38) 1px, transparent 1px, transparent 3px)",
              opacity: 0.75,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: scanY,
              height: 90,
              background: `linear-gradient(180deg, ${ink}00, ${ink}16, ${ink}00)`,
            }}
          />
        </>
      )}

      {/* 擦光带（制服图风格，给画面一点金属感） */}
      {surface === "grid" && sweepOn > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: sweepX,
            top: -80,
            width: 260,
            height: 1240,
            transform: "rotate(14deg)",
            background: `linear-gradient(90deg, ${ink}00, ${ink}0d, ${ink}00)`,
            opacity: sweepOn,
          }}
        />
      )}

      {/* 版心边框 + 裁切标记（制图风格） */}
      {frameLines && (
        <>
          <div
            style={{
              position: "absolute",
              left: 44,
              top: 44,
              right: 44,
              bottom: 44,
              border: `1px solid ${ink}1e`,
              opacity: chromeIn,
            }}
          />
          {[
            { left: 44, top: 44, borderLeft: `1.5px solid ${ink}99`, borderTop: `1.5px solid ${ink}99` },
            { right: 44, top: 44, borderRight: `1.5px solid ${ink}99`, borderTop: `1.5px solid ${ink}99` },
            { left: 44, bottom: 44, borderLeft: `1.5px solid ${ink}99`, borderBottom: `1.5px solid ${ink}99` },
            { right: 44, bottom: 44, borderRight: `1.5px solid ${ink}99`, borderBottom: `1.5px solid ${ink}99` },
          ].map((corner, i) => (
            <div
              key={i}
              style={{ position: "absolute", width: 18, height: 18, opacity: chromeIn, ...corner }}
            />
          ))}
        </>
      )}

      {/* 页眉 */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 70,
          fontFamily: mono,
          fontSize: 15,
          letterSpacing: 3.4,
          color: muted,
          opacity: chromeIn,
        }}
      >
        {plate.header}
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 98,
          fontFamily: mono,
          fontSize: 12.5,
          letterSpacing: 2.6,
          color: `${muted}b0`,
          opacity: chromeIn,
        }}
      >
        {plate.chrome}
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 70,
          fontFamily: mono,
          fontSize: 15,
          letterSpacing: 3.4,
          color: muted,
          opacity: chromeIn,
        }}
      >
        {plate.right}
      </div>

      {/* 右上角制图十字 */}
      <div style={{ position: "absolute", right: 120, top: 106, width: 16, height: 16, opacity: chromeIn }}>
        <div style={{ position: "absolute", left: 7.5, top: 0, width: 1, height: 16, background: accent }} />
        <div style={{ position: "absolute", left: 0, top: 7.5, width: 16, height: 1, background: accent }} />
      </div>

      {/* 底部细线 */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          bottom: 72,
          height: 1,
          background: `linear-gradient(90deg, ${ink}00, ${ink}1f, ${ink}00)`,
          opacity: chromeIn,
          transform: `scaleX(${surfaceIn})`,
          transformOrigin: "center",
        }}
      />

      {/* CRT 玻璃边 */}
      {hasGrid && surface === "scan" && (
        <AbsoluteFill
          style={{
            boxShadow: `inset 0 0 180px rgba(0,0,0,.9), inset 0 0 40px ${ink}0e`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
