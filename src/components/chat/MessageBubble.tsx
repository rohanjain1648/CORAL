'use client'

import { HexagonIcon, User } from 'lucide-react'
import { SOURCE_META } from '@/lib/utils'
import DataTable from './DataTable'
import IncidentTimeline from './IncidentTimeline'
import type { Message, DataRow } from '@/types'

const TIMELINE_KEYS = ['created_at', 'merged_at', 'first_seen', 'started_at', 'triggered_at', 'resolved_at']

function looksLikeTimeline(rows: DataRow[]): boolean {
  if (rows.length < 2) return false
  const keys = Object.keys(rows[0])
  return TIMELINE_KEYS.some(k => keys.includes(k))
}

interface MessageBubbleProps {
  message: Message
  onSQLClick?: () => void
}

export default function MessageBubble({ message, onSQLClick }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-up" style={{ padding: '4px 0' }}>
        <div
          className="flex items-end gap-2.5"
          style={{ maxWidth: '75%', flexDirection: 'row-reverse' }}
        >
          {/* Avatar */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 28,
              height: 28,
              background: 'var(--nx-surface-3)',
              border: '1px solid var(--nx-border-2)',
              marginBottom: 2,
            }}
          >
            <User size={13} style={{ color: 'var(--nx-muted)' }} />
          </div>

          {/* Bubble */}
          <div
            className="rounded-2xl rounded-tr-sm px-4 py-3"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              fontSize: 14,
              lineHeight: 1.6,
              boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  // Assistant message
  const { queryResult } = message

  return (
    <div className="flex items-start gap-3 animate-fade-up" style={{ padding: '4px 0', maxWidth: '100%' }}>
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          boxShadow: '0 0 12px rgba(99,102,241,0.3)',
          marginTop: 2,
        }}
      >
        <HexagonIcon size={13} strokeWidth={2.5} color="white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div
          className="glass-card px-4 py-3"
          style={{ fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word' }}
        >
          {/* Text content */}
          <div style={{ color: 'var(--nx-text)', whiteSpace: 'pre-wrap' }}>
            {renderMarkdownLike(message.content)}
          </div>

          {/* Timeline or table depending on data shape */}
          {queryResult && queryResult.rows.length > 0 && (
            looksLikeTimeline(queryResult.rows)
              ? <IncidentTimeline rows={queryResult.rows} />
              : <DataTable rows={queryResult.rows} />
          )}

          {/* Source pills + SQL link */}
          {queryResult && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {queryResult.sources.map(src => {
                const meta = SOURCE_META[src] ?? { label: src, color: '#94a3b8', bg: 'rgba(0,0,0,0)' }
                return (
                  <div
                    key={src}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5"
                    style={{ background: meta.bg, fontSize: 11 }}
                  >
                    <div className="rounded-full" style={{ width: 5, height: 5, background: meta.color }} />
                    <span style={{ color: meta.color, fontWeight: 500 }}>{meta.label}</span>
                  </div>
                )
              })}

              {onSQLClick && (
                <button
                  onClick={onSQLClick}
                  style={{
                    fontSize: 11,
                    color: 'var(--nx-indigo-light)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: 4,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  View SQL →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function renderMarkdownLike(text: string): React.ReactNode {
  if (!text) return null

  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={j}
            style={{
              background: 'rgba(99,102,241,0.12)',
              color: 'var(--nx-indigo-light)',
              borderRadius: 4,
              padding: '1px 5px',
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.9em',
            }}
          >
            {part.slice(1, -1)}
          </code>
        )
      }
      return <span key={j}>{part}</span>
    })

    // Heading detection
    if (line.startsWith('## ')) {
      return (
        <p key={i} style={{ fontWeight: 700, fontSize: 15, color: 'var(--nx-text)', marginTop: 12, marginBottom: 4 }}>
          {line.slice(3)}
        </p>
      )
    }
    if (line.startsWith('# ')) {
      return (
        <p key={i} style={{ fontWeight: 700, fontSize: 17, color: 'var(--nx-text)', marginTop: 12, marginBottom: 4 }}>
          {line.slice(2)}
        </p>
      )
    }
    // Bullet
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} className="flex gap-2" style={{ marginLeft: 8, marginTop: 2 }}>
          <span style={{ color: 'var(--nx-indigo)', marginTop: 1 }}>•</span>
          <span>{rendered.slice(1)}</span>
        </div>
      )
    }
    if (line === '') return <div key={i} style={{ height: 6 }} />
    return <div key={i}>{rendered}</div>
  })
}
