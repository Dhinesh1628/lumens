import {
  extractDocumentPages,
  chunkPages,
  storeClientDocument,
  queryClientDocument
} from './services/clientRagEngine.js';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

let isBackendAvailable = null;

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      isBackendAvailable = true;
      return res;
    }
  } catch (e) {
    // Backend offline
  }
  isBackendAvailable = false;
  return { ok: false, status: 503 };
}

export async function uploadDocument(formData, file) {
  // If backend is known to be available or explicitly configured with a base URL
  if (API_BASE_URL || isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        return res;
      }
    } catch (e) {
      console.warn('[Upload] Backend upload failed, switching to client-side engine:', e);
    }
  }

  // Autonomous Client-Side RAG Engine (Zero external dependencies)
  console.log('[Upload] Processing document using autonomous browser RAG engine...');
  const targetFile = file || formData.get('file');
  const sessionId = formData.get('sessionId') || `session_${Date.now()}`;

  if (!targetFile) {
    throw new Error('No document provided.');
  }

  const pages = await extractDocumentPages(targetFile);
  const chunks = chunkPages(pages, targetFile.name);
  const docData = storeClientDocument(sessionId, targetFile.name, pages, chunks);

  // Return synthetic mock Response conforming to fetch Response interface
  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => docData
  };
}

export async function queryDocument(sessionId, question) {
  if (API_BASE_URL || isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, question })
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        return res;
      }
    } catch (e) {
      console.warn('[Query] Backend query failed, trying client-side engine:', e);
    }
  }

  // Autonomous Client-Side RAG Query
  const result = await queryClientDocument(sessionId, question);
  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => result
  };
}
