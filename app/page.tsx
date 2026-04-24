import { Hero } from "@/components/Hero";
import { SensationSection } from "@/components/SensationSection";
import { InputProvider } from "@/lib/InputContext";

export default function Home() {
  return (
    <InputProvider>
      <main>
        <Hero />
        <SensationSection />
      </main>
    </InputProvider>
  );
}
