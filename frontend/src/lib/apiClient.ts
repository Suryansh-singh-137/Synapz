const API_URL = process.env.REACT_APP_API_URL 


const getToken = () => localStorage.getItem('token');

export async function fetchContent() {
  const res = await fetch(`${API_URL}/content`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch content');
  return res.json();
}

export async function addContentAPI(data) {
  const res = await fetch(`${API_URL}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add content');
  return res.json();
}

export async function deleteContentAPI(contentId) {
  const res = await fetch(`${API_URL}/content`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ contentId }),
  });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

export async function chatAPI(query) {
  const res = await fetch(`${API_URL}/brain/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}

export async function createShareLinkAPI() {
  const res = await fetch(`${API_URL}/brain/share`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to create link');
  return res.json();
}