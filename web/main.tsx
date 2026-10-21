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
  BlackSample,
  CoralAccentSample,
  CyanAccentSample,
  SilverAccentSample,
  VioletAccentSample,
  CrtSample,
  ForestSample,
  GoldSample,
  VioletSample,
  BlueprintSample,
  NeonSample,
  PaperSample,
  SwissSample,
  WarmSample,
} from "../src/samples";

const FPS = 30;
const DURATION = 330;
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
    note: "黑底 · 米白制图线 · 红标注",
    file: "黑底",
    chip: ["#000000", "#E5484D"],
    component: BlackSample,
  },
  {
    id: "TauLawNeon",
    label: "深色霓虹",
    note: "发布会 HUD · 青蓝发光",
    file: "霓虹",
    chip: ["#060A12", "#2BE3C9"],
    component: NeonSample,
  },
  {
    id: "TauLawPaper",
    label: "纸面工程图",
    note: "米白图纸 · 黑墨红线",
    file: "纸面",
    chip: ["#F3EEE4", "#C8402A"],
    component: PaperSample,
  },
  {
    id: "TauLawBlueprint",
    label: "蓝图制图",
    note: "深蓝底 · 白色制图线",
    file: "蓝图",
    chip: ["#0A2A46", "#EAF3FA"],
    component: BlueprintSample,
  },
  {
    id: "TauLawWarm",
    label: "暖调杂志",
    note: "奶油底 · 深绿与陶土红",
    file: "暖调",
    chip: ["#F6E9D6", "#D9542B"],
    component: WarmSample,
  },
  {
    id: "TauLawSwiss",
    label: "瑞士极简",
    note: "纯白 · 黑字 · 单一红",
    file: "瑞士",
    chip: ["#FFFFFF", "#E30613"],
    component: SwissSample,
  },
  {
    id: "TauLawGold",
    label: "黑金",
    note: "黑底 · 琥珀金 · 细线",
    file: "黑金",
    chip: ["#0B0906", "#E0A94A"],
    component: GoldSample,
  },
  {
    id: "TauLawForest",
    label: "墨绿",
    note: "深绿 · 米白 · 黄铜",
    file: "墨绿",
    chip: ["#0D231B", "#D9A05B"],
    component: ForestSample,
  },
  {
    id: "TauLawCrt",
    label: "CRT 终端",
    note: "荧光绿 · 扫描线 · 终端",
    file: "CRT",
    chip: ["#020604", "#8CFFB0"],
    component: CrtSample,
  },
  {
    id: "TauLawViolet",
    label: "深紫夜幕",
    note: "夜幕紫 · 浅紫 · 珊瑚",
    file: "深紫",
    chip: ["#130B24", "#FF8A65"],
    component: VioletSample,
  },
  {
    id: "TauLawCyan",
    label: "黑青",
    note: "黑底 · 青色替代金",
    file: "黑青",
    chip: ["#0B0906", "#35E0D0"],
    component: CyanAccentSample,
  },
  {
    id: "TauLawCoral",
    label: "黑珊瑚",
    note: "黑底 · 珊瑚橙替代金",
    file: "黑珊瑚",
    chip: ["#0B0906", "#FF7A59"],
    component: CoralAccentSample,
  },
  {
    id: "TauLawAmethyst",
    label: "黑紫",
    note: "黑底 · 紫罗兰替代金",
    file: "黑紫",
    chip: ["#0B0906", "#A78BFA"],
    component: VioletAccentSample,
  },
  {
    id: "TauLawSilver",
    label: "黑银",
    note: "黑底 · 银灰替代金",
    file: "黑银",
    chip: ["#0B0906", "#C9D1D9"],
    component: SilverAccentSample,
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
        name: `韬定律-样片-${style.file}.${plan.container}`,
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
        韬（τ）定律 · 11 秒样片｜十四种风格
      </h1>
      <p style={{ color: "rgba(255,255,255,.58)", margin: "0 0 22px", lineHeight: 1.75 }}>
        同一个镜头、同一条 47 条字幕时间轴，只换视觉语言。点开对比，选一个我就按它做完整片。
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
        <div>字幕：47 条 SRT 全文已内置，本次显示前 4 条，文本未改</div>
        <div>音频：pad + 55Hz 次低音；2.45s 卡尺咬合 · 6.9s 扫光 · 9.05s τ 落版</div>
      </div>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
