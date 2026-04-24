"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Prose } from "@/components/layout/Prose";
import { Button } from "@/components/ui/button";
import { useInput } from "@/lib/InputContext";
import { useModel } from "@/hooks/useModel";
import { runInference } from "@/lib/inference";

// Plasma-like colormap: blue -> purple -> orange -> yellow
function plasmaColor(t: number): [number, number, number] {
  const r = Math.round(
    Math.min(255, Math.max(0, -510 * t * t + 770 * t - 5))
  );
  const g = Math.round(Math.min(255, Math.max(0, 255 * (t - 0.5) * 2)));
  const b = Math.round(
    Math.min(255, Math.max(0, 255 * (1 - t * 1.5)))
  );
  return [r, g, b];
}

function bilinearUpsample(
  src: Float32Array,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Float32Array {
  const dst = new Float32Array(dstW * dstH);
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const sx = (x / dstW) * srcW;
      const sy = (y / dstH) * srcH;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const y1 = Math.min(y0 + 1, srcH - 1);
      const fx = sx - x0;
      const fy = sy - y0;

      dst[y * dstW + x] =
        src[y0 * srcW + x0] * (1 - fx) * (1 - fy) +
        src[y0 * srcW + x1] * fx * (1 - fy) +
        src[y1 * srcW + x0] * (1 - fx) * fy +
        src[y1 * srcW + x1] * fx * fy;
    }
  }
  return dst;
}

function computeActivationHeatmap(conv2: Float32Array): Float32Array {
  // conv2 shape: [16, 14, 14] -> max across channels -> 14x14
  const mapSize = 14;
  const channels = 16;
  const heatmap14 = new Float32Array(mapSize * mapSize);

  for (let i = 0; i < mapSize * mapSize; i++) {
    let max = -Infinity;
    for (let c = 0; c < channels; c++) {
      const v = conv2[c * mapSize * mapSize + i];
      if (v > max) max = v;
    }
    heatmap14[i] = max;
  }

  // Upsample to 28x28
  const heatmap28 = bilinearUpsample(heatmap14, 14, 14, 28, 28);

  // Normalize to [0, 1]
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < heatmap28.length; i++) {
    if (heatmap28[i] < min) min = heatmap28[i];
    if (heatmap28[i] > max) max = heatmap28[i];
  }
  const range = max - min || 1;
  for (let i = 0; i < heatmap28.length; i++) {
    heatmap28[i] = (heatmap28[i] - min) / range;
  }

  return heatmap28;
}

function renderOverlay(
  canvas: HTMLCanvasElement,
  pixels: Float32Array,
  heatmap: Float32Array,
  showHeatmap: boolean
) {
  const size = 28;
  const displaySize = 280;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);

  for (let i = 0; i < size * size; i++) {
    const v = Math.round(pixels[i] * 255);
    if (showHeatmap) {
      const t = heatmap[i];
      const [hr, hg, hb] = plasmaColor(t);
      const alpha = t * 0.65;
      imageData.data[i * 4] = Math.round(v * (1 - alpha) + hr * alpha);
      imageData.data[i * 4 + 1] = Math.round(v * (1 - alpha) + hg * alpha);
      imageData.data[i * 4 + 2] = Math.round(v * (1 - alpha) + hb * alpha);
    } else {
      imageData.data[i * 4] = v;
      imageData.data[i * 4 + 1] = v;
      imageData.data[i * 4 + 2] = v;
    }
    imageData.data[i * 4 + 3] = 255;
  }

  // Draw to a temp canvas then scale up
  const temp = document.createElement("canvas");
  temp.width = size;
  temp.height = size;
  temp.getContext("2d")!.putImageData(imageData, 0, 0);

  canvas.width = displaySize;
  canvas.height = displaySize;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(temp, 0, 0, displaySize, displaySize);
}

