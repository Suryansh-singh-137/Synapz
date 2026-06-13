"use client";

import { useEffect, useRef, useState } from "react";
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

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  sources?: Array<{ title: string; link: string; type: string }>;
  loading?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const SUGGESTED_QUESTIONS = [
  "What are the main topics covered here?",
  "Summarize what's in this brain",
  "What are the key insights?",
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SharedBrainPage() {
  const params = useParams();
  const hash = params?.hash as string;

  const [brain, setBrain] = useState<SharedBrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  // ── Fetch brain data ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!hash) return;
    const fetchBrain = async () => {
      try {
        const res = await fetch(`${API_URL}/brain/${hash}`);
        if (res.status === 404) {
          setError(
            "This brain doesn't exist or the link has been deactivated.",
          );
          return;
        }
        if (!res.ok) {
          setError("Failed to load this brain.");
          return;
        }
        setBrain(await res.json());
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchBrain();
  }, [hash]);

  // ── Auto-scroll chat ───────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send chat message ──────────────────────────────────────────────────────

  const sendMessage = async (query: string) => {
    if (!query.trim() || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", text: query.trim() };
    const loadingMsg: ChatMessage = {
      role: "assistant",
      text: "",
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/brain/${hash}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev.slice(0, -1), // remove loading bubble
        {
          role: "assistant",
          text: data.answer ?? "Sorry, I couldn't get a response.",
          sources: data.sources ?? [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          text: "Connection error. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const allTypes = brain
    ? Array.from(new Set(brain.content.map((c) => c.type)))
    : [];

  const filtered = brain
    ? brain.content.filter((item) => filter === "all" || item.type === filter)
    : [];

  const indexedCount = brain
    ? brain.content.filter((c) => c.embeddingStatus === "embedded").length
    : 0;

  // ── Loading ────────────────────────────────────────────────────────────────

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

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-ink p-10 text-center">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
            ERR_404
          </p>
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

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            SHARED_BRAIN / {hash.substring(0, 8).toUpperCase()}
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-ink leading-none mb-3">
            {brain.username.toUpperCase()}
            <span className="text-muted-foreground">'S BRAIN</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-10">
            Browse saved content below, or ask the AI anything about this brain.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-10 mb-10">
            <Stat label="Total Items" value={brain.content.length} />
            <Stat label="Indexed" value={indexedCount} />
            <Stat label="Types" value={allTypes.length} />
          </div>

          {/* Chat CTA */}
          <button
            onClick={() => setChatOpen(true)}
            className="border border-ink bg-ink px-6 py-3 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink transition-colors"
          >
            ✦ Ask This Brain a Question
          </button>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <section className="border-b border-ink sticky top-0 bg-background z-10">
        <div className="mx-auto max-w-[1200px] px-6 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
        </div>
      </section>

      {/* ── Content Grid ── */}
      <main className="mx-auto max-w-[1200px] w-full px-6 py-12 flex-1">
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
      <footer className="border-t border-ink">
        <div className="mx-auto max-w-[1200px] px-6 py-8 flex items-center justify-between">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Powered by{" "}
            <Link href="/" className="text-ink hover:underline">
              SYNAPZ
            </Link>
          </p>
          <Link
            href="/signup"
            className="border border-ink px-5 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-ink-foreground transition-colors"
          >
            Build Your Brain →
          </Link>
        </div>
      </footer>

      {/* ── Chat Panel (slide-in from right) ── */}
      {chatOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 z-40"
            onClick={() => setChatOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-background border-l border-ink z-50 flex flex-col">
            {/* Panel header */}
            <div className="border-b border-ink px-6 py-5 flex items-center justify-between shrink-0">
              <div>
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-0.5">
                  CHAT_001
                </p>
                <h2 className="font-display text-xl text-ink">
                  Ask This Brain
                </h2>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="border border-ink w-8 h-8 flex items-center justify-center font-mono-tech text-sm hover:bg-secondary transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Empty state with suggested questions */}
              {messages.length === 0 && (
                <div className="space-y-6">
                  <div className="border border-border p-4">
                    <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      HOW IT WORKS
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ask anything and the AI will search through{" "}
                      <strong className="text-ink">{brain.username}'s</strong>{" "}
                      saved content to find a relevant answer. It only knows
                      what's in this brain.
                    </p>
                  </div>

                  <div>
                    <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                      TRY ASKING
                    </p>
                    <div className="space-y-2">
                      {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="w-full text-left border border-border px-4 py-3 text-sm text-muted-foreground hover:border-ink hover:text-ink hover:bg-secondary transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.role === "user" ? "flex justify-end" : ""}
                >
                  {msg.role === "user" ? (
                    <div className="bg-ink text-ink-foreground px-4 py-3 max-w-[85%]">
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-[95%]">
                      {/* Role label */}
                      <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        Brain AI
                      </p>

                      {/* Loading dots */}
                      {msg.loading ? (
                        <div className="flex gap-1 py-2">
                          <span className="w-2 h-2 bg-ink rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-ink rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-ink rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-foreground leading-relaxed">
                            {msg.text}
                          </p>

                          {/* Sources */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="border-t border-border pt-3 space-y-1.5">
                              <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                Sources
                              </p>
                              {msg.sources.map((src, si) => (
                                <div
                                  key={si}
                                  className="flex items-center gap-2"
                                >
                                  <span className="font-mono-tech text-[10px] text-muted-foreground">
                                    {TYPE_ICONS[src.type] ?? "◎"}
                                  </span>
                                  {src.link && src.type !== "text" ? (
                                    <a
                                      href={src.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-ink underline hover:no-underline truncate"
                                    >
                                      {src.title}
                                    </a>
                                  ) : (
                                    <span className="text-xs text-muted-foreground truncate">
                                      {src.title}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-ink px-6 py-4 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  disabled={chatLoading}
                  className="flex-1 border border-ink bg-background px-4 py-2.5 font-mono-tech text-xs focus:outline-none placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={chatLoading || !input.trim()}
                  className="border border-ink bg-ink px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink disabled:opacity-40 transition-colors"
                >
                  {chatLoading ? "..." : "Send"}
                </button>
              </div>
              <p className="font-mono-tech text-[10px] text-muted-foreground mt-2">
                Enter to send · Answers grounded in saved content only
              </p>
            </div>
          </div>
        </>
      )}
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

  return (
    <div
      onClick={() => {
        if (item.link && item.type !== "text") {
          window.open(item.link, "_blank", "noopener,noreferrer");
        }
      }}
      className={`bg-background p-6 flex flex-col gap-4 group transition-colors ${
        item.type !== "text" ? "cursor-pointer hover:bg-secondary" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {icon} {typeLabel}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${isIndexed ? "bg-ink" : "bg-border"}`}
          title={isIndexed ? "Indexed & searchable" : "Not yet indexed"}
        />
      </div>

      <h3 className="font-bold text-ink leading-tight line-clamp-3 text-base group-hover:underline">
        {item.title}
      </h3>

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
