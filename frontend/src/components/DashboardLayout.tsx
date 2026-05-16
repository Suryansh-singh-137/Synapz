"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { removeToken } from "@/lib/authHelpers";
import AddContentModal from "./AddContentModal";
import ShareModal from "./ShareModal";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [showAddContent, setShowAddContent] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleLogout = () => {
    // Clear everything
    removeToken();
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-48 border-right border-all min-h-screen p-6 bg-background">
        {/* Logo */}
        <h2 className="text-xl font-bold mb-12">SYNAPZ</h2>

        {/* Navigation */}
        <nav className="space-y-4 mb-12">
          <Link href="/dashboard" className="block hover:opacity-60 transition">
            🏠 Home
          </Link>
          <Link
            href="/dashboard/content"
            className="block hover:opacity-60 transition"
          >
            📚 Content
          </Link>
          <Link
            href="/dashboard/chat"
            className="block hover:opacity-60 transition"
          >
            💬 Chat
          </Link>
        </nav>

        <hr className="mb-8" />

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => setShowAddContent(true)}
            className="w-full btn-brutalist-outline text-sm"
          >
            + Add Content
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="w-full btn-brutalist-outline text-sm"
          >
            🔗 Share Brain
          </button>
        </div>

        <hr className="mb-8" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full btn-brutalist-outline text-sm text-red-600 border-red-300 hover:bg-red-50"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Modals */}
      <AddContentModal
        isOpen={showAddContent}
        onClose={() => setShowAddContent(false)}
      />
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
    </div>
  );
}
