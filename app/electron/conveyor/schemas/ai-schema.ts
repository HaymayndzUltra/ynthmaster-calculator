import { z } from 'zod';

const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
});

const calculatorContextSchema = z.object({
  activeChapter: z.number(),
  targetYieldGrams: z.number().nullable(),
  selectedMethod: z.string().nullable(),
  calculatedReagents: z.any().nullable(),
}).optional();

export const aiIpcSchema = {
  'ai:chat': {
    args: z.tuple([
      z.object({
        messages: z.array(chatMessageSchema),
        calculatorContext: calculatorContextSchema,
      }),
    ]),
    return: z.object({
      success: z.boolean(),
      error: z.string().optional(),
    }),
  },
  'ai:abort': {
    args: z.tuple([]),
    return: z.object({
      aborted: z.boolean(),
    }),
  },
  'ai:status': {
    args: z.tuple([]),
    return: z.any(),
  },
  'ai:clear': {
    args: z.tuple([]),
    return: z.void(),
  },
} as const;

export type AiIpcSchema = typeof aiIpcSchema;
