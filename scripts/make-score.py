#!/usr/bin/env python3
"""韬（τ）定律 · 原创配乐合成器（纯 numpy 加法合成，无任何采样/第三方音源）。

当前实现片头 10 秒：失谐锯齿 pad、低频脉冲、8 秒处 16 分琶音 + sub bass。
用法：
  python3 scripts/make-score.py --duration 10 --out public/score-sample.wav
"""

import argparse
import math
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60.0 / BPM          # 0.5 s
BAR = 4 * BEAT             # 2.0 s


# ---------------------------------------------------------------- 基础工具

def axis(duration: float) -> np.ndarray:
    return np.arange(int(round(duration * SR)), dtype=np.float64) / SR


def env_ad(n: int, attack: float, release: float) -> np.ndarray:
    """Attack / release 包络，指数手感。"""
    e = np.ones(n, dtype=np.float64)
    a = min(int(attack * SR), n)
    r = min(int(release * SR), n)
    if a > 1:
        e[:a] = np.linspace(0.0, 1.0, a) ** 1.6
    if r > 1:
        e[n - r:] *= np.linspace(1.0, 0.0, r) ** 1.3
    return e


def bandlimited_saw(freq: float, t: np.ndarray, phase: float = 0.0, harmonics: int = 28) -> np.ndarray:
    """加法合成的限带锯齿，避免高频混叠。"""
    y = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        f = freq * k
        if f > SR * 0.45:
            break
        y += np.sin(2 * np.pi * f * t + phase * k) / k
    return y * (2.0 / np.pi)


def fft_filter(x: np.ndarray, cutoff: float, kind: str = "low", order: int = 2) -> np.ndarray:
    """零相位 FFT 滤波器，够用且快。"""
    n = len(x)
    if n == 0:
        return x
    nfft = 1 << int(math.ceil(math.log2(max(n, 2))))
    spec = np.fft.rfft(x, nfft)
    freqs = np.fft.rfftfreq(nfft, 1.0 / SR)
    ratio = np.maximum(freqs, 1e-6) / max(cutoff, 1e-6)
    if kind == "low":
        h = 1.0 / np.sqrt(1.0 + ratio ** (2 * order))
    else:
        h = 1.0 / np.sqrt(1.0 + (1.0 / ratio) ** (2 * order))
    return np.fft.irfft(spec * h, nfft)[:n]


def add_at(buf: np.ndarray, start_sec: float, sig: np.ndarray) -> None:
    i0 = max(0, int(round(start_sec * SR)))
    i1 = min(len(buf), i0 + len(sig))
    if i1 > i0:
        buf[i0:i1] += sig[: i1 - i0]


def stereo_pan(sig: np.ndarray, pan: float):
    """pan: -1 左 / +1 右。"""
    left = sig * (0.5 - 0.5 * pan)
    right = sig * (0.5 + 0.5 * pan)
    return left, right


def delayed(x: np.ndarray, seconds: float, gain: float) -> np.ndarray:
    """单抽头延迟，用来做 ping-pong。"""
    out = np.zeros_like(x)
    d = int(round(seconds * SR))
    if 0 < d < len(x):
        out[d:] = x[:-d] * gain
    return out


def reverb(x: np.ndarray, decay: float = 0.62, length: float = 2.4, wet: float = 0.32) -> np.ndarray:
    """合成脉冲响应做卷积混响。"""
    n_ir = int(length * SR)
    t_ir = np.arange(n_ir) / SR
    rng = np.random.default_rng(20260525)
    ir = rng.normal(0.0, 1.0, n_ir) * np.exp(-t_ir / decay)
    ir = fft_filter(ir, 4200.0, "low", 1)
    ir /= np.sqrt(np.sum(ir ** 2)) or 1.0

    nfft = 1 << int(math.ceil(math.log2(len(x) + n_ir - 1)))
    conv = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return x * (1.0 - wet) + conv * wet * 1.6


# ---------------------------------------------------------------- 配器

