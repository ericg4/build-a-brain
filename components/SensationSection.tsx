"use client";

import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Prose } from "@/components/layout/Prose";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { SamplePicker } from "@/components/SamplePicker";
import { PixelGrid } from "@/components/PixelGrid";

export function SensationSection() {
  return (
    <Section id="sensation" wide>
      <SectionHeader
        eyebrow="Part One"
        title="Sensation"
        subtitle="From photons to pixels"
      />

      <Prose>
        <p>
          Before you can recognize a face, read a word, or catch a ball,
          something much simpler has to happen. Photons strike the
          photoreceptors in your retina and get converted into electrical
          signals. This is <em>sensation</em> — the raw conversion of physical
          energy into neural activity, with no interpretation attached. A
          &ldquo;7&rdquo; at this stage is just a pattern of firing rates. There
          is no number, no meaning, no recognition; only data.
        </p>
        <p>
          A convolutional neural network begins the same way. Before it can do
          anything intelligent, an image must be reduced to numbers. A
          28-by-28 pixel grid becomes 784 intensity values between 0 (black)
          and 1 (white). Try drawing a digit below, or pick one of the samples.
          Notice that the pixels themselves are meaningless — a grid of grays.
          Meaning comes later.
        </p>
      </Prose>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
          <DrawingCanvas />
          <SamplePicker />
        </div>
        <PixelGrid />
      </div>
    </Section>
  );
}
