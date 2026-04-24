import { Hero } from "@/components/Hero";
import { SensationSection } from "@/components/SensationSection";
import { PerceptionSection } from "@/components/PerceptionSection";
import { AttentionSection } from "@/components/AttentionSection";
import { InputProvider } from "@/lib/InputContext";

export default function Home() {
  return (
    <InputProvider>
      <main>
        <Hero />
        <SensationSection />
        <PerceptionSection />
        <AttentionSection />
      </main>
    </InputProvider>
  );
}
