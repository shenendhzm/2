#!/usr/bin/env python3
"""
片头配乐（S1，00:00–00:08）：A 小调 pad + 低频脉冲，无鼓。
脚本对应段落：「前奏：A 小调长音 pad + 低频脉冲，无鼓；8 s 处琶音进入」。
所以 8 秒整收在琶音进入之前，留一个干净的切点。

用法：python3 scripts/make-title-score.py
输出：public/score-title.m4a（44.1 kHz / 立体声 / AAC 192k / 8.000s）
"""
import os
import subprocess

import numpy as np

SR = 44100
DUR = 8.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(20260525)


def env_adsr(n, attack, decay, sustain_level, release):
    a = int(attack * SR)
    d = int(decay * SR)
    r = int(release * SR)
    s = max(0, n - a - d - r)
    return np.concatenate(
        [
            np.linspace(0, 1, a, endpoint=False),
            np.linspace(1, sustain_level, d, endpoint=False),
            np.full(s, sustain_level),
            np.linspace(sustain_level, 0, r),
        ]
    )[:n]


def lowpass(x, cutoff):
    """一阶低通（足够做 pad 的柔化）。"""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    prev = 0.0
    for i in range(len(x)):
        prev = (1 - a) * x[i] + a * prev
        y[i] = prev
    return y


def saw(freq, n, detune=0.0, phase=0.0):
    """带限近似锯齿：几个谐波叠加，避免高频毛刺。"""
    x = np.zeros(n)
    f = freq * (1 + detune)
    for k in range(1, 9):
        x += np.sin(2 * np.pi * f * k * t[:n] + phase * k) / k
    return x / 2.2


# ---------------------------------------------------------------- pad：A 小调
chord = [110.0, 130.81, 164.81, 220.0]  # A2 C3 E3 A3
pad = np.zeros(N)
for i, f in enumerate(chord):
    lvl = 0.30 if i < 3 else 0.14
    pad += lvl * (saw(f, N, +0.0016, rng.uniform(0, 6)) + saw(f, N, -0.0018, rng.uniform(0, 6))) / 2

pad = lowpass(pad, 1400)
pad_env = env_adsr(N, attack=1.6, decay=0.8, sustain_level=0.72, release=1.1)
# 缓慢呼吸，避免长音死板
pad *= pad_env * (0.86 + 0.14 * np.sin(2 * np.pi * 0.19 * t))

# sub 低音：55 Hz（A1）
sub = 0.34 * np.sin(2 * np.pi * 55.0 * t) * env_adsr(N, 1.2, 0.6, 0.8, 1.2)

# 低频脉冲：0 / 2 / 4 / 6 s，每两秒一次
pulse = np.zeros(N)
for at in (0.0, 2.0, 4.0, 6.0):
    i0 = int(at * SR)
    n = int(0.55 * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * (52.0 * np.exp(-2.2 * tt) + 18.0) * tt)
    body *= np.exp(-7.5 * tt)
    pulse[i0 : i0 + n] += 0.26 * body

# 高音微光：A5 + E6，很轻
shimmer = (
    0.045 * np.sin(2 * np.pi * 880.0 * t)
    + 0.03 * np.sin(2 * np.pi * 1318.5 * t + 0.7)
) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.33 * t + 1.1))
shimmer *= np.clip((t - 0.8) / 2.0, 0, 1) * np.clip((DUR - t) / 1.4, 0, 1)

# 6.6–8.0 s 的极轻噪声 swell（给 8 s 的切点一点推力）
swell_n = int(1.4 * SR)
sw = t[-swell_n:]
swell_p = np.clip((sw - sw[0]) / 1.4, 0, 1)
swell = rng.normal(0, 1, swell_n) * swell_p**3 * 0.03
swell = lowpass(swell, 4200)

# ---------------------------------------------------------------- 简易卷积混响
ir_len = int(0.85 * SR)
ir = rng.normal(0, 1, ir_len) * np.exp(-np.arange(ir_len) / (0.24 * SR))
ir /= np.sqrt(np.sum(ir**2)) + 1e-9


def reverb(x, wet=0.28):
    n = len(x) + ir_len - 1
    nfft = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return x + wet * y


dry = pad + sub + pulse + shimmer
dry[-swell_n:] += swell
mix = reverb(dry)

# 轻微立体声：左偏 pad、右偏微光
left = mix + 0.05 * shimmer
right = mix - 0.05 * shimmer

stereo = np.stack([left, right], axis=1)
# 尾部 120 ms 淡出，避免切点爆音
tail = int(0.12 * SR)
stereo[-tail:] *= np.linspace(1, 0, tail)[:, None]

# 归一化到 -1 dBFS 峰值
peak = np.max(np.abs(stereo))
stereo = stereo / peak * 0.66

out_wav = os.path.join("public", "score-title.wav")
os.makedirs("public", exist_ok=True)
pcm = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)

import wave

with wave.open(out_wav, "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm.tobytes())

out_m4a = os.path.join("public", "score-title.m4a")
subprocess.run(
    [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", out_wav,
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
        "-t", f"{DUR:.3f}", "-movflags", "+faststart",
        out_m4a,
    ],
    check=True,
)

rms = 20 * np.log10(np.sqrt(np.mean(stereo**2)) + 1e-12)
print(f"{out_m4a}: {DUR:.3f}s  peak {20*np.log10(0.66):.2f} dBFS  rms {rms + 20*np.log10(0.66 / peak):.2f} dBFS")
