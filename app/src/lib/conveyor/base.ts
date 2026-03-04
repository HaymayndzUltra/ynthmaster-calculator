/**
 * ConveyorApi — Base class for type-safe IPC API wrappers.
 * Each API class extends this and provides typed methods that
 * invoke IPC channels through window.* bridges.
 */
export abstract class ConveyorApi {
  protected invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
    const bridge = this.getBridge();
    const method = (bridge as Record<string, (...a: unknown[]) => Promise<T>>)[channel];
    if (typeof method !== 'function') {
      console.error(`[ConveyorApi] Method not found on bridge: ${channel}`);
      return Promise.reject(new Error(`IPC method not found: ${channel}`));
    }
    return method(...args);
  }

  protected abstract getBridge(): unknown;
}
