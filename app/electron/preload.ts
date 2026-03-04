import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { ChatMessage, CalculatorContext, AIChunkEvent, AIErrorEvent, AIStatus } from '../src/types/ai';

// ─── AI Bridge ─────────────────────────────────────────────────
// Exposes window.ai namespace to the renderer process.
// Dedicated namespace because streaming requires listener cleanup
// (unsubscribe functions) not supported by a generic bridge.
contextBridge.exposeInMainWorld('ai', {
  /**
   * Send a chat message to the AI backend via Ollama.
   * Returns success/error; streaming tokens arrive via onChunk.
   */
  chat: (
    messages: ChatMessage[],
    calculatorContext?: CalculatorContext
  ): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('ai:chat', { messages, calculatorContext }),

  /**
   * Abort the current in-flight inference request.
   */
  abort: (): Promise<{ aborted: boolean }> =>
    ipcRenderer.invoke('ai:abort'),

  /**
   * Get current Ollama connection status and loaded model info.
   */
  getStatus: (): Promise<AIStatus> =>
    ipcRenderer.invoke('ai:status'),

  /**
   * Clear chat history on main process side and abort any in-flight request.
   */
  clearHistory: (): Promise<void> =>
    ipcRenderer.invoke('ai:clear'),

  /**
   * Subscribe to streaming token chunks from the AI.
   * Returns an unsubscribe function for cleanup.
   */
  onChunk: (callback: (event: AIChunkEvent) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: AIChunkEvent): void =>
      callback(data);
    ipcRenderer.on('ai:chunk', handler);
    return () => ipcRenderer.removeListener('ai:chunk', handler);
  },

  /**
   * Subscribe to AI error events.
   * Returns an unsubscribe function for cleanup.
   */
  onError: (callback: (event: AIErrorEvent) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: AIErrorEvent): void =>
      callback(data);
    ipcRenderer.on('ai:error', handler);
    return () => ipcRenderer.removeListener('ai:error', handler);
  },
});
