"use client";

import { motion } from "framer-motion";

interface PredictionBarsProps {
  probs: number[] | null;
  prediction: number | null;
}

export function PredictionBars({ probs, prediction }: PredictionBarsProps) {
  return (
    <div className="w-full">
      <p className="mb-2 text-center text-sm font-medium text-[var(--fg)]">
        Prediction
      </p>
      <div className="space-y-1.5">
        {Array.from({ length: 10 }).map((_, digit) => {
          const prob = probs ? probs[digit] : 0;
          const isTop = prediction === digit && probs !== null;
          return (
            <div key={digit} className="flex items-center gap-2">
              <span
                className={`w-4 text-right text-sm font-medium ${
                  isTop ? "text-[var(--accent)]" : "text-[var(--fg-muted)]"
                }`}
              >
                {digit}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-[var(--fg)]/5">
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded ${
                    isTop ? "bg-[var(--accent)]" : "bg-[var(--fg)]/20"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${prob * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <span
                className={`w-12 text-right text-xs ${
                  isTop ? "font-medium text-[var(--accent)]" : "text-[var(--fg-muted)]"
                }`}
              >
                {probs ? `${(prob * 100).toFixed(1)}%` : ""}
              </span>
            </div>
          );
        })}
      </div>
      {probs && prediction !== null && (
        <div className="mt-3 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-2 text-center">
          <span className="text-sm text-[var(--fg-muted)]">Predicted: </span>
          <span className="font-heading text-2xl font-semibold text-[var(--accent)]">
            {prediction}
          </span>
          <span className="ml-1 text-sm text-[var(--fg-muted)]">
            ({(probs[prediction] * 100).toFixed(1)}% confidence)
          </span>
        </div>
      )}
    </div>
  );
}
