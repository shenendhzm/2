import React from "react";
import { rOf, xOf, yOf } from "../geometry";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * 白球：全片唯一的主角。
 *
 * 位置与半径完全由投影函数决定（u → x/y/r）；`lateral` 是入画时的横向偏移，
 * 以半轨宽为单位（0 = 轨道中心）。
 *
 * 醒目度是硬指标（手机竖屏也要一眼看到）：
 *   1) 体量：BALL_R0 提到 80，跟拍位 u=0.66 时直径约 106px；
 *   2) 分离：球下有一圈冷光「落脚点」，把球从深色轨面上托起来；
 *   3) 边缘：外发光 + 一圈青色描边光，暗场里不会糊进背景。
 * 三颗暗点只用来读「在滚」而不是「在飘」。
 */
export const Ball: React.FC<{
  u: number;
  lateral?: number;
  spin?: number;
  opacity?: number;
  trail?: boolean;
  glow?: number;
}> = ({ u, lateral = 0, spin = 0, opacity = 1, trail = true, glow = 1 }) => {
  const x = xOf(u, lateral);
  const y = yOf(u);
  const r = rOf(u);
  const marks = clamp01((r - 10) / 14);

  return (
    <>
      {/* 拖影：三团淡影跟在球后面（更靠近镜头的一侧） */}
      {trail &&
        [1, 2, 3, 4].map((i) => {
          const ut = Math.min(1.14, u * (1 + 0.045 * i));
          const rt = rOf(ut);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: xOf(ut, lateral) - rt,
                top: yOf(ut) - 2 * rt,
                width: 2 * rt,
                height: 2 * rt,
                borderRadius: "50%",
                background: "rgba(206,228,255,.7)",
                opacity: opacity * (0.16 / i),
                filter: "blur(1.6px)",
              }}
            />
          );
        })}

      {/* 落脚点冷光：给球一个「自己的地面」 */}
      <div
        style={{
          position: "absolute",
          left: x - 3.2 * r,
          top: y - 1.0 * r,
          width: 6.4 * r,
          height: 2.0 * r,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(53,224,255,.30) 0%, rgba(53,224,255,.12) 42%, rgba(53,224,255,0) 72%)",
          opacity: 0.9 * opacity * glow,
        }}
      />

      {/* 影子：球和地面之间唯一的关系 */}
      <div
        style={{
          position: "absolute",
          left: x - 1.75 * r,
          top: y - 0.40 * r,
          width: 3.5 * r,
          height: 0.8 * r,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,.72), rgba(0,0,0,0) 74%)",
          opacity: 0.92 * opacity,
        }}
      />

      {/* 外发光：暗场里的第一眼靠它 */}
      <div
        style={{
          position: "absolute",
          left: x - 2.25 * r,
          top: y - r - 2.25 * r,
          width: 4.5 * r,
          height: 4.5 * r,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(53,224,255,.34) 0%, rgba(53,224,255,.12) 40%, rgba(53,224,255,0) 68%)",
          opacity: glow * opacity,
        }}
      />

      {/* 球体 */}
      <div
        style={{
          position: "absolute",
          left: x - r,
          top: y - 2 * r,
          width: 2 * r,
          height: 2 * r,
          borderRadius: "50%",
          opacity,
          background:
            "radial-gradient(circle at 34% 26%, #FFFFFF 0%, #F6FAFF 26%, #DFEAF9 48%, #B3C6DE 72%, #7C8FA8 92%, #66788F 100%)",
          boxShadow: [
            `inset ${-0.20 * r}px ${-0.26 * r}px ${0.55 * r}px rgba(0,0,0,.26)`,
            `inset ${0.10 * r}px ${0.12 * r}px ${0.22 * r}px rgba(120,220,255,.30)`,
            `0 0 ${0.62 * r}px rgba(120,215,255,.55)`,
            `0 ${0.12 * r}px ${bf(r)}px rgba(53,224,255,.30)`,
          ].join(", "),
          overflow: "hidden",
        }}
      >
        {/* 球面暗点：随滚动旋转 */}
        <div style={{ position: "absolute", inset: 0, opacity: marks }}>
          {[0, 1, 2].map((k) => (
            <div
              key={k}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: r * 0.20,
                height: r * 0.20,
                marginLeft: -r * 0.10,
                marginTop: -r * 0.10,
                borderRadius: "50%",
                background: "rgba(84,104,132,.42)",
                transform: `rotate(${spin + k * 120}deg) translateX(${r * 0.56}px)`,
              }}
            />
          ))}
        </div>
        {/* 高光 */}
        <div
          style={{
            position: "absolute",
            left: r * 0.24,
            top: r * 0.18,
            width: r * 0.64,
            height: r * 0.46,
            borderRadius: "50%",
            background: "rgba(255,255,255,.72)",
            filter: "blur(2px)",
          }}
        />
        {/* 下沿的冷反光：把球从轨面里「切」出来 */}
        <div
          style={{
            position: "absolute",
            left: r * 0.18,
            top: r * 1.34,
            width: r * 1.64,
            height: r * 0.34,
            borderRadius: "50%",
            background: "rgba(120,220,255,.22)",
            filter: "blur(4px)",
          }}
        />
      </div>

      {/* 青色描边光：小尺寸时也能被看见 */}
      <div
        style={{
          position: "absolute",
          left: x - r - 2,
          top: y - 2 * r - 2,
          width: 2 * r + 4,
          height: 2 * r + 4,
          borderRadius: "50%",
          border: "1.5px solid rgba(170,235,255,.34)",
          boxShadow: "0 0 10px rgba(120,215,255,.35)",
          opacity: opacity * 0.9,
        }}
      />
    </>
  );
};

/** 按球半径给一点柔光扩散（避免小半径时 boxShadow 过虚） */
const bf = (r: number) => Math.max(6, r * 0.5);
