#!/usr/bin/env python3
"""片头第一击：0.00s 的金属撞击 + 低频冲击（纯 Python 合成，不依赖 numpy）。

为什么要单独做这一击：`public/score-sample.m4a` 是上一版 11 秒配乐，
第一记音效在 2.45s（卡尺咬合），0 秒处只有 pad 淡入 —— 而新片头是「尺子砸下来」，
0 帧必须有声音。这一击只补 0.9 秒，叠在原配乐之上，不替换它。

用法：python3 scripts/make-impact.py --out public/impact-open.wav
"""
import argparse
import math
import random
import struct
import wave

SR = 44100
DUR = 0.9
N = int(SR * DUR)
random.seed(11)

samples = []
phase = 0.0
prev_noise = 0.0

for i in range(N):
    t = i / SR

    # 低频冲击：频率 110 → 42Hz 快速下坠，A 调，与配乐的 A 小调同调
    f = 42.0 + 68.0 * math.exp(-t / 0.075)
    phase += 2.0 * math.pi * f / SR
    boom = math.sin(phase) * math.exp(-t / 0.30) * 0.95

    # 金属撞击：白噪声高通（一阶差分）+ 极短衰减
    n = random.uniform(-1.0, 1.0)
    hp = n - prev_noise
    prev_noise = n
    crack = hp * math.exp(-t / 0.035) * 0.30

    # 余响：两声高频金属泛音
    ring = (
        math.sin(2.0 * math.pi * 2140.0 * t) * math.exp(-t / 0.085) * 0.10
        + math.sin(2.0 * math.pi * 3260.0 * t) * math.exp(-t / 0.060) * 0.07
    )

    v = boom + crack + ring
    samples.append(v)

peak = max(abs(v) for v in samples) or 1.0
gain = 0.92 / peak
frames = bytearray()
for v in samples:
    x = math.tanh(v * gain * 1.15)  # 软限幅
    s = int(max(-1.0, min(1.0, x)) * 32767)
    packed = struct.pack("<h", s)
    frames += packed + packed  # 立体声，居中

ap = argparse.ArgumentParser()
ap.add_argument("--out", default="public/impact-open.wav")
args = ap.parse_args()
with wave.open(args.out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))
print(f"wrote {args.out}: {DUR:.2f}s / {SR}Hz / stereo")
