import { z } from 'zod';

const yieldConfigSchema = z.object({
  ch2: z.number().min(0.1).max(0.95),
  ch3: z.number().min(0.1).max(0.95),
  ch4: z.number().min(0.1).max(0.95),
  ch5: z.number().min(0.1).max(0.95),
});

export const calcIpcSchema = {
  'calc:calculate': {
    args: z.tuple([
      z.object({
        targetG: z.number().min(1).max(500),
        yields: yieldConfigSchema,
      }),
    ]),
    return: z.any(),
  },
  'calc:getProcessInfo': {
    args: z.tuple([
      z.object({
        chapter: z.number().int().min(1).max(5),
      }),
    ]),
    return: z.any(),
  },
  'calc:getProcedures': {
    args: z.tuple([
      z.object({
        chapter: z.number().int().min(2).max(5),
      }),
    ]),
    return: z.array(z.any()),
  },
  'calc:getFailureModes': {
    args: z.tuple([
      z.object({
        chapter: z.number().int().min(1).max(5).optional(),
      }),
    ]),
    return: z.array(z.any()),
  },
} as const;

export type CalcIpcSchema = typeof calcIpcSchema;
