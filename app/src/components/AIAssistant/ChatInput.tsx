import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatInputProps } from '../../types/ai';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 8,
  padding: '8px 12px',
  borderTop: '1px solid #374151',
  backgroundColor: '#111827',
};

const textareaStyle: React.CSSProperties = {
  flex: 1,
  resize: 'none',
  border: '1px solid #374151',
  borderRadius: 8,
  backgroundColor: '#1F2937',
  color: '#E5E7EB',
  fontSize: 14,
  lineHeight: '20px',
  padding: '8px 12px',
  fontFamily: 'inherit',
  outline: 'none',
  minHeight: 40,
  maxHeight: 120,
  overflow: 'auto',
};

const buttonBaseStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  lineHeight: '20px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'background-color 150ms ease, opacity 150ms ease',
};

const sendButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: '#2E6BE6',
  color: '#FFFFFF',
};

const stopButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: '#DC2626',
  color: '#FFFFFF',
};

const disabledButtonStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  backgroundColor: '#374151',
  color: '#6B7280',
  cursor: 'not-allowed',
  opacity: 0.6,
};

function getDisabledTooltip(disabled: boolean, isStreaming: boolean): string | undefined {
  if (isStreaming) return undefined;
  if (disabled) return 'AI is unavailable — check Ollama status';
  return undefined;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onAbort,
  isStreaming,
  disabled,
}) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isStreaming) {
          handleSend();
        }
      }
    },
    [isStreaming, handleSend],
  );

  const isInputDisabled = disabled && !isStreaming;
  const isSendDisabled = disabled || !value.trim();

  return (
    <div style={containerStyle}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isInputDisabled}
        placeholder="Ask CSOG anything... (Taglish OK)"
        aria-label="Chat message input"
        style={{
          ...textareaStyle,
          opacity: isInputDisabled ? 0.5 : 1,
        }}
        rows={1}
      />
      {isStreaming ? (
        <button
          onClick={onAbort}
          style={stopButtonStyle}
          aria-label="Stop AI generation"
          type="button"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={isSendDisabled}
          style={isSendDisabled ? disabledButtonStyle : sendButtonStyle}
          aria-label="Send message"
          title={getDisabledTooltip(disabled, isStreaming)}
          type="button"
        >
          Send
        </button>
      )}
    </div>
  );
};
