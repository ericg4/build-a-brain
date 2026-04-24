"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface FeatureMapGridProps {
  data: Float32Array | null;
  channels: number;
  size: number;
  cols: number;
  label: string;
  sublabel: string;
}

function renderFeatureMap(
  canvas: HTMLCanvasElement,
  data: Float32Array,
  offset: number,
  size: number
) {
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);

  // Find min/max for this channel
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < size * size; i++) {
    const v = data[offset + i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;

  for (let i = 0; i < size * size; i++) {
    const t = (data[offset + i] - min) / range;
    // Amber gradient: dark brown to bright amber
    const r = Math.round(t * 252);
    const g = Math.round(t * 141);
    const b = Math.round(t * 98 + (1 - t) * 30);
    imageData.data[i * 4] = r;
    imageData.data[i * 4 + 1] = g;
    imageData.data[i * 4 + 2] = b;
    imageData.data[i * 4 + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

function FeatureMapTile({
  data,
  channelIndex,
  size,
  delay,
}: {
  data: Float32Array;
  channelIndex: number;
  size: number;
  delay: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderFeatureMap(canvasRef.current, data, channelIndex * size * size, size);
  }, [data, channelIndex, size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full rounded border border-[var(--border-custom)]"
      />
    </motion.div>
  );
}

export function FeatureMapGrid({
  data,
  channels,
  size,
  cols,
  label,
  sublabel,
}: FeatureMapGridProps) {
  if (!data) {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--fg-muted)]">{label}</p>
        <p className="text-xs text-[var(--fg-muted)]">{sublabel}</p>
        <div
          className="mt-2 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: channels }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded border border-[var(--border-custom)] bg-[var(--fg)]/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-[var(--fg)]">{label}</p>
      <p className="mb-2 text-xs text-[var(--fg-muted)]">{sublabel}</p>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: channels }).map((_, i) => (
          <FeatureMapTile
            key={`${i}-${data.length}`}
            data={data}
            channelIndex={i}
            size={size}
            delay={i * 0.03}
          />
        ))}
      </div>
    </div>
  );
}
