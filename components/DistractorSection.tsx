"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Prose } from "@/components/layout/Prose";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModel } from "@/hooks/useModel";
import { runInference } from "@/lib/inference";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type DistractorType = "gaussian_noise" | "occlusion" | "salt_pepper";

const DISTRACTOR_LABELS: Record<DistractorType, string> = {
  gaussian_noise: "Gaussian noise",
  occlusion: "Occlusion",
  salt_pepper: "Salt & pepper",
};

const DISTRACTOR_COLORS: Record<DistractorType, string> = {
  gaussian_noise: "#c2410c",
  occlusion: "#1a1a1a",
  salt_pepper: "#6b6b6b",
};

interface CurveData {
  intensities: number[];
  curves: Record<DistractorType, number[]>;
}

// Seeded RNG for reproducible distortions
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianRandom(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
}

function applyDistractor(
  pixels: Float32Array,
  type: DistractorType,
  intensity: number
): Float32Array {
  const result = new Float32Array(pixels);
  const rng = mulberry32(42);

  if (type === "gaussian_noise") {
    for (let i = 0; i < result.length; i++) {
      result[i] = Math.max(
        0,
        Math.min(1, result[i] + gaussianRandom(rng) * intensity)
      );
    }
  } else if (type === "occlusion") {
    const numRects = Math.floor(intensity * 8);
    const rectSize = Math.round(4 + intensity * 8);
    for (let r = 0; r < numRects; r++) {
      const rx = Math.floor(rng() * 28);
      const ry = Math.floor(rng() * 28);
      const fillVal = rng() > 0.5 ? 1 : 0;
      for (let dy = 0; dy < rectSize; dy++) {
        for (let dx = 0; dx < rectSize; dx++) {
          const x = rx + dx;
          const y = ry + dy;
          if (x < 28 && y < 28) {
            result[y * 28 + x] = fillVal;
          }
        }
      }
    }
  } else if (type === "salt_pepper") {
    for (let i = 0; i < result.length; i++) {
      const r = rng();
      if (r < intensity * 0.5) {
        result[i] = 0;
      } else if (r < intensity) {
        result[i] = 1;
      }
    }
  }

  return result;
}

