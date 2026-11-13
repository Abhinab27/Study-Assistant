import { useState } from 'react';
import type { Mode } from '../types';

interface InputPanelProps {
  onGenerate: (mode: Mode, topic: string, notes?: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  'Photosynthesis',
  'The French Revolution',
  'TCP vs UDP networking',
  'Mitosis and Meiosis',
  'JavaScript Promises',
  'The Water Cycle',
];

export function InputPanel({ onGenerate, isLoading }: InputPanelProps) {
  const [mode, setMode] = useState<Mode>('flashcards');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate(mode, topic.trim(), notes.trim() || undefined);
  }

  function useSuggestion(s: string) {
    setTopic(s);
  }

  return (
    <div className="input-panel">
      <div className="input-panel__header">
        <h1 className="input-panel__title">
          <span className="input-panel__icon">📚</span>
          Study Assistant
        </h1>
        <p className="input-panel__subtitle">
          Transform any topic or notes into flashcards or a quiz — instantly.
        </p>
      </div>

      <form className="input-panel__form" onSubmit={handleSubmit}>
        {/* Mode Selector */}
        <div className="mode-selector">
          <button
            type="button"
            className={`mode-btn ${mode === 'flashcards' ? 'mode-btn--active' : ''}`}
            onClick={() => setMode('flashcards')}
          >
            🃏 Flashcards
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'quiz' ? 'mode-btn--active' : ''}`}
            onClick={() => setMode('quiz')}
          >
            🧠 Quiz
          </button>
        </div>

        {/* Topic input */}
        <div className="form-field">
          <label htmlFor="topic" className="form-label">
            Topic <span className="required">*</span>
          </label>
          <input
            id="topic"
            type="text"
            className="form-input"
            placeholder="e.g. Photosynthesis, JavaScript Closures, World War II..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={200}
            disabled={isLoading}
            required
          />
        </div>

        {/* Notes input (optional) */}
        <div className="form-field">
          <label htmlFor="notes" className="form-label">
            Your Notes <span className="optional">(optional)</span>
          </label>
          <textarea
            id="notes"
            className="form-textarea"
            placeholder="Paste your lecture notes, article text, or any content you want to study from..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={8000}
            rows={5}
            disabled={isLoading}
          />
          <span className="char-count">{notes.length}/8000</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="submit-btn"
          disabled={isLoading || !topic.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              {mode === 'flashcards' ? 'Creating flashcards…' : 'Building quiz…'}
            </>
          ) : (
            <>
              {mode === 'flashcards' ? '🃏 Generate Flashcards' : '🧠 Generate Quiz'}
            </>
          )}
        </button>
      </form>

      {/* Suggestions */}
      <div className="suggestions">
        <span className="suggestions__label">Try a topic:</span>
        <div className="suggestions__list">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="suggestion-chip"
              onClick={() => useSuggestion(s)}
              disabled={isLoading}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
