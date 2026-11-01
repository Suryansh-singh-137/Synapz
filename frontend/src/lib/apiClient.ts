const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const CLEAN_URL = RAW_API_URL.trim().replace(/\/+$/, "");

/**
 * Normalized API base URL ending reliably with /api/v1 without duplication.
 */
export const API_BASE_URL = CLEAN_URL.endsWith("/api/v1")
  ? CLEAN_URL
  : `${CLEAN_URL}/api/v1`;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

// ============ AUTHENTICATION APIS ============

export async function signinAPI(data: { username: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || "Invalid username or password");
  }
  return json;
}

export async function signupAPI(data: { username: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || "Signup failed");
  }
  return json;
}

// ============ CONTENT APIS ============

export async function fetchContent() {
  const res = await fetch(`${API_BASE_URL}/content`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("fetchContent failed status:", res.status, errorText);
    throw new Error("Failed to fetch content");
  }
  return res.json();
}

export async function addContentAPI(data: any) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getToken()}`,
  };

  const body = data instanceof FormData ? data : JSON.stringify(data);

  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}/content`, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("addContentAPI response status:", res.status, errorText);
    throw new Error(`Failed to add content: ${errorText}`);
  }
  return res.json();
}

export async function deleteContentAPI(contentId: string) {
  const res = await fetch(`${API_BASE_URL}/content`, {
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

// ============ BRAIN CHAT APIS ============

export async function chatAPI(query: string) {
  const res = await fetch(`${API_BASE_URL}/brain/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Chat failed: ${errorText}`);
  }
  return res.json();
}

// ============ SHARE LINK APIS ============

/**
 * GET or CREATE a share link for the current user.
 */
export async function createShareLinkAPI(): Promise<{ hash: string }> {
  const res = await fetch(`${API_BASE_URL}/brain/share`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create share link: ${errorText}`);
  }

  return res.json();
}

/**
 * Delete (deactivate) the current user's share link.
 */
export async function deleteShareLinkAPI(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/brain/share`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete share link: ${errorText}`);
  }
}

// ============ PUBLIC SHARED BRAIN APIS ============

/**
 * Fetch a shared brain by hash.
 */
export async function getSharedBrainAPI(hash: string) {
  const res = await fetch(`${API_BASE_URL}/brain/${hash}`);

  if (res.status === 404) {
    throw new Error("This brain doesn't exist or the link has been deactivated.");
  }
  if (!res.ok) {
    throw new Error("Failed to load this brain.");
  }
  return res.json();
}

/**
 * Chat with a public shared brain by hash.
 */
export async function chatWithSharedBrainAPI(hash: string, query: string) {
  const res = await fetch(`${API_BASE_URL}/brain/${hash}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Shared chat failed: ${errorText}`);
  }
  return res.json();
}
