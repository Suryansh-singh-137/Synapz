"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentItem {
  _id: string;
  title: string;
  link: string;
  type: "article" | "tweet" | "youtube" | "pdf" | "text";
  tags: string[];
  status: string;
  embeddingStatus: string;
  createdAt: string;
  chunkCount: number;
}

interface SharedBrain {
  username: string;
  content: ContentItem[];
}

// ─── Type badge styles ────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  article: "ARTICLE",
  tweet: "TWEET",
  youtube: "VIDEO",
  pdf: "PDF",
  text: "NOTE",
};

const TYPE_ICONS: Record<string, string> = {
  article: "◎",
  tweet: "↗",
  youtube: "▶",
  pdf: "▤",
  text: "≡",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SharedBrainPage() {
  const params = useParams();
  const hash = params?.hash as string;

  const [brain, setBrain] = useState<SharedBrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!hash) return;

    const fetchBrain = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

        const res = await fetch(`${API_URL}/brain/${hash}`);

        if (res.status === 404) {
          setError(
            "This brain doesn't exist or the link has been deactivated.",
          );
          return;
        }

        if (!res.ok) {
          setError("Failed to load this brain. Please try again.");
          return;
        }

        const data = await res.json();
        setBrain(data);
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrain();
  }, [hash]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const allTypes = brain
    ? Array.from(new Set(brain.content.map((c) => c.type)))
    : [];

  const filtered = brain
    ? brain.content.filter((item) => {
        const matchesType = filter === "all" || item.type === filter;
        const matchesSearch =
          searchQuery === "" ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        return matchesType && matchesSearch;
      })
    : [];

  const indexedCount = brain
    ? brain.content.filter((c) => c.embeddingStatus === "embedded").length
    : 0;

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="font-display text-4xl text-ink animate-pulse">
            SYNAPZ
          </div>
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Loading brain...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-ink p-10 text-center">
          <div className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
            ERR_404
          </div>
          <h1 className="font-display text-3xl text-ink mb-4">
            Brain Not Found
          </h1>
          <p className="text-muted-foreground text-sm mb-8">{error}</p>
          <Link
            href="/"
            className="inline-block border border-ink bg-ink px-6 py-3 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!brain) return null;

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="border-b border-ink">
        <div className="mx-auto max-w-[1200px] px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl tracking-tight text-ink"
          >
            SYNAPZ
          </Link>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Public Brain
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            SHARED_BRAIN / {hash.substring(0, 8).toUpperCase()}
          </p>

          <h1 className="font-display text-5xl md:text-7xl text-ink leading-none mb-6">
            {brain.username.toUpperCase()}
            <span className="text-muted-foreground">'S BRAIN</span>
          </h1>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mt-10">
            <Stat label="Total Items" value={brain.content.length} />
            <Stat label="Indexed" value={indexedCount} />
            <Stat label="Content Types" value={allTypes.length} />
          </div>
        </div>
      </section>

      {/* ── Filters + Search ── */}
      <section className="border-b border-ink sticky top-0 bg-background z-10">
        <div className="mx-auto max-w-[1200px] px-6 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            <FilterBtn
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All ({brain.content.length})
            </FilterBtn>
            {allTypes.map((type) => (
              <FilterBtn
                key={type}
                active={filter === type}
                onClick={() => setFilter(type)}
              >
                {TYPE_LABELS[type] ?? type.toUpperCase()} (
                {brain.content.filter((c) => c.type === type).length})
              </FilterBtn>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles or tags..."
            className="border border-ink bg-background px-4 py-2 font-mono-tech text-xs focus:outline-none w-full sm:w-64 placeholder:text-muted-foreground"
          />
        </div>
      </section>

      {/* ── Content Grid ── */}
      <main className="mx-auto max-w-[1200px] px-6 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] mb-3">
              NO_RESULTS
            </p>
            <p className="text-sm">No content matches your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {filtered.map((item) => (
              <ContentCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-ink mt-auto">
        <div className="mx-auto max-w-[1200px] px-6 py-8 flex items-center justify-between">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Powered by{" "}
            <Link href="/" className="text-ink hover:underline">
              SYNAPZ
            </Link>
          </p>
          <Link
            href="/signup"
            className="border border-ink bg-background px-5 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-ink-foreground transition-colors"
          >
            Build Your Brain →
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-display text-4xl text-ink">{value}</p>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border border-ink px-4 py-1.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] transition-colors ${
        active
          ? "bg-ink text-ink-foreground"
          : "bg-background text-ink hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  const isIndexed = item.embeddingStatus === "embedded";
  const icon = TYPE_ICONS[item.type] ?? "◎";
  const typeLabel = TYPE_LABELS[item.type] ?? item.type.toUpperCase();

  const handleClick = () => {
    // Only open if it's a real URL (not a PDF stored on Cloudinary for access)
    if (item.link && item.type !== "text") {
      window.open(item.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-background p-6 flex flex-col gap-4 group ${
        item.type !== "text" ? "cursor-pointer hover:bg-secondary" : ""
      } transition-colors`}
    >
      {/* Top row: type badge + indexed dot */}
      <div className="flex items-center justify-between">
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {icon} {typeLabel}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            isIndexed ? "bg-ink" : "bg-border"
          }`}
          title={isIndexed ? "Indexed & searchable" : "Not yet indexed"}
        />
      </div>

      {/* Title */}
      <h3 className="font-bold text-ink leading-tight line-clamp-3 text-base group-hover:underline">
        {item.title}
      </h3>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="border border-border px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 4 && (
            <span className="font-mono-tech text-[10px] text-muted-foreground">
              +{item.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Date */}
      <p className="font-mono-tech text-[10px] text-muted-foreground mt-auto">
        {new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
