'use client'

import { X, Copy, CheckCheck, Clock, Database } from 'lucide-react'
import { useState } from 'react'
import { formatDuration, SOURCE_META } from '@/lib/utils'
import type { DataRow } from '@/types'

interface QueryGlassProps {
  sql: string
  rows: DataRow[]
  sources: string[]
  executionTime: number
  onClose: () => void
}

export default function QueryGlass({ sql, rows, sources, executionTime, onClose }: QueryGlassProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex flex-col h-full animate-slide-in"
      style={{
        width: 'var(--nx-qg-w)',
        flexShrink: 0,
        background: 'var(--nx-surface)',
        borderLeft: '1px solid var(--nx-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--nx-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="rounded-md flex items-center justify-center"
            style={{ width: 22, height: 22, background: 'var(--nx-indigo-dim)' }}
          >
            <Database size={12} style={{ color: 'var(--nx-indigo-light)' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--nx-text)' }}>
            Query Glass
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--nx-muted)' }}>
            <Clock size={11} />
            {formatDuration(executionTime)}
          </div>
          <div
            className="rounded-full px-2 py-0.5"
            style={{ fontSize: 11, background: 'var(--nx-indigo-dim)', color: 'var(--nx-indigo-light)' }}
          >
            {rows.length} {rows.length === 1 ? 'row' : 'rows'}
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nx-muted)', display: 'flex', padding: 2 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--nx-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--nx-muted)')}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* SQL block */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        <div className="relative group">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid var(--nx-border)',
            }}
          >
            {/* Copy button */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: '1px solid var(--nx-border)', fontSize: 11, color: 'var(--nx-muted)' }}
            >
              <span>SQL</span>
              <button
                onClick={copy}
                className="flex items-center gap-1 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--nx-success)' : 'var(--nx-muted)' }}
                onMouseEnter={e => !copied && (e.currentTarget.style.color = 'var(--nx-text)')}
                onMouseLeave={e => !copied && (e.currentTarget.style.color = 'var(--nx-muted)')}
              >
                {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Syntax-highlighted SQL */}
            <pre
              className="p-4 overflow-x-auto"
              style={{
                fontSize: 12.5,
                lineHeight: 1.7,
                fontFamily: 'var(--font-geist-mono), monospace',
                color: 'var(--nx-text-2)',
                margin: 0,
              }}
            >
              {highlightSQL(sql)}
            </pre>
          </div>
        </div>

        {/* Sources used */}
        {sources.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--nx-muted)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Sources queried
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map(src => {
                const meta = SOURCE_META[src] ?? { label: src, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' }
                return (
                  <div
                    key={src}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ background: meta.bg, border: `1px solid ${meta.color}22`, fontSize: 12 }}
                  >
                    <div className="rounded-full" style={{ width: 6, height: 6, background: meta.color }} />
                    <span style={{ color: meta.color, fontWeight: 500 }}>{meta.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Row preview */}
        {rows.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--nx-muted)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Result preview
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.2)' }}
            >
              <div style={{ overflowX: 'auto', maxHeight: 200, overflowY: 'auto' }}>
                <table className="nx-table">
                  <thead>
                    <tr>
                      {Object.keys(rows[0]).map(col => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 4).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} title={String(val ?? '')}>{String(val ?? '').slice(0, 30)}{String(val ?? '').length > 30 ? '…' : ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 4 && (
                <div
                  className="px-3 py-2 text-center"
                  style={{ fontSize: 11, color: 'var(--nx-muted)', borderTop: '1px solid var(--nx-border)' }}
                >
                  +{rows.length - 4} more rows shown in chat
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--nx-border)', flexShrink: 0 }}
      >
        <div
          className="flex-1 rounded-lg px-3 py-2"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
        >
          <p style={{ fontSize: 11, color: 'var(--nx-text-2)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--nx-indigo-light)', fontWeight: 600 }}>Coral SQL</span>
            {' '}executed this join locally — no data left your machine.
          </p>
        </div>
      </div>
    </div>
  )
}

/* Minimal SQL syntax highlighter */
function highlightSQL(sql: string): React.ReactNode {
  const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|WITH|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|BETWEEN|LIKE|EXISTS|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|DATE_TRUNC|EXTRACT|INTERVAL|CURRENT_DATE|NOW|COUNT|SUM|AVG|MIN|MAX|COALESCE|NULLIF|CONCAT|LOWER|UPPER|TRIM|CAST|DATE|TIMESTAMP)\b/gi
  const strings = /(\'[^\']*\'|\"[^\"]*\")/g
  const numbers = /\b(\d+(\.\d+)?)\b/g
  const comments = /(--[^\n]*)/g
  const tables = /\b(github|sentry|pagerduty|datadog|stripe|linear|slack|jira|confluence|buildkite|coral)\.\w+/gi

  const parts: React.ReactNode[] = []
  let i = 0
  const tokens: Array<{ start: number; end: number; type: string; text: string }> = []

  // Collect all token ranges
  ;[
    { re: comments, type: 'comment' },
    { re: strings, type: 'string' },
    { re: tables, type: 'table' },
    { re: keywords, type: 'keyword' },
    { re: numbers, type: 'number' },
  ].forEach(({ re, type }) => {
    let m
    while ((m = re.exec(sql)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, type, text: m[0] })
    }
  })

  tokens.sort((a, b) => a.start - b.start)

  // Remove overlapping tokens
  const clean: typeof tokens = []
  let cursor = 0
  for (const t of tokens) {
    if (t.start >= cursor) { clean.push(t); cursor = t.end }
  }

  // Render
  let pos = 0
  for (const t of clean) {
    if (t.start > pos) parts.push(<span key={pos}>{sql.slice(pos, t.start)}</span>)
    const cls =
      t.type === 'keyword'  ? 'sql-keyword'  :
      t.type === 'table'    ? 'sql-table'    :
      t.type === 'string'   ? 'sql-string'   :
      t.type === 'number'   ? 'sql-number'   :
      t.type === 'comment'  ? 'sql-comment'  : ''
    parts.push(<span key={t.start} className={cls}>{t.text}</span>)
    pos = t.end
  }
  if (pos < sql.length) parts.push(<span key={pos}>{sql.slice(pos)}</span>)

  return parts
}
