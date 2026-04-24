"use client";

import { useRef, useEffect, useState } from "react";
import { useInput } from "@/lib/InputContext";

const DISPLAY_SIZE = 392;
const GRID_SIZE = 28;
const CELL_SIZE = DISPLAY_SIZE / GRID_SIZE;

export function PixelGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pixels } = useInput();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);

    if (!pixels) return;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const val = pixels[row * GRID_SIZE + col];
        const v = Math.round(val * 255);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(
          col * CELL_SIZE + 0.5,
          row * CELL_SIZE + 0.5,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );
      }
    }
  }, [pixels]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!pixels) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = DISPLAY_SIZE / rect.width;
    const x = Math.floor(((e.clientX - rect.left) * scale) / CELL_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * scale) / CELL_SIZE);
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        value: pixels[y * GRID_SIZE + x],
      });
    } else {
      setTooltip(null);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[392px]">
      <p className="mb-2 text-center text-sm font-medium text-[var(--fg-muted)]">
        28 x 28 pixel grid
      </p>
      <canvas
        ref={canvasRef}
        width={DISPLAY_SIZE}
        height={DISPLAY_SIZE}
        className="w-full rounded-lg border border-[var(--border-custom)]"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute rounded bg-[var(--fg)] px-2 py-1 text-xs text-[var(--bg)]"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 28,
          }}
        >
          {tooltip.value.toFixed(2)}
        </div>
      )}
    </div>
  );
}
