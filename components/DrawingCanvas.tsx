"use client";

import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useInput } from "@/lib/InputContext";

const CANVAS_SIZE = 280;
const GRID_SIZE = 28;

function downsampleToGrid(canvas: HTMLCanvasElement): Float32Array {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = GRID_SIZE;
  tempCanvas.height = GRID_SIZE;
  const tempCtx = tempCanvas.getContext("2d")!;

  tempCtx.fillStyle = "black";
  tempCtx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
  tempCtx.drawImage(canvas, 0, 0, GRID_SIZE, GRID_SIZE);

  const imageData = tempCtx.getImageData(0, 0, GRID_SIZE, GRID_SIZE);
  const pixels = new Float32Array(GRID_SIZE * GRID_SIZE);

  for (let i = 0; i < pixels.length; i++) {
    // MNIST is white-on-black, so invert: canvas has black bg with white strokes
    pixels[i] = imageData.data[i * 4] / 255;
  }

  return pixels;
}

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const { setInput } = useInput();

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, [getCtx]);

  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  const emitPixels = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pixels = downsampleToGrid(canvas);
    setInput(pixels, "drawn");
  }, [setInput]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scale,
        y: (touch.clientY - rect.top) * scale,
      };
    }
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawingRef.current = true;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      emitPixels();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-[var(--fg-muted)]">
        Draw a digit
      </p>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full max-w-[280px] cursor-crosshair rounded-lg border border-[var(--border-custom)]"
        style={{ touchAction: "none" }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          clearCanvas();
          // Don't clear input to avoid flash; user can draw again
        }}
      >
        Clear
      </Button>
    </div>
  );
}
