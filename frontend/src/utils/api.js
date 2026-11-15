const API_BASE = 'http://localhost:3001/api';

function classifyError(status, body) {
  if (status === 429 || body?.error === 'rate_limit') {
    return { type: 'rate_limit', message: body.message };
  }
  if (status === 400) {
    return { type: 'validation', message: body.message || 'Invalid request. Please check your input.' };
  }
  if (status === 502 || body?.error === 'schema_mismatch') {
    return { type: 'validation', message: body.message };
  }
  if (status === 500 || body?.error === 'server_config') {
    return { type: 'server', message: body.message };
  }
  return { type: 'unknown', message: body?.message || 'An unexpected error occurred.' };
}

export async function generateContent({ mode, topic, notes, signal }) {
  let response;
  try {
    response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, topic, notes }),
      signal,
    });
  } catch (err) {
    // Aborted requests — rethrow so callers can detect
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw {
      type: 'network',
      message: 'Could not connect to the server. Make sure the backend is running on port 3001.',
    };
  }

  const body = await response.json();

  if (!response.ok) {
    throw classifyError(response.status, body);
  }

  return { mode: body.mode, data: body.data };
}
