import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import type {
  WebRendererAudioCodec,
  WebRendererContainer,
  WebRendererVideoCodec,
} from "@remotion/web-renderer";
import { TauLawSample } from "../src/HelloWorld";
import { FPS, SAMPLE_FRAMES, SHOTS, TOTAL_FRAMES } from "../src/film/data";

/* ------------------------------------------------------------------ *
 * 出片页常量（与 src/Root.tsx 的合成参数保持一致）
 * ------------------------------------------------------------------ */
const COMPOSITION = {
  id: "TauLawSample",
  component: TauLawSample,
  width: 1920,
  height: 1080,
  fps: FPS,
  durationInFrames: SAMPLE_FRAMES, // 300 帧 = 10.000s
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
    note: "MP4 / H.264（推荐，手机相册可直接播）",
  },
  {
    container: "webm",
    videoCodec: "vp8",
    audioCodec: "opus",
    note: "WebM / VP8（H.264 不可用时的兜底）",
  },
];

const fmt = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);

const App: React.FC = () => {
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
      id: COMPOSITION.id,
      component: COMPOSITION.component,
      durationInFrames: COMPOSITION.durationInFrames,
      fps: COMPOSITION.fps,
      width: COMPOSITION.width,
      height: COMPOSITION.height,
    }),
    [],
  );

  /* 开机探测：这台浏览器能不能编码 */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const collected: string[] = [];
        for (const candidate of PLANS) {
          const check = await canRenderMediaOnWeb({
            container: candidate.container,
            videoCodec: candidate.videoCodec,
            audioCodec: candidate.audioCodec,
            width: COMPOSITION.width,
            height: COMPOSITION.height,
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
  }, []);

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
        videoBitrate: "high",
        keyframeIntervalInSeconds: 1,
        onProgress: ({ renderedFrames, encodedFrames }) => {
          setProgress(Math.round((renderedFrames / COMPOSITION.durationInFrames) * 100));
          setStatus(`渲染中 ${renderedFrames}/${COMPOSITION.durationInFrames} 帧 · 已编码 ${encodedFrames}`);
        },
      });

      setStatus("封装文件…");
      const blob = await rendered.getBlob();
      setResult({
        url: URL.createObjectURL(blob),
        size: blob.size,
        name: `韬定律-片头样片.${plan.container}`,
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
    if (!isRunning || progress < 3 || elapsed < 1) return null;
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
        Tau Law · Film 01 · Sample
      </div>
      <h1 style={{ fontSize: 31, margin: "0 0 10px", letterSpacing: 0.5, lineHeight: 1.3 }}>
        韬（τ）定律 · 片头样片
      </h1>
      <p style={{ color: "rgba(233,243,255,.58)", margin: "0 0 20px", fontSize: 15, lineHeight: 1.8 }}>
        镜头 1–2：一把量了六十年的金属尺，把芯片逼到 1nm。
        <br />
        尺子还在，时间还没出场——10 秒后，第 3 镜会把尺子折断。
      </p>

      <section style={{ marginBottom: 14 }}>
        <Player
          component={COMPOSITION.component}
          durationInFrames={COMPOSITION.durationInFrames}
          fps={COMPOSITION.fps}
          compositionWidth={COMPOSITION.width}
          compositionHeight={COMPOSITION.height}
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
          loop
          autoPlay
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
            "300 帧 = 10.000s",
            "Noto Sans CJK",
            "无配音 · 字幕承载",
            "含原创配乐",
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
      </section>

      <section
        style={{
          marginTop: 22,
          border: "1px solid rgba(47,227,255,.22)",
          borderRadius: 14,
          padding: 18,
          background:
            "linear-gradient(180deg, rgba(47,227,255,.07), rgba(255,255,255,.015))",
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
          {isRunning ? "渲染中…" : `渲染 ${fmt(DURATION_SECONDS)} 秒样片`}
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
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 13, letterSpacing: 1.4, color: "rgba(233,243,255,.5)" }}>
            全片进度 · 16 镜 / {TOTAL_FRAMES} 帧 / {(TOTAL_FRAMES / FPS).toFixed(0)}s
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(233,243,255,.36)" }}>2 / 16 已出</div>
        </div>

        {SHOTS.map((s) => {
          const done = s.id <= 2;
          return (
            <div
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "34px 118px 1fr 52px",
                alignItems: "center",
                gap: 8,
                padding: "7px 0",
                borderTop: "1px solid rgba(233,243,255,.07)",
                fontSize: 13.5,
                color: done ? "rgba(233,243,255,.9)" : "rgba(233,243,255,.42)",
              }}
            >
              <span style={{ fontFamily: "ui-monospace, monospace", opacity: 0.7 }}>
                {String(s.id).padStart(2, "0")}
              </span>
              <span style={{ fontFamily: "ui-monospace, monospace", opacity: 0.66 }}>{s.tc}</span>
              <span>{s.title}</span>
              <span
                style={{
                  fontSize: 11.5,
                  textAlign: "right",
                  color: done ? "#2FE3FF" : "rgba(233,243,255,.3)",
                }}
              >
                {done ? "已出" : "待做"}
              </span>
            </div>
          );
        })}
      </section>

      <p
        style={{
          margin: "22px 0 0",
          fontSize: 12.5,
          lineHeight: 1.85,
          color: "rgba(233,243,255,.4)",
        }}
      >
        时间轴按 30fps 严格对齐脚本：镜 1 = 0–180 帧（00:00–00:06），镜 2 = 180–345 帧；
        样片取 0–300 帧收黑。字幕文本逐字照抄脚本，未做改写。动画只用 interpolate / spring。
      </p>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: 12.5,
          lineHeight: 1.85,
          color: "rgba(233,243,255,.4)",
        }}
      >
        渲染时请保持本页在前台、不要锁屏。10 秒样片在这台手机上预计 2–4 分钟。
      </p>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
