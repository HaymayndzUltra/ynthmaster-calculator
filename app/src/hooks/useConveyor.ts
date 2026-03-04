import { useMemo } from 'react';
import { conveyor, CalcApi, AiApi, WindowApi } from '../lib/conveyor';

type ConveyorDomain = 'calc' | 'ai' | 'window';

type DomainApi<T extends ConveyorDomain> =
  T extends 'calc' ? CalcApi :
  T extends 'ai' ? AiApi :
  T extends 'window' ? WindowApi :
  never;

/**
 * useConveyor — React hook for type-safe IPC access.
 *
 * Usage:
 *   const calc = useConveyor('calc');
 *   const result = await calc.calculate(25, yields);
 *
 *   const ai = useConveyor('ai');
 *   await ai.chat(messages);
 *
 *   const win = useConveyor('window');
 *   win.minimize();
 */
export function useConveyor<T extends ConveyorDomain>(domain: T): DomainApi<T>;
export function useConveyor(): typeof conveyor;
export function useConveyor<T extends ConveyorDomain>(domain?: T) {
  return useMemo(() => {
    if (!domain) return conveyor;
    return conveyor[domain];
  }, [domain]);
}
