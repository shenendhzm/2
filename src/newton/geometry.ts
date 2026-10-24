import { W } from "./look";

/**
 * 轨道透视几何（纯函数，无随机、无副作用）。
 *
 * 全片母题：一条向灭点延伸的轨道 + 一颗白球。
 * 用「距离的倒数」做屏幕投影：u = D0 / d。
 *   u = 1    → 贴着镜头（画面底边）
 *   u → 0    → 灭点
 * 这样球的匀速世界运动在屏幕上自然表现为「近处快、远处慢」，
 * 不需要任何缓动，也符合透视直觉。
 */

/** 灭点高度 */
export const HORIZON_Y = 466;
/** u = 1 时的地面高度（画面底边略下） */
export const NEAR_Y = 1046;
/** u = 1 时的半轨宽 */
export const NEAR_HALF_W = 642;
/** u = 1 时的球半径（跟拍镜头里球是主角，给足体量） */
export const BALL_R0 = 88;
/** 归一化距离基准 */
export const D0 = 340;

/** 屏幕纵坐标 */
export const yOf = (u: number) => HORIZON_Y + (NEAR_Y - HORIZON_Y) * u;
/** 半轨宽 */
export const halfOf = (u: number) => NEAR_HALF_W * u;
/** 球半径 */
export const rOf = (u: number) => BALL_R0 * u;
/** 屏幕横坐标：lateral 以「半轨宽」为单位，0 = 轨道中心 */
export const xOf = (u: number, lateral = 0) => W / 2 + lateral * halfOf(u);

/** 球的深度随时间：匀速（t 秒）——用于「不跟拍」的镜头 */
export const uAt = (t: number, speed = 0.62) => 1 / (1 + speed * Math.max(0, t));

/* ------------------------------------------------------------------ *
 * 跟拍（camera follow）
 *
 * 镜 1 / 镜 11 是跟拍镜头：机位与球同速前进，球停在画面下三分之一处，
 * 轨道向镜头扑过来。做法是把枕木 / 灰点按「几何级数」铺在深度上，
 * 再用一个连续的滚动相位 scroll 推动它们：
 *   u_i = a^(frac - i)      frac = scroll - floor(scroll)
 * 每过一个循环，i 整体挪一位，视觉上完全无缝。
 * ------------------------------------------------------------------ */

/** 枕木间距倍数（近疏远密） */
export const SLEEP_A = 1.29;
/** 一个循环里铺多少根枕木 */
export const SLEEP_COUNT = 18;
/** 跟拍时球所在的归一化深度：y ≈ 849，落在画面下三分之一 */
export const FOLLOW_U = 0.66;
/** 跟拍推进速度（scroll 单位 / 秒） */
export const SCROLL_RATE = 1.9;

/** 正模运算 */
export const wrap = (v: number, m: number) => ((v % m) + m) % m;

/** 跟拍帧里的枕木深度序列（由近及远） */
export const sleeperUnits = (scroll: number, count = SLEEP_COUNT): number[] => {
  const frac = scroll - Math.floor(scroll);
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const u = Math.pow(SLEEP_A, frac - i);
    if (u <= 1.12) out.push(u);
  }
  return out;
};

/** 跟拍帧里某个灰点的深度：按滚动相位循环，过了镜头就从远端重新出现 */
export const speckU = (m: number, scroll: number) =>
  Math.pow(SLEEP_A, -wrap(m - scroll, SLEEP_COUNT));

/** 枕木深度（静态镜头用；跟拍镜头请用 sleeperUnits） */
export const SLEEPERS: number[] = Array.from({ length: 16 }, (_, i) => 1 / Math.pow(SLEEP_A, i));

/** 确定性伪随机（保证每一帧、每一次渲染的噪点位置完全一致） */
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export type Speck = { m: number; lateral: number; r: number; a: number };

/**
 * 轨面上的摩擦灰点：m 是深度循环里的相位（0–18），
 * 渲染时由 speckU(m, scroll) 换算屏幕位置，所以会跟着轨道一起往镜头扑。
 */
export const SPECKS: Speck[] = (() => {
  const rand = mulberry32(20261023);
  const out: Speck[] = [];
  for (let i = 0; i < 220; i += 1) {
    out.push({
      m: rand() * SLEEP_COUNT,
      lateral: (rand() * 2 - 1) * 1.34,
      r: 0.6 + rand() * 1.9,
      a: 0.24 + rand() * 0.5,
    });
  }
  return out;
})();
