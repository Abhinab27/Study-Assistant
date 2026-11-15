import { useState } from 'react';
import { useGenerate } from './hooks/useGenerate';
import { InputPanel } from './components/InputPanel';
import { FlashcardView } from './components/FlashcardView';
import { QuizView } from './components/QuizView';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

export default function App() {
  const { status, result, error, generate, reset } = useGenerate();
  const [lastRequest, setLastRequest] = useState(null);

  function handleGenerate(mode, topic, notes) {
    setLastRequest({ mode, topic, notes });
    generate(mode, topic, notes);
  }

  function handleRetry() {
    if (lastRequest) {
      generate(lastRequest.mode, lastRequest.topic, lastRequest.notes);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-header__logo">📚</span>
        <span className="app-header__name">Study Assistant</span>
      </header>

      <main className="app-main">
        {/* Always show input panel on idle, or as a sidebar when content is shown */}
        {status === 'idle' && (
          <InputPanel onGenerate={handleGenerate} isLoading={false} />
        )}

        {status === 'loading' && lastRequest && (
          <div className="content-area">
            <div className="content-area__sidebar">
              <InputPanel onGenerate={handleGenerate} isLoading={true} />
            </div>
            <div className="content-area__main">
              <LoadingState mode={lastRequest.mode} />
            </div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="content-area">
            <div className="content-area__sidebar">
              <InputPanel onGenerate={handleGenerate} isLoading={false} />
            </div>
            <div className="content-area__main">
              <ErrorState error={error} onRetry={handleRetry} onReset={reset} />
            </div>
          </div>
        )}

        {status === 'success' && result && (
          <div className="content-area">
            <div className="content-area__sidebar">
              <InputPanel onGenerate={handleGenerate} isLoading={false} />
            </div>
            <div className="content-area__main">
              {result.mode === 'flashcards' ? (
                <FlashcardView deck={result.data} onReset={reset} />
              ) : (
                <QuizView quiz={result.data} onReset={reset} />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Study Assistant · AI-powered learning</p>
      </footer>
    </div>
  );
}
