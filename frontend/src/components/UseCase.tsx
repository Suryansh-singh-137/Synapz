export const UseCase = () => {
  return (
    <section id="example" className="border-b border-border">
      <div className="mx-auto max-w-[1480px] px-6 py-24 lg:py-32">
        <h2 className="font-display text-4xl leading-none tracking-tight text-ink md:text-6xl">
          REAL EXAMPLE
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="border border-ink p-8 md:p-10">
            <span className="font-mono-tech text-xs uppercase tracking-[0.25em] text-muted-foreground">
              User Question
            </span>
            <p className="mt-6 font-display text-2xl leading-tight tracking-tight text-ink md:text-3xl">
              "What patterns appear across my saved articles on AI and work?"
            </p>
          </div>

          <div className="border border-ink bg-ink p-8 text-ink-foreground md:p-10">
            <span className="font-mono-tech text-xs uppercase tracking-[0.25em] text-ink-foreground/60">
              System Response
            </span>
            <p className="mt-6 text-lg leading-relaxed">
              Across 12 sources, three themes emerge:
            </p>
            <ol className="mt-4 space-y-2 text-lg leading-relaxed">
              <li>1. Rise of AI-augmented roles (not replacement)</li>
              <li>2. Growing need for human judgment in complex decisions</li>
              <li>3. Compression of routine tasks by 2025-2030</li>
            </ol>
            <div className="mt-8 flex flex-wrap gap-2 border-t border-ink-foreground/20 pt-6">
              <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-ink-foreground/60">
                Sources:
              </span>
              {["Article 1", "Article 2", "Article 3"].map((a) => (
                <span
                  key={a}
                  className="border border-ink-foreground/40 px-2 py-0.5 font-mono-tech text-xs text-ink-foreground"
                >
                  [{a}]
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
