/**
 * Global error handler middleware.
 * Translates various error types into clean JSON responses.
 */
export function errorHandler(err, _req, res, _next) {
  console.error('[ErrorHandler]', err.message);

  // Gemini API key not configured
  if (err.message?.includes('GEMINI_API_KEY')) {
    return res.status(500).json({
      error: 'server_config',
      message: 'The server is not configured with an AI API key. Contact the administrator.',
    });
  }

  // Google API rate limit
  if (err.status === 429 || err.message?.toLowerCase().includes('quota') || err.message?.toLowerCase().includes('rate')) {
    return res.status(429).json({
      error: 'rate_limit',
      message: 'The AI service is temporarily rate-limited. Please wait a moment and try again.',
    });
  }

  // Validation / schema errors surfaced from services
  if (err.message?.includes('unexpected response format')) {
    return res.status(502).json({
      error: 'schema_mismatch',
      message: err.message,
    });
  }

  // Generic fallback
  return res.status(500).json({
    error: 'internal',
    message: err.message || 'An unexpected error occurred. Please try again.',
  });
}
