import { FPS, SUBS } from "./data";

/**
 * 字幕节拍表。
 *
 * 规则：中文按 5.0 字/秒出字（原来整句铺满镜头 = 3.3 字/秒，偏慢），
 * 每个镜头内部再按逗号拆成 2–3 条短句，读完即清，不占满整个镜头。
 * 文本仍然是脚本原文，一个字不改，只改显示节拍。
 */
export type Cue = { from: number; to: number; text: string };

/** 每秒读几个字 */
const CPS = 5.0;
/** 两条之间的黑场（帧） */
const GAP = 3;
/** 一条至少停留的帧数 */
const MIN = 18;

const splitChunks = (text: string): string[] => {
  const raw = text.match(/[^，。；：、—]+[，。；：、—]*/g) ?? [text];
  const merged: string[] = [];
  let buf = "";
  for (const part of raw) {
    buf += part;
    if (buf.length >= 10) {
      merged.push(buf);
      buf = "";
    }
  }
  if (buf) merged.push(buf);
  return merged.filter(Boolean);
};

const build = (): Cue[] => {
  const cues: Cue[] = [];

  SUBS.forEach((sub, index) => {
    // 最后一句是片尾金句，不拆，一口气读完更有分量
    const whole = sub.lines.join("");
    const chunks = index === SUBS.length - 1 ? [whole] : splitChunks(whole);
    if (!chunks.length) return;

    const window = sub.to - sub.from;
    const raw = chunks.map((c) => Math.max(MIN, Math.round((c.length / CPS) * FPS)));
    const sum = raw.reduce((a, b) => a + b, 0) + GAP * (chunks.length - 1);
    const room = window - 4 - GAP * (chunks.length - 1);
    const scale = sum > room ? room / (sum - GAP * (chunks.length - 1)) : 1;

    let t = sub.from;
    chunks.forEach((text, i) => {
      const d = Math.max(MIN, Math.round(raw[i] * scale));
      const to = Math.min(sub.to - 2, t + d);
      cues.push({ from: t, to, text });
      t = to + GAP;
    });
  });

  return cues;
};

export const CUES: Cue[] = build();
