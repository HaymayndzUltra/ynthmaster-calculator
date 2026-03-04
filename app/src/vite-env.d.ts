/// <reference types="vite/client" />

import type {
  ChatMessage,
  CalculatorContext,
  AIChunkEvent,
  AIErrorEvent,
  AIStatus,
} from './types/ai';

declare global {
  interface Window {
    ai: {
      chat: (
        messages: ChatMessage[],
        calculatorContext?: CalculatorContext
      ) => Promise<{ success: boolean; error?: string }>;
      abort: () => Promise<{ aborted: boolean }>;
      getStatus: () => Promise<AIStatus>;
      clearHistory: () => Promise<void>;
      onChunk: (callback: (event: AIChunkEvent) => void) => () => void;
      onError: (callback: (event: AIErrorEvent) => void) => () => void;
    };
  }
}
