import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Prose } from "@/components/layout/Prose";

export default function Home() {
  return (
    <main>
      <Section>
        <SectionHeader
          eyebrow="A Cognitive Psychology Project"
          title="How does a brain see?"
          subtitle="A journey through sensation, perception, and attention."
        />
        <Prose>
          <p>Design system loaded. Fonts and colors are ready.</p>
        </Prose>
      </Section>
    </main>
  );
}
