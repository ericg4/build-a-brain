import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Prose } from "@/components/layout/Prose";

export function TakeawaySection() {
  return (
    <Section id="takeaway">
      <SectionHeader
        eyebrow="Synthesis"
        title="What the machine teaches us about the mind"
      />

      <Prose>
        <p>
          Sensation, perception, and attention are not just three vocabulary
          words on a midterm. They represent a deep architectural insight about
          how information-processing systems — biological or artificial — must be
          organized. Sensation is cheap: it is the raw transduction of energy
          into signal. Perception is expensive: it requires hierarchical
          feature extraction, the kind of layered processing that Hubel and
          Wiesel found in the visual cortex and that convolutional neural
          networks replicate with remarkable fidelity. And attention is the
          missing piece that separates a system that works in a lab from one
          that works in the world.
        </p>
        <p>
          The parallels between brains and neural networks are not accidental.
          The architectures that work best in machine learning — convolutional
          layers, attention mechanisms, hierarchical representations — were
          inspired by decades of cognitive psychology and neuroscience research.
          Hubel and Wiesel&rsquo;s simple and complex cells became convolutional
          filters. Treisman&rsquo;s feature binding became self-attention. The
          engineering validated the psychology, and the psychology continues to
          guide the engineering. Understanding one helps you understand the
          other.
        </p>
      </Prose>
    </Section>
  );
}
