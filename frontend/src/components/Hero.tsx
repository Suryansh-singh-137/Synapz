import { NeuralOrb } from "@/components/NeuralOrb";

export const Hero = () => {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1480px] px-6 py-24 lg:py-32">
        <div className="grid grid-cols-12 gap-10 lg:gap-16">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              TURN EVERYTHING YOU READ INTO A SECOND BRAIN
            </h1>

            <p className="mt-10 max-w-2xl text-xl leading-relaxed text-foreground md:text-2xl">
              Save articles, PDFs, and videos. Chat with your knowledge
              instantly.
            </p>

            <div className="mt-12">
              <a
                href="#signup"
                className="inline-flex items-center gap-3 border border-ink bg-background px-8 py-4 font-mono-tech text-xs uppercase tracking-[0.25em] text-ink transition-colors hover:bg-ink hover:text-ink-foreground"
              >
                Get Started
                <span>→</span>
              </a>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:flex lg:items-center lg:justify-center">
            <div className="hidden lg:block">
              <NeuralOrb />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
