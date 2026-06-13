export const Footer = () => {
  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/Suryansh-singh-137?tab=repositories",
    },
    {
      name: "Twitter",
      href: "https://x.com/Confused_guy137",
    },
    {
      name: "Email",
      href: "mailto:suryanshsingh13763@gmail.com",
    },
  ];

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
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-tech text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:text-ink"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