export function AttentionSection() {
  const { pixels, source, sourceDigit } = useInput();
  const { session, isReady } = useModel();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmap, setHeatmap] = useState<Float32Array | null>(null);
  const [isGradCam, setIsGradCam] = useState(false);
  const inputCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Compute heatmap
  useEffect(() => {
    if (!pixels) {
      setHeatmap(null);
      return;
    }

    if (source === "sample" && sourceDigit !== undefined) {
      // Load pre-computed Grad-CAM
      fetch("/build_a_brain_assets/samples/gradcams.json")
        .then((r) => r.json())
        .then((data) => {
          const gcData = data[String(sourceDigit)] as number[][];
          const flat = new Float32Array(28 * 28);
          for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
              flat[y * 28 + x] = gcData[y][x];
            }
          }
          setHeatmap(flat);
          setIsGradCam(true);
        });
    } else if (session && isReady) {
      // Compute activation-based proxy
      runInference(session, pixels).then((result) => {
        const h = computeActivationHeatmap(result.conv2);
        setHeatmap(h);
        setIsGradCam(false);
      });
    }
  }, [pixels, source, sourceDigit, session, isReady]);

  // Render canvases
  useEffect(() => {
    if (!pixels || !inputCanvasRef.current || !overlayCanvasRef.current) return;
    renderOverlay(inputCanvasRef.current, pixels, heatmap ?? new Float32Array(784), false);
    renderOverlay(
      overlayCanvasRef.current,
      pixels,
      heatmap ?? new Float32Array(784),
      showHeatmap
    );
  }, [pixels, heatmap, showHeatmap]);

  return (
    <Section id="attention" wide>
      <SectionHeader
        eyebrow="Part Three"
        title="Attention"
        subtitle="What the network chose to care about"
      />

      <Prose>
        <p>
          Your brain doesn&rsquo;t have the bandwidth to fully process
          everything hitting your retina. In 1964, Anne Treisman proposed
          the <em>filter attenuation model</em>, which argues that unattended
          information isn&rsquo;t completely blocked — it&rsquo;s just turned
          down, like lowering the volume on a background conversation. The
          important signals get amplified; the rest are attenuated but not
          silenced.
        </p>
        <p>
          A CNN learns something strikingly similar during training. Each
          weight in the network represents how much attention that neuron pays
          to a particular feature. For parts of the input that matter — the
          curves that distinguish a &ldquo;3&rdquo; from an &ldquo;8,&rdquo;
          say — the network learns large weight values, amplifying those
          signals. For parts that don&rsquo;t matter, the weights stay small,
          effectively attenuating that information. This is Treisman&rsquo;s
          filter, implemented in linear algebra.
        </p>
        <p>
          We can visualize this using a technique called Grad-CAM, which asks
          the network: &ldquo;if this pixel had been different, how much would
          the answer have changed?&rdquo; The resulting heatmap is a{" "}
          <em>spotlight of attention</em> — it reveals which regions of the
          input the network weighted most heavily for its decision. Toggle
          the overlay below and notice how the hot spots cluster around the
          most diagnostic features of the digit, not the empty background.
          The model learned what to care about and what to ignore.
        </p>
      </Prose>

      <div className="mx-auto mt-14 max-w-xl">
        {!pixels && (
          <p className="text-center text-[var(--fg-muted)]">
            Draw or select a digit above to see attention maps.
          </p>
        )}

        {pixels && (
          <>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="mb-2 text-sm font-medium text-[var(--fg)]">
                  Input
                </p>
                <canvas
                  ref={inputCanvasRef}
                  className="w-full max-w-[280px] rounded-lg border border-[var(--border-custom)]"
                />
              </div>
              <div className="text-center">
                <p className="mb-2 text-sm font-medium text-[var(--fg)]">
                  {showHeatmap ? "With attention overlay" : "Input"}
                </p>
                <canvas
                  ref={overlayCanvasRef}
                  className="w-full max-w-[280px] rounded-lg border border-[var(--border-custom)]"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <Button
                variant={showHeatmap ? "default" : "outline"}
                onClick={() => setShowHeatmap((v) => !v)}
                className={
                  showHeatmap
                    ? "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
                    : ""
                }
              >
                {showHeatmap ? "Hide attention" : "Show attention"}
              </Button>

              {!isGradCam && heatmap && (
                <p className="max-w-sm text-center text-xs italic text-[var(--fg-muted)]">
                  For drawn digits, we show activation intensity as a proxy;
                  true Grad-CAM requires gradient computation.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