def make_pad(n: int, duration: float):
    """A 小调长音 pad，和声 Am – F – C，滤波器缓慢打开。"""
    left = np.zeros(n)
    right = np.zeros(n)
    chords = [
        (0.0, 4.8, [110.00, 164.81, 220.00, 261.63], 950.0),   # Am
        (3.6, 8.9, [87.31, 130.81, 174.61, 220.00], 1500.0),   # F
        (7.6, duration, [130.81, 196.00, 261.63, 329.63], 2050.0),  # C
    ]
    for start, end, notes, cutoff in chords:
        n0 = int(start * SR)
        n1 = min(int(end * SR), n)
        if n1 <= n0:
            continue
        tt = np.arange(n1 - n0) / SR
        seg_l = np.zeros(n1 - n0)
        seg_r = np.zeros(n1 - n0)
        for i, f in enumerate(notes):
            for j, detune in enumerate((-7.0, 0.0, 7.0)):
                voice = bandlimited_saw(
                    f * 2 ** (detune / 1200.0), tt, phase=i * 0.37 + j * 0.19, harmonics=24
                )
                pan = 0.55 * math.sin(i * 0.9 + j * 0.6)
                v_l, v_r = stereo_pan(voice, pan)
                seg_l += v_l
                seg_r += v_r
        env = env_ad(n1 - n0, 1.5 if start == 0 else 1.0, 1.0)
        seg_l = fft_filter(seg_l * env, cutoff, "low", 2)
        seg_r = fft_filter(seg_r * env, cutoff, "low", 2)
        add_at(left, start, seg_l * 0.056)
        add_at(right, start, seg_r * 0.056)
    return left, right


def make_pulse(n: int, duration: float):
    """每小节一次的低频脉冲。"""
    left = np.zeros(n)
    right = np.zeros(n)
    rng = np.random.default_rng(7)
    bar = 0.0
    while bar < duration:
        seg_dur = min(0.95, duration - bar)
        seg_n = int(seg_dur * SR)
        tt = np.arange(seg_n) / SR
        # 音高快速下坠的 sub 脉冲
        f = 52.0 + 20.0 * np.exp(-tt / 0.055)
        phase = 2 * np.pi * np.cumsum(f) / SR
        sig = np.sin(phase) * np.exp(-tt / 0.30)
        # 极短的 thump，增加“实验室”质感
        thump = rng.normal(0, 1, seg_n) * np.exp(-tt / 0.035)
        thump = fft_filter(thump, 190.0, "low", 1)
        sig = sig * 0.55 + thump * 0.16
        sig *= env_ad(seg_n, 0.004, 0.05)
        add_at(left, bar, sig * 0.17)
        add_at(right, bar, sig * 0.17)
        bar += BAR
    return left, right


def make_shimmer(n: int):
    """高频微光，让 pad 不死。"""
    tt = axis(n / SR)
    amp = 0.010 * (1.0 - np.exp(-tt / 2.0))
    sig = np.sin(2 * np.pi * 1760.0 * tt + 0.6 * np.sin(2 * np.pi * 0.25 * tt))
    sig += 0.35 * np.sin(2 * np.pi * 2637.0 * tt)
    pan = 0.35 * np.sin(2 * np.pi * 0.08 * tt)
    return sig * amp * (1.0 - pan), sig * amp * (1.0 + pan)


def make_arp(n: int, duration: float):
    """8 秒进入的 16 分拨弦琶音（C 和弦色彩，A-C-E 动机的延伸）。"""
    left = np.zeros(n)
    right = np.zeros(n)
    notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 392.00]
    step = BEAT / 4.0
    start = 8.0
    idx = 0
    t0 = start
    while t0 < duration - 1e-6:
        seg_dur = min(0.34, duration - t0)
        seg_n = int(seg_dur * SR)
        tt = np.arange(seg_n) / SR
        f = notes[idx % len(notes)]
        sig = (
            0.70 * np.sin(2 * np.pi * f * tt)
            + 0.28 * np.sin(2 * np.pi * 2 * f * tt)
            + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
        )
        sig *= np.exp(-tt / 0.085)
        sig += 0.22 * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.018)
        sig = fft_filter(sig, 5600.0, "low", 1)
        pan = 0.28 * math.sin(idx * 1.7)
        s_l, s_r = stereo_pan(sig, pan)
        add_at(left, t0, s_l * 0.072)
        add_at(right, t0, s_r * 0.072)
        idx += 1
        t0 += step
    return left, right


def make_sub(n: int, duration: float):
    """8 秒进入的 sub bass。"""
    start = 8.0
    if duration <= start:
        return np.zeros(n), np.zeros(n)
    seg_n = n - int(start * SR)
    tt = np.arange(seg_n) / SR
    f = 65.41  # C2
    sig = np.sin(2 * np.pi * f * tt) * (1.0 - np.exp(-tt / 0.35))
    sig += 0.25 * np.sin(2 * np.pi * 2 * f * tt) * (1.0 - np.exp(-tt / 0.30))
    sig *= env_ad(seg_n, 0.02, 0.0)
    out = np.zeros(n)
    add_at(out, start, sig * 0.082)
    return out, out.copy()


