"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useContentStore } from "@/store/contentStore";
import { removeToken } from "@/lib/authHelpers";
import { AddContentModal } from "./AddContentModal";
import { ShareBrainModal } from "./ShareModal";

const navItems = [
  { href: "/dashboard", label: "Home", end: true },
  { href: "/dashboard/content", label: "My Content" },
  { href: "/dashboard/chat", label: "Chat with Brain" },
];

const settingsItems = [{ href: "/dashboard/settings", label: "Settings" }];

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { user, logout } = useAuthStore();
  const { content, loadContent } = useContentStore() as any;

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    removeToken();
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-ink">
        <div className="flex items-center justify-between gap-6 px-6 py-4">
          <Link
            href="/"
            className="font-display text-xl tracking-tight text-ink"
          >
            SYNAPZ
          </Link>

          <input
            type="text"
            placeholder="Search your brain..."
            className="hidden md:block flex-1 max-w-md border border-ink bg-background px-4 py-2 font-mono-tech text-xs uppercase tracking-[0.15em] placeholder:text-muted-foreground focus:outline-none"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddOpen(true)}
              className="border border-ink bg-ink px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink-foreground hover:bg-background hover:text-ink transition-colors"
            >
              + Add Content
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="border border-ink bg-background px-4 py-2 font-mono-tech text-[11px] uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-ink-foreground transition-colors"
            >
              Share Brain
            </button>
            <button
              onClick={handleLogout}
              className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-ink"
            >
              {user?.username} ▾
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 border-r border-ink p-6 hidden md:block">
          <div className="space-y-8">
            <nav className="space-y-2">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                NAV_001
              </p>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-1.5 text-sm font-medium border-l-2 pl-3 transition-colors ${
                    isActive(item.href)
                      ? "border-ink text-ink"
                      : "border-transparent text-muted-foreground hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <hr className="border-ink/20" />

            <div className="space-y-4">
              <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                STATS
              </p>
              <div>
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Total Content
                </p>
                <p className="font-display text-3xl text-ink">
                  {content.length}
                </p>
              </div>
              <div>
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Indexed
                </p>
                <p className="font-display text-3xl text-ink">
                  {content.filter((c: any) => c.status === "extracted").length}
                </p>
              </div>
            </div>

            <hr className="border-ink/20" />

            <nav className="space-y-2">
              {settingsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-1 text-sm border-l-2 pl-3 transition-colors ${
                    isActive(item.href)
                      ? "border-ink text-ink"
                      : "border-transparent text-muted-foreground hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left py-1 pl-3 border-l-2 border-transparent text-sm text-muted-foreground hover:text-ink"
              >
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <AddContentModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
      <ShareBrainModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
