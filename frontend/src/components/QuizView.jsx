import { useState, useCallback } from 'react';

function QuestionCard({
  question,
  questionNumber,
  total,
  onAnswer,
  lockedAnswer,
  isRetest = false,
}) {
  const isAnswered = lockedAnswer !== null;

  return (
    <div className="question-card">
      <div className="question-card__header">
        <span className="question-label">
          {isRetest ? '🔁 Retest · ' : ''}Question {questionNumber} of {total}
        </span>
      </div>
      <p className="question-text">{question.question}</p>

      <div className="options-list">
        {question.options.map((opt) => {
          let optClass = 'option-btn';
          if (isAnswered) {
            if (opt.id === question.correctOptionId) {
              optClass += ' option-btn--correct';
            } else if (opt.id === lockedAnswer?.selectedOptionId) {
              optClass += ' option-btn--wrong';
            } else {
              optClass += ' option-btn--dimmed';
            }
          }

          return (
            <button
              key={opt.id}
              className={optClass}
              onClick={() => !isAnswered && onAnswer(opt.id)}
              disabled={isAnswered}
            >
              {opt.text}
              {isAnswered && opt.id === question.correctOptionId && (
                <span className="option-badge option-badge--correct">✓ Correct</span>
              )}
              {isAnswered && opt.id === lockedAnswer?.selectedOptionId && !lockedAnswer.isCorrect && (
                <span className="option-badge option-badge--wrong">✗ Your answer</span>
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className={`explanation ${lockedAnswer?.isCorrect ? 'explanation--correct' : 'explanation--wrong'}`}>
          <strong>{lockedAnswer?.isCorrect ? '🎉 Correct!' : '😕 Not quite.'}</strong>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

function ScoreScreen({
  quiz,
  answers,
  wrongQuestions,
  onRetest,
  onReset,
}) {
  const score = answers.filter((a) => a.isCorrect).length;
  const pct = Math.round((score / quiz.questions.length) * 100);
  const emoji = pct === 100 ? '🏆' : pct >= 70 ? '🎯' : pct >= 40 ? '📖' : '💪';

  return (
    <div className="score-screen">
      <div className="score-screen__icon">{emoji}</div>
      <h2 className="score-screen__title">Quiz Complete!</h2>
      <div className="score-display">
        <span className="score-display__num">{score}</span>
        <span className="score-display__denom">/ {quiz.questions.length}</span>
      </div>
      <p className="score-pct">{pct}% correct</p>

      <div className="score-breakdown">
        {quiz.questions.map((q, i) => {
          const ans = answers.find((a) => a.questionId === q.id);
          return (
            <div key={q.id} className={`breakdown-item ${ans?.isCorrect ? 'breakdown-item--pass' : 'breakdown-item--fail'}`}>
              <span>{ans?.isCorrect ? '✓' : '✗'}</span>
              <span>Q{i + 1}: {q.question.slice(0, 60)}{q.question.length > 60 ? '…' : ''}</span>
            </div>
          );
        })}
      </div>

      <div className="score-actions">
        {wrongQuestions.length > 0 && (
          <button className="retest-btn" onClick={onRetest}>
            🔁 Retest {wrongQuestions.length} wrong answer{wrongQuestions.length !== 1 ? 's' : ''}
          </button>
        )}
        <button className="reset-btn" onClick={onReset}>
          ← New topic
        </button>
      </div>
    </div>
  );
}

export function QuizView({ quiz, onReset }) {
  const [phase, setPhase] = useState('answering');
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [retestQuestions, setRetestQuestions] = useState([]);
  const [retestAnswers, setRetestAnswers] = useState([]);

  const activeQuestions = phase === 'retest' ? retestQuestions : quiz.questions;
  const activeAnswers = phase === 'retest' ? retestAnswers : answers;

  const handleAnswer = useCallback((optionId) => {
    const q = activeQuestions[currentIndex];
    const isCorrect = optionId === q.correctOptionId;
    const answer = { questionId: q.id, selectedOptionId: optionId, isCorrect };

    if (phase === 'retest') {
      setRetestAnswers((prev) => [...prev, answer]);
    } else {
      setAnswers((prev) => [...prev, answer]);
    }
  }, [activeQuestions, currentIndex, phase]);

  const currentAnswer = activeAnswers.find((a) => a.questionId === activeQuestions[currentIndex]?.id) ?? null;
  const isCurrentAnswered = currentAnswer !== null;
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  function handleNext() {
    if (isLastQuestion) {
      setPhase('complete');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleStartRetest() {
    const wrong = quiz.questions.filter(
      (q) => !answers.find((a) => a.questionId === q.id)?.isCorrect
    );
    setRetestQuestions(wrong);
    setRetestAnswers([]);
    setCurrentIndex(0);
    setPhase('retest');
  }

  if (phase === 'complete' || (phase === 'retest' && retestAnswers.length === retestQuestions.length && retestQuestions.length > 0)) {
    // Merge retest results into final answers for display
    const finalAnswers = phase === 'retest'
      ? answers.map((a) => {
          const retestAns = retestAnswers.find((ra) => ra.questionId === a.questionId);
          return retestAns ?? a;
        })
      : answers;

    const wrongOnes = quiz.questions.filter(
      (q) => !finalAnswers.find((a) => a.questionId === q.id)?.isCorrect
    );

    return (
      <ScoreScreen
        quiz={quiz}
        answers={finalAnswers}
        wrongQuestions={wrongOnes}
        onRetest={handleStartRetest}
        onReset={onReset}
      />
    );
  }

  const question = activeQuestions[currentIndex];

  return (
    <div className="quiz-view">
      <div className="view-header">
        <div>
          <h2 className="view-title">{quiz.title}</h2>
          {phase === 'retest' && (
            <span className="retest-badge">🔁 Retest mode</span>
          )}
        </div>
        <button className="reset-btn" onClick={onReset}>
          ← New topic
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
        />
      </div>

      <QuestionCard
        question={question}
        questionNumber={currentIndex + 1}
        total={activeQuestions.length}
        onAnswer={handleAnswer}
        lockedAnswer={currentAnswer}
        isRetest={phase === 'retest'}
      />

      {isCurrentAnswered && (
        <button className="next-btn" onClick={handleNext}>
          {isLastQuestion ? 'See Results →' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
