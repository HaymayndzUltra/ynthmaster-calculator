import { z } from 'zod';

export const windowIpcSchema = {
  'window:minimize': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window:maximize': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window:close': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window:isMaximized': {
    args: z.tuple([]),
    return: z.boolean(),
  },
} as const;

export type WindowIpcSchema = typeof windowIpcSchema;