def make_riser(n: int, duration: float):
    """7–8 秒噪声 riser，推入琶音。"""
    start, end = 6.8, 8.0
    if duration <= start:
        return np.zeros(n)
    n0 = int(start * SR)
    n1 = min(int(end * SR), n)
    seg_n = n1 - n0
    tt = np.arange(seg_n) / SR
    rng = np.random.default_rng(11)
    noise = rng.normal(0.0, 1.0, seg_n)
    out = np.zeros(seg_n)
    blocks = 8
    for b in range(blocks):
        i0 = int(b * seg_n / blocks)
        i1 = int((b + 1) * seg_n / blocks)
        cutoff = 240.0 * (2 ** (b * 0.55))
        out[i0:i1] = fft_filter(noise[i0:i1], cutoff, "low", 1)
    env = (tt / max(end - start, 1e-6)) ** 2.1
    out *= env * 0.038
    f = 180.0 * (2 ** (3.0 * tt / max(end - start, 1e-6)))
    phase = 2 * np.pi * np.cumsum(f) / SR
    out += np.sin(phase) * env * 0.012
    buf = np.zeros(n)
    add_at(buf, start, out)
    return buf


# ---------------------------------------------------------------- 主流程

def build(duration: float) -> np.ndarray:
    n = int(round(duration * SR))
    pad_l, pad_r = make_pad(n, duration)
    pulse_l, pulse_r = make_pulse(n, duration)
    shim_l, shim_r = make_shimmer(n)
    arp_l, arp_r = make_arp(n, duration)
    # 1/8 拍 ping-pong 延迟：L→R→L，衰减 0.32/0.16/0.08
    dly_l = delayed(arp_r, 0.25, 0.32) + delayed(arp_l, 0.50, 0.16) + delayed(arp_r, 0.75, 0.08)
    dly_r = delayed(arp_l, 0.25, 0.32) + delayed(arp_r, 0.50, 0.16) + delayed(arp_l, 0.75, 0.08)
    arp_l = arp_l + dly_l
    arp_r = arp_r + dly_r
    sub_l, sub_r = make_sub(n, duration)
    riser = make_riser(n, duration)

    # pad + arp 走混响，脉冲/sub 保持干声
    wet_l = reverb(pad_l * 0.85 + arp_l * 0.55 + shim_l * 0.7)
    wet_r = reverb(pad_r * 0.85 + arp_r * 0.55 + shim_r * 0.7)

    left = wet_l + pulse_l + arp_l * 0.45 + sub_l + riser
    right = wet_r + pulse_r + arp_r * 0.45 + sub_r + riser

    left = fft_filter(left, 28.0, "high", 2)
    right = fft_filter(right, 28.0, "high", 2)

    stereo = np.stack([left, right], axis=1)
    rms = float(np.sqrt(np.mean(stereo ** 2))) or 1.0
    stereo *= 10 ** (-16.5 / 20.0) / rms

    peak = float(np.max(np.abs(stereo))) or 1.0
    if peak > 0.944:
        stereo *= 0.944 / peak

    # 10 ms 淡入淡出，避免爆音
    fade = min(int(0.010 * SR), n)
    stereo[:fade] *= np.linspace(0.0, 1.0, fade)[:, None]
    stereo[-fade:] *= np.linspace(1.0, 0.0, fade)[:, None]
    return np.clip(stereo, -1.0, 1.0)


def write_wav(path: str, stereo: np.ndarray) -> None:
    pcm = (stereo * 32767.0).astype("<i2")
    with wave.open(path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--duration", type=float, default=10.0)
    ap.add_argument("--out", default="public/score-sample.wav")
    args = ap.parse_args()
    stereo = build(args.duration)
    write_wav(args.out, stereo)
    print(f"wrote {args.out}: {args.duration:.2f}s / {SR}Hz / stereo")
    print(f"peak {20 * np.log10(np.max(np.abs(stereo)) + 1e-12):.2f} dBFS, "
          f"rms {20 * np.log10(np.sqrt(np.mean(stereo ** 2)) + 1e-12):.2f} dBFS")


if __name__ == "__main__":
    main()
