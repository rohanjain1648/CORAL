'use client'

import { SOURCE_META } from '@/lib/utils'
import type { DataRow } from '@/types'

interface TimelineEvent {
  time: string
  source: string
  title: string
  subtitle?: string
  severity?: string
}

interface IncidentTimelineProps {
  rows: DataRow[]
}

function parseEvents(rows: DataRow[]): TimelineEvent[] {
  return rows.map(row => {
    // Detect timestamp column
    const tsKeys = ['created_at', 'merged_at', 'first_seen', 'started_at', 'triggered_at', 'timestamp', 'opened_at']
    const tsKey = tsKeys.find(k => row[k])
    const time = tsKey ? formatTime(String(row[tsKey])) : ''

    // Detect source from schema prefix in any key — fall back to content heuristics
    let source = 'unknown'
    const titleStr = String(row.title ?? row.error_message ?? row.name ?? row.message ?? '')
    const keys = Object.keys(row)
    if (keys.some(k => k.includes('sha') || k.includes('merged_by') || k.includes('additions'))) {
      source = 'github'
    } else if (keys.some(k => k.includes('error_message') || k.includes('times_seen') || k.includes('level'))) {
      source = 'sentry'
    } else if (keys.some(k => k.includes('urgency') || k.includes('incident_key') || k.includes('resolved_at'))) {
      source = 'pagerduty'
    } else if (keys.some(k => k.includes('latency') || k.includes('metric') || k.includes('p99'))) {
      source = 'datadog'
    } else if (keys.some(k => k.includes('channel') || k.includes('text') || k.includes('slack'))) {
      source = 'slack'
    }

    const subtitle = [
      row.author, row.merged_by, row.user__login,
      row.error_message, row.level,
      row.urgency, row.state,
    ].filter(Boolean).map(String).slice(0, 2).join(' · ')

    return { time, source, title: titleStr || JSON.stringify(row).slice(0, 80), subtitle }
  }).filter(e => e.title)
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ts.slice(0, 16)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return ts.slice(0, 16)
  }
}

const SEVERITY_DOT: Record<string, string> = {
  fatal: '#ef4444',
  error: '#f97316',
  warning: '#f59e0b',
  info: '#06b6d4',
  P1: '#ef4444',
  P2: '#f97316',
  high: '#ef4444',
  low: '#f59e0b',
}

export default function IncidentTimeline({ rows }: IncidentTimelineProps) {
  if (!rows.length) return null

  const events = parseEvents(rows)
  if (!events.length) return null

  return (
    <div className="mt-3 rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.2)' }}>

      {/* Header */}
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.15)' }}>
        <div className="rounded-full" style={{ width: 6, height: 6, background: '#ef4444', boxShadow: '0 0 6px #ef4444', animation: 'pulseGlow 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--nx-text-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Incident Timeline
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--nx-muted)' }}>
          {events.length} events
        </span>
      </div>

      {/* Events */}
      <div className="px-4 py-3" style={{ maxHeight: 320, overflowY: 'auto' }}>
        {events.map((event, i) => {
          const meta = SOURCE_META[event.source] ?? { label: event.source, color: '#94a3b8', bg: 'transparent' }
          const isLast = i === events.length - 1

          return (
            <div key={i} className="flex gap-3" style={{ minHeight: 48 }}>
              {/* Left: time + line */}
              <div className="flex flex-col items-center" style={{ width: 48, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: 'var(--nx-muted)', fontFamily: 'var(--font-geist-mono)', whiteSpace: 'nowrap' }}>
                  {event.time}
                </span>
                {!isLast && (
                  <div style={{ flex: 1, width: 1, background: 'var(--nx-border)', margin: '4px 0' }} />
                )}
              </div>

              {/* Node */}
              <div className="flex-shrink-0 mt-0.5">
                <div className="rounded-full"
                  style={{ width: 10, height: 10, background: meta.color, boxShadow: `0 0 6px ${meta.color}66`, marginTop: 3 }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start gap-2 flex-wrap">
                  <div className="rounded-full px-2 py-0.5 flex-shrink-0"
                    style={{ fontSize: 10, fontWeight: 600, background: meta.bg, color: meta.color, border: `1px solid ${meta.color}22` }}>
                    {meta.label}
                  </div>
                  {event.subtitle && SEVERITY_DOT[event.subtitle] && (
                    <div className="rounded-full px-2 py-0.5"
                      style={{ fontSize: 10, background: `${SEVERITY_DOT[event.subtitle]}18`, color: SEVERITY_DOT[event.subtitle] }}>
                      {event.subtitle}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--nx-text)', marginTop: 4, lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {event.title.length > 100 ? event.title.slice(0, 100) + '…' : event.title}
                </div>
                {event.subtitle && !SEVERITY_DOT[event.subtitle] && (
                  <div style={{ fontSize: 11, color: 'var(--nx-muted)', marginTop: 2 }}>
                    {event.subtitle}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
