import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import type {
  WebRendererAudioCodec,
  WebRendererContainer,
  WebRendererVideoCodec,
} from "@remotion/web-renderer";
import { TauLaw, TauLawSample } from "../src/HelloWorld";
import { FPS, SAMPLE_FRAMES, SHOTS, TOTAL_FRAMES } from "../src/film/data";

/* ------------------------------------------------------------------ *
 * 出片页常量（与 src/Root.tsx 的合成参数一致）
 * ------------------------------------------------------------------ */
const FILM = {
  id: "TauLaw",
  label: "整片",
  component: TauLaw,
  width: 1920,
  height: 1080,
  fps: FPS,
  durationInFrames: TOTAL_FRAMES, // 3420 = 114.000s
};
const SAMPLE = {
  id: "TauLawSample",
  label: "片头样片",
  component: TauLawSample,
  width: 1920,
  height: 1080,
  fps: FPS,
  durationInFrames: SAMPLE_FRAMES, // 300 = 10.000s
};
const COMPS = [FILM, SAMPLE];

type Plan = {
  container: WebRendererContainer;
  videoCodec: WebRendererVideoCodec;
  audioCodec: WebRendererAudioCodec;
  note: string;
};

const PLANS: Plan[] = [
  { container: "mp4", videoCodec: "h264", audioCodec: "aac", note: "MP4 / H.264 + AAC（推荐）" },
  { container: "webm", videoCodec: "vp8", audioCodec: "opus", note: "WebM / VP8 + Opus（兜底）" },
];

