export const Nav = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-5">
        <a href="#" className="font-display text-xl tracking-tight text-ink">
          SYNAPZ
        </a>

        <div className="flex items-center gap-6">
          <a
            href="#login"
            className="font-mono-tech text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:text-ink"
          >
            Login
          </a>
          <a
            href="#signup"
            className="inline-flex items-center border border-ink bg-background px-5 py-2.5 font-mono-tech text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-ink-foreground"
          >
            Sign Up
          </a>
        </div>
      </div>
    </header>
  );
};
