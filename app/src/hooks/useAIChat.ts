import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ChatMessage,
  CalculatorContext,
  AIStatus,
  AIChunkEvent,
  AIErrorEvent,
  UseAIChatReturn,
} from '../types/ai';

const DEFAULT_STATUS: AIStatus = {
  ollamaConnected: false,
  modelLoaded: null,
  modelSize: null,
  availableModels: [],
  serverVersion: null,
};

const STATUS_POLL_INTERVAL_MS = 30_000;

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus>(DEFAULT_STATUS);

  // Ref to accumulate streaming tokens without triggering re-renders per token
  const streamContentRef = useRef('');
  // Ref to track streaming state inside callbacks (avoids stale closure)
  const isStreamingRef = useRef(false);

  // ─── 9.2: Status polling on mount ───────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async (): Promise<void> => {
      try {
        const status = await window.ai.getStatus();
        if (isMounted) {
          setAiStatus(status);
        }
      } catch (err) {
        console.error('useAIChat: Failed to fetch AI status:', err);
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, STATUS_POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // ─── 9.4: Streaming chunk subscription ─────────────────────────
  useEffect(() => {
    const unsubscribe = window.ai.onChunk((event: AIChunkEvent) => {
      if (!isStreamingRef.current) return;

      streamContentRef.current += event.token;

      if (event.done) {
        const finalContent = streamContentRef.current;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: finalContent },
        ]);
        streamContentRef.current = '';
        isStreamingRef.current = false;
        setIsStreaming(false);
      }
    });

    return unsubscribe;
  }, []);

  // ─── 9.5: Error subscription ───────────────────────────────────
  useEffect(() => {
    const unsubscribe = window.ai.onError((event: AIErrorEvent) => {
      const errorMsg =
        event.code === 'OLLAMA_UNREACHABLE'
          ? 'Error: Ollama is not reachable. Make sure it is running.'
          : event.code === 'MODEL_NOT_FOUND'
            ? 'Error: No compatible model found. Pull dolphin-mixtral first.'
            : event.code === 'ABORTED'
              ? 'Generation aborted.'
              : `Error: ${event.error}`;

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMsg },
      ]);
      streamContentRef.current = '';
      isStreamingRef.current = false;
      setIsStreaming(false);
    });

    return unsubscribe;
  }, []);

  // ─── 9.3: sendMessage ──────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, context?: CalculatorContext): Promise<void> => {
      if (!content.trim()) return;
      if (isStreamingRef.current) return;

      const userMessage: ChatMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      streamContentRef.current = '';
      isStreamingRef.current = true;
      setIsStreaming(true);

      try {
        const result = await window.ai.chat(updatedMessages, context);
        if (!result.success && result.error) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `Error: ${result.error}` },
          ]);
          streamContentRef.current = '';
          isStreamingRef.current = false;
          setIsStreaming(false);
        }
      } catch (err) {
        console.error('useAIChat: chat invocation failed:', err);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Error: Failed to communicate with AI backend.',
          },
        ]);
        streamContentRef.current = '';
        isStreamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [messages],
  );

  // ─── 9.6: abortGeneration ─────────────────────────────────────
  const abortGeneration = useCallback(async (): Promise<void> => {
    try {
      await window.ai.abort();
    } catch (err) {
      console.error('useAIChat: abort failed:', err);
    }

    if (streamContentRef.current) {
      const partial = streamContentRef.current;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: partial },
      ]);
    }

    streamContentRef.current = '';
    isStreamingRef.current = false;
    setIsStreaming(false);
  }, []);

  // ─── 9.7: clearChat ───────────────────────────────────────────
  const clearChat = useCallback(async (): Promise<void> => {
    try {
      await window.ai.abort();
      await window.ai.clearHistory();
    } catch (err) {
      console.error('useAIChat: clearChat failed:', err);
    }

    setMessages([]);
    streamContentRef.current = '';
    isStreamingRef.current = false;
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    aiStatus,
    sendMessage,
    abortGeneration,
    clearChat,
  };
}
