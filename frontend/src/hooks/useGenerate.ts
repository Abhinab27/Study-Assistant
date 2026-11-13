import { useState, useRef, useCallback } from 'react';
import type { Mode, AppStatus, AppError, GenerateResult } from '../types';
import { generateContent } from '../utils/api';
import { saveSession } from '../utils/storage';

interface UseGenerateReturn {
  status: AppStatus;
  result: GenerateResult | null;
  error: AppError | null;
  generate: (mode: Mode, topic: string, notes?: string) => Promise<void>;
  reset: () => void;
}

export function useGenerate(): UseGenerateReturn {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  // AbortController ref — cancel any in-flight request on re-submit
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (mode: Mode, topic: string, notes?: string) => {
    // Cancel previous in-flight request (stale response prevention)
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const data = await generateContent({ mode, topic, notes, signal: controller.signal });
      
      // Only update state if this request wasn't superseded
      if (!controller.signal.aborted) {
        setResult(data);
        setStatus('success');
        // Persist to localStorage
        saveSession({ mode, topic, data: data.data });
      }
    } catch (err: unknown) {
      // Ignore aborted requests — a newer one is in flight
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (!controller.signal.aborted) {
        const appError = (err as AppError) ?? {
          type: 'unknown',
          message: 'Something went wrong. Please try again.',
        };
        setError(appError);
        setStatus('error');
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, generate, reset };
}
