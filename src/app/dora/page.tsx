'use client'

import { useState } from 'react'
import Shell from '@/components/layout/Shell'
import { BarChart3, TrendingUp, TrendingDown, Clock, AlertTriangle, RefreshCw, Zap } from 'lucide-react'
import type { DataRow } from '@/types'

interface DoraMetric {
  label: string
  value: string | null
  unit: string
  trend?: 'up' | 'down' | 'neutral'
  good?: boolean
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  color: string
  sql: string
  description: string
}

const METRICS: DoraMetric[] = [
  {
    label: 'Deployment Frequency',
    value: null,
    unit: 'deploys/week',
    icon: Zap,
    color: '#6366f1',
    description: 'How often your team deploys to production',
    sql: `SELECT
  COUNT(*) AS deploys,
  DATE_TRUNC('week', merged_at) AS week
FROM github.pull_requests
WHERE merged_at >= CURRENT_DATE - 30
  AND base_ref = 'main'
GROUP BY week
ORDER BY week DESC
LIMIT 4`,
  },
  {
    label: 'Lead Time for Changes',
    value: null,
    unit: 'hours avg',
    icon: Clock,
    color: '#06b6d4',
    description: 'Time from first commit to production deploy',
    sql: `SELECT
  AVG(
    EXTRACT(EPOCH FROM (merged_at - created_at)) / 3600
  ) AS avg_lead_time_hours
FROM github.pull_requests
WHERE merged_at >= CURRENT_DATE - 30`,
  },
  {
    label: 'Mean Time to Recovery',
    value: null,
    unit: 'minutes avg',
    icon: TrendingDown,
    color: '#10b981',
    description: 'How quickly you recover from production incidents',
    sql: `SELECT
  AVG(
    EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60
  ) AS avg_mttr_minutes
FROM pagerduty.incidents
WHERE created_at >= CURRENT_DATE - 30
  AND resolved_at IS NOT NULL`,
  },
  {
    label: 'Change Failure Rate',
    value: null,
    unit: '% of deploys',
    icon: AlertTriangle,
    color: '#f59e0b',
    description: 'Percentage of deploys that cause production incidents',
    sql: `SELECT
  COUNT(DISTINCT s.id) AS failures,
  (
    SELECT COUNT(*) FROM github.pull_requests
    WHERE merged_at >= CURRENT_DATE - 30
  ) AS total_deploys,
  ROUND(
    COUNT(DISTINCT s.id) * 100.0 /
    NULLIF((SELECT COUNT(*) FROM github.pull_requests WHERE merged_at >= CURRENT_DATE - 30), 0),
    1
  ) AS failure_rate_pct
FROM sentry.issues s
WHERE s.first_seen >= CURRENT_DATE - 30
  AND s.level = 'fatal'`,
  },
]

async function runSQL(sql: string): Promise<DataRow[]> {
  const res = await fetch('/api/coral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  })
  const data = await res.json() as { rows?: DataRow[]; error?: string }
  if (data.error) throw new Error(data.error)
  return data.rows ?? []
}

function DoraCard({ metric, loading }: { metric: DoraMetric; loading: boolean }) {
  const Icon = metric.icon

  return (
    <div
      className="glass-card p-6 flex flex-col gap-4"
      style={{ transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 30px ${metric.color}20`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div style={{ fontSize: 12, color: 'var(--nx-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
            {metric.label}
          </div>
          <div className="flex items-end gap-2">
            {loading ? (
              <div className="shimmer rounded-lg" style={{ width: 80, height: 36 }} />
            ) : metric.value !== null ? (
              <>
                <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--nx-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {metric.value}
                </span>
                <span style={{ fontSize: 13, color: 'var(--nx-muted)', marginBottom: 4 }}>{metric.unit}</span>
              </>
            ) : (
              <span style={{ fontSize: 24, color: 'var(--nx-muted)' }}>—</span>
            )}
          </div>
        </div>
        <div
          className="rounded-xl flex items-center justify-center"
          style={{ width: 40, height: 40, background: `${metric.color}18`, border: `1px solid ${metric.color}22`, flexShrink: 0 }}
        >
          <Icon size={18} style={{ color: metric.color }} />
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--nx-muted)', lineHeight: 1.5 }}>
        {metric.description}
      </p>
    </div>
  )
}

export default function DoraPage() {
  const [metrics, setMetrics] = useState<DoraMetric[]>(METRICS)
  const [loading, setLoading] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculate = async () => {
    setLoading(true)
    setError(null)

    const updated = [...METRICS]

    for (let i = 0; i < METRICS.length; i++) {
      try {
        const rows = await runSQL(METRICS[i].sql)
        if (rows.length > 0) {
          const row = rows[0]
          // Extract the first numeric value from the row
          const numVal = Object.values(row).find(v => v !== null && !isNaN(Number(v)))
          if (numVal !== undefined) {
            updated[i] = { ...updated[i], value: parseFloat(String(numVal)).toFixed(1) }
          }
        }
      } catch (e) {
        updated[i] = { ...updated[i], value: 'ERR' }
      }
    }

    setMetrics(updated)
    setLastRun(new Date().toLocaleTimeString())
    setLoading(false)
  }

  return (
    <Shell>
      <div className="h-full overflow-y-auto p-6">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <BarChart3 size={20} style={{ color: 'var(--nx-indigo)' }} />
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--nx-text)' }}>DORA Metrics</h1>
              </div>
              <p style={{ fontSize: 13, color: 'var(--nx-muted)' }}>
                Live engineering performance metrics calculated from your real data via Coral SQL.
                {lastRun && <span style={{ color: 'var(--nx-text-2)' }}> Last updated: {lastRun}</span>}
              </p>
            </div>
            <button
              onClick={calculate}
              disabled={loading}
              className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin-slow 1s linear infinite' : 'none' }} />
              {loading ? 'Calculating…' : 'Calculate Now'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13 }}
            >
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Coral not configured banner */}
          <div
            className="rounded-xl px-5 py-4 mb-6 flex items-start gap-3"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div style={{ fontSize: 13, color: 'var(--nx-text-2)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--nx-indigo-light)', fontWeight: 600 }}>How it works:</span>
              {' '}Clicking "Calculate Now" runs 4 Coral SQL queries across GitHub, Sentry, and PagerDuty simultaneously
              to compute your live DORA metrics. No data leaves your machine.
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {metrics.map(m => (
              <DoraCard key={m.label} metric={m} loading={loading} />
            ))}
          </div>

          {/* SQL reference */}
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--nx-text-2)', marginBottom: 12 }}>
              Coral SQL Queries
            </h2>
            <div className="flex flex-col gap-3">
              {metrics.map(m => (
                <details
                  key={m.label}
                  className="glass-card overflow-hidden"
                  style={{ cursor: 'pointer' }}
                >
                  <summary
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ fontSize: 13, color: 'var(--nx-text-2)', listStyle: 'none', userSelect: 'none' }}
                  >
                    <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--nx-muted)' }}>expand ↓</span>
                  </summary>
                  <pre
                    style={{
                      padding: '12px 16px',
                      margin: 0,
                      fontSize: 12,
                      lineHeight: 1.7,
                      fontFamily: 'var(--font-geist-mono), monospace',
                      color: 'var(--nx-text-2)',
                      borderTop: '1px solid var(--nx-border)',
                      background: 'rgba(0,0,0,0.2)',
                      overflowX: 'auto',
                    }}
                  >
                    {m.sql}
                  </pre>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
