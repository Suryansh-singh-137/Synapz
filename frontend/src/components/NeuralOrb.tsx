export const NeuralOrb = () => {
  // Generate deterministic node positions on a sphere projection
  const nodes = Array.from({ length: 28 }).map((_, i) => {
    const angle = (i / 28) * Math.PI * 2;
    const radius = 90 + (i % 3) * 18;
    return {
      x: 140 + Math.cos(angle) * radius,
      y: 140 + Math.sin(angle) * radius,
      r: 1.5 + (i % 4) * 0.4,
    };
  });

  return (
    <div className="relative h-[280px] w-[280px]">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 animate-rotate-slow">
        <svg viewBox="0 0 280 280" className="h-full w-full">
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="2 8"
          />
          <circle
            cx="140"
            cy="140"
            r="100"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Network */}
      <svg viewBox="0 0 280 280" className="absolute inset-0 h-full w-full">
        {/* connecting lines */}
        {nodes.map((n, i) =>
          nodes
            .slice(i + 1, i + 4)
            .map((m, j) => (
              <line
                key={`${i}-${j}`}
                x1={n.x}
                y1={n.y}
                x2={m.x}
                y2={m.y}
                stroke="hsl(var(--ink) / 0.15)"
                strokeWidth="0.5"
              />
            )),
        )}
        {/* nodes */}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="hsl(var(--ink))" />
        ))}
        {/* core */}
        <circle
          cx="140"
          cy="140"
          r="42"
          fill="hsl(var(--background))"
          stroke="hsl(var(--ink))"
          strokeWidth="1.5"
        />
        <circle cx="140" cy="140" r="6" fill="hsl(var(--ink))" />
        <text
          x="140"
          y="200"
          textAnchor="middle"
          className="font-mono-tech"
          fontSize="9"
          letterSpacing="2"
          fill="hsl(var(--muted-foreground))"
        >
          SYNAPSE_CORE
        </text>
      </svg>
    </div>
  );
};
