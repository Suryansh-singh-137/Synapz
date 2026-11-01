"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, TYPE_ICONS } from "@/lib/types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
  emptyPlaceholder?: string;
  className?: string;
}

export function ChatMessageList({
  messages,
  loading = false,
  emptyPlaceholder = "Start a conversation...",
  className = "",
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className={`overflow-y-auto space-y-6 ${className}`}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground font-mono-tech text-sm">
          <p>{emptyPlaceholder}</p>
        </div>
      ) : (
        messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "user" ? (
              <div className="bg-ink text-ink-foreground px-5 py-3 max-w-md">
                <p className="text-sm leading-relaxed">{m.content}</p>
              </div>
            ) : (
              <div className="border border-ink bg-background px-5 py-4 max-w-2xl w-full">
                {m.content && (
                  <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-line">
                    {m.content}
                  </p>
                )}

                {/* Citation sources */}
                {m.sources && m.sources.length > 0 && (
                  <div className="border-t border-ink/20 pt-3 space-y-1.5 mt-3">
                    <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Sources
                    </p>
                    {m.sources.map((s, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="font-mono-tech text-[10px] text-muted-foreground">
                          {s.type ? (TYPE_ICONS[s.type] ?? "◎") : "•"}
                        </span>
                        {s.link && s.type !== "text" ? (
                          <a
                            href={s.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-ink underline hover:no-underline truncate"
                          >
                            {s.title}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground truncate">
                            {s.title}
                          </span>
                        )}
                        {s.relevance && (
                          <span className="font-mono-tech text-[10px] text-muted-foreground ml-auto shrink-0">
                            {s.relevance}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {loading && (
        <div className="flex justify-start">
          <div className="border border-ink px-5 py-3 bg-background">
            <div className="flex gap-2 items-center h-4">
              <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

