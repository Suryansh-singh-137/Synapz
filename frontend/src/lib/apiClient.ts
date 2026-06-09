const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const getToken = () => localStorage.getItem("token");

export async function fetchContent() {
  const url = `${API_URL}/content`;
  console.log("fetchContent ->", url);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    console.error("fetchContent failed status:", res.status);
    throw new Error("Failed to fetch content");
  }
  return res.json();
}

export async function addContentAPI(data: any) {
  const url = `${API_URL}/content`;
  console.log("addContent ->", url, data);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getToken()}`,
  };

  const body = data instanceof FormData ? data : JSON.stringify(data);

  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error(
      "addContentAPI response status:",
      res.status,
      "body:",
      errorText,
    );
    throw new Error(`Failed to add content: ${errorText}`);
  }
  return res.json();
}

export async function deleteContentAPI(contentId: string) {
  const url = `${API_URL}/content`;
  console.log("deleteContent ->", url, contentId);
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ contentId }),
  });
  if (!res.ok) {
    console.error("deleteContentAPI response status:", res.status);
    throw new Error("Failed to delete");
  }
  return res.json();
}

export async function chatAPI(query: string) {
  const res = await fetch(`${API_URL}/brain/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

/**
 * GET or CREATE a share link for the current user.
 * Returns { hash: string } — the backend handles
 * "already exists" vs "create new" automatically.
 */
export async function createShareLinkAPI(): Promise<{ hash: string }> {
  const res = await fetch(`${API_URL}/brain/share`, {
    method: "POST",
    headers: {
      // No Content-Type needed — we send no body
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create share link: ${errorText}`);
  }

  return res.json(); // { hash: "abc123..." }
}

/**
 * Delete (deactivate) the current user's share link.
 */
export async function deleteShareLinkAPI(): Promise<void> {
  const res = await fetch(`${API_URL}/brain/share`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete share link: ${errorText}`);
  }
}
