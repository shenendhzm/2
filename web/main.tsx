import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import type {
  WebRendererContainer,
  WebRendererVideoCodec,
} from "@remotion/web-renderer";
import { HelloWorld } from "../src/HelloWorld";

const COMPOSITION = {
  id: "HelloWorld",
  component: HelloWorld,
  durationInFrames: 150,
  fps: 30,
  width: 1280,
  height: 720,
  defaultProps: { title: "Remotion 部署成功" },
};

type Plan = {
  container: WebRendererContainer;
  videoCodec: WebRendererVideoCodec;
  note: string;
};

const PLANS: Plan[] = [
  { container: "mp4", videoCodec: "h264", note: "MP4 / H.264（通用性最好）" },
  { container: "webm", videoCodec: "vp8", note: "WebM / VP8（H.264 不可用时兜底）" },
];

const App: React.FC = () => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [checked, setChecked] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("待渲染");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; size: number; name: string } | null>(
    null,
  );
  const running = useRef(false);

  useEffect(() => {
    (async () => {
      const collected: string[] = [];
      for (const candidate of PLANS) {
        const check = await canRenderMediaOnWeb({
          container: candidate.container,
          videoCodec: candidate.videoCodec,
          width: COMPOSITION.width,
          height: COMPOSITION.height,
          muted: true,
        });
        if (check.canRender) {
          setPlan(candidate);
          setIssues(
            [...collected, ...check.issues.map((i) => `${i.severity}: ${i.message}`)].slice(
              0,
              6,
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
    })();
  }, []);

  const start = async () => {
    if (!plan || running.current) return;
    running.current = true;
    setError(null);
    setResult(null);
    setProgress(0);
    setStatus("准备中…");
    try {
      const rendered = await renderMediaOnWeb({
        composition: COMPOSITION,
        inputProps: COMPOSITION.defaultProps,
        container: plan.container,
        videoCodec: plan.videoCodec,
        muted: true,
        onProgress: ({ renderedFrames, encodedFrames }) => {
          const pct = Math.round((renderedFrames / COMPOSITION.durationInFrames) * 100);
          setProgress(pct);
          setStatus(`渲染中 ${renderedFrames}/${COMPOSITION.durationInFrames} 帧 · 已编码 ${encodedFrames}`);
        },
      });
      setStatus("封装文件…");
      const blob = await rendered.getBlob();
      const url = URL.createObjectURL(blob);
      setResult({
        url,
        size: blob.size,
        name: `helloworld.${plan.container}`,
      });
      setProgress(100);
      setStatus("完成");
    } catch (e) {
      setError(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      setStatus("失败");
    } finally {
      running.current = false;
    }
  };

  const planLabel = useMemo(
    () => (plan ? plan.note : checked ? "没有可用的编码组合" : "检测中…"),
    [plan, checked],
  );

  return (
    <main
      style={{
        fontFamily:
          '"Noto Sans CJK SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif',
        maxWidth: 760,
        margin: "0 auto",
        padding: "28px 20px 60px",
      }}
    >
      <h1 style={{ fontSize: 26, margin: "0 0 8px" }}>Remotion 浏览器渲染</h1>
      <p style={{ color: "rgba(255,255,255,.6)", margin: "0 0 22px", lineHeight: 1.7 }}>
        在手机浏览器里用 WebCodecs 逐帧渲染，不需要本地 Chromium。
      </p>

      <section
        style={{
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 14,
          padding: 18,
          background: "rgba(255,255,255,.03)",
        }}
      >
        <div style={{ fontSize: 14, color: "rgba(255,255,255,.55)" }}>编码方案</div>
        <div style={{ fontSize: 16, marginTop: 6 }}>{planLabel}</div>
        {issues.length > 0 && (
          <details style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,.45)" }}>
            <summary style={{ cursor: "pointer" }}>检测详情</summary>
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </details>
        )}

        <button
          onClick={start}
          disabled={!plan || running.current}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "14px 18px",
            fontSize: 17,
            fontWeight: 600,
            borderRadius: 10,
            border: "none",
            color: "#04121f",
            background: plan ? "linear-gradient(90deg,#54c8ff,#a06bff)" : "#39404f",
            cursor: plan ? "pointer" : "not-allowed",
          }}
        >
          渲染 5 秒 MP4
        </button>

        <div style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,.6)" }}>
          {status}
        </div>
        <div
          style={{
            marginTop: 8,
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
            }}
          >
            {error}
          </pre>
        )}
      </section>

      {result && (
        <section style={{ marginTop: 22 }}>
          <video
            src={result.url}
            controls
            playsInline
            style={{ width: "100%", borderRadius: 12, background: "#000" }}
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
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
