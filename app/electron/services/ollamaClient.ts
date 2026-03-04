import type { ChatMessage, AIErrorEvent } from '../../src/types/ai';

/**
 * HTTP client for Ollama REST API.
 * Uses Node.js built-in fetch (Electron 33+ / Node 21+).
 * All communication is localhost-only — no external network calls.
 */
export class OllamaClient {
  private baseUrl: string;
  private controller: AbortController | null = null;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  /**
   * Health check: GET /api/version with 3-second timeout.
   */
  async healthCheck(): Promise<{ ok: boolean; version?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return { ok: false };
      const data = await response.json();
      return { ok: true, version: data.version };
    } catch (err) {
      console.warn('[OllamaClient] healthCheck failed:', (err as Error).message ?? err);
      return { ok: false };
    }
  }

  /**
   * List installed models: GET /api/tags with 5-second timeout.
   * Returns model name strings. Empty array on failure.
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.models ?? []).map((m: { name: string }) => m.name);
    } catch (err) {
      console.warn('[OllamaClient] listModels failed:', (err as Error).message ?? err);
      return [];
    }
  }

  /**
   * Streaming chat completion: POST /api/chat with NDJSON response.
   * Calls onChunk for each token. Resolves when done.
   */
  async chatStream(
    model: string,
    messages: ChatMessage[],
    onChunk: (token: string, done: boolean) => void,
    numCtx: number = 4096
  ): Promise<void> {
    this.controller = new AbortController();

    // Combine manual abort with 120-second inference timeout (PRD §3.2.1)
    const timeoutSignal = AbortSignal.timeout(120_000);
    const combinedSignal = AbortSignal.any([this.controller.signal, timeoutSignal]);

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: {
          temperature: 0.4,
          top_p: 0.9,
          num_ctx: numCtx,
        },
      }),
      signal: combinedSignal,
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 404) {
        throw Object.assign(new Error(`Model '${model}' not found`), { code: 'MODEL_NOT_FOUND' });
      }
      throw Object.assign(new Error(`Ollama HTTP ${status}`), { code: 'INFERENCE_ERROR' });
    }

    if (!response.body) {
      throw Object.assign(new Error('No response body from Ollama'), { code: 'INFERENCE_ERROR' });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            const token = parsed.message?.content ?? '';
            const done = parsed.done === true;
            onChunk(token, done);
            if (done) return;
          } catch (parseErr) {
            console.warn('[OllamaClient] Skipping malformed NDJSON line:', trimmed.slice(0, 80));
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          const token = parsed.message?.content ?? '';
          const done = parsed.done === true;
          onChunk(token, done);
        } catch (parseErr) {
          console.warn('[OllamaClient] Skipping malformed trailing buffer data');
        }
      }
    } finally {
      reader.releaseLock();
      this.controller = null;
    }
  }

  /**
   * Abort any in-flight request.
   */
  abort(): void {
    this.controller?.abort();
    this.controller = null;
  }
}

/**
 * Classify an error into an AIErrorEvent code.
 */
export function classifyError(err: unknown): AIErrorEvent['code'] {
  if (err instanceof Error) {
    if (err.name === 'AbortError') return 'ABORTED';
    if ((err as Error & { code?: string }).code === 'MODEL_NOT_FOUND') return 'MODEL_NOT_FOUND';
    if ((err as Error & { code?: string }).code === 'INFERENCE_ERROR') return 'INFERENCE_ERROR';
    if (
      err.message.includes('fetch failed') ||
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('network')
    ) {
      return 'OLLAMA_UNREACHABLE';
    }
  }
  return 'UNKNOWN';
}
