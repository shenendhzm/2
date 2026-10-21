import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import type {
  WebRendererAudioCodec,
  WebRendererContainer,
  WebRendererVideoCodec,
} from "@remotion/web-renderer";
import { HelloWorld } from "../src/HelloWorld";

const COMPOSITION = {
  id: "TauLaw",
  component: HelloWorld,
  durationInFrames: 330,
  fps: 30,
  width: 1920,
  height: 1080,
};

const DURATION_SECONDS = COMPOSITION.durationInFrames / COMPOSITION.fps;

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
    container: string;
  } | null>(null);

  const running = useRef(false);
  const [isRunning, setIsRunning] = useState(false);
  const startedAt = useRef(0);

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
          width: COMPOSITION.width,
          height: COMPOSITION.height,
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
        composition: COMPOSITION,
        container: plan.container,
        videoCodec: plan.videoCodec,
        audioCodec: withAudio ? plan.audioCodec : null,
        muted: !withAudio,
        videoBitrate: "medium",
        audioBitrate: "medium",
        keyframeIntervalInSeconds: 2,
        onProgress: ({ renderedFrames, encodedFrames }) => {
          const pct = Math.round((renderedFrames / COMPOSITION.durationInFrames) * 100);
          setProgress(pct);
          setStatus(
            `渲染中 ${renderedFrames}/${COMPOSITION.durationInFrames} 帧 · 已编码 ${encodedFrames}`,
          );
        },
      });

      setStatus("封装文件…");
      const blob = await rendered.getBlob();
      const url = URL.createObjectURL(blob);
      const ext = plan.container;
      setResult({
        url,
        size: blob.size,
        name: `韬定律-样片-01-换尺子.${ext}`,
        container: plan.container,
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
        maxWidth: 820,
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
        Tau Law · Sample 01 / Shot 01
      </div>
      <h1 style={{ fontSize: 30, margin: "0 0 10px", letterSpacing: 1 }}>
        韬（τ）定律 · 11 秒样片｜01 换尺子
      </h1>
      <p style={{ color: "rgba(255,255,255,.58)", margin: "0 0 24px", lineHeight: 1.75 }}>
        1920×1080 · 30fps · {fmt(DURATION_SECONDS)}s（{COMPOSITION.durationInFrames}{" "}
        帧）· H.264 + AAC · 原创配乐由代码合成
      </p>

      <section style={{ marginBottom: 26 }}>
        <Player
          component={HelloWorld}
          durationInFrames={COMPOSITION.durationInFrames}
          fps={COMPOSITION.fps}
          compositionWidth={COMPOSITION.width}
          compositionHeight={COMPOSITION.height}
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
          实时预览（默认静音，点右下角喇叭开声音；双击画面全屏）。导出 MP4 用下面的按钮。
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
          编码方案
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
          含原创配乐与音效（A 小调 / 11 秒）
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
          {isRunning ? "渲染中…" : `渲染 ${fmt(DURATION_SECONDS)} 秒样片`}
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
        渲染时请保持本页在前台、不要锁屏。11 秒样片在这台手机上预计 2–5
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
        <div>画面段落：00:00–00:11 第 1 镜「换尺子」（分镜表 S1，帧 0–330）</div>
        <div>音乐段落：pad + 55Hz 次低音 0–11s；2.45s 卡尺咬合 · 6.9s 扫光 · 9.05s τ 落版</div>
      </div>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
