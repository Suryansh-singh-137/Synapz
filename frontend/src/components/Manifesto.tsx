export const Manifesto = () => {
  return (
    <section
      id="access"
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-[1480px] px-6 py-28 lg:py-40">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-2">
            <span className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              05 / ENTRY_PROTOCOL
            </span>
          </div>
          <div className="col-span-12 lg:col-span-10">
            <h2 className="font-display text-[10vw] leading-[0.88] tracking-tighter text-ink lg:text-[7.5rem]">
              YOUR ARCHIVE
              <br />
              IS WAITING
              <br />
              <span className="text-muted-foreground">TO BE QUERIED.</span>
            </h2>

            <div className="mt-12 grid grid-cols-12 gap-6">
              <p className="col-span-12 max-w-2xl text-xl leading-relaxed text-foreground md:col-span-7">
                Stop hoarding. Start retrieving. Synapz is currently in private
                access. Request your portal key below.
              </p>
              <div className="col-span-12 md:col-span-5">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex border border-ink bg-surface"
                >
                  <input
                    type="email"
                    placeholder="OPERATOR@DOMAIN.COM"
                    className="flex-1 bg-transparent px-4 py-4 font-mono-tech text-xs uppercase tracking-[0.2em] text-ink placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="border-l border-ink bg-ink px-6 py-4 font-mono-tech text-xs uppercase tracking-[0.25em] text-ink-foreground transition-colors hover:bg-background hover:text-ink"
                  >
                    REQUEST →
                  </button>
                </form>
                <p className="mt-3 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  KEYS_DISPATCHED · TUE_1700_UTC
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
