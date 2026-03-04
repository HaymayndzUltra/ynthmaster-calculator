// Shared type definitions for AI integration feature
// All interfaces used across Electron main process, preload bridge, and React renderer

// --- Core Chat Types ---

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// --- Calculator Context Types ---

export interface CalculatorContext {
  activeChapter: number;
  targetYieldGrams: number | null;
  selectedMethod: string | null;
  calculatedReagents: ReagentEntry[] | null;
}

export interface ReagentEntry {
  opsecAlias: string;
  massGrams: number;
  moles: number;
  equivalents: number;
}

// --- AI Status Types ---

export interface AIStatus {
  ollamaConnected: boolean;
  modelLoaded: string | null;
  modelSize: string | null;
  availableModels: string[];
  serverVersion: string | null;
}

// --- Streaming Event Types ---

export interface AIChunkEvent {
  token: string;
  done: boolean;
}

export interface AIErrorEvent {
  error: string;
  code: 'OLLAMA_UNREACHABLE' | 'MODEL_NOT_FOUND' | 'INFERENCE_ERROR' | 'ABORTED' | 'UNKNOWN';
}

// --- OPSEC Mapping Types ---

export interface OpsecMappingFile {
  version: string;
  description: string;
  mappings: OpsecEntry[];
}

export interface OpsecEntry {
  internal_id: string;
  alias: string;
  chemical: string;
  mw: number;
  used_in: string;
}

// --- Hook Return Type ---

export interface UseAIChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  aiStatus: AIStatus;
  sendMessage: (content: string, context?: CalculatorContext) => void;
  abortGeneration: () => void;
  clearChat: () => void;
}

// --- Component Props Types ---

export interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  calculatorContext?: CalculatorContext;
}

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  onAbort: () => void;
  isStreaming: boolean;
  disabled: boolean;
}
