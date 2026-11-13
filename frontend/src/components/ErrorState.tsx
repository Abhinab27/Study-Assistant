import type { AppError } from '../types';

interface ErrorStateProps {
  error: AppError;
  onRetry: () => void;
  onReset: () => void;
}

const ERROR_ICONS: Record<AppError['type'], string> = {
  network: '🔌',
  rate_limit: '⏳',
  validation: '🤔',
  server: '🔧',
  unknown: '😕',
};

const ERROR_TITLES: Record<AppError['type'], string> = {
  network: 'Connection Error',
  rate_limit: 'Slow Down!',
  validation: 'Unexpected Response',
  server: 'Server Error',
  unknown: 'Something Went Wrong',
};

export function ErrorState({ error, onRetry, onReset }: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-state__icon">{ERROR_ICONS[error.type]}</div>
      <h3 className="error-state__title">{ERROR_TITLES[error.type]}</h3>
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
