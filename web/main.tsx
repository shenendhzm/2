import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import type {
  WebRendererAudioCodec,
  WebRendererContainer,
  WebRendererVideoCodec,
} from "@remotion/web-renderer";
import {
  TauBlackSample,
  TauGoldSample,
  TauDotsSample,
  TauGlowSample,
  TauLinesSample,
  TauCrtSample,
} from "../src/plates";

const FPS = 30;
const DURATION = 240;
const DURATION_SECONDS = DURATION / FPS;

type StyleDef = {
  id: string;
  label: string;
  note: string;
  file: string;
  chip: [string, string];
  component: React.FC;
};

const STYLES: StyleDef[] = [
  {
    id: "TauLawBlack",
    label: "纯黑底",
    note: "黑底 · 米白制图线 · 朱红强调",
    file: "纯黑",
    chip: ["#000000", "#E5484D"],
    component: TauBlackSample,
  },
  {
    id: "TauLawGold",
    label: "黑金",
    note: "墨黑 · 琥珀金 · 细制图线",
    file: "黑金",
    chip: ["#0B0906", "#E0A94A"],
    component: TauGoldSample,
  },
  {
    id: "TauLawDots",
    label: "黑点阵",
    note: "黑底 · 34px 细点阵 · 冰蓝",
    file: "黑点阵",
    chip: ["#000000", "#8FD8FF"],
    component: TauDotsSample,
  },
  {
    id: "TauLawGlow",
    label: "黑光晕",
    note: "黑底 · 环境光 · 琥珀",
    file: "黑光晕",
    chip: ["#000000", "#E0A94A"],
    component: TauGlowSample,
  },
  {
    id: "TauLawLines",
    label: "黑横线",
    note: "黑底 · 7px 细横纹 · 朱红",
    file: "黑横线",
    chip: ["#000000", "#FF5A4E"],
    component: TauLinesSample,
  },
  {
    id: "TauLawCrt",
    label: "CRT 终端",
    note: "荧光绿 · 扫描线 · 终端绿字",
    file: "CRT",
    chip: ["#020604", "#8CFFB0"],
    component: TauCrtSample,
  },
];

type Plan = {
  container: WebRendererContainer;
  videoCodec: WebRendererVideoCodec;
  audioCodec: WebRendererAudioCodec;
  note: string;
};

const PLANS: Plan[] = [
  {
    container: "mp4",
    videoCodec: "h264",
    audioCodec: "aac",
    note: "MP4 / H.264 + AAC（推荐，手机相册可直接播）",
  },
  {
    container: "webm",
    videoCodec: "vp8",
    audioCodec: "opus",
    note: "WebM / VP8 + Opus（H.264 不可用时的兜底）",
  },
];

const fmt = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);

