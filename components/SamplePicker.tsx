"use client";

import { useCallback } from "react";
import { useInput } from "@/lib/InputContext";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function SamplePicker() {
  const { setInput, sourceDigit, source } = useInput();

  const loadSample = useCallback(
    async (digit: number) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `/build_a_brain_assets/samples/digit_${digit}.png`;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 28;
      canvas.height = 28;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 28, 28);
      const imageData = ctx.getImageData(0, 0, 28, 28);

      const pixels = new Float32Array(784);
      for (let i = 0; i < 784; i++) {
        pixels[i] = imageData.data[i * 4] / 255;
      }

      setInput(pixels, "sample", digit);
    },
    [setInput]
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-[var(--fg-muted)]">
        Or pick a sample
      </p>
      <div className="grid grid-cols-5 gap-2">
        {DIGITS.map((d) => (
          <button
            key={d}
            onClick={() => loadSample(d)}
            className={`flex h-14 w-14 items-center justify-center rounded-lg border text-lg font-medium transition-colors ${
              source === "sample" && sourceDigit === d
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border-custom)] text-[var(--fg-muted)] hover:border-[var(--fg-muted)]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
