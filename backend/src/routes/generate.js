import { Router } from 'express';
import { z } from 'zod';
import { generateFlashcards, generateQuiz } from '../services/gemini.js';

export const generateRouter = Router();

// ── Request body schema ───────────────────────────────────────────────────────
const GenerateRequestSchema = z.object({
  mode: z.enum(['flashcards', 'quiz']),
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic is too long'),
  notes: z.string().max(8000, 'Notes are too long (max 8000 chars)').optional(),
});

// ── POST /api/generate ────────────────────────────────────────────────────────
generateRouter.post('/generate', async (req, res, next) => {
  // 1. Validate request body
  const parseResult = GenerateRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  const { mode, topic, notes } = parseResult.data;

  try {
    let data;
    if (mode === 'flashcards') {
      data = await generateFlashcards(topic, notes);
    } else {
      data = await generateQuiz(topic, notes);
    }

    return res.json({ success: true, mode, data });
  } catch (err) {
    next(err);
  }
});
