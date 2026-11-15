import { useState, useCallback } from 'react';

export function useQuizSession(quiz) {
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isComplete = answers.length === quiz.questions.length;

  const score = answers.filter((a) => a.isCorrect).length;

  const wrongQuestions = quiz.questions.filter(
    (q) => answers.find((a) => a.questionId === q.id && !a.isCorrect)
  );

  const submitAnswer = useCallback((optionId) => {
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
