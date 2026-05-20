import { useState, useEffect } from "react";
import { useShareStore } from "@/store/shareStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareBrainModal = ({ isOpen, onClose }: Props) => {
  const { link, loading, generateLink, copyLink } = useShareStore() as any;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          <h2 className="font-display text-2xl text-ink">Share Your Brain</h2>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            MOD_002
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Share a public link to your brain so others can view your content.
        </p>

        {!link ? (
          <button
            onClick={generateLink}
            disabled={loading}
            className="w-full border border-ink bg-ink px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Link"}
          </button>
        ) : (
          <>
            <div className="mb-6">
              <label className="block font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 border border-ink bg-secondary px-4 py-2 font-mono-tech text-xs focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="border border-ink bg-background px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-ink-foreground"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-ink h-4 w-4"
                />
                <span>Allow others to chat with my brain</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-ink h-4 w-4"
                />
                <span>Show content sources</span>
              </label>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-ink bg-background px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-secondary"
          >
            Close
          </button>
          {link && (
            <button className="flex-1 border border-ink bg-background px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-ink-foreground">
              Deactivate Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