const App: React.FC = () => {
  const [styleIndex, setStyleIndex] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [checked, setChecked] = useState(false);
  const [withAudio, setWithAudio] = useState(true);
  const [issues, setIssues] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("待渲染");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    size: number;
    name: string;
  } | null>(null);

  const style = STYLES[styleIndex];
  const running = useRef(false);
  const [isRunning, setIsRunning] = useState(false);
  const startedAt = useRef(0);

  const composition = useMemo(
    () => ({
      id: style.id,
      component: style.component,
      durationInFrames: DURATION,
      fps: FPS,
      width: 1920,
      height: 1080,
    }),
    [style],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setChecked(false);
        setPlan(null);
        setIssues([]);
        setError(null);
        const collected: string[] = [];

        for (const candidate of PLANS) {
          const check = await canRenderMediaOnWeb({
            container: candidate.container,
            videoCodec: candidate.videoCodec,
            audioCodec: withAudio ? candidate.audioCodec : null,
            width: 1920,
            height: 1080,
            muted: !withAudio,
            videoBitrate: "medium",
            audioBitrate: "medium",
          });
          if (cancelled) return;
          if (check.canRender) {
            setPlan(candidate);
            setIssues(
              [...collected, ...check.issues.map((i) => `${i.severity}: ${i.message}`)].slice(
                0,
                8,
              ),
            );
            setChecked(true);
            return;
          }
          collected.push(
            `${candidate.container}/${candidate.videoCodec}: ` +
              check.issues.map((i) => i.message).join("; "),
          );
        }

        setIssues(collected);
        setChecked(true);
      } catch (e) {
        if (cancelled) return;
        setIssues([e instanceof Error ? `${e.name}: ${e.message}` : String(e)]);
        setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [withAudio]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setElapsed((performance.now() - startedAt.current) / 1000);
    }, 500);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const start = async () => {
    if (!plan || running.current) return;
    running.current = true;
    setIsRunning(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setElapsed(0);
    setStatus("准备中…");
    startedAt.current = performance.now();

    try {
      const rendered = await renderMediaOnWeb({
        composition,
        container: plan.container,
        videoCodec: plan.videoCodec,
        audioCodec: withAudio ? plan.audioCodec : null,
        muted: !withAudio,
        videoBitrate: "medium",
        audioBitrate: "medium",
        keyframeIntervalInSeconds: 2,
        onProgress: ({ renderedFrames, encodedFrames }) => {
          const pct = Math.round((renderedFrames / DURATION) * 100);
          setProgress(pct);
          setStatus(`渲染中 ${renderedFrames}/${DURATION} 帧 · 已编码 ${encodedFrames}`);
        },
      });

      setStatus("封装文件…");
      const blob = await rendered.getBlob();
      const url = URL.createObjectURL(blob);
      setResult({
        url,
        size: blob.size,
        name: `韬定律-片头-${style.file}.${plan.container}`,
      });
      setProgress(100);
      setStatus("完成");
      setElapsed((performance.now() - startedAt.current) / 1000);
    } catch (e) {
      setError(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      setStatus("失败");
    } finally {
      running.current = false;
      setIsRunning(false);
    }
  };

  const planLabel = useMemo(
    () => (plan ? plan.note : checked ? "没有可用的编码组合" : "检测中…"),
    [plan, checked],
  );

  const eta = useMemo(() => {
    if (!isRunning || progress < 3 || elapsed < 1) return null;
    return Math.max(0, (elapsed / progress) * (100 - progress));
  }, [isRunning, progress, elapsed]);

  return (
    <main
      style={{
        fontFamily:
          '"Noto Sans CJK SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif',
        maxWidth: 980,
        margin: "0 auto",
        padding: "30px 20px 72px",
        color: "#fff",
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: 3,
          color: "#54c8ff",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Tau Law · Style Lab
      </div>
      <h1 style={{ fontSize: 30, margin: "0 0 10px", letterSpacing: 1 }}>
        韬（τ）定律 · 8 秒片头样片｜六种风格
      </h1>
      <p style={{ color: "rgba(255,255,255,.58)", margin: "0 0 22px", lineHeight: 1.75 }}>
        同一段片头：同心圆晕开、巨型 τ 浮现、标题升起。六套色板只换视觉语言，时间轴一帧不动。挑一个，我按它把 8 个镜头 / 120 秒全片做出来。
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {STYLES.map((s, i) => {
          const active = i === styleIndex;
          return (
            <button
              key={s.id}
              onClick={() => {
                if (isRunning) return;
                setStyleIndex(i);
                setResult(null);
                setProgress(0);
                setStatus("待渲染");
              }}
              style={{
                textAlign: "left",
                padding: "11px 12px",
                borderRadius: 10,
                cursor: isRunning ? "not-allowed" : "pointer",
                border: active ? "1px solid #54c8ff" : "1px solid rgba(255,255,255,.14)",
                background: active ? "rgba(84,200,255,.10)" : "rgba(255,255,255,.03)",
                color: "#fff",
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  flex: "0 0 auto",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.2)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ flex: 1, background: s.chip[0] }} />
                <span style={{ flex: 1, background: s.chip[1] }} />
              </span>
              <span>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>
                  {s.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    color: "rgba(255,255,255,.45)",
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {s.note}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <section style={{ marginBottom: 24 }}>
        <Player
          key={style.id}
          component={style.component}
          durationInFrames={DURATION}
          fps={FPS}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 14,
            overflow: "hidden",
            background: "#000",
            border: "1px solid rgba(255,255,255,.1)",
          }}
          controls
          loop
          autoPlay
          clickToPlay
          doubleClickToFullscreen
          initiallyMuted
          acknowledgeRemotionLicense
        />
        <div
          style={{
            marginTop: 8,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "rgba(255,255,255,.42)",
          }}
        >
          实时预览（默认静音，可开声音；双击全屏）。当前：{style.label} · 1920×1080 · 30fps ·{" "}
          {DURATION} 帧。
        </div>
      </section>

      <section
        style={{
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 16,
          padding: 20,
          background:
            "linear-gradient(180deg, rgba(84,200,255,.06), rgba(255,255,255,.02))",
        }}
      >
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", letterSpacing: 1 }}>
          导出当前风格
        </div>
        <div style={{ fontSize: 16, marginTop: 7, lineHeight: 1.6 }}>{planLabel}</div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            fontSize: 14,
            color: "rgba(255,255,255,.72)",
            cursor: isRunning ? "not-allowed" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={withAudio}
            disabled={isRunning}
            onChange={(e) => {
              setWithAudio(e.target.checked);
              setResult(null);
              setProgress(0);
              setStatus("待渲染");
            }}
            style={{ width: 18, height: 18, accentColor: "#54c8ff" }}
          />
          含原创配乐（A 小调 pad + 低频脉冲 / 8 秒）
        </label>

        {issues.length > 0 && (
          <details style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,.45)" }}>
            <summary style={{ cursor: "pointer" }}>检测详情</summary>
            <ul style={{ paddingLeft: 18, lineHeight: 1.65 }}>
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </details>
        )}

        <button
          onClick={start}
          disabled={!plan || isRunning}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "15px 18px",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 11,
            border: "none",
            color: "#04121f",
            background: plan
              ? "linear-gradient(90deg,#54c8ff,#a06bff)"
              : "#39404f",
            cursor: plan && !isRunning ? "pointer" : "not-allowed",
            opacity: isRunning ? 0.8 : 1,
          }}
        >
          {isRunning ? "渲染中…" : `渲染「${style.label}」${fmt(DURATION_SECONDS)} 秒样片`}
        </button>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 14,
            color: "rgba(255,255,255,.62)",
          }}
        >
          <span>{status}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {elapsed > 0 ? `已用 ${fmt(elapsed)}s` : ""}
            {eta !== null ? ` · 约剩 ${fmt(eta)}s` : ""}
          </span>
        </div>

        <div
          style={{
            marginTop: 9,
            height: 8,
            borderRadius: 4,
            background: "rgba(255,255,255,.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg,#54c8ff,#a06bff)",
              transition: "width .2s",
            }}
          />
        </div>

        {error && (
          <pre
            style={{
              marginTop: 14,
              whiteSpace: "pre-wrap",
              fontSize: 13,
              color: "#ff9b9b",
              background: "rgba(255,80,80,.08)",
              padding: 12,
              borderRadius: 8,
              lineHeight: 1.6,
            }}
          >
            {error}
          </pre>
        )}
      </section>

      <p
        style={{
          margin: "16px 0 0",
          fontSize: 13,
          lineHeight: 1.75,
          color: "rgba(255,255,255,.42)",
        }}
      >
        渲染时请保持本页在前台、不要锁屏。8 秒样片在这台手机上预计 2–4
        分钟；若音频编码不可用，页面会自动回退到 WebM/Opus，或取消勾选配乐出无声片。
      </p>

      {result && (
        <section style={{ marginTop: 24 }}>
          <video
            src={result.url}
            controls
            playsInline
            style={{ width: "100%", borderRadius: 14, background: "#000" }}
          />
          <a
            href={result.url}
            download={result.name}
            style={{
              display: "inline-block",
              marginTop: 12,
              color: "#54c8ff",
              fontSize: 15,
            }}
          >
            下载 {result.name}（{(result.size / 1024 / 1024).toFixed(1)} MB）
          </a>
        </section>
      )}

      <div
        style={{
          marginTop: 26,
          paddingTop: 18,
          borderTop: "1px solid rgba(255,255,255,.08)",
          fontSize: 13,
          lineHeight: 1.8,
          color: "rgba(255,255,255,.38)",
        }}
      >
        <div>画面段落：00:00–00:08 第 1 镜「τ 浮现」（分镜表 S1，帧 0–240）</div>
        <div>字幕：脚本设定为无解说、无字幕，本段不加字幕层</div>
        <div>音频：A 小调 pad + 55Hz 次低音 + 每 2 s 一次低频脉冲，8.000 s 收在琶音进入之前</div>
      </div>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
