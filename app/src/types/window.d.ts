export {};

declare global {
  interface Window {
    windowControls?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
    };
  }
}
