import React, { useEffect, useRef, useCallback } from 'react';
import type { AIAssistantProps } from '../../types/ai';
import { useAIChat } from '../../hooks/useAIChat';
import { StatusIndicator } from './StatusIndicator';
import { ContextBadge } from './ContextBadge';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

// ─── Panel animation & layout styles ────────────────────────────

const panelAnimationCSS = `
  .ai-panel-overlay {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 360px;
    max-width: 100vw;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    background-color: #111827;
    border-left: 1px solid #1F2937;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
  }

  .ai-panel-overlay.ai-panel-open {
    transform: translateX(0);
  }

  .ai-toggle-btn {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 999;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #374151;
    background-color: #1F2937;
    color: #E5E7EB;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 150ms ease, opacity 150ms ease;
  }

  .ai-toggle-btn:hover {
    background-color: #374151;
  }

  .ai-toggle-btn.ai-toggle-hidden {
    opacity: 0;
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .ai-panel-overlay {
      width: 100vw;
    }
  }

  @media (min-width: 641px) and (max-width: 900px) {
    .ai-panel-overlay {
      width: 300px;
    }
  }
`;

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderBottom: '1px solid #1F2937',
  backgroundColor: '#0D1117',
  flexShrink: 0,
  minHeight: 44,
};

const headerTitleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 13,
  color: '#F9FAFB',
  marginRight: 'auto',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#9CA3AF',
  fontSize: 18,
  cursor: 'pointer',
  padding: '2px 4px',
  lineHeight: 1,
  borderRadius: 4,
  flexShrink: 0,
};

const messageListStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  color: '#6B7280',
  fontSize: 13,
  textAlign: 'center',
  padding: '24px 16px',
  gap: 8,
};

// ─── Component ──────────────────────────────────────────────────

export const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onToggle,
  calculatorContext,
}) => {
  const {
    messages,
    isStreaming,
    aiStatus,
    sendMessage,
    abortGeneration,
    clearChat,
  } = useAIChat();

  const messageListRef = useRef<HTMLDivElement>(null);
  const streamContentRef = useRef('');

  // ─── 15.1: Global F12 panic key — OPSEC wipe ─────────────────
  useEffect(() => {
    const handlePanicKey = (e: KeyboardEvent): void => {
      if (e.key !== 'F12') return;
      e.preventDefault();

      const t0 = performance.now();

      // Step 1: Kill in-flight inference (fire-and-forget IPC, signal sent immediately)
      window.ai.abort();

      // Step 2: Tell main process to clean up (fire-and-forget IPC)
      window.ai.clearHistory();

      // Step 3: Wipe renderer state (synchronous — setState + ref resets)
      clearChat();

      // Step 4: Close AI panel (only if open — onToggle is a toggle, not close)
      if (isOpen) onToggle();

      // Step 5: (Future integration point) Trigger existing panic key
      // handler for spreadsheet view toggle when Phase 5 base PRD is built.
      // e.g. window.dispatchEvent(new CustomEvent('panic:spreadsheet'));

      if (import.meta.env.DEV) {
        const elapsed = performance.now() - t0;
        console.debug(`[OPSEC] Panic wipe completed in ${elapsed.toFixed(2)}ms (target: <200ms)`);
      }
    };

    document.addEventListener('keydown', handlePanicKey);
    return () => document.removeEventListener('keydown', handlePanicKey);
  }, [clearChat, onToggle, isOpen]);

  // ─── Auto-scroll to bottom on new messages / streaming ────────
  const scrollToBottom = useCallback(() => {
    const el = messageListRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  // ─── Track streaming content for live display ─────────────────
  // We subscribe to onChunk to update a local ref for the streaming bubble
  const [streamingContent, setStreamingContent] = React.useState('');

  useEffect(() => {
    const unsubscribe = window.ai.onChunk((event) => {
      if (event.done) {
        setStreamingContent('');
        streamContentRef.current = '';
      } else {
        streamContentRef.current += event.token;
        setStreamingContent(streamContentRef.current);
      }
    });

    return unsubscribe;
  }, []);

  // Reset streaming content when streaming ends (safety net)
  useEffect(() => {
    if (!isStreaming) {
      setStreamingContent('');
      streamContentRef.current = '';
    }
  }, [isStreaming]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content, calculatorContext);
    },
    [sendMessage, calculatorContext],
  );

  const isChatDisabled = !aiStatus.ollamaConnected || !aiStatus.modelLoaded;

  return (
    <>
      <style>{panelAnimationCSS}</style>

      {/* Toggle button — visible when panel is closed */}
      <button
        className={`ai-toggle-btn${isOpen ? ' ai-toggle-hidden' : ''}`}
        onClick={onToggle}
        aria-label="Open AI Assistant"
        title="Open AI Assistant"
        type="button"
      >
        ⚗
      </button>

      {/* Panel */}
      <div
        className={`ai-panel-overlay${isOpen ? ' ai-panel-open' : ''}`}
        role="complementary"
        aria-label="AI Assistant panel"
      >
        {/* Header */}
        <div style={headerStyle}>
          <button
            style={closeButtonStyle}
            onClick={onToggle}
            aria-label="Close AI Assistant"
            title="Close"
            type="button"
          >
            ✕
          </button>
          <span style={headerTitleStyle}>CSOG Assistant</span>
          <ContextBadge context={calculatorContext} />
          <StatusIndicator status={aiStatus} />
        </div>

        {/* Message list */}
        <div
          ref={messageListRef}
          style={messageListStyle}
          role="list"
          aria-label="Chat messages"
        >
          {messages.length === 0 && !isStreaming ? (
            <div style={emptyStateStyle}>
              <span style={{ fontSize: 28 }}>⚗</span>
              <span>Ask CSOG anything.</span>
              <span style={{ fontSize: 11, color: '#4B5563' }}>
                Taglish OK — Operator-grade answers
              </span>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  role={msg.role === 'system' ? 'assistant' : msg.role}
                  content={msg.content}
                />
              ))}
              {isStreaming && streamingContent && (
                <ChatMessage
                  role="assistant"
                  content={streamingContent}
                  isStreaming
                />
              )}
            </>
          )}
        </div>

        {/* Footer: ChatInput */}
        <ChatInput
          onSend={handleSend}
          onAbort={abortGeneration}
          isStreaming={isStreaming}
          disabled={isChatDisabled}
        />
      </div>
    </>
  );
};
