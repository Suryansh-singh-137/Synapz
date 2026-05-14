const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";
function getToken() {
  return localStorage.getItem("token");
}
//  for fetching all the content
export async function fetchContent() {
  const res = await fetch(`${API_URL}/content`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch content");
  }
  return res.json();
}
// adding content
export async function createContent(data) {
  const res = await fetch(`${API_URL}/content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add content");
  return res.json();
}
//  deleteing content
export async function removeContent(contentId) {
  const res = await fetch(`${API_URL}/content`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ contentId }),
  });
  if (!res.ok) throw new Error('Failed to delete content');
  return res.json();
}
//  post method to chat with the brain 
 export async function  chatAPI(query)
{
  const res  =  await fetch(`${API_URL}/brain/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to chat with brain');
  return res.json();
}
// post method for shareable  brain link 
export async function createShareLink() {
  const res = await fetch(`${API_URL}/brain/share`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to create share link');
  return res.json();
}