#!/usr/bin/env python3
"""S1「换尺子」11 秒原创配乐 + 音效（纯 numpy 合成，无采样）。

结构：A 小调 pad 铺底 + 55Hz 次低音 + 卡尺咬合 / 扫光 / τ 落版三个音效。
用法：
  python3 scripts/make-s1-score.py --out public/score-sample.wav
"""
import argparse
import math
import wave

import numpy as np

SR = 44100
DUR = 11.0
N = int(SR * DUR)
rng = np.random.default_rng(11)


def t_axis(n):
    return np.arange(n, dtype=np.float64) / SR


def env_ar(n, attack, release, curve=1.5):
    e = np.ones(n, dtype=np.float64)
    a = min(int(attack * SR), n)
    r = min(int(release * SR), n)
    if a > 1:
        e[:a] = np.linspace(0, 1, a) ** curve
    if r > 1:
        e[n - r:] *= np.linspace(1, 0, r) ** 1.2
    return e


def saw_add(freq, n, harmonics=9, detune=0.0):
    t = t_axis(n)
    y = np.zeros(n)
    for k in range(1, harmonics + 1):
        f = freq * k * (1 + detune)
        if f > SR * 0.45:
            break
        y += np.sin(2 * np.pi * f * t) / k
    return y * (2 / np.pi)


def lowpass(x, cutoff, order=2):
    n = len(x)
    nfft = 1 << int(math.ceil(math.log2(max(n, 2))))
    spec = np.fft.rfft(x, nfft)
    freqs = np.fft.rfftfreq(nfft, 1 / SR)
    h = 1 / np.sqrt(1 + (np.maximum(freqs, 1e-6) / cutoff) ** (2 * order))
    return np.fft.irfft(spec * h, nfft)[:n]


def bandpass(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)


def add(bus, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    seg = sig[: max(0, N - i)]
    gl = gain * math.sqrt((1 - pan) / 2)
    gr = gain * math.sqrt((1 + pan) / 2)
    bus[0, i:i + len(seg)] += seg * gl
    bus[1, i:i + len(seg)] += seg * gr


mix = np.zeros((2, N), dtype=np.float64)

# ------------------------------------------------ pad（A2 / E3 / A3 / C4）
pad_notes = [110.0, 164.81, 220.0, 261.63]
for j, f in enumerate(pad_notes):
    n = N
    sig = saw_add(f, n, harmonics=8, detune=-0.0032) + saw_add(f, n, harmonics=8, detune=0.0032)
    sig = lowpass(sig, 1250, 2)
    e = env_ar(n, 2.6, 1.6, 1.4) * (0.20 if j == 0 else 0.14)
    add(mix, sig * e, 0.0, pan=-0.35 if j % 2 == 0 else 0.35)

# 高频空气层：C5 极轻
n = N
air = lowpass(saw_add(523.25, n, 5, 0.002), 2600) * env_ar(n, 3.4, 2.0) * 0.035
add(mix, air, 0.0, pan=0.2)

# ------------------------------------------------ 次低音 55Hz 脉冲
n = N
t = t_axis(n)
sub = np.sin(2 * np.pi * 55 * t) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.5 * t - 1.2))
sub *= env_ar(n, 1.2, 1.2) * 0.30
add(mix, lowpass(sub, 160, 3), 0.0, gain=0.9)

# ------------------------------------------------ 2.45s 卡尺咬合
n = int(0.55 * SR)
click = bandpass(rng.standard_normal(n), 2200, 7200) * np.exp(-t_axis(n) / 0.028) * 0.55
ring = (np.sin(2 * np.pi * 2140 * t_axis(n)) * 0.5 + np.sin(2 * np.pi * 3260 * t_axis(n)) * 0.3)
ring *= np.exp(-t_axis(n) / 0.11) * 0.22
add(mix, click + ring, 2.45, gain=0.9)

# ------------------------------------------------ 6.9s 扫光 whoosh
n = int(1.1 * SR)
x = rng.standard_normal(n)
sweep = bandpass(x, 900, 5200)
env = np.exp(-((t_axis(n) - 0.52) ** 2) / (2 * 0.20 ** 2))
add(mix, sweep * env * 0.5, 6.85, gain=0.85, pan=0.15)

# ------------------------------------------------ 9.05s τ 落版撞击
n = int(2.0 * SR)
tt = t_axis(n)
f_drop = 72 - 30 * np.clip(tt / 0.35, 0, 1)
phase = 2 * np.pi * np.cumsum(f_drop) / SR
boom = np.sin(phase) * np.exp(-tt / 0.55) * 0.9
noise = lowpass(rng.standard_normal(n), 340, 2) * np.exp(-tt / 0.16) * 0.55
add(mix, boom + noise, 9.05, gain=1.0)

# ------------------------------------------------ 收尾淡入淡出
t = t_axis(N)
fade_in = np.clip(t / 1.2, 0, 1) ** 1.3
fade_out = np.clip((DUR - 0.1 - t) / 0.9, 0, 1) ** 1.2
mix *= (fade_in * fade_out)[None, :]

# 峰值归一 + 轻微软限幅
peak = np.max(np.abs(mix))
mix *= min(1.0, 0.89 / max(peak, 1e-9))
mix = np.tanh(mix * 1.02) / np.tanh(1.02)

pcm = (np.clip(mix.T, -1, 1) * 32767).astype(np.int16)
ap = argparse.ArgumentParser()
ap.add_argument("--out", default="public/score-sample.wav")
args = ap.parse_args()
with wave.open(args.out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {args.out}: {DUR:.2f}s / {SR}Hz / stereo")
