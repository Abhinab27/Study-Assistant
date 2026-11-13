interface LoadingStateProps {
  mode: 'flashcards' | 'quiz';
}

const MESSAGES = {
  flashcards: [
    'Synthesizing key concepts…',
    'Crafting your flashcard deck…',
    'Identifying the most important ideas…',
  ],
  quiz: [
    'Drafting quiz questions…',
    'Building plausible distractors…',
    'Preparing your challenge…',
  ],
};

export function LoadingState({ mode }: LoadingStateProps) {
  const msgs = MESSAGES[mode];
  const msg = msgs[Math.floor(Date.now() / 1000) % msgs.length];

  return (
    <div className="loading-state">
      <div className="loading-state__animation">
        <div className="loading-cards">
          <div className="loading-card loading-card--1" />
          <div className="loading-card loading-card--2" />
          <div className="loading-card loading-card--3" />
        </div>
      </div>
      <p className="loading-state__message">{msg}</p>
      <div className="skeleton-preview">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--short" />
      </div>
    </div>
  );
}
