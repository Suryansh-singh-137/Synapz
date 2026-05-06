export const Ticker = () => {
  const items = [
    "SEMANTIC_SEARCH",
    "RAG_ARCHITECTURE",
    "VECTOR_RETRIEVAL",
    "KNOWLEDGE_INDEXING",
    "AI_SYNTHESIS",
    "CONTEXT_AWARE",
    "PRIVATE_BY_DEFAULT",
    "QUERYABLE_ARCHIVE",
  ];
  const loop = [...items, ...items];
  return (
    <section className="overflow-hidden border-b border-border bg-ink py-5 text-ink-foreground">
      <div className="ticker flex gap-12 whitespace-nowrap">
        {loop.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-12 font-mono-tech text-sm uppercase tracking-[0.3em]"
          >
            <span>{t}</span>
            <span aria-hidden>✦</span>
          </div>
        ))}
      </div>
    </section>
  );
};
