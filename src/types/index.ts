export type MessageRole = 'user' | 'assistant'

export type ChatStatus = 'idle' | 'thinking' | 'tool_calling' | 'streaming'

export interface DataRow {
  [key: string]: string | number | boolean | null | undefined
}

export interface CoralQueryResult {
  rows: DataRow[]
  executionTime: number
  sources: string[]
  sql: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  queryResult?: CoralQueryResult
  toolName?: string
  timestamp: number
}

/** Gemini Content format — kept frontend-side to avoid importing the SDK in client bundles */
export interface GeminiPart {
  text?: string
  functionCall?: { name: string; args: Record<string, unknown> }
  functionResponse?: { name: string; response: Record<string, unknown> }
}

export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export interface SSEEvent {
  type: 'text' | 'tool_start' | 'tool_result' | 'done' | 'error'
  content?: string
  name?: string
  sql?: string
  rows?: DataRow[]
  executionTime?: number
  sources?: string[]
  message?: string
  history?: GeminiContent[]
}

export interface SourceInfo {
  id: string
  label: string
  color: string
  bgColor: string
  connected: boolean
  tableCount?: number
}
