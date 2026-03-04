import React from 'react';
import type { AIStatus } from '../../types/ai';

interface StatusIndicatorProps {
  status: AIStatus;
}

type StatusLevel = 'green' | 'yellow' | 'red' | 'grey';

interface StatusConfig {
  level: StatusLevel;
  label: string;
  ariaLabel: string;
}

function getStatusConfig(status: AIStatus): StatusConfig {
  if (!status.ollamaConnected && !status.modelLoaded) {
    // Could be initial/checking state or truly offline
    if (status.serverVersion === null && status.availableModels.length === 0) {
      return {
        level: 'grey',
        label: 'Checking...',
        ariaLabel: 'Checking Ollama connection status',
      };
    }
    return {
      level: 'red',
      label: 'Ollama offline',
      ariaLabel: 'Ollama is not running. Start Ollama to enable AI.',
    };
  }

  if (status.ollamaConnected && !status.modelLoaded) {
    return {
      level: 'yellow',
      label: 'No model loaded',
      ariaLabel:
        'Ollama is connected but no compatible model is loaded. Pull dolphin-mixtral to enable AI.',
    };
  }

  if (status.ollamaConnected && status.modelLoaded) {
    return {
      level: 'green',
      label: `${status.modelLoaded} ready`,
      ariaLabel: `AI ready. Model ${status.modelLoaded} is loaded and operational.`,
    };
  }

  return {
    level: 'red',
    label: 'Ollama offline',
    ariaLabel: 'Ollama is not running.',
  };
}

const DOT_STYLES: Record<StatusLevel, React.CSSProperties> = {
  green: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#1F9D55',
    display: 'inline-block',
    flexShrink: 0,
  },
  yellow: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#F59E0B',
    display: 'inline-block',
    flexShrink: 0,
  },
  red: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#DC2626',
    display: 'inline-block',
    flexShrink: 0,
  },
  grey: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#9CA3AF',
    display: 'inline-block',
    flexShrink: 0,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  lineHeight: '16px',
  color: '#D1D5DB',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const config = getStatusConfig(status);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div
        style={containerStyle}
        role="status"
        aria-label={config.ariaLabel}
      >
        <span style={DOT_STYLES[config.level]} aria-hidden="true" />
        <span>{config.label}</span>
      </div>
    </>
  );
};
