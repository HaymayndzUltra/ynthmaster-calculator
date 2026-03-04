import React, { useState, useCallback, useEffect } from 'react';
import { AIAssistant } from './components/AIAssistant/AIAssistant';
import { CalculatorLayout } from './components/Calculator/CalculatorLayout';
import { AppErrorBoundary } from './components/Calculator/ErrorBoundary';
import { ToastProvider } from './hooks/useToast';
import { useCalculator } from './hooks/useCalculator';

const FAKE_DATA = [
  ['Sales', 142500, 156800, 163200, 462500],
  ['Marketing', 38200, 41500, 39800, 119500],
  ['Operations', 95600, 98100, 101400, 295100],
  ['R&D', 67800, 72300, 75100, 215200],
  ['Admin', 28400, 29100, 30200, 87700],
  ['IT Support', 22100, 23400, 24800, 70300],
  ['Logistics', 45200, 47800, 49100, 142100],
];

const App: React.FC = () => {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const calculator = useCalculator();

  const handleAiToggle = useCallback(() => {
    setAiPanelOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'F12') {
        e.preventDefault();
        calculator.togglePanic();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [calculator.togglePanic]);

  if (calculator.isPanicMode) {
    return (
      <div className="fixed inset-0 bg-white text-gray-800 font-[Calibri,Arial,sans-serif] text-[13px] p-6 overflow-auto z-[99999]">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a5276]">Q3 2026 Revenue Forecast — Internal</h2>
            <span className="text-[10px] text-gray-400">Generated: Mar 4, 2026</span>
          </div>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#d5e8d4]">
                <th className="p-2 border border-gray-300 text-left font-semibold">Department</th>
                <th className="p-2 border border-gray-300 text-right font-semibold">July</th>
                <th className="p-2 border border-gray-300 text-right font-semibold">August</th>
                <th className="p-2 border border-gray-300 text-right font-semibold">September</th>
                <th className="p-2 border border-gray-300 text-right font-semibold bg-[#c8e6c9]">Total</th>
              </tr>
            </thead>
            <tbody>
              {FAKE_DATA.map(([dept, ...nums], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}>
                  <td className="px-2 py-1.5 border border-gray-200 font-medium">{dept as string}</td>
                  {(nums as number[]).map((n, j) => (
                    <td key={j} className={`px-2 py-1.5 border border-gray-200 text-right tabular-nums ${j === 3 ? 'font-semibold bg-[#f0f7f0]' : ''}`}>
                      {n.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 })}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#e8f5e9] font-bold">
                <td className="px-2 py-1.5 border border-gray-300">TOTAL</td>
                {[0, 1, 2, 3].map((col) => (
                  <td key={col} className="px-2 py-1.5 border border-gray-300 text-right tabular-nums">
                    {FAKE_DATA.reduce((sum, row) => sum + (row[col + 1] as number), 0)
                      .toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 })}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-[10px] text-gray-400 flex justify-between">
            <span>Confidential — Finance Division</span>
            <span>Press F12 to close</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppErrorBoundary>
    <ToastProvider>
    <div className="h-screen flex overflow-hidden bg-[#06080C]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <CalculatorLayout calculator={calculator} />
      </div>

      <AIAssistant
        isOpen={aiPanelOpen}
        onToggle={handleAiToggle}
        calculatorContext={calculator.calculatorContext}
      />
    </div>
    </ToastProvider>
    </AppErrorBoundary>
  );
};

export default App;
