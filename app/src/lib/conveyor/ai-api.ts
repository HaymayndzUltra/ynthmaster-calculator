import type { ChatMessage, CalculatorContext, AIChunkEvent, AIErrorEvent, AIStatus } from '../../types/ai';

/**
 * AiApi — Type-safe wrapper for AI IPC channels.
 * Uses window.ai bridge exposed by preload.
 */
export class AiApi {
  chat(messages: ChatMessage[], calculatorContext?: CalculatorContext): Promise<{ success: boolean; error?: string }> {
    return window.ai.chat(messages, calculatorContext);
  }

  abort(): Promise<{ aborted: boolean }> {
    return window.ai.abort();
  }

  getStatus(): Promise<AIStatus> {
    return window.ai.getStatus();
  }

  clearHistory(): Promise<void> {
    return window.ai.clearHistory();
  }

  onChunk(callback: (event: AIChunkEvent) => void): () => void {
    return window.ai.onChunk(callback);
  }

  onError(callback: (event: AIErrorEvent) => void): () => void {
    return window.ai.onError(callback);
  }
}
