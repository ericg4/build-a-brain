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
          Sensation is the process of receiving signals from the outside world
          and converting them into electrical signals inside the brain. When
          you look at a handwritten 7, photons hit the rods and cones in your
          retina, and a process called <em>transduction</em> turns that
          physical energy into electrical signals. At this stage there is no
          recognition yet. No meaning. Only data.
        </p>
        <p>
          A convolutional neural network starts the exact same way. Before it
          can do anything useful, the image has to be reduced to numbers. A
          28x28 pixel grid becomes 784 greyscale intensity values between 0
          (black) and 1 (white). This mirrors exactly how the retina converts
          photons into electrical signals. The numbers by themselves mean
          nothing. It&rsquo;s just raw input. Try drawing a digit below, or
          pick one of the samples, and you&rsquo;ll see the grid of greys that
          the model actually sees.
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