function renderPixels(canvas: HTMLCanvasElement, pixels: Float32Array) {
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(28, 28);
  for (let i = 0; i < 784; i++) {
    const v = Math.round(pixels[i] * 255);
    imageData.data[i * 4] = v;
    imageData.data[i * 4 + 1] = v;
    imageData.data[i * 4 + 2] = v;
    imageData.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function DistractorSection() {
  const { session, isReady } = useModel();
  const [intensity, setIntensity] = useState(0);
  const [distractorType, setDistractorType] =
    useState<DistractorType>("gaussian_noise");
  const [selectedDigit, setSelectedDigit] = useState(7);
  const [basePixels, setBasePixels] = useState<Float32Array | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [curveData, setCurveData] = useState<CurveData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load curve data
  useEffect(() => {
    fetch("/build_a_brain_assets/distractor_curve.json")
      .then((r) => r.json())
      .then(setCurveData);
  }, []);

  // Load sample digit
  const loadDigit = useCallback((digit: number) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `/build_a_brain_assets/samples/digit_${digit}.png`;
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 28;
      c.height = 28;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 28, 28);
      const data = ctx.getImageData(0, 0, 28, 28);
      const pixels = new Float32Array(784);
      for (let i = 0; i < 784; i++) {
        pixels[i] = data.data[i * 4] / 255;
      }
      setBasePixels(pixels);
    };
  }, []);

  useEffect(() => {
    loadDigit(selectedDigit);
  }, [selectedDigit, loadDigit]);

  // Apply distractor and run inference
  useEffect(() => {
    if (!basePixels || !session || !isReady || !canvasRef.current) return;

    const distorted = applyDistractor(basePixels, distractorType, intensity);
    renderPixels(canvasRef.current, distorted);

    runInference(session, distorted).then((result) => {
      setPrediction(result.prediction);
      setConfidence(result.probs[result.prediction]);
    });
  }, [basePixels, distractorType, intensity, session, isReady]);

  // Build chart data
  const chartData = curveData
    ? curveData.intensities.map((x, i) => ({
        intensity: x,
        gaussian_noise: curveData.curves.gaussian_noise[i],
        occlusion: curveData.curves.occlusion[i],
        salt_pepper: curveData.curves.salt_pepper[i],
      }))
    : [];

  return (
    <Section id="distractor" wide>
      <SectionHeader
        eyebrow="Part Four"
        title="The Attention Problem"
        subtitle="What happens when the signal gets noisy"
      />

      <Prose>
        <p>
          In 1980, Anne Treisman proposed Feature Integration Theory, arguing
          that attention is the glue that binds features into objects. Without
          it, a system can detect basic features — color, orientation, motion —
          but it cannot reliably combine them when distractors crowd the scene.
          Think of it this way: our CNN processes every pixel with roughly
          equal priority before its learned weights filter out what&rsquo;s
          unimportant. It has no mechanism to proactively suppress noise the
          way your attentional system does.
        </p>
        <p>
          The demo below shows what happens when selective attention is absent.
          Drag the slider to inject noise, occlusion, or salt-and-pepper
          clutter into the input. Accuracy holds up for a while — the learned
          weights can tolerate mild distortion — but it collapses quickly.
          Even mediocre levels of distraction cause the model to fail, often
          predicting the same digit regardless of the actual input. This is
          exactly why selective attention matters for perception: without the
          ability to ignore irrelevant information, the system breaks down.
        </p>
        <p>
          Modern vision models like Vision Transformers include dedicated{" "}
          <em>attention modules</em> that learn to weight different parts of
          the input dynamically. These modules help the model understand
          context — which features belong together and which are background
          noise. In a meaningful sense, the engineering caught up with the
          psychology: once researchers built systems with something like
          Treisman&rsquo;s binding mechanism, performance on cluttered
          real-world images improved dramatically.
        </p>
      </Prose>

      <div className="mx-auto mt-14 max-w-[1000px]">
        {/* Controls */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <Tabs
            value={distractorType}
            onValueChange={(v) => setDistractorType(v as DistractorType)}
          >
            <TabsList>
              <TabsTrigger value="gaussian_noise">Gaussian noise</TabsTrigger>
              <TabsTrigger value="occlusion">Occlusion</TabsTrigger>
              <TabsTrigger value="salt_pepper">Salt &amp; pepper</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--fg-muted)]">Digit:</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDigit(d)}
                  className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                    selectedDigit === d
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--fg-muted)] hover:bg-[var(--fg)]/5"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid items-start gap-8 md:grid-cols-[200px_1fr]">
          {/* Left: distorted image + prediction */}
          <div className="flex flex-col items-center gap-4">
            <canvas
              ref={canvasRef}
              width={28}
              height={28}
              className="w-full max-w-[200px] rounded-lg border border-[var(--border-custom)]"
              style={{ imageRendering: "pixelated" }}
            />
            {prediction !== null && confidence !== null && (
              <div className="text-center">
                <p className="text-sm text-[var(--fg-muted)]">
                  Predicted:{" "}
                  <span className="font-heading text-xl font-semibold text-[var(--accent)]">
                    {prediction}
                  </span>
                </p>
                <p className="text-xs text-[var(--fg-muted)]">
                  {(confidence * 100).toFixed(1)}% confidence
                </p>
              </div>
            )}

            <div className="w-full max-w-[200px]">
              <label className="mb-1 block text-center text-xs text-[var(--fg-muted)]">
                Intensity: {intensity.toFixed(2)}
              </label>
              <Slider
                value={[intensity]}
                onValueChange={([v]) => setIntensity(v)}
                min={0}
                max={1}
                step={0.02}
              />
            </div>
          </div>

          {/* Right: accuracy curve chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-custom)"
                />
                <XAxis
                  dataKey="intensity"
                  label={{
                    value: "Distractor intensity",
                    position: "insideBottom",
                    offset: -5,
                    style: { fill: "var(--fg-muted)", fontSize: 12 },
                  }}
                  tick={{ fill: "var(--fg-muted)", fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 1]}
                  label={{
                    value: "Accuracy",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "var(--fg-muted)", fontSize: 12 },
                  }}
                  tick={{ fill: "var(--fg-muted)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg)",
                    border: "1px solid var(--border-custom)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [
                    `${(Number(value) * 100).toFixed(1)}%`,
                    DISTRACTOR_LABELS[name as DistractorType] ?? name,
                  ]}
                />
                <Legend
                  formatter={(value: string) =>
                    DISTRACTOR_LABELS[value as DistractorType] ?? value
                  }
                />
                {(
                  Object.keys(DISTRACTOR_COLORS) as DistractorType[]
                ).map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={DISTRACTOR_COLORS[key]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
                <ReferenceLine
                  x={intensity}
                  stroke="var(--accent)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Section>
  );
}
