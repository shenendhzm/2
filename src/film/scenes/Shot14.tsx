import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Eyebrow, StatCard } from "../components/ui";
import { CLAMP, CYAN, EASE_OUT, TEXT } from "../look";

const BARS = Array.from({ length: 26 }, (_, i) => i);

/** 镜 14：01:33.5–01:41，381 款 / 麒麟 / 2031 */
export const Shot14: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const roll = interpolate(frame, [18, 58], [0, 381], { ...CLAMP, easing: EASE_OUT });
  const cards = [12, 46, 80].map((d) =>
    spring({ frame: frame - d, fps, config: { damping: 19, mass: 0.8, stiffness: 110 } }),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070C", overflow: "hidden" }}>
      <Stage glow={0.8} grid={0.35} lightX={1520} lightY={480} />

      {/* 机架剪影 */}
      <div style={{ position: "absolute", left: 1240, top: 170, width: 540, height: 640, opacity: 0.5 }}>
        {BARS.map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (i % 6) * 88,
              top: Math.floor(i / 6) * 148,
              width: 62,
              height: 126,
              border: "1px solid rgba(47,227,255,.18)",
              background: "rgba(47,227,255,.03)",
            }}
          >
            {[0, 1, 2, 3].map((k) => (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8,
                  top: 12 + k * 28,
                  height: 2,
                  background: "rgba(47,227,255,.16)",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {[
        { x: 120, y: 190, title: "6 YEARS / 381 CHIPS", value: `${Math.round(roll)} 款`, note: "六年量产，覆盖千行百业" },
        { x: 120, y: 418, title: "2026 AUTUMN", value: "麒麟", note: "首发逻辑折叠" },
        { x: 120, y: 646, title: "2031", value: "≈1.4nm", note: "晶体管密度等效水平" },
      ].map((c, i) => (
        <div
          key={c.title}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            transform: `translateY(${(1 - cards[i]) * 46}px)`,
            opacity: interpolate(cards[i], [0, 0.45], [0, 1], CLAMP),
          }}
        >
          <StatCard x={c.x} y={c.y} w={840} title={c.title} value={c.value} note={c.note} />
        </div>
      ))}

      <Eyebrow text="EVIDENCE / 2026 → 2031" x={120} y={120} opacity={0.72} />
      <div
        style={{
          position: "absolute",
          left: 1000,
          top: 800,
          fontSize: 20,
          color: "rgba(233,243,255,.34)",
          opacity: interpolate(frame, [110, 130], [0, 1], CLAMP),
          letterSpacing: 1,
        }}
      >
        数据口径：华为公开演讲与媒体披露
      </div>
    </AbsoluteFill>
  );
};
