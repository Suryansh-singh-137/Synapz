"use client";

import { useState } from "react";
import { useContentStore } from "@/store/contentStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddContentModal({ isOpen, onClose }: Props) {
  const { addContent, loading, error, clearError } = useContentStore() as {
    addContent: (data: {
      type: string;
      link: string;
      title: string;
      tags: string[];
    }) => Promise<boolean>;
    loading: boolean;
    error: string;
    clearError: () => void;
  };

  const [form, setForm] = useState({
    type: "article",
    link: "",
    title: "",
    tags: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await addContent({
      ...form,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
    });

    if (success) {
      setForm({ type: "article", link: "", title: "", tags: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-background border-all max-w-md w-full p-8">
        <h2 className="text-2xl font-bold mb-6">Add Content</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full border-all px-4 py-2"
            >
              <option value="article">Article</option>
              <option value="youtube">YouTube</option>
              <option value="pdf">PDF</option>
              <option value="tweet">Tweet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Link</label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
              className="w-full border-all px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="w-full border-all px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className="w-full border-all px-4 py-2"
              placeholder="ai, learning, tech"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">
              {error}
              <button
                type="button"
                onClick={clearError}
                className="ml-2 text-xs hover:opacity-60"
              >
                Dismiss
              </button>
            </p>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-all px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-brutalist"
            >
              {loading ? "Adding..." : "Add Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
