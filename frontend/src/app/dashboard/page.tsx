'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useContentStore } from '@/store/contentStore';

export default function DashboardHome() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { content, loading, loadContent } = useContentStore() as {
    content: Array<{ _id: string; title: string; type: string }>;
    loading: boolean;
    loadContent: () => void;
  };

  // Check if logged in
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container-tight section-spacing">
      <h1>Welcome, {user.username}</h1>
      <p className="text-muted-foreground mt-2">
        You have {content.length} items saved
      </p>

      {/* Recent Items */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Saves</h2>

        {loading ? (
          <p>Loading...</p>
        ) : content.length === 0 ? (
          <p className="text-muted-foreground">No content yet. Add some!</p>
        ) : (
          <div className="space-y-4">
            {content.slice(0, 5).map((item) => (
              <div key={item._id} className="border-all p-4">
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}