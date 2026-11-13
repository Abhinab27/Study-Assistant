import { useState, useEffect, useCallback } from 'react';
import type { FlashcardDeck, Flashcard } from '../types';

interface FlashcardViewProps {
  deck: FlashcardDeck;
  onReset: () => void;
}

function FlashcardItem({ card, index, total }: { card: Flashcard; index: number; total: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [card.id]);

  return (
    <div className="flashcard-wrapper">
      <div className="card-counter">
        Card {index + 1} of {total}
      </div>

      <div
        className={`flashcard ${isFlipped ? 'flashcard--flipped' : ''}`}
        onClick={() => setIsFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Card back – click to flip' : 'Card front – click to flip'}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setIsFlipped((f) => !f);
          }
        }}
      >
        <div className="flashcard__inner">
          <div className="flashcard__face flashcard__face--front">
            <span className="face-label">Question</span>
            <p className="flashcard__text">{card.front}</p>
            {card.hint && !showHint && (
              <button
                className="hint-btn"
                onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
              >
                💡 Show hint
              </button>
            )}
            {card.hint && showHint && (
              <p className="hint-text">💡 {card.hint}</p>
            )}
            <span className="flip-cue">Click or press Space to flip</span>
          </div>
          <div className="flashcard__face flashcard__face--back">
            <span className="face-label">Answer</span>
            <p className="flashcard__text">{card.back}</p>
            <span className="flip-cue">Click or press Space to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlashcardView({ deck, onReset }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, deck.flashcards.length - 1));
  }, [deck.flashcards.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const card = deck.flashcards[currentIndex];

  return (
    <div className="flashcard-view">
      <div className="view-header">
        <div>
          <h2 className="view-title">{deck.title}</h2>
          <p className="view-summary">{deck.summary}</p>
        </div>
        <button className="reset-btn" onClick={onReset}>
          ← New topic
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{ width: `${((currentIndex + 1) / deck.flashcards.length) * 100}%` }}
        />
      </div>

      <FlashcardItem card={card} index={currentIndex} total={deck.flashcards.length} />

      {/* Navigation */}
      <div className="card-nav">
        <button
          className="nav-btn"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous card"
        >
          ← Prev
        </button>

        {/* Dot indicators */}
        <div className="card-dots">
          {deck.flashcards.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === currentIndex ? 'dot--active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="nav-btn"
          onClick={goNext}
          disabled={currentIndex === deck.flashcards.length - 1}
          aria-label="Next card"
        >
          Next →
        </button>
      </div>

      <p className="keyboard-hint">
        ← → arrow keys to navigate · Space or Enter to flip
      </p>
    </div>
  );
}
