"use client";

import { useState, useEffect } from "react";
import { useContentStore } from "@/store/contentStore";

const filters = ["All", "Articles", "PDFs", "Videos", "Tweets"] as const;

export default function ContentPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const { content, loading, deleteContent, loadContent } =
    useContentStore() as any;

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const filtered = content.filter((c: any) => {
    if (filter === "All") return true;
    if (filter === "Articles") return c.type === "article";
    if (filter === "PDFs") return c.type === "pdf";
    if (filter === "Videos") return c.type === "youtube";
    if (filter === "Tweets") return c.type === "tweet";
    return true;
  });

  const handleDelete = async (contentId: string) => {
    if (confirm("Delete this item?")) {
      await deleteContent(contentId);
    }
  };

  return (
    <main className="p-8 lg:p-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
            DASH_002 / CONTENT
          </p>
          <h2 className="font-display text-4xl text-ink">My Content</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} items
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border border-ink px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] transition-colors ${
              filter === f
                ? "bg-ink text-ink-foreground"
                : "bg-background hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="border border-ink overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-ink bg-secondary">
            <tr className="font-mono-tech text-[10px] uppercase tracking-[0.25em]">
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Added</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item: any) => (
                <tr
                  key={item._id}
                  className="border-b border-ink/20 hover:bg-secondary"
                >
                  <td className="p-4 font-medium text-ink line-clamp-1">
                    {item.title}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {item.type}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground font-mono-tech">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] border border-ink px-2 py-1">
                      {item.status || "extracted"}
                    </span>
                  </td>
                  <td className="p-4 text-sm space-x-4">
                    <button className="font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:opacity-60">
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:opacity-60 text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center text-muted-foreground"
                >
                  No content found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
