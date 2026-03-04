/// <reference types="vite/client" />

import type {
  ChatMessage,
  CalculatorContext,
  AIChunkEvent,
  AIErrorEvent,
  AIStatus,
} from './types/ai';
import type {
  YieldConfig,
  ScalingResult,
  ProcessInfo,
  ProcedureStep,
  FailureMode,
} from './types/calculator';

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
    calc: {
      calculate: (targetG: number, yields: YieldConfig) => Promise<ScalingResult>;
      getProcessInfo: (chapter: number) => Promise<ProcessInfo | null>;
      getProcedures: (chapter: number) => Promise<ProcedureStep[]>;
      getFailureModes: (chapter?: number) => Promise<FailureMode[]>;
    };
  }
}
