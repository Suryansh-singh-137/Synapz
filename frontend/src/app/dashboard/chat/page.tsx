"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";

export default function ChatPage() {
  const { messages, loading, sendMessage, clearChat } = useChatStore() as any;
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    await sendMessage(input);
    setInput("");
  };

  return (
    <main className="p-8 lg:p-12 flex flex-col h-[calc(100vh-73px)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
            DASH_003 / CHAT
          </p>
          <h2 className="font-display text-4xl text-ink">
            Chat with Your Brain
          </h2>
        </div>
        <button
          onClick={clearChat}
          className="border border-ink bg-background px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-secondary"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 border border-ink p-6 mb-4 overflow-y-auto space-y-6 bg-background">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Start a conversation...</p>
          </div>
        ) : (
          messages.map((m: any, i: any) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "user" ? (
                <div className="bg-ink text-ink-foreground px-5 py-3 max-w-md">
                  <p>{m.content}</p>
                </div>
              ) : (
                <div className="border border-ink bg-background px-5 py-4 max-w-2xl">
                  <p className="mb-3">{m.content}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="space-y-1 text-sm font-mono-tech text-muted-foreground border-t border-ink/20 pt-3 mt-3">
                      {m.sources.map((s: any, j: any) => (
                        <p key={j}>• {s.title}</p>
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
            <div className="border border-ink px-5 py-3">
              <div className="flex gap-2">
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

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything about your brain..."
          className="flex-1 border border-ink bg-background px-4 py-3 focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="border border-ink bg-ink px-6 py-3 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </main>
  );
}
