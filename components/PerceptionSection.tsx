"use client";

import { useEffect, useState, useTransition } from "react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Prose } from "@/components/layout/Prose";
import { FeatureMapGrid } from "@/components/FeatureMapGrid";
import { PredictionBars } from "@/components/PredictionBars";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { SamplePicker } from "@/components/SamplePicker";
import { useInput } from "@/lib/InputContext";
import { useModel } from "@/hooks/useModel";
import { runInference } from "@/lib/inference";
import type { InferenceResult } from "@/lib/inference";

export function PerceptionSection() {
  const { pixels } = useInput();
  const { session, isReady } = useModel();
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!pixels || !session || !isReady) {
      setResult(null);
      return;
    }

    startTransition(() => {
      runInference(session, pixels).then(setResult);
    });
  }, [pixels, session, isReady]);

  return (
    <Section id="perception" wide>
      <SectionHeader
        eyebrow="Part Two"
        title="Perception"
        subtitle="Building meaning from raw signals"
      />

      <Prose>
        <p>
          The retina sends its raw signals to the visual cortex, where something
          remarkable happens. In 1959, David Hubel and Torsten Wiesel stuck
          electrodes into the visual cortex of a cat and discovered that
          individual neurons fired selectively — some only for horizontal edges,
          some only for vertical ones, some only for edges moving in a
          particular direction. Their work, which won the 1981 Nobel Prize,
          revealed that the brain builds up visual understanding in layers:
          simple features first, then combinations of features, then whole
          objects.
        </p>
        <p>
          This is <em>perception</em> — the active construction of meaning from
          raw sensation. A convolutional neural network works the same way. The
          first layer below contains eight &ldquo;neurons,&rdquo; each looking
          for a specific simple pattern. Some learn to detect edges, others
          respond to curves or blobs. The second layer combines these detections
          into richer patterns. By the time the signal reaches the end, the
          network has assembled enough evidence to guess a digit.
        </p>
        <p>
          What you see in each tile is literally what that neuron &ldquo;cares
          about&rdquo; — bright regions mean the neuron is firing strongly for
          that part of the image. Try different inputs and watch the patterns
          shift. This is roughly analogous to the way neurons in your V1 cortex
          respond to the stimuli in front of you right now.
        </p>
      </Prose>

      <div className="mt-14">
        {!pixels && (
          <p className="mb-8 text-center text-[var(--fg-muted)]">
            Draw or select a digit above to see the network in action.
          </p>
        )}

        {/* Drawing + predictions side by side */}
        <div className="mb-10 flex flex-col items-center gap-8 md:flex-row md:justify-center md:items-start">
          <div className="flex flex-col items-center gap-4">
            <DrawingCanvas />
            <SamplePicker />
          </div>
          <div className="w-full max-w-[240px]">
            <PredictionBars
              probs={result?.probs ?? null}
              prediction={result?.prediction ?? null}
            />
          </div>
        </div>

        {/* Feature maps */}
        <div className="grid items-start gap-8 md:grid-cols-[1fr_1fr_1.5fr]">
          {/* Input preview */}
          <div className="text-center">
            <p className="mb-2 text-sm font-medium text-[var(--fg)]">Input</p>
            <p className="mb-2 text-xs text-[var(--fg-muted)]">28 x 28</p>
            <div className="mx-auto aspect-square w-full max-w-[80px] overflow-hidden rounded border border-[var(--border-custom)] bg-black">
              {pixels && <InputPreview pixels={pixels} />}
            </div>
          </div>

          {/* Conv1 */}
          <FeatureMapGrid
            data={result?.conv1 ?? null}
            channels={8}
            size={28}
            cols={4}
            label="First layer"
            sublabel="Edges and strokes"
          />

          {/* Conv2 */}
          <FeatureMapGrid
            data={result?.conv2 ?? null}
            channels={16}
            size={14}
            cols={4}
            label="Second layer"
            sublabel="Combinations"
          />
        </div>
      </div>
    </Section>
  );
}

function InputPreview({ pixels }: { pixels: Float32Array }) {
  const canvasRef = { current: null as HTMLCanvasElement | null };

  return (
    <canvas
      ref={(el) => {
        if (!el) return;
        canvasRef.current = el;
        const ctx = el.getContext("2d")!;
        const imageData = ctx.createImageData(28, 28);
        for (let i = 0; i < 784; i++) {
          const v = Math.round(pixels[i] * 255);
          imageData.data[i * 4] = v;
          imageData.data[i * 4 + 1] = v;
          imageData.data[i * 4 + 2] = v;
          imageData.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      }}
      width={28}
      height={28}
      className="h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
