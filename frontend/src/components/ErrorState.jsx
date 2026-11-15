const ERROR_ICONS = {
  network: '🔌',
  rate_limit: '⏳',
  validation: '🤔',
  server: '🔧',
  unknown: '😕',
};

const ERROR_TITLES = {
  network: 'Connection Error',
  rate_limit: 'Slow Down!',
  validation: 'Unexpected Response',
  server: 'Server Error',
  unknown: 'Something Went Wrong',
};

export function ErrorState({ error, onRetry, onReset }) {
  return (
    <div className="error-state">
      <div className="error-state__icon">{ERROR_ICONS[error.type] || ERROR_ICONS.unknown}</div>
      <h3 className="error-state__title">{ERROR_TITLES[error.type] || ERROR_TITLES.unknown}</h3>
      <p className="error-state__message">{error.message}</p>

      {error.type === 'rate_limit' && (
        <p className="error-state__hint">
          The free tier allows ~15 requests/minute. Wait a moment, then try again.
        </p>
      )}
      {error.type === 'network' && (
        <p className="error-state__hint">
          Make sure the backend server is running: <code>cd backend &amp;&amp; npm run dev</code>
        </p>
      )}

      <div className="error-state__actions">
        <button className="retry-btn" onClick={onRetry}>
          🔄 Try Again
        </button>
        <button className="reset-btn" onClick={onReset}>
          ← Start Over
        </button>
      </div>
    </div>
  );
}
