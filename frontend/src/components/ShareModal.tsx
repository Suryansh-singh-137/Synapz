"use client";

import { useState } from "react";
import { useShareStore } from "@/store/shareStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: Props) {
  const { link, loading, generateLink, copyLink } = useShareStore() as any;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-background border-all max-w-md w-full p-8">
        <h2 className="text-2xl font-bold mb-6">Share Your Brain</h2>

        <p className="text-muted-foreground mb-6">
          Generate a public link to share your brain with others.
        </p>

        {!link ? (
          <button
            onClick={generateLink}
            disabled={loading}
            className="w-full btn-brutalist"
          >
            {loading ? "Generating..." : "Generate Link"}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={link}
                readOnly
                className="flex-1 border-all px-4 py-2 bg-secondary"
              />
              <button onClick={handleCopy} className="btn-brutalist-outline">
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>

            <button onClick={onClose} className="w-full border-all px-4 py-2">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
