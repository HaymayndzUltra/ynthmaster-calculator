import { ipcMain, BrowserWindow } from 'electron';
import { join } from 'path';
import type { ChatMessage, OpsecMappingFile } from '../../src/types/ai';
import { OllamaClient, classifyError } from '../services/ollamaClient';
import { ModelManager } from '../services/modelManager';
import { KnowledgeBase, ContextBuilder, DatabaseAdapter } from '../services/contextBuilder';

/**
 * Register all AI-related IPC handlers on the main process.
 * Wires together OllamaClient, ModelManager, KnowledgeBase, and ContextBuilder.
 *
 * @param mainWindow - The BrowserWindow to send streaming events to
 * @param db - SQLite database adapter (better-sqlite3 compatible)
 * @param opsecMap - Loaded opsecMapping.json data
 */
export function registerAIHandlers(
  mainWindow: BrowserWindow,
  db: DatabaseAdapter,
  opsecMap: OpsecMappingFile
): { modelManager: ModelManager } {
  const ollamaClient = new OllamaClient();
  const knowledgeBase = new KnowledgeBase();
  const modelManager = new ModelManager(ollamaClient);

  // Load knowledge files from data/knowledge/ relative to app root
  const knowledgeDir = join(__dirname, '..', '..', 'data', 'knowledge');
  knowledgeBase.loadAll(knowledgeDir);

  const contextBuilder = new ContextBuilder(db, opsecMap, knowledgeBase, modelManager);

  // Initialize model manager (async, non-blocking)
  modelManager.initialize().catch((err) => {
    console.warn('[aiHandlers] Initial model manager setup failed (Ollama may not be running):', (err as Error).message ?? err);
  });

  // ─── ai:chat ───────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcMain.handle('ai:chat', async (_event: any, payload: any) => {
    try {
      const rawMessages = payload?.messages;
      const calculatorContext = payload?.calculatorContext;

      // Input validation: messages must be array of { role, content }
      if (!Array.isArray(rawMessages)) {
        return { success: false, error: 'Invalid messages: expected array' };
      }
      for (const msg of rawMessages) {
        if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
          return { success: false, error: 'Invalid message format: each must have role and content strings' };
        }
      }
      const messages = rawMessages as ChatMessage[];

      // Select best available model
      const model = await modelManager.selectBestModel();
      if (!model) {
        return { success: false, error: 'No model available' };
      }

      // Determine context window and trim history accordingly
      const ctxWindow = modelManager.getModelContextWindow(model);
      const maxPairs = ctxWindow >= 32768 ? 20 : 5;
      const trimmedMessages = trimHistory(messages, maxPairs);

      // Build system prompt with RAG context
      const systemPrompt = await contextBuilder.buildSystemPrompt(calculatorContext);
      const fullMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...trimmedMessages,
      ];

      // Stream response to renderer
      const numCtx = ctxWindow >= 32768 ? 32768 : ctxWindow;
      await ollamaClient.chatStream(model, fullMessages, (token, done) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('ai:chunk', { token, done });
        }
      }, numCtx);

      return { success: true };
    } catch (err: unknown) {
      const code = classifyError(err);
      const message = err instanceof Error ? err.message : 'Unknown error';

      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('ai:error', { error: message, code });
      }

      return { success: false, error: message };
    }
  });

  // ─── ai:abort ──────────────────────────────────────────────
  ipcMain.handle('ai:abort', async () => {
    ollamaClient.abort();
    return { aborted: true };
  });

  // ─── ai:status ─────────────────────────────────────────────
  ipcMain.handle('ai:status', async () => {
    return modelManager.getStatus();
  });

  // ─── ai:clear ──────────────────────────────────────────────
  ipcMain.handle('ai:clear', async () => {
    ollamaClient.abort();
    // No disk cleanup needed — everything is in-memory
  });

  return { modelManager };
}

/**
 * Trim conversation history to keep only the last N user+assistant pairs.
 * Preserves message order. Filters out system messages (those are injected separately).
 */
function trimHistory(messages: ChatMessage[], maxPairs: number): ChatMessage[] {
  // Filter to only user and assistant messages
  const conversationMessages = messages.filter(
    (m) => m.role === 'user' || m.role === 'assistant'
  );

  // Count pairs (each pair = 1 user + 1 assistant)
  // Take last maxPairs * 2 messages
  const maxMessages = maxPairs * 2;
  if (conversationMessages.length <= maxMessages) {
    return conversationMessages;
  }

  return conversationMessages.slice(-maxMessages);
}
