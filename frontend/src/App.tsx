import { useState } from 'react';
import type { Mode } from './types';
import type { FlashcardDeck, Quiz } from './types';
import { useGenerate } from './hooks/useGenerate';
import { InputPanel } from './components/InputPanel';
import { FlashcardView } from './components/FlashcardView';
import { QuizView } from './components/QuizView';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

export default function App() {
  const { status, result, error, generate, reset } = useGenerate();
  const [lastRequest, setLastRequest] = useState<{ mode: Mode; topic: string; notes?: string } | null>(null);

  function handleGenerate(mode: Mode, topic: string, notes?: string) {
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
                <FlashcardView deck={result.data as FlashcardDeck} onReset={reset} />
              ) : (
                <QuizView quiz={result.data as Quiz} onReset={reset} />
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
