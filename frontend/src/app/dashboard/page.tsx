"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useContentStore } from "@/store/contentStore";
import { ShareBrainModal } from "@/components/ShareModal";

export default function DashboardHome() {
  const { user, token, setToken } = useAuthStore();
  const { content, loadContent, deleteContent } = useContentStore() as any;
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Rehydrate token from localStorage if store is empty
  useEffect(() => {
    if (!token) {
      const t =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (t) {
        setToken(t);
        return;
      }
      router.push("/login");
    }
  }, [token, router, setToken]);

  // Load content once token is present
  useEffect(() => {
    if (token) {
      loadContent();
    }
  }, [token, loadContent]);

  // If there's no user and no token in store AND no token in localStorage,
  // show Loading. If a token exists in localStorage we assume the app is
  // rehydrating and avoid the Loading flash while effects run.
  const hasLocalToken =
    typeof window !== "undefined" && !!localStorage.getItem("token");
  if (!user && !token && !hasLocalToken)
    return <div className="p-8">Loading...</div>;

  const recent = content.slice(0, 4);

  const handleViewContent = (item: any) => {
    if (item.link) {
      // Open the link in a new tab
      // For PDFs on Cloudinary, this will open the PDF viewer
      // For articles and tweets, it will open the original link
      window.open(item.link, "_blank");
    } else {
      alert("No link available for this content");
    }
  };

  const handleDeleteContent = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteContent(itemId);
    }
  };

  return (
    <main className="p-8 lg:p-12">
      <div className="mb-12">
        <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          DASH_001 / HOME
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-ink leading-none">
          Welcome back, {user?.username || "there"}!
        </h2>
        <p className="text-muted-foreground mt-3">
          You have {content.length} items in your brain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <QuickCard
          label="ACT_01"
          title="View Content"
          desc="Browse articles, PDFs, videos"
          cta="View"
          href="/dashboard/content"
        />
        <QuickCard
          label="ACT_02"
          title="Chat with Brain"
          desc="Ask questions about your content"
          cta="Start Chat"
          href="/dashboard/chat"
        />
        <QuickCard
          label="ACT_03"
          title="Share Brain"
          desc="Share your brain with others"
          cta="Share"
          onClick={() => setIsShareModalOpen(true)}
        />
      </div>

      <ShareBrainModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <div className="border-t border-ink pt-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              REF_001
            </p>
            <h3 className="font-display text-3xl text-ink">Recent Content</h3>
          </div>
          <Link
            href="/dashboard/content"
            className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink hover:opacity-60"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recent.length > 0 ? (
            recent.map((item: any) => (
              <div
                key={item._id}
                className="border border-ink p-5 bg-background hover:bg-secondary transition-colors"
              >
                <div className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                  {item.type}
                </div>
                <h4 className="font-bold text-ink mb-3 leading-tight line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  {item.tags?.join(", ") || "No tags"}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleViewContent(item)}
                    className="font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:opacity-60 text-ink"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteContent(item._id)}
                    className="font-mono-tech text-[11px] uppercase tracking-[0.2em] hover:opacity-60 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-muted-foreground py-8">
              No content yet. Start by adding your first item!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function QuickCard({
  label,
  title,
  desc,
  cta,
  href,
  onClick,
}: {
  label: string;
  title: string;
  desc: string;
  cta: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
        {label}
      </div>
      <h3 className="font-display text-2xl text-ink mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 flex-1">{desc}</p>
      <div className="border border-ink bg-ink px-5 py-2.5 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground group-hover:bg-background group-hover:text-ink w-fit">
        {cta}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="border border-ink p-8 bg-background hover:bg-secondary transition-colors flex flex-col group text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || "#"}
      className="border border-ink p-8 bg-background hover:bg-secondary transition-colors flex flex-col group"
    >
      {content}
    </Link>
  );
}
