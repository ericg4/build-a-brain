import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Prose } from "@/components/layout/Prose";

export function TakeawaySection() {
  return (
    <Section id="takeaway">
      <SectionHeader
        eyebrow="Synthesis"
        title="Wrapping it up"
      />

      <Prose>
        <p>
          Overall, my project shows how modern machine learning techniques,
          like neural networks, were inspired heavily by how the brain works.
          This CNN learns to sense through pixel input, perceives those raw
          signals through layers of neurons, and then filters what&rsquo;s
          important and what isn&rsquo;t through the training process. It
          learns to pay attention to only the important features.
        </p>
        <p>
          While this works pretty effectively on clean inputs, without a
          dedicated attention module it struggles badly with distractions —
          the same way a human who couldn&rsquo;t deploy attention would
          struggle to process all the jumbled meaningless information hitting
          their senses. Newer models have specific attention modules built-in
          that help them understand more context about what they&rsquo;re
          looking at, which is a huge part of why they work so well on
          real-world images.
        </p>
        <p>
          Seeing the CNN and the brain side by side makes it really clear that
          the parallels aren&rsquo;t coincidental. Hubel and Wiesel&rsquo;s
          simple and complex cells became convolutional filters.
          Treisman&rsquo;s ideas about attention became attention modules. The
          engineering grew directly out of the psychology, and understanding
          one helps you understand the other.
        </p>
      </Prose>
    </Section>
  );
}
