"use client";

import { useState } from "react";
import { useShareStore } from "@/store/shareStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareBrainModal = ({ isOpen, onClose }: Props) => {
  const { link, loading, error, generateLink, deactivateLink, copyLink } =
    useShareStore();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDeactivate = async () => {
    await deactivateLink();
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-ink">Share Your Brain</h2>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            MOD_002
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Share a public link to your brain so others can view your content.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {!link ? (
          /* ── No link yet — show Generate button ── */
          <button
            onClick={generateLink}
            disabled={loading}
            className="w-full border border-ink bg-ink px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink disabled:opacity-50 transition-colors"
          >
            {loading ? "Generating..." : "Generate Link"}
          </button>
        ) : (
          /* ── Link exists — show copy input ── */
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
                className="border border-ink bg-background px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-ink-foreground transition-colors"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-ink bg-background px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-secondary transition-colors"
          >
            Close
          </button>

          {link && (
            <button
              onClick={handleDeactivate}
              disabled={loading}
              className="flex-1 border border-ink bg-background px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-ink-foreground disabled:opacity-50 transition-colors"
            >
              {loading ? "Removing..." : "Deactivate Link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
