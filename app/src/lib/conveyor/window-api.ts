/**
 * WindowApi — Type-safe wrapper for Window Control IPC channels.
 * Uses window.windowControls bridge exposed by preload.
 */
export class WindowApi {
  minimize(): void {
    window.windowControls?.minimize();
  }

  maximize(): void {
    window.windowControls?.maximize();
  }

  close(): void {
    window.windowControls?.close();
  }

  isMaximized(): Promise<boolean> {
    return window.windowControls?.isMaximized() ?? Promise.resolve(false);
  }
}
