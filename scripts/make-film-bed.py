#!/usr/bin/env python3
"""全片铺底（114s，A 小调，纯 Python 合成，不依赖 numpy/ffmpeg）。

为什么不用 score-sample.m4a：它只有 11s，整片 114s 铺不满；
循环会让它自带的淡出每 11s 抽一下。这里的铺底专为长片做：
六段和弦（Am–F–C–G–Am–F）每 19s 换一次，2s 交叉淡化，下面压一条 55Hz。
用法：python3 scripts/make-film-bed.py --out public/score-bed.wav
"""
import argparse
import math
import random
import struct
import wave

SR = 24000
DUR = 114.0
N = int(SR * DUR)
SECTION = 19.0
XFADE = 2.0

CHORDS = [
    [110.00, 164.81, 220.00, 261.63],  # Am
    [87.31, 174.61, 220.00, 261.63],   # F
    [130.81, 196.00, 261.63, 329.63],  # C
    [98.00, 146.83, 246.94, 293.66],   # G
    [110.00, 164.81, 220.00, 261.63],  # Am
    [87.31, 174.61, 220.00, 261.63],   # F
]

AMPS = [0.16, 0.12, 0.10, 0.07]
SUB = 55.0

random.seed(7)
frames = bytearray()
prev = [0.0] * 4
noise_lp = 0.0


def chord_index(t):
    i = int(t / SECTION)
    return min(i, len(CHORDS) - 1)


for i in range(N):
    t = i / SR
    idx = chord_index(t)
    local = t - idx * SECTION
    # 段内增益：进入 1.2s 渐入，段落尾 2s 交给下一段
    seg = min(1.0, local / 1.2)
    if idx < len(CHORDS) - 1 and local > SECTION - XFADE:
        seg *= max(0.0, (SECTION - local) / XFADE) ** 0.8
    nxt = min(idx + 1, len(CHORDS) - 1)
    nx_local = local - SECTION

    v = 0.0
    for k, f in enumerate(CHORDS[idx]):
        prev[k] = math.sin(2 * math.pi * f * t)
        v += prev[k] * AMPS[k] * seg

    if nx_local > -XFADE:
        nseg = max(0.0, 1.0 - abs(nx_local) / XFADE) if nx_local < 0 else min(1.0, nx_local / 1.2)
        nseg = max(0.0, nseg) ** 0.8
        for k, f in enumerate(CHORDS[nxt]):
            v += math.sin(2 * math.pi * f * t) * AMPS[k] * nseg * 0.9

    # 55Hz 次低音，很慢的呼吸
    v += math.sin(2 * math.pi * SUB * t) * 0.20 * (0.62 + 0.38 * math.sin(2 * math.pi * 0.011 * t - 1.1))

    # 空气层：极轻的滤波噪声
    noise_lp += 0.02 * (random.uniform(-1, 1) - noise_lp)
    v += noise_lp * 0.05

    # 全片淡入淡出
    if t < 3.0:
        v *= (t / 3.0) ** 1.4
    if t > DUR - 6.0:
        v *= max(0.0, (DUR - t) / 6.0) ** 1.2

    s = int(max(-1.0, min(1.0, v)) * 24000)
    frames += struct.pack("<h", s)

ap = argparse.ArgumentParser()
ap.add_argument("--out", default="public/score-bed.wav")
args = ap.parse_args()
with wave.open(args.out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))
print(f"wrote {args.out}: {DUR:.1f}s / {SR}Hz / mono")
