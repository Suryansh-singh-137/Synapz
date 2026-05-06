const SearchIcon = () => (
  <svg viewBox="0 0 120 120" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="50" cy="50" r="28" />
    <circle cx="50" cy="50" r="18" strokeDasharray="2 4" />
    <circle cx="50" cy="50" r="8" />
    <line x1="70" y1="70" x2="100" y2="100" strokeWidth="3" />
    <line x1="50" y1="14" x2="50" y2="22" />
    <line x1="50" y1="78" x2="50" y2="86" />
    <line x1="14" y1="50" x2="22" y2="50" />
    <line x1="78" y1="50" x2="86" y2="50" />
  </svg>
);

const CitedIcon = () => (
  <svg viewBox="0 0 120 120" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="20" y="18" width="50" height="68" />
    <rect x="32" y="30" width="50" height="68" />
    <line x1="42" y1="46" x2="72" y2="46" />
    <line x1="42" y1="56" x2="72" y2="56" />
    <line x1="42" y1="66" x2="62" y2="66" />
    <line x1="42" y1="76" x2="68" y2="76" />
    <circle cx="92" cy="36" r="10" fill="currentColor" />
    <text x="92" y="40" textAnchor="middle" fontSize="11" fill="hsl(var(--background))" fontFamily="JetBrains Mono" fontWeight="700">1</text>
    <line x1="72" y1="56" x2="86" y2="40" />
  </svg>
);

const InstantIcon = () => (
  <svg viewBox="0 0 120 120" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="14" y="24" width="58" height="36" />
    <polyline points="14,60 22,68 22,76 30,76 30,60" />
    <line x1="24" y1="36" x2="62" y2="36" />
    <line x1="24" y1="44" x2="54" y2="44" />
    <rect x="50" y="60" width="58" height="36" />
    <polyline points="108,60 100,52 100,44 92,44 92,60" />
    <line x1="60" y1="72" x2="98" y2="72" />
    <line x1="60" y1="80" x2="88" y2="80" />
    <line x1="60" y1="88" x2="94" y2="88" />
  </svg>
);

const FormatIcon = () => (
  <svg viewBox="0 0 120 120" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="10" y="14" width="32" height="40" />
    <line x1="16" y1="24" x2="36" y2="24" />
    <line x1="16" y1="32" x2="36" y2="32" />
    <line x1="16" y1="40" x2="30" y2="40" />
    <rect x="50" y="14" width="32" height="40" />
    <polygon points="58,38 66,28 74,38" fill="currentColor" />
    <circle cx="71" cy="24" r="2.5" fill="currentColor" />
    <rect x="90" y="14" width="20" height="40" />
    <polygon points="96,28 96,40 106,34" fill="currentColor" />
    <rect x="10" y="66" width="50" height="40" />
    <text x="35" y="92" textAnchor="middle" fontSize="14" fill="currentColor" fontFamily="JetBrains Mono" fontWeight="700">PDF</text>
    <rect x="68" y="66" width="42" height="40" />
    <line x1="76" y1="78" x2="102" y2="78" />
    <line x1="76" y1="86" x2="102" y2="86" />
    <line x1="76" y1="94" x2="94" y2="94" />
  </svg>
);

const features = [
  {
    title: "Semantic Search",
    desc: "Search like you think. Find what matters, even with different words.",
    Icon: SearchIcon,
    label: "F_01",
  },
  {
    title: "Always Cited",
    desc: "Every answer shows exactly where it came from. No guessing.",
    Icon: CitedIcon,
    label: "F_02",
  },
  {
    title: "Instant Answers",
    desc: "Chat with your knowledge. Synapz understands context, not just keywords.",
    Icon: InstantIcon,
    label: "F_03",
  },
  {
    title: "Any Format",
    desc: "Articles, PDFs, YouTube videos, tweets, notes. We handle it all.",
    Icon: FormatIcon,
    label: "F_04",
  },
];

export const Features = () => {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-[1480px] px-6 py-24 lg:py-32">
        <h2 className="font-display text-4xl leading-none tracking-tight text-ink md:text-6xl">
          WHAT YOU GET
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-px bg-border md:grid-cols-2">
          {features.map(({ title, desc, Icon, label }) => (
            <div
              key={title}
              className="group relative bg-background p-8 transition-colors hover:bg-secondary md:p-12"
            >
              <span className="font-mono-tech absolute right-6 top-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </span>

              <div className="mb-10 h-32 w-32 text-ink transition-transform duration-500 group-hover:rotate-3 md:h-40 md:w-40">
                <Icon />
              </div>

              <h3 className="font-display text-2xl tracking-tight text-ink md:text-3xl">
                {title}
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
