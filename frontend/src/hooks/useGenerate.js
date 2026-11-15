import { useState, useRef, useCallback } from 'react';
import { generateContent } from '../utils/api';
import { saveSession } from '../utils/storage';

export function useGenerate() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // AbortController ref — cancel any in-flight request on re-submit
  const abortRef = useRef(null);

  const generate = useCallback(async (mode, topic, notes) => {
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
    } catch (err) {
      // Ignore aborted requests — a newer one is in flight
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (!controller.signal.aborted) {
        const appError = err || {
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
