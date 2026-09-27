export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res;
}

export async function uploadDocument(formData) {
  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData
  });
  return res;
}

export async function queryDocument(sessionId, question) {
  const res = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, question })
  });
  return res;
}