const fmt = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);
const mmss = (frames: number, fps: number) => {
  const s = Math.round(frames / fps);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const App: React.FC = () => {
  const [compIndex, setCompIndex] = useState(0);
  const comp = COMPS[compIndex];

  const [plan, setPlan] = useState<Plan | null>(null);
  const [checked, setChecked] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("待渲染");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; size: number; name: string } | null>(null);

  const running = useRef(false);
  const [isRunning, setIsRunning] = useState(false);
  const startedAt = useRef(0);

  const composition = useMemo(
    () => ({
      id: comp.id,
      component: comp.component,
      durationInFrames: comp.durationInFrames,
      fps: comp.fps,
      width: comp.width,
      height: comp.height,
    }),
    [comp],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setChecked(false);
        setPlan(null);
        setIssues([]);
        const collected: string[] = [];
        for (const candidate of PLANS) {
          const check = await canRenderMediaOnWeb({
            container: candidate.container,
            videoCodec: candidate.videoCodec,
            audioCodec: candidate.audioCodec,
            width: comp.width,
            height: comp.height,
            muted: false,
            videoBitrate: "medium",
            audioBitrate: "medium",
          });
          if (cancelled) return;
          if (check.canRender) {
            setPlan(candidate);
            setIssues(check.issues.map((i) => `${i.severity}: ${i.message}`).slice(0, 6));
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
  }, [comp.width, comp.height]);

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
        audioCodec: plan.audioCodec,
        muted: false,
        videoBitrate: comp.durationInFrames > 600 ? "medium" : "high",
        keyframeIntervalInSeconds: 2,
        onProgress: ({ renderedFrames, encodedFrames }) => {
          setProgress(Math.round((renderedFrames / comp.durationInFrames) * 100));
          setStatus(
            `渲染中 ${renderedFrames}/${comp.durationInFrames} 帧 · 已编码 ${encodedFrames}`,
          );
        },
      });
      setStatus("封装文件…");
      const blob = await rendered.getBlob();
      setResult({
        url: URL.createObjectURL(blob),
        size: blob.size,
        name: `韬定律-${comp.durationInFrames > 600 ? "整片" : "片头样片"}.${plan.container}`,
      });
      setProgress(100);
      setStatus("完成");
    } catch (e) {
      setError(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      setStatus("失败");
    } finally {
      running.current = false;
      setIsRunning(false);
    }
  };

  const eta = useMemo(() => {
    if (!isRunning || progress < 2 || elapsed < 1) return null;
    return Math.max(0, (elapsed / progress) * (100 - progress));
  }, [isRunning, progress, elapsed]);

  return (
    <main
      style={{
        fontFamily:
          '"Noto Sans CJK SC","Noto Sans CJK","Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif',
        maxWidth: 1000,
        margin: "0 auto",
        padding: "34px 20px 80px",
        color: "#E9F3FF",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 3.4,
          color: "#2FE3FF",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Tau Law · Film 01 · 16 shots
      </div>
      <h1 style={{ fontSize: 31, margin: "0 0 10px", letterSpacing: 0.5, lineHeight: 1.3 }}>
        韬（τ）定律 · 技术讲解片
      </h1>
      <p style={{ color: "rgba(233,243,255,.58)", margin: "0 0 18px", fontSize: 15, lineHeight: 1.8 }}>
        一把量了六十年的金属尺，在 11.5 秒处折断；此后讲的都是同一件事——把信号等待的时间压短。
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {COMPS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => {
              if (isRunning) return;
              setCompIndex(i);
              setResult(null);
              setProgress(0);
              setStatus("待渲染");
            }}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              cursor: isRunning ? "not-allowed" : "pointer",
              border: i === compIndex ? "1px solid #2FE3FF" : "1px solid rgba(255,255,255,.14)",
              background: i === compIndex ? "rgba(47,227,255,.12)" : "rgba(255,255,255,.03)",
              color: "#E9F3FF",
              fontSize: 14,
            }}
          >
            {c.label} · {mmss(c.durationInFrames, c.fps)}
          </button>
        ))}
      </div>

      <Player
        key={comp.id}
        component={comp.component}
        durationInFrames={comp.durationInFrames}
        fps={comp.fps}
        compositionWidth={comp.width}
        compositionHeight={comp.height}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
          border: "1px solid rgba(233,243,255,.12)",
          boxShadow: "0 24px 60px rgba(0,0,0,.55)",
        }}
        controls
        autoPlay
        loop
        clickToPlay
        doubleClickToFullscreen
        initiallyMuted
        acknowledgeRemotionLicense
      />

      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          fontSize: 12.5,
          color: "rgba(233,243,255,.46)",
        }}
      >
        {[
          "1920×1080",
          "16:9",
          "30 fps",
          `${comp.durationInFrames} 帧`,
          `${(comp.durationInFrames / comp.fps).toFixed(3)}s`,
          "16 镜",
          "Noto Sans CJK",
          "含配乐",
        ].map((t) => (
          <span
            key={t}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid rgba(233,243,255,.13)",
              background: "rgba(255,255,255,.025)",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <section
        style={{
          marginTop: 22,
          border: "1px solid rgba(47,227,255,.22)",
          borderRadius: 14,
          padding: 18,
          background: "linear-gradient(180deg, rgba(47,227,255,.07), rgba(255,255,255,.015))",
        }}
      >
        <div style={{ fontSize: 12.5, color: "rgba(233,243,255,.5)", letterSpacing: 1.4 }}>
          浏览器内出片（WebCodecs，不经过容器 Chromium）
        </div>
        <div style={{ fontSize: 15.5, marginTop: 6, color: "rgba(233,243,255,.86)" }}>
          {plan ? plan.note : checked ? "这台浏览器没有可用的编码组合" : "检测中…"}
        </div>

        {issues.length > 0 && (
          <details style={{ marginTop: 10, fontSize: 12.5, color: "rgba(233,243,255,.45)" }}>
            <summary style={{ cursor: "pointer" }}>检测详情</summary>
            <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
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
            marginTop: 16,
            width: "100%",
            padding: "15px 18px",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 10,
            border: "none",
            color: "#04121f",
            background: plan ? "linear-gradient(90deg,#2FE3FF,#7FB3FF)" : "#39404f",
            cursor: plan && !isRunning ? "pointer" : "not-allowed",
          }}
        >
          {isRunning
            ? "渲染中…"
            : `渲染「${comp.label}」${(comp.durationInFrames / comp.fps).toFixed(0)} 秒`}
        </button>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 13.5,
            color: "rgba(233,243,255,.6)",
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
            marginTop: 8,
            height: 6,
            borderRadius: 3,
            background: "rgba(255,255,255,.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg,#2FE3FF,#7FB3FF)",
              transition: "width .2s",
            }}
          />
        </div>

        {error && (
          <pre
            style={{
              marginTop: 12,
              whiteSpace: "pre-wrap",
              fontSize: 12.5,
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

        {result && (
          <div style={{ marginTop: 16 }}>
            <video
              src={result.url}
              controls
              playsInline
              style={{ width: "100%", borderRadius: 10, background: "#000" }}
            />
            <a
              href={result.url}
              download={result.name}
              style={{ display: "inline-block", marginTop: 10, color: "#2FE3FF", fontSize: 14 }}
            >
              下载 {result.name}（{(result.size / 1024 / 1024).toFixed(1)} MB）
            </a>
          </div>
        )}
      </section>

      <section style={{ marginTop: 26 }}>
        <div style={{ fontSize: 13, letterSpacing: 1.4, color: "rgba(233,243,255,.5)", marginBottom: 10 }}>
          分镜 · 16 镜 / 3420 帧 / 114.000s
        </div>
        {SHOTS.map((s) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "34px 128px 1fr 44px",
              alignItems: "center",
              gap: 8,
              padding: "7px 0",
              borderTop: "1px solid rgba(233,243,255,.07)",
              fontSize: 13.5,
              color: "rgba(233,243,255,.86)",
            }}
          >
            <span style={{ fontFamily: "ui-monospace, monospace", opacity: 0.66 }}>
              {String(s.id).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "ui-monospace, monospace", opacity: 0.6 }}>{s.tc}</span>
            <span>{s.title}</span>
            <span style={{ fontSize: 11.5, textAlign: "right", color: "#2FE3FF" }}>已出</span>
          </div>
        ))}
      </section>

      <p style={{ margin: "20px 0 0", fontSize: 12.5, lineHeight: 1.85, color: "rgba(233,243,255,.4)" }}>
        整片渲染请插电、保持本页在前台、别锁屏：1080p / 3420 帧，按这台手机的编码速度大约
        25–45 分钟；片头 10 秒样片只需 2–4 分钟。中途切后台可能中断，重来即可。
      </p>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
