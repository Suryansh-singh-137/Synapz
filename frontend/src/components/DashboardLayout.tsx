"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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
    localStorage.removeItem("token");
    logout();
    router.push("/login");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-48 border-right min-h-screen p-6">
        <h2 className="text-xl font-bold mb-8">SYNAPZ</h2>

        <nav className="space-y-4 mb-8">
          <Link href="/dashboard" className="block hover:opacity-60">
            Home
          </Link>
          <Link href="/dashboard/content" className="block hover:opacity-60">
            Content
          </Link>
          <Link href="/dashboard/chat" className="block hover:opacity-60">
            Chat
          </Link>
        </nav>

        <hr className="mb-8" />

        <div className="space-y-4">
          <button
            onClick={() => setShowAddContent(true)}
            className="w-full btn-brutalist-outline"
          >
            + Add
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="w-full btn-brutalist-outline"
          >
            Share
          </button>
        </div>

        <hr className="my-8" />

        <button
          onClick={handleLogout}
          className="w-full btn-brutalist-outline text-red-600 border-red-300"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Modals */}
      <AddContentModal
        isOpen={showAddContent}
        onClose={() => setShowAddContent(false)}
      />
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
    </div>
  );
}
