const steps = [
  {
    n: "01",
    title: "SAVE",
    body: "Drop in articles, PDFs, videos, or notes. Anything you want to remember.",
  },
  {
    n: "02",
    title: "UNDERSTAND",
    body: "Synapz automatically extracts key information and indexes everything.",
  },
  {
    n: "03",
    title: "QUERY",
    body: "Ask questions in plain English. Get instant answers backed by your sources.",
  },
];

export const System = () => {
  return (
    <section id="how" className="border-b border-border">
      <div className="mx-auto max-w-[1480px] px-6 py-24 lg:py-32">
        <h2 className="font-display text-4xl leading-none tracking-tight text-ink md:text-6xl">
          HOW IT WORKS
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-px bg-border md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-background p-8 md:p-10">
              <span className="font-mono-tech text-xs uppercase tracking-[0.25em] text-muted-foreground">
                STEP {s.n}
              </span>
              <h3 className="mt-6 font-display text-3xl tracking-tight text-ink md:text-4xl">
                {s.title}
              </h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
