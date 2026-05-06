import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { System } from "@/components/System";
import { Features } from "@/components/Feature";
import { Ticker } from "@/components/Ticker";
import { UseCase } from "@/components/UseCase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-ink selection:text-ink-foreground">
      <Nav />
      <main>
        <Hero />
        <System />
        <Features />
        <UseCase />
        <Ticker />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
