import { Hero } from "@/components/Hero";
import { SensationSection } from "@/components/SensationSection";
import { PerceptionSection } from "@/components/PerceptionSection";
import { AttentionSection } from "@/components/AttentionSection";
import { DistractorSection } from "@/components/DistractorSection";
import { TakeawaySection } from "@/components/TakeawaySection";
import { ReferencesSection } from "@/components/ReferencesSection";
import { ModelStatus } from "@/components/ModelStatus";
import { InputProvider } from "@/lib/InputContext";

export default function Home() {
  return (
    <InputProvider>
      <main>
        <Hero />
        <SensationSection />
        <PerceptionSection />
        <AttentionSection />
        <DistractorSection />
        <TakeawaySection />
        <ReferencesSection />
      </main>
      <ModelStatus />
    </InputProvider>
  );
}
