"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Prose } from "@/components/layout/Prose";
import { FeatureMapGrid } from "@/components/FeatureMapGrid";
import { PredictionBars } from "@/components/PredictionBars";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { SamplePicker } from "@/components/SamplePicker";
import { BrainCNNParallel } from "@/components/BrainCNNParallel";
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
    if (!pixels || !session || !isReady) return;

    let cancelled = false;
    startTransition(() => {
      runInference(session, pixels).then((r) => {
        if (!cancelled) setResult(r);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [pixels, session, isReady]);

  const displayResult = pixels ? result : null;

  return (
    <Section id="perception" wide>
      <SectionHeader
        eyebrow="Part Two"
        title="Perception"
        subtitle="Building meaning from raw signals"
      />

      <Prose>
        <p>
          Perception is the process of constructing meaning from the raw
          electrical signals that sensation produces. In 1959, Hubel and
          Wiesel put electrodes into the visual cortex of a cat and found that
          individual neurons fired selectively. Some only responded to
          horizontal edges, some only to vertical ones, and some only to edges
          moving in a specific direction. Their work showed that the brain
          builds up visual understanding in layers: simple cells in V1 detect
          edges, complex cells in V2 and V4 combine those edges into shapes,
          and neurons further down the pipeline respond to whole objects.
        </p>
        <p>
          A CNN builds perception the same way. It&rsquo;s made up of layers
          of artificial neurons, and each neuron processes its inputs with
          certain weights. When a handwritten 7 is inputted, it fires a
          different set of neurons at different strengths than if a
          handwritten 3 were inputted. This mirrors exactly how human brain
          neurons work.
        </p>
        <p>
          The diagram below maps each stage of the CNN onto its biological
          counterpart. The first convolutional layer&rsquo;s eight neurons act
          like V1 simple cells, each learning to detect a simple feature like
          an edge or a stroke. The second layer&rsquo;s sixteen neurons
          combine those features into more complex patterns, similar to what
          V2 and V4 cells do. The final dense layer pools everything into the
          model&rsquo;s best guess at what it perceived.
        </p>
      </Prose>

      <div className="mt-10 mb-4">
        <BrainCNNParallel />
      </div>

      <Prose>
        <p>
          Each tile below shows what a single neuron is actually looking at.
          Bright regions mean the neuron is firing strongly for that part of
          the image. Try different inputs and watch the patterns change. This
          is roughly what neurons in your own V1 cortex are doing right now as
          you read this.
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
              probs={displayResult?.probs ?? null}
              prediction={displayResult?.prediction ?? null}
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
            data={displayResult?.conv1 ?? null}
            channels={8}
            size={28}
            cols={4}
            label="First layer"
            sublabel="Edges and strokes"
          />

          {/* Conv2 */}
          <FeatureMapGrid
            data={displayResult?.conv2 ?? null}
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
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
  }, [pixels]);

  return (
    <canvas
      ref={canvasRef}
      width={28}
      height={28}
      className="h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
