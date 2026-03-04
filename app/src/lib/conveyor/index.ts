import { CalcApi } from './calc-api';
import { AiApi } from './ai-api';
import { WindowApi } from './window-api';

export { CalcApi } from './calc-api';
export { AiApi } from './ai-api';
export { WindowApi } from './window-api';

// Singleton instances
let _calc: CalcApi | null = null;
let _ai: AiApi | null = null;
let _window: WindowApi | null = null;

/**
 * Get the global Conveyor API instances.
 * Lazy-initialized singletons for each domain.
 */
export const conveyor = {
  get calc(): CalcApi {
    if (!_calc) _calc = new CalcApi();
    return _calc;
  },
  get ai(): AiApi {
    if (!_ai) _ai = new AiApi();
    return _ai;
  },
  get window(): WindowApi {
    if (!_window) _window = new WindowApi();
    return _window;
  },
};
