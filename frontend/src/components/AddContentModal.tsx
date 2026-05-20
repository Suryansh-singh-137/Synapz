import { useState } from "react";
import { useContentStore } from "@/store/contentStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddContentModal = ({ isOpen, onClose }: Props) => {
  const { addContent, loading, error, clearError } = useContentStore() as any;

  const [type, setType] = useState("article");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagList = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const payload =
      type === "pdf"
        ? (() => {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("title", title);
            if (file) formData.append("file", file);
            tagList.forEach((tag) => formData.append("tags", tag));
            return formData;
          })()
        : {
            type,
            link,
            title,
            tags: tagList,
          };

    const success = await addContent(payload);

    if (success) {
      setType("article");
      setLink("");
      setFile(null);
      setTitle("");
      setTags("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-ink max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-ink">Add Content</h2>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            MOD_001
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-600 text-sm">
            <div className="flex justify-between items-start">
              <span>{error}</span>
              <button onClick={clearError} className="text-xs hover:opacity-60">
                ✕
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Type">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setFile(null);
                if (e.target.value !== "pdf") {
                  setLink("");
                }
              }}
              className="w-full border border-ink bg-background px-4 py-2 font-mono-tech text-xs uppercase tracking-[0.15em] focus:outline-none"
            >
              <option value="article">article</option>
              <option value="youtube">youtube</option>
              <option value="pdf">pdf</option>
              <option value="tweet">tweet</option>
            </select>
          </Field>

          <Field label={type === "pdf" ? "Upload PDF" : "Link"}>
            {type === "pdf" ? (
              <input
                key={type}
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full border border-ink bg-background px-4 py-2 font-mono-tech text-xs focus:outline-none"
                required
              />
            ) : (
              <input
                key={type}
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full border border-ink bg-background px-4 py-2 font-mono-tech text-xs focus:outline-none"
                placeholder="https://example.com/article"
                required
              />
            )}
          </Field>

          <Field label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-ink bg-background px-4 py-2 text-sm focus:outline-none"
              placeholder="Enter title"
              required
            />
          </Field>

          <Field label="Tags">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-ink bg-background px-4 py-2 text-sm focus:outline-none"
              placeholder="ai, learning, tech"
            />
          </Field>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-ink bg-background px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 border border-ink bg-ink px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
      {label}
    </label>
    {children}
  </div>
);
