#!/usr/bin/env python3
"""15 秒样片声音（纯 Python 合成，不依赖 numpy / ffmpeg）。

设计（与画面同一张时间表，30fps，450 帧 = 15.000s）：
  0.0–4.0   轨道底噪 + 55Hz 极轻 drone，4.0s 戛然而止（画面同时落字）
  4.0–8.0   完全静音 —— 问题要落在安静里
  8.0       硬切进镜 2：一记低频「落」，不要金属感
  8.0–8.67  手掌推箱的极轻摩擦
  8.87–13.33 纸箱滑行的「沙」声，随速度衰减同步变轻、变闷
  13.33     箱子停住：一声短而轻的「顿」
  8.0–14.6  一层很薄的 A2/E3 pad 托住，防静音段显得像掉音

用法：python3 scripts/make-newton-sample.py --out public/newton-sample.wav [--dur 15]
"""
import argparse
import math
import random
import struct
import wave

SR = 24000

ap = argparse.ArgumentParser()
ap.add_argument("--out", default="public/newton-sample.wav")
ap.add_argument("--dur", type=float, default=15.0)
args = ap.parse_args()

DUR = args.dur
N = int(SR * DUR)
random.seed(20261023)

# 与画面同步的关键时刻（秒）
CUT1 = 8.0          # 镜 1 → 镜 2
SLIDE_IN = 26 / 30.0 + CUT1   # 镜 2 局部 26 帧：开始滑行
STOP = 160 / 30.0 + CUT1      # 镜 2 局部 160 帧：箱子停住
PAD_OUT = DUR - 0.4

samples = []
noise_lp = 0.0
noise_lp2 = 0.0
phase55 = 0.0
phase_boom = 0.0
phase_stop = 0.0


def smoothstep(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return x * x * (3.0 - 2.0 * x)


for i in range(N):
    t = i / SR
    v = 0.0

    # ---- 0–4s：轨道底噪 ----
    if t < 4.0:
        n = random.uniform(-1.0, 1.0)
        noise_lp += 0.018 * (n - noise_lp)
        env = min(1.0, t / 0.6) * max(0.0, min(1.0, (4.0 - t) / 0.22)) ** 1.4
        phase55 += 2.0 * math.pi * 55.0 / SR
        v += (noise_lp * 1.5 + math.sin(phase55) * 0.30) * env * 0.34

    # ---- 8.0s：一记低频落点 ----
    if CUT1 <= t < CUT1 + 1.2:
        dt = t - CUT1
        f = 44.0 + 56.0 * math.exp(-dt / 0.10)
        phase_boom += 2.0 * math.pi * f / SR
        v += math.sin(phase_boom) * math.exp(-dt / 0.34) * 0.62
        v += random.uniform(-1.0, 1.0) * math.exp(-dt / 0.018) * 0.10

    # ---- 8.0–8.67s：手掌推箱 ----
    if CUT1 <= t < SLIDE_IN:
        n = random.uniform(-1.0, 1.0)
        noise_lp += 0.05 * (n - noise_lp)
        env = smoothstep((t - CUT1) / 0.10) * (1.0 - smoothstep((t - SLIDE_IN + 0.10) / 0.10))
        v += noise_lp * env * 0.16

    # ---- 8.87–13.33s：纸箱滑行，随速度衰减 ----
    if SLIDE_IN <= t < STOP:
        p = (t - SLIDE_IN) / (STOP - SLIDE_IN)
        speed = (1.0 - p) ** 2  # 与画面 Easing.out(quad) 的速度曲线同形
        n = random.uniform(-1.0, 1.0)
        noise_lp += (0.06 + 0.10 * speed) * (n - noise_lp)
        noise_lp2 += 0.35 * (noise_lp - noise_lp2)
        env = min(1.0, (t - SLIDE_IN) / 0.05) * max(0.0, min(1.0, (STOP - t) / 0.10)) ** 1.2
        v += (noise_lp - noise_lp2) * env * (0.16 + 0.26 * speed)

    # ---- 13.33s：停住，一记短「顿」 ----
    if STOP <= t < STOP + 0.5:
        dt = t - STOP
        f = 58.0 + 40.0 * math.exp(-dt / 0.05)
        phase_stop += 2.0 * math.pi * f / SR
        v += math.sin(phase_stop) * math.exp(-dt / 0.11) * 0.24
        v += random.uniform(-1.0, 1.0) * math.exp(-dt / 0.014) * 0.05

    # ---- 8.0–14.6s：薄 pad（A2 / E3 / A3） ----
    if CUT1 <= t < PAD_OUT + 0.01:
        dt = t - CUT1
        a = min(1.0, dt / 0.9)
        rel = max(0.0, min(1.0, (PAD_OUT - t) / 0.55))
        pad = (
            math.sin(2.0 * math.pi * 110.0 * t) * 0.26
            + math.sin(2.0 * math.pi * 164.81 * t) * 0.16
            + math.sin(2.0 * math.pi * 220.0 * t) * 0.07
        )
        v += pad * a * rel * 0.42

    # 首尾各留 20ms / 50ms 淡入淡出，避免播放器爆音
    if t < 0.02:
        v *= t / 0.02
    if t > DUR - 0.05:
        v *= max(0.0, (DUR - t) / 0.05)

    samples.append(v)

peak = max(abs(x) for x in samples) or 1.0
gain = 0.88 / peak
frames = bytearray()
for x in samples:
    y = math.tanh(x * gain * 1.05)
    frames += struct.pack("<h", int(max(-1.0, min(1.0, y)) * 32767))

with wave.open(args.out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))
print(f"wrote {args.out}: {DUR:.3f}s / {SR}Hz / mono / {len(frames) / 1024:.1f} KB")
