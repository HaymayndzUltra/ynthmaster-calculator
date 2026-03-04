import type { AIStatus } from '../../src/types/ai';
import { OllamaClient } from './ollamaClient';

/**
 * Manages Ollama health, model detection, and fallback model selection.
 * Drives the StatusIndicator and model selection for chat requests.
 */
export class ModelManager {
  private ollamaClient: OllamaClient;
  private preferredModels: string[] = [
    'csog-operator',
    'dolphin-mixtral',
    'nous-hermes2-mixtral',
    'dolphin-mistral',
  ];
  private healthInterval: ReturnType<typeof setInterval> | null = null;
  private cachedStatus: AIStatus = {
    ollamaConnected: false,
    modelLoaded: null,
    modelSize: null,
    availableModels: [],
    serverVersion: null,
  };

  constructor(ollamaClient: OllamaClient) {
    this.ollamaClient = ollamaClient;
  }

  /**
   * Run initial health check + model detection.
   * Returns the current AIStatus.
   */
  async initialize(): Promise<AIStatus> {
    const health = await this.ollamaClient.healthCheck();
    this.cachedStatus.ollamaConnected = health.ok;
    this.cachedStatus.serverVersion = health.version ?? null;

    if (health.ok) {
      const models = await this.ollamaClient.listModels();
      this.cachedStatus.availableModels = models;

      const best = this.selectBestModelSync(models);
      this.cachedStatus.modelLoaded = best;

      // Detect model size from available model list metadata (best-effort)
      this.cachedStatus.modelSize = best ? this.estimateModelSize(best) : null;
    } else {
      this.cachedStatus.availableModels = [];
      this.cachedStatus.modelLoaded = null;
      this.cachedStatus.modelSize = null;
    }

    return { ...this.cachedStatus };
  }

  /**
   * Select best model from the preferred list.
   * Async version that re-fetches model list from Ollama.
   */
  async selectBestModel(): Promise<string | null> {
    if (!this.cachedStatus.ollamaConnected) return null;
    const models = await this.ollamaClient.listModels();
    this.cachedStatus.availableModels = models;
    return this.selectBestModelSync(models);
  }

  /**
   * Synchronous model selection from an already-fetched model list.
   * Iterates preferred model order, returns first match.
   * Matches by prefix to handle versioned names like "dolphin-mixtral:latest".
   */
  private selectBestModelSync(availableModels: string[]): string | null {
    for (const preferred of this.preferredModels) {
      const match = availableModels.find(
        (m) => m === preferred || m.startsWith(`${preferred}:`)
      );
      if (match) return match;
    }
    return null;
  }

  /**
   * Start polling Ollama health every 30 seconds.
   * Calls onStatusChange when status differs from previous.
   */
  startHealthPolling(onStatusChange: (status: AIStatus) => void): void {
    this.stopHealthPolling();

    this.healthInterval = setInterval(async () => {
      const prevConnected = this.cachedStatus.ollamaConnected;
      const prevModel = this.cachedStatus.modelLoaded;

      await this.initialize();

      const changed =
        prevConnected !== this.cachedStatus.ollamaConnected ||
        prevModel !== this.cachedStatus.modelLoaded;

      if (changed) {
        onStatusChange({ ...this.cachedStatus });
      }
    }, 30_000);
  }

  /**
   * Stop health polling interval.
   */
  stopHealthPolling(): void {
    if (this.healthInterval !== null) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
  }

  /**
   * Return cached AIStatus (no network call).
   */
  getStatus(): AIStatus {
    return { ...this.cachedStatus };
  }

  /**
   * Determine context window size based on model name.
   * mixtral models → 32768, mistral-7B → 8192, default → 4096.
   */
  getModelContextWindow(model?: string | null): number {
    if (!model) return 4096;
    const lower = model.toLowerCase();
    if (lower.includes('mixtral')) return 32768;
    if (lower.includes('mistral') && !lower.includes('mixtral')) return 8192;
    return 4096;
  }

  /**
   * Best-effort model size estimate from name.
   */
  private estimateModelSize(model: string): string | null {
    const lower = model.toLowerCase();
    if (lower.includes('mixtral')) return '~26GB';
    if (lower.includes('mistral')) return '~4.1GB';
    if (lower.includes('llama3')) return '~4.7GB';
    if (lower.includes('hermes')) return '~4.1GB';
    return null;
  }
}
