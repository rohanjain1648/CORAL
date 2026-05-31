'use client'

import { useState } from 'react'
import Shell from '@/components/layout/Shell'
import { BarChart3, Clock, TrendingDown, AlertTriangle, RefreshCw, Zap } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import type { DataRow } from '@/types'

interface SparkPoint { value: number }

interface DoraMetric {
  key: string
  label: string
  value: string | null
  unit: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  color: string
  description: string
  benchmark: string
  sparkData: SparkPoint[]
  sql: string
  sparkSQL: string
}

const METRICS: DoraMetric[] = [
  {
    key: 'freq',
    label: 'Deployment Frequency',
    value: null, unit: 'deploys/week', icon: Zap, color: '#6366f1',
    description: 'How often your team deploys to production',
    benchmark: 'Elite: multiple/day',
    sparkData: [],
    sql: `SELECT COUNT(*) AS value FROM github.pull_requests WHERE merged_at >= CURRENT_DATE - 7 AND base_ref = 'main'`,
    sparkSQL: `SELECT DATE_TRUNC('week', merged_at) AS week, COUNT(*) AS value FROM github.pull_requests WHERE merged_at >= CURRENT_DATE - 56 AND base_ref = 'main' GROUP BY week ORDER BY week`,
  },
  {
    key: 'lead',
    label: 'Lead Time for Changes',
    value: null, unit: 'hours avg', icon: Clock, color: '#06b6d4',
    description: 'Time from first commit to production deploy',
    benchmark: 'Elite: < 1 hour',
    sparkData: [],
    sql: `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (merged_at - created_at)) / 3600), 1) AS value FROM github.pull_requests WHERE merged_at >= CURRENT_DATE - 30`,
    sparkSQL: `SELECT DATE_TRUNC('week', merged_at) AS week, ROUND(AVG(EXTRACT(EPOCH FROM (merged_at - created_at)) / 3600), 1) AS value FROM github.pull_requests WHERE merged_at >= CURRENT_DATE - 56 GROUP BY week ORDER BY week`,
  },
  {
    key: 'mttr',
    label: 'Mean Time to Recovery',
    value: null, unit: 'minutes avg', icon: TrendingDown, color: '#10b981',
    description: 'How quickly you recover from production incidents',
    benchmark: 'Elite: < 1 hour',
    sparkData: [],
    sql: `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60), 1) AS value FROM pagerduty.incidents WHERE created_at >= CURRENT_DATE - 30 AND resolved_at IS NOT NULL`,
    sparkSQL: `SELECT DATE_TRUNC('week', created_at) AS week, ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60), 1) AS value FROM pagerduty.incidents WHERE created_at >= CURRENT_DATE - 56 AND resolved_at IS NOT NULL GROUP BY week ORDER BY week`,
  },
  {
    key: 'cfr',
    label: 'Change Failure Rate',
    value: null, unit: '% of deploys', icon: AlertTriangle, color: '#f59e0b',
    description: 'Percentage of deploys that cause a production incident',
    benchmark: 'Elite: 0–5%',
    sparkData: [],
    sql: `SELECT ROUND(COUNT(DISTINCT s.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM github.pull_requests WHERE merged_at >= CURRENT_DATE - 30), 0), 1) AS value FROM sentry.issues s WHERE s.first_seen >= CURRENT_DATE - 30 AND s.level = 'fatal'`,
    sparkSQL: `SELECT DATE_TRUNC('week', s.first_seen) AS week, COUNT(DISTINCT s.id) AS value FROM sentry.issues s WHERE s.first_seen >= CURRENT_DATE - 56 AND s.level = 'fatal' GROUP BY week ORDER BY week`,
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

function Sparkline({ data, color }: { data: SparkPoint[]; color: string }) {
  if (!data.length) return <div style={{ height: 44 }} />
  const gradId = `g${color.replace('#', '')}`
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ background: 'var(--nx-surface)', border: '1px solid var(--nx-border)', borderRadius: 8, fontSize: 11, color: 'var(--nx-text)' }}
          itemStyle={{ color }}
          labelFormatter={() => ''}
          formatter={(v: number) => [v, '']}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
          fill={`url(#${gradId})`} dot={false} animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function DoraCard({ metric, loading }: { metric: DoraMetric; loading: boolean }) {
  const Icon = metric.icon
  return (
    <div className="glass-card p-5 flex flex-col gap-3"
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 24px ${metric.color}20`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
      style={{ transition: 'box-shadow 0.2s' }}>

      <div className="flex items-start justify-between">
        <div>
          <div style={{ fontSize: 11, color: 'var(--nx-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            {metric.label}
          </div>
          {loading ? (
            <div className="shimmer rounded-lg" style={{ width: 72, height: 32 }} />
          ) : metric.value !== null ? (
            <div className="flex items-end gap-1.5">
              <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--nx-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {metric.value}
              </span>
              <span style={{ fontSize: 12, color: 'var(--nx-muted)', paddingBottom: 3 }}>{metric.unit}</span>
            </div>
          ) : (
            <span style={{ fontSize: 26, color: 'var(--nx-muted)', lineHeight: 1 }}>—</span>
          )}
        </div>
        <div className="rounded-xl flex items-center justify-center"
          style={{ width: 38, height: 38, background: `${metric.color}18`, border: `1px solid ${metric.color}22`, flexShrink: 0 }}>
          <Icon size={17} style={{ color: metric.color }} />
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline data={metric.sparkData} color={metric.color} />

      <div className="flex items-center justify-between">
        <p style={{ fontSize: 11, color: 'var(--nx-muted)' }}>{metric.description}</p>
        <span style={{ fontSize: 10, color: metric.color, fontWeight: 500, whiteSpace: 'nowrap', marginLeft: 8 }}>
          {metric.benchmark}
        </span>
      </div>
    </div>
  )
}

export default function DoraPage() {
  const [metrics, setMetrics] = useState<DoraMetric[]>(METRICS)
  const [loading, setLoading] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculate = async () => {
    setLoading(true); setError(null)

    const updated = metrics.map(m => ({ ...m }))

    await Promise.all(
      updated.map(async (m, i) => {
        try {
          const [valueRows, sparkRows] = await Promise.all([
            runSQL(m.sql),
            runSQL(m.sparkSQL).catch(() => []),
          ])
          if (valueRows.length > 0) {
            const val = Object.values(valueRows[0]).find(v => v !== null && !isNaN(Number(v)))
            if (val !== undefined) updated[i].value = parseFloat(String(val)).toFixed(1)
          }
          updated[i].sparkData = sparkRows.map(r => ({
            value: parseFloat(String(Object.values(r).find(v => !isNaN(Number(v))) ?? '0')),
          }))
        } catch {
          updated[i].value = 'ERR'
        }
      })
    )

    setMetrics(updated)
    setLastRun(new Date().toLocaleTimeString())
    setLoading(false)
  }

  return (
    <Shell>
      <div className="h-full overflow-y-auto p-6">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <BarChart3 size={20} style={{ color: 'var(--nx-indigo)' }} />
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--nx-text)' }}>DORA Metrics</h1>
              </div>
              <p style={{ fontSize: 13, color: 'var(--nx-muted)' }}>
                Live engineering performance via Coral SQL — GitHub · Sentry · PagerDuty.
                {lastRun && <span style={{ color: 'var(--nx-text-2)' }}> Updated {lastRun}</span>}
              </p>
            </div>
            <button onClick={calculate} disabled={loading}
              className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium"
              style={{ opacity: loading ? 0.7 : 1 }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin-slow 0.8s linear infinite' : 'none' }} />
              {loading ? 'Calculating…' : 'Calculate Now'}
            </button>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13 }}>
              <AlertTriangle size={14} />{error}
            </div>
          )}

          <div className="glass-card px-5 py-4 mb-6" style={{ background: 'rgba(99,102,241,0.05)' }}>
            <p style={{ fontSize: 13, color: 'var(--nx-text-2)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--nx-indigo-light)', fontWeight: 600 }}>How it works:</span>
              {' '}Each metric runs a Coral SQL query across GitHub (deployments), Sentry (failures), and PagerDuty (incidents).
              Sparklines show the 8-week trend. All data is live from your connected sources.
            </p>
          </div>

          {/* Metric cards grid */}
          <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {metrics.map(m => <DoraCard key={m.key} metric={m} loading={loading} />)}
          </div>

          {/* SQL reference */}
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--nx-text-2)', marginBottom: 10 }}>
            Coral SQL Queries
          </h2>
          <div className="flex flex-col gap-2">
            {metrics.map(m => (
              <details key={m.key} className="glass-card overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer flex items-center justify-between"
                  style={{ fontSize: 12, color: 'var(--nx-text-2)', listStyle: 'none', userSelect: 'none' }}>
                  <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--nx-muted)' }}>expand ↓</span>
                </summary>
                <pre style={{ padding: '10px 16px', margin: 0, fontSize: 11.5, lineHeight: 1.7, fontFamily: 'var(--font-geist-mono)', color: 'var(--nx-text-2)', borderTop: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.15)', overflowX: 'auto' }}>
                  {m.sql}
                </pre>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  )
}
