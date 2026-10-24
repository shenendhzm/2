/**
 * 《幽灵堵车》10 秒样片 · 数据层
 *
 * 46 辆车跑在一条环形单车道上的 Nagel–Schreckenberg 元胞自动机。
 * 前 5 秒每辆车只被允许"加速 / 按前车距离减速"；第 5 秒起加入 30% 的随机减速
 * （= 每个人都会犹豫半拍），拥堵便自己从车流里长出来。
 *
 * 全部位移在模块加载时一次算好（150 步 × 46 车），渲染时只做插值，不依赖随机数。
 */

export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const FRAMES = 300;

export const RING_R = 300;
export const RING_CX = W / 2;
export const RING_CY = 566;

const L = 200;          // 环道总格数
const CARS = 46;
const VMAX = 5;
const STEP_FRAMES = 2;  // 1 个元胞步 = 2 帧
const SWITCH_FRAME = 150; // 第 5 秒：犹豫开始

type State = { pos: number[]; v: number[] };

let seed = 2008;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

const states: State[] = [];
{
  const pos: number[] = [];
  const v: number[] = [];
  const occ = new Array(L).fill(-1);
  for (let i = 0; i < CARS; i++) {
    const c = Math.round((i * L) / CARS);
    pos.push(c);
    v.push(VMAX);
    occ[c] = i;
  }
  states.push({ pos: pos.slice(), v: v.slice() });

  const steps = Math.ceil(FRAMES / STEP_FRAMES) + 1;
  for (let s = 0; s < steps; s++) {
    const p = s * STEP_FRAMES < SWITCH_FRAME ? 0.02 : 0.3;
    const nv = new Array(CARS);
    const np = new Array(CARS);
    for (let i = 0; i < CARS; i++) {
      let gap = 1;
      for (let k = 1; k <= L; k++) {
        const c = (pos[i] + k) % L;
        if (occ[c] >= 0) {
          gap = k;
          break;
        }
      }
      let vi = Math.min(v[i] + 1, VMAX, gap - 1);
      if (rnd() < p) vi = Math.max(0, vi - 1);
      nv[i] = vi;
      np[i] = (pos[i] + vi) % L;
    }
    occ.fill(-1);
    for (let i = 0; i < CARS; i++) {
      pos[i] = np[i];
      v[i] = nv[i];
      occ[pos[i]] = i;
    }
    states.push({ pos: pos.slice(), v: v.slice() });
  }
}

export type Car = { angle: number; speed: number };

/** 取第 frame 帧的车流状态（两帧之间做线性插值，避免跳格） */
export const carsAt = (frame: number): Car[] => {
  const f = Math.min(FRAMES - 1, Math.max(0, frame)) / STEP_FRAMES;
  const k = Math.min(states.length - 2, Math.floor(f));
  const a = f - k;
  const s0 = states[k];
  const s1 = states[k + 1];
  const out: Car[] = [];
  for (let i = 0; i < CARS; i++) {
    let p1 = s1.pos[i];
    if (p1 < s0.pos[i] - L / 2) p1 += L;
    const p = (s0.pos[i] * (1 - a) + p1 * a) % L;
    const v = s0.v[i] * (1 - a) + s1.v[i] * a;
    out.push({ angle: (p / L) * Math.PI * 2 - Math.PI / 2, speed: v });
  }
  return out;
};

/** 时间轴（帧） */
export const T = {
  hookIn: 0,
  hookOut: 84,
  ringIn: 90,
  ringFull: 118,
  jamIn: 150,
  nameIn: 236,
  end: FRAMES,
};

export const COPY = {
  hook: "堵车，真的不是因为车多。",
  hookSub: "也不是因为前面出了事故。",
  cap1: "46 辆车，同一个环道，同一套规矩。",
  cap2: "只是每个人，都慢了半拍。",
  name: "幽灵堵车",
  nameEn: "PHANTOM JAM · NAGOYA 2008",
  chapter: "01 · 环道",
};
