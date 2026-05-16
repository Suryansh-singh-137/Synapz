"use client";

import { useContentStore } from "@/store/contentStore";

export default function ContentPage() {
  const { content, loading, deleteContent } = useContentStore() as {
    content: Array<{
      _id: string;
      title: string;
      type: string;
      status?: string;
    }>;
    loading: boolean;
    deleteContent: (contentId: string) => Promise<void>;
  };

  const handleDelete = async (contentId) => {
    if (confirm("Delete this item?")) {
      await deleteContent(contentId);
    }
  };

  if (loading) return <div>Loading content...</div>;

  return (
    <div className="container-tight section-spacing">
      <h2 className="text-3xl font-bold mb-8">My Content ({content.length})</h2>

      {content.length === 0 ? (
        <p className="text-muted-foreground">No content saved yet.</p>
      ) : (
        <div className="border-all overflow-hidden">
          <table className="w-full">
            <thead className="border-bottom bg-secondary">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <tr key={item._id} className="border-bottom hover:bg-secondary">
                  <td className="p-4">{item.title}</td>
                  <td className="p-4 text-sm">{item.type}</td>
                  <td className="p-4 text-sm">
                    <span className="bg-secondary px-2 py-1">
                      {item.status || "extracted"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:opacity-60"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
