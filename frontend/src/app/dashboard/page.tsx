"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useContentStore } from "@/store/contentStore";

export default function DashboardHome() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { content, loading, loadContent } = useContentStore();

  // Check if logged in
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Load content on mount
  useEffect(() => {
    if (token) {
      loadContent();
    }
  }, [token, loadContent]);

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="container-tight section-spacing">
      {/* Welcome */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Welcome back, {user.username}!
        </h1>
        <p className="text-muted-foreground text-lg">
          {loading ? "Loading..." : `You have ${content.length} items saved`}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-3 gap-8 mb-12">
        <div className="border-all p-8 text-center">
          <div className="text-4xl font-bold">{content.length}</div>
          <p className="text-muted-foreground mt-2">Items Saved</p>
        </div>

        <div className="border-all p-8 text-center">
          <div className="text-4xl font-bold">
            {content.filter((c) => c.status === "extracted").length}
          </div>
          <p className="text-muted-foreground mt-2">Indexed</p>
        </div>

        <div className="border-all p-8 text-center">
          <div className="text-4xl font-bold">
            {content.reduce((sum, c) => sum + (c.tags?.length || 0), 0)}
          </div>
          <p className="text-muted-foreground mt-2">Tags</p>
        </div>
      </div>

      {/* Recent Content */}
      {content.length > 0 && (
        <div className="border-top pt-12">
          <h2 className="text-3xl font-bold mb-8">Recent Saves</h2>

          <div className="grid grid-2 gap-8">
            {content.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="border-all p-6 hover:bg-secondary transition"
              >
                <div className="text-sm text-muted-foreground mb-2 uppercase">
                  {item.type}
                </div>
                <h3 className="font-bold mb-3 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.tags?.join(", ") || "No tags"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && content.length === 0 && (
        <div className="border-all p-12 text-center">
          <h3 className="text-2xl font-bold mb-3">No content yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by adding your first article, PDF, or video
          </p>
        </div>
      )}
    </div>
  );
}
