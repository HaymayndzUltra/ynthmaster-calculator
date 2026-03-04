import React, { useState, useCallback } from 'react';
import { AIAssistant } from './components/AIAssistant/AIAssistant';

const appContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#0D1117',
  color: '#E5E7EB',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const App: React.FC = () => {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const handleAiToggle = useCallback(() => {
    setAiPanelOpen((prev) => !prev);
  }, []);

  // Calculator context — undefined until Phase 3 (calculator state) is built.
  // The AI still works without it per PRD §3.10; it just won't have
  // app-state awareness (active chapter, target yield, reagents).
  const calculatorContext = undefined;

  return (
    <div style={appContainerStyle}>
      {/* Main app content will be added in future phases */}

      <AIAssistant
        isOpen={aiPanelOpen}
        onToggle={handleAiToggle}
        calculatorContext={calculatorContext}
      />
    </div>
  );
};

export default App;
