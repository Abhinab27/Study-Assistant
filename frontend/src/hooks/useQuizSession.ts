import { useState, useCallback } from 'react';
import type { Quiz, QuizAnswer } from '../types';

interface UseQuizSessionReturn {
  answers: QuizAnswer[];
  currentIndex: number;
  submitAnswer: (optionId: string) => void;
  goNext: () => void;
  reset: () => void;
  isComplete: boolean;
  score: number;
  wrongQuestions: Quiz['questions'];
}

export function useQuizSession(quiz: Quiz): UseQuizSessionReturn {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isComplete = answers.length === quiz.questions.length;

  const score = answers.filter((a) => a.isCorrect).length;

  const wrongQuestions = quiz.questions.filter(
    (q) => answers.find((a) => a.questionId === q.id && !a.isCorrect)
  );

  const submitAnswer = useCallback((optionId: string) => {
    const q = quiz.questions[currentIndex];
    if (!q) return;
    // Guard: don't double-submit
    if (answers.find((a) => a.questionId === q.id)) return;

    const isCorrect = optionId === q.correctOptionId;
    setAnswers((prev) => [...prev, { questionId: q.id, selectedOptionId: optionId, isCorrect }]);
  }, [quiz.questions, currentIndex, answers]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, quiz.questions.length - 1));
  }, [quiz.questions.length]);

  const reset = useCallback(() => {
    setAnswers([]);
    setCurrentIndex(0);
  }, []);

  return { answers, currentIndex, submitAnswer, goNext, isComplete, score, wrongQuestions, reset };
}
