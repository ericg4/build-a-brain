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
          how information-processing systems — biological or artificial — must
          be organized. Sensation is transduction: the cheap, mechanical
          conversion of energy into signal. Perception is construction: the
          expensive, hierarchical extraction of features that Hubel and Wiesel
          found in the visual cortex and that convolutional layers replicate
          with remarkable fidelity. And attention is selection: the mechanism
          that separates a system that works in a quiet lab from one that works
          in the messy, noisy world.
        </p>
        <p>
          This CNN learns to sense through pixel input, perceives through
          layers of artificial neurons whose weights parallel synaptic
          strengths, and filters what matters through its training process —
          amplifying important features and attenuating irrelevant ones, much
          as Treisman&rsquo;s filter attenuation model describes. Yet without
          a dedicated attention module, it crumbles in the face of
          distractions, just as a human who cannot deploy selective attention
          would be overwhelmed by the jumbled sensory world.
        </p>
        <p>
          The parallels between brains and neural networks are not accidental.
          Hubel and Wiesel&rsquo;s simple and complex cells became
          convolutional filters. Treisman&rsquo;s feature binding became
          self-attention. The engineering validated the psychology, and the
          psychology continues to guide the engineering. Understanding one
          helps you understand the other.
        </p>
      </Prose>
    </Section>
  );
}
