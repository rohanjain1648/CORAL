'use client'

import { useEffect, useState } from 'react'
import Shell from '@/components/layout/Shell'
import { Plug, CheckCircle2, XCircle, RefreshCw, ChevronDown, Terminal } from 'lucide-react'

interface Source {
  id: string
  label: string
  color: string
  description: string
  connected: boolean
  tables: string[]
}

interface SourcesData {
  coralAvailable: boolean
  sources: Source[]
  error?: string
}

export default function SourcesPage() {
  const [data, setData] = useState<SourcesData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sources')
      const json = await res.json() as SourcesData
      setData(json)
    } catch {
      setData({ coralAvailable: false, sources: [] })
    }
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const connected = data?.sources.filter(s => s.connected).length ?? 0
  const total = data?.sources.length ?? 0

  return (
    <Shell>
      <div className="h-full overflow-y-auto p-6">
        <div style={{ maxWidth: 780, margin: '0 auto' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Plug size={20} style={{ color: 'var(--nx-cyan)' }} />
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--nx-text)' }}>Data Sources</h1>
              </div>
              <p style={{ fontSize: 13, color: 'var(--nx-muted)' }}>
                {loading ? 'Detecting…' : `${connected} of ${total} sources connected via Coral`}
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="btn-ghost flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin-slow 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {/* Coral status banner */}
          {data && (
            <div
              className="rounded-xl px-5 py-4 mb-6 flex items-center gap-3"
              style={{
                background: data.coralAvailable ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${data.coralAvailable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              {data.coralAvailable
                ? <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                : <XCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
              }
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: data.coralAvailable ? '#34d399' : '#fca5a5' }}>
                  Coral CLI {data.coralAvailable ? 'detected' : 'not found'}
                </span>
                {!data.coralAvailable && (
                  <p style={{ fontSize: 12, color: 'var(--nx-muted)', marginTop: 2 }}>
                    Install from{' '}
                    <a href="https://withcoral.com/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--nx-indigo-light)' }}>
                      withcoral.com/docs
                    </a>
                    {' '}and set CORAL_BIN in .env.local
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Source cards */}
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shimmer rounded-2xl mb-3" style={{ height: 80 }} />
              ))
            : data?.sources.map(src => (
                <div
                  key={src.id}
                  className="glass-card mb-3 overflow-hidden"
                  style={{ transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => src.connected && (e.currentTarget.style.boxShadow = `0 0 24px ${src.color}15`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                      {/* Dot */}
                      <div
                        className="rounded-full flex-shrink-0"
                        style={{
                          width: 10,
                          height: 10,
                          background: src.connected ? src.color : 'var(--nx-muted)',
                          boxShadow: src.connected ? `0 0 8px ${src.color}` : 'none',
                          animation: src.connected ? 'pulseGlow 2s ease-in-out infinite' : 'none',
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nx-text)' }}>
                          {src.label}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--nx-muted)', marginTop: 1 }}>
                          {src.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {src.connected ? (
                        <span
                          className="rounded-full px-2.5 py-1 flex items-center gap-1.5"
                          style={{ fontSize: 11, background: `${src.color}14`, color: src.color, border: `1px solid ${src.color}22` }}
                        >
                          <CheckCircle2 size={10} />
                          Connected · {src.tables.length} tables
                        </span>
                      ) : (
                        <span
                          className="rounded-full px-2.5 py-1"
                          style={{ fontSize: 11, background: 'rgba(255,255,255,0.04)', color: 'var(--nx-muted)', border: '1px solid var(--nx-border)' }}
                        >
                          Not connected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tables list */}
                  {src.connected && src.tables.length > 0 && (
                    <details>
                      <summary
                        className="flex items-center gap-2 px-5 py-2 cursor-pointer"
                        style={{ borderTop: '1px solid var(--nx-border)', fontSize: 11, color: 'var(--nx-muted)', listStyle: 'none', userSelect: 'none' }}
                      >
                        <ChevronDown size={11} />
                        {src.tables.length} tables available
                      </summary>
                      <div
                        className="px-5 py-3 flex flex-wrap gap-2"
                        style={{ borderTop: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.1)' }}
                      >
                        {src.tables.map(t => (
                          <code
                            key={t}
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: `${src.color}0d`,
                              color: src.color,
                              fontFamily: 'var(--font-geist-mono)',
                              border: `1px solid ${src.color}1a`,
                            }}
                          >
                            {src.id}.{t}
                          </code>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* How to connect */}
                  {!src.connected && (
                    <div
                      className="px-5 py-3 flex items-center gap-2"
                      style={{ borderTop: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.1)' }}
                    >
                      <Terminal size={12} style={{ color: 'var(--nx-muted)', flexShrink: 0 }} />
                      <code style={{ fontSize: 11, color: 'var(--nx-text-2)', fontFamily: 'var(--font-geist-mono)' }}>
                        coral source add {src.id}
                      </code>
                    </div>
                  )}
                </div>
              ))
          }

          {/* Add sources CTA */}
          <div
            className="mt-6 rounded-2xl px-5 py-5"
            style={{ background: 'var(--nx-indigo-dim)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--nx-text)', marginBottom: 8 }}>
              Connect more sources
            </h3>
            <p style={{ fontSize: 13, color: 'var(--nx-text-2)', lineHeight: 1.6, marginBottom: 12 }}>
              Coral has 27+ bundled sources including Datadog, Linear, Jira, Slack, Stripe, and Confluence.
              Add any source in seconds:
            </p>
            <pre
              style={{
                fontSize: 12,
                fontFamily: 'var(--font-geist-mono)',
                color: '#a5b4fc',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 10,
                padding: '10px 14px',
                overflowX: 'auto',
                margin: 0,
              }}
            >
{`coral source add datadog
coral source add linear
coral source add slack
coral source discover   # see all 27+ sources`}
            </pre>
          </div>
        </div>
      </div>
    </Shell>
  )
}
