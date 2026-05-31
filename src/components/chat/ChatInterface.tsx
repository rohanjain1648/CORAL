'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { generateId } from '@/lib/utils'
import MessageBubble from './MessageBubble'
import ThinkingIndicator from './ThinkingIndicator'
import ScenarioButtons from './ScenarioButtons'
import QueryGlass from './QueryGlass'
import type { Message, GeminiContent, SSEEvent, DataRow } from '@/types'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'thinking' | 'tool_calling' | 'streaming'>('idle')
  const [thinkLabel, setThinkLabel] = useState('Thinking…')

  // Query Glass state
  const [qgOpen, setQgOpen] = useState(false)
  const [qgSQL, setQgSQL] = useState('')
  const [qgRows, setQgRows] = useState<DataRow[]>([])
  const [qgSources, setQgSources] = useState<string[]>([])
  const [qgTime, setQgTime] = useState(0)

  // Anthropic conversation history
  const [history, setHistory] = useState<GeminiContent[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const busy = status !== 'idle'

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  // Auto-resize textarea
  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    resizeTextarea()
  }

  const submit = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || busy) return

    const trimmed = userMessage.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Add user message
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setStatus('thinking')
    setThinkLabel('Thinking…')

    const assistantId = generateId()
    let accumulated = ''
    let latestSQL = ''
    let latestRows: DataRow[] = []
    let latestSources: string[] = []
    let latestTime = 0

    // Add empty assistant placeholder
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
    ])

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(err || `HTTP ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let event: SSEEvent
          try { event = JSON.parse(line.slice(6)) } catch { continue }

          switch (event.type) {
            case 'text':
              accumulated += event.content ?? ''
              setStatus('streaming')
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
              )
              break

            case 'tool_start':
              setStatus('tool_calling')
              setThinkLabel(
                event.name === 'coral_query'
                  ? 'Running Coral SQL…'
                  : event.name === 'get_schema'
                  ? 'Reading schema…'
                  : `Calling ${event.name}…`
              )
              if (event.sql) {
                latestSQL = event.sql
                setQgSQL(event.sql)
                setQgOpen(true)
              }
              break

            case 'tool_result':
              latestRows = event.rows ?? []
              latestSources = event.sources ?? []
              latestTime = event.executionTime ?? 0
              if (event.sql) {
                latestSQL = event.sql
                setQgSQL(event.sql)
              }
              setQgRows(latestRows)
              setQgSources(latestSources)
              setQgTime(latestTime)
              setQgOpen(true)
              setStatus('streaming')
              break

            case 'done':
              // Attach query result to message
              if (latestRows.length > 0) {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? {
                          ...m,
                          queryResult: {
                            rows: latestRows,
                            sql: latestSQL,
                            sources: latestSources,
                            executionTime: latestTime,
                          },
                        }
                      : m
                  )
                )
              }
              // Update history
              if (event.history) setHistory(event.history)
              setStatus('idle')
              break

            case 'error':
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: `⚠️ Error: ${event.message ?? 'Unknown error'}` }
                    : m
                )
              )
              setStatus('idle')
              break
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: accumulated || '_(stopped)_' } : m)
        )
      } else {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: `⚠️ ${(e as Error).message}` }
              : m
          )
        )
      }
      setStatus('idle')
    }
  }, [busy, history])

  const stop = () => {
    abortRef.current?.abort()
    setStatus('idle')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(input)
    }
  }

  const empty = messages.length === 0

  return (
    <div className="flex h-full overflow-hidden" style={{ position: 'relative' }}>

      {/* ── Main chat area ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* Empty state */}
            {empty && (
              <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                <ScenarioButtons onSelect={submit} disabled={busy} />
              </div>
            )}

            {/* Messages */}
            {messages.map(msg => (
              <div key={msg.id} className="mb-4">
                <MessageBubble
                  message={msg}
                  onSQLClick={
                    msg.queryResult
                      ? () => {
                          setQgSQL(msg.queryResult!.sql)
                          setQgRows(msg.queryResult!.rows)
                          setQgSources(msg.queryResult!.sources)
                          setQgTime(msg.queryResult!.executionTime)
                          setQgOpen(true)
                        }
                      : undefined
                  }
                />
              </div>
            ))}

            {/* Thinking indicator */}
            {(status === 'thinking' || status === 'tool_calling') && (
              <div className="mb-4">
                <ThinkingIndicator label={thinkLabel} />
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Input bar ── */}
        <div
          className="flex-shrink-0 px-4 pb-5 pt-3"
          style={{ borderTop: '1px solid var(--nx-border)', background: 'rgba(3,3,8,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div
              className="flex items-end gap-3 rounded-2xl px-4 py-3"
              style={{
                background: 'var(--nx-surface-2)',
                border: '1px solid var(--nx-border)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={() => {}}
            >
              <textarea
                ref={textareaRef}
                className="nx-input flex-1"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your engineering org…"
                disabled={busy}
                rows={1}
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  resize: 'none',
                  maxHeight: 160,
                }}
              />

              {/* Send / Stop button */}
              {busy ? (
                <button
                  onClick={stop}
                  className="flex-shrink-0 flex items-center justify-center rounded-xl transition-all"
                  style={{
                    width: 36,
                    height: 36,
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    cursor: 'pointer',
                    color: '#ef4444',
                  }}
                  title="Stop"
                >
                  <Square size={14} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={() => submit(input)}
                  disabled={!input.trim()}
                  className="flex-shrink-0 flex items-center justify-center rounded-xl btn-primary transition-all"
                  style={{
                    width: 36,
                    height: 36,
                    opacity: input.trim() ? 1 : 0.35,
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                  }}
                  title="Send (Enter)"
                >
                  <ArrowUp size={16} />
                </button>
              )}
            </div>

            {/* Footer hint */}
            <p
              className="text-center mt-2"
              style={{ fontSize: 11, color: 'var(--nx-muted)' }}
            >
              Enter to send · Shift+Enter for newline · Powered by{' '}
              <span style={{ color: 'var(--nx-indigo-light)' }}>Coral SQL</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Query Glass panel ── */}
      {qgOpen && qgSQL && (
        <QueryGlass
          sql={qgSQL}
          rows={qgRows}
          sources={qgSources}
          executionTime={qgTime}
          onClose={() => setQgOpen(false)}
        />
      )}
    </div>
  )
}
