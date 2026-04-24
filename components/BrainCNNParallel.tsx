"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";

interface StageProps {
  label: string;
  sublabel: string;
  color: string;
  delay: number;
}

function Stage({ label, sublabel, color, delay }: StageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col items-center gap-1"
    >
      <div
        className="flex h-16 w-full items-center justify-center rounded-lg border px-3 text-center text-sm font-medium"
        style={{
          borderColor: color,
          backgroundColor: `${color}0D`,
          color: "var(--fg)",
        }}
      >
        {label}
      </div>
      <p className="text-xs text-[var(--fg-muted)]">{sublabel}</p>
    </motion.div>
  );
}

function Arrow({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-center text-[var(--fg-muted)]"
    >
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
        <path
          d="M4 8h14M14 3l4 5-4 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

const BRAIN_STAGES: StageProps[] = [
  { label: "Retina", sublabel: "Transduction", color: "#c2410c", delay: 0 },
  { label: "V1 Simple Cells", sublabel: "Edges & orientation", color: "#c2410c", delay: 0.15 },
  { label: "V2/V4 Complex Cells", sublabel: "Shapes & patterns", color: "#c2410c", delay: 0.3 },
  { label: "Inferotemporal Cortex", sublabel: "Object recognition", color: "#c2410c", delay: 0.45 },
];

const CNN_STAGES: StageProps[] = [
  { label: "Pixel Input", sublabel: "28 × 28 values", color: "#1a1a1a", delay: 0 },
  { label: "Conv Layer 1", sublabel: "8 edge detectors", color: "#1a1a1a", delay: 0.15 },
  { label: "Conv Layer 2", sublabel: "16 pattern combiners", color: "#1a1a1a", delay: 0.3 },
  { label: "Dense Layer", sublabel: "Digit classification", color: "#1a1a1a", delay: 0.45 },
];

function PipelineRow({
  label,
  stages,
}: {
  label: string;
  stages: StageProps[];
}) {
  return (
    <div>
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">
        {label}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
        {stages.map((stage, i) => (
          <Fragment key={stage.label}>
            {i > 0 && <Arrow delay={stage.delay - 0.05} />}
            <Stage {...stage} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function VerticalConnectors() {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
      {[0, 1, 2, 3].map((i) => (
        <Fragment key={i}>
          {i > 0 && <div />}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: i * 0.15 + 0.1 }}
            className="flex justify-center"
          >
            <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
              <path
                d="M8 4v18M4 18l4 4 4-4"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="3 3"
              />
            </svg>
          </motion.div>
        </Fragment>
      ))}
    </div>
  );
}

export function BrainCNNParallel() {
  return (
    <div className="mx-auto max-w-[780px] overflow-x-auto">
      <div className="min-w-[600px] space-y-3">
        <PipelineRow label="Biological Vision" stages={BRAIN_STAGES} />
        <VerticalConnectors />
        <PipelineRow label="Convolutional Neural Network" stages={CNN_STAGES} />
      </div>
    </div>
  );
}
