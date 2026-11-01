"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { ChatMessageList } from "@/components/ChatMessageList";

export default function ChatPage() {
  const { messages, loading, sendMessage, clearChat } = useChatStore() as any;
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const currentInput = input;
    setInput("");
    await sendMessage(currentInput);
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
          className="border border-ink bg-background px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-secondary transition-colors"
        >
          Clear
        </button>
      </div>

      <ChatMessageList
        messages={messages}
        loading={loading}
        emptyPlaceholder="Start a conversation with your brain..."
        className="flex-1 border border-ink p-6 mb-4 bg-background"
      />

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
          disabled={loading || !input.trim()}
          className="border border-ink bg-ink px-6 py-3 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </main>
  );
}
