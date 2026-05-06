export const Footer = () => {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-[1480px] px-6 py-12">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
          <div>
            <div className="font-display text-2xl tracking-tight text-ink">
              SYNAPZ
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A semantic knowledge engine
            </p>
          </div>

          <div className="text-center font-mono-tech text-xs uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()}
          </div>

          <div className="flex gap-6 md:justify-end">
            {["GitHub", "Twitter", "Email"].map((l) => (
              <a
                key={l}
                href="#"
                className="font-mono-tech text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:text-ink"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
