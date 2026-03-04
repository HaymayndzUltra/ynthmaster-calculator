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
  const [streamingContent, setStreamingContent] = useState('');
  const [aiStatus, setAiStatus] = useState<AIStatus>(DEFAULT_STATUS);

  // Ref to accumulate streaming tokens (source of truth for content)
  const streamContentRef = useRef('');
  // Ref to track streaming state inside callbacks (avoids stale closure)
  const isStreamingRef = useRef(false);
  // Throttle timer for rendering streaming content (50ms interval)
  const renderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // ─── 9.4: Streaming chunk subscription + throttled render (50ms) ───
  useEffect(() => {
    const unsubscribe = window.ai.onChunk((event: AIChunkEvent) => {
      if (!isStreamingRef.current) return;

      streamContentRef.current += event.token;

      if (event.done) {
        // Stop throttled rendering
        if (renderTimerRef.current) {
          clearInterval(renderTimerRef.current);
          renderTimerRef.current = null;
        }
        const finalContent = streamContentRef.current;
        setStreamingContent('');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: finalContent },
        ]);
        streamContentRef.current = '';
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

  // ─── 9.3: sendMessage (uses functional setState to avoid stale closure) ─
  const sendMessage = useCallback(
    async (content: string, context?: CalculatorContext): Promise<void> => {
      if (!content.trim()) return;
      if (isStreamingRef.current) return;

      const userMessage: ChatMessage = { role: 'user', content };

      // Use functional setState to avoid stale messages closure
      let messagesSnapshot: ChatMessage[] = [];
      setMessages((prev) => {
        messagesSnapshot = [...prev, userMessage];
        return messagesSnapshot;
      });

      streamContentRef.current = '';
      setStreamingContent('');
      isStreamingRef.current = true;
      setIsStreaming(true);

      // Start throttled render of streaming content (50ms interval, PRD US-AI-06)
      renderTimerRef.current = setInterval(() => {
        if (streamContentRef.current) {
          setStreamingContent(streamContentRef.current);
        }
      }, 50);

      try {
        const result = await window.ai.chat(messagesSnapshot, context);
        if (!result.success && result.error) {
          if (renderTimerRef.current) {
            clearInterval(renderTimerRef.current);
            renderTimerRef.current = null;
          }
          setStreamingContent('');
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
        if (renderTimerRef.current) {
          clearInterval(renderTimerRef.current);
          renderTimerRef.current = null;
        }
        setStreamingContent('');
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
    [],
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
  // State reset is synchronous and comes FIRST so that when
  // the F12 panic handler calls clearChat() without await, the
  // renderer state is wiped immediately (<200ms OPSEC target).
  // IPC calls to main process are fire-and-forget cleanup.
  const clearChat = useCallback((): void => {
    setMessages([]);
    streamContentRef.current = '';
    isStreamingRef.current = false;
    setIsStreaming(false);

    window.ai.abort().catch((err: unknown) => {
      console.error('useAIChat: clearChat abort failed:', err);
    });
    window.ai.clearHistory().catch((err: unknown) => {
      console.error('useAIChat: clearChat clearHistory failed:', err);
    });
  }, []);

  return {
    messages,
    isStreaming,
    streamingContent,
    aiStatus,
    sendMessage,
    abortGeneration,
    clearChat,
  };
}
