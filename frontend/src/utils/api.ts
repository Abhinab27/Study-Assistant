import type { Mode, GenerateResult, AppError } from '../types';

const API_BASE = 'http://localhost:3001/api';

interface GenerateOptions {
  mode: Mode;
  topic: string;
  notes?: string;
  signal?: AbortSignal;
}

interface ApiSuccessResponse {
  success: true;
  mode: Mode;
  data: GenerateResult['data'];
}

interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string[]>;
}

function classifyError(status: number, body: ApiErrorResponse): AppError {
  if (status === 429 || body.error === 'rate_limit') {
    return { type: 'rate_limit', message: body.message };
  }
  if (status === 400) {
    return { type: 'validation', message: body.message || 'Invalid request. Please check your input.' };
  }
  if (status === 502 || body.error === 'schema_mismatch') {
    return { type: 'validation', message: body.message };
  }
  if (status === 500 || body.error === 'server_config') {
    return { type: 'server', message: body.message };
  }
  return { type: 'unknown', message: body.message || 'An unexpected error occurred.' };
}

export async function generateContent(options: GenerateOptions): Promise<GenerateResult> {
  const { mode, topic, notes, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, topic, notes }),
      signal,
    });
  } catch (err: unknown) {
    // Aborted requests — rethrow so callers can detect
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw {
      type: 'network',
      message: 'Could not connect to the server. Make sure the backend is running on port 3001.',
    } satisfies AppError;
  }

  const body = await response.json();

  if (!response.ok) {
    throw classifyError(response.status, body as ApiErrorResponse);
  }

  const successBody = body as ApiSuccessResponse;
  return { mode: successBody.mode, data: successBody.data };
}
