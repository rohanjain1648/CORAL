'use client'

import { useState } from 'react'
import Shell from '@/components/layout/Shell'
import {
  Zap, AlertTriangle, CheckCircle2, Info,
  GitBranch, Search, RotateCcw
} from 'lucide-react'
import type { DataRow } from '@/types'

interface RiskFactor {
  label: string
  value: string
  severity: 'good' | 'low' | 'medium' | 'high'
  points: number
}

interface RiskResult {
  score: number
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: RiskFactor[]
  prTitle: string
  prAuthor: string
  changeSize: number
  filesChanged: number
  queries: string[]
}

const SEVERITY_COLOR: Record<string, string> = {
  good:   '#10b981',
  low:    '#f59e0b',
  medium: '#f97316',
  high:   '#ef4444',
}

const LEVEL_CONFIG = {
  LOW:      { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  label: 'LOW RISK',      icon: CheckCircle2 },
  MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  label: 'MEDIUM RISK',   icon: Info },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)',  label: 'HIGH RISK',     icon: AlertTriangle },
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   label: 'CRITICAL RISK', icon: Zap },
}

function RiskGauge({ score, level }: { score: number; level: RiskResult['level'] }) {
  const color = LEVEL_CONFIG[level].color
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 160 160" style={{ width: 180, height: 180 }}>
        {/* Track */}
        <circle cx="80" cy="80" r={radius} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
        {/* Progress */}
        <circle cx="80" cy="80" r={radius} fill="none"
          stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ filter: `drop-shadow(0 0 10px ${color}80)`, transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Score */}
        <text x="80" y="70" textAnchor="middle" fill="white"
          fontSize="36" fontWeight="800" fontFamily="var(--font-geist-sans)">{score}</text>
        <text x="80" y="88" textAnchor="middle" fill="rgba(255,255,255,0.3)"
          fontSize="13" fontFamily="var(--font-geist-sans)">/100</text>
        <text x="80" y="108" textAnchor="middle" fill={color}
          fontSize="12" fontWeight="700" fontFamily="var(--font-geist-sans)"
          letterSpacing="0.08em">{LEVEL_CONFIG[level].label}</text>
      </svg>
    </div>
  )
}

function FactorRow({ factor }: { factor: RiskFactor }) {
  const color = SEVERITY_COLOR[factor.severity]
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: 'var(--nx-surface-2)', border: '1px solid var(--nx-border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full" style={{ width: 8, height: 8, background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nx-text)' }}>{factor.label}</div>
          <div style={{ fontSize: 12, color: 'var(--nx-muted)' }}>{factor.value}</div>
        </div>
      </div>
      {factor.points > 0 && (
        <div className="rounded-full px-2 py-0.5"
          style={{ fontSize: 11, background: `${color}18`, color, fontWeight: 600 }}>
          +{factor.points}
        </div>
      )}
    </div>
  )
}

async function runQuery(sql: string): Promise<DataRow[]> {
  const res = await fetch('/api/coral', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  })
  const data = await res.json() as { rows?: DataRow[]; error?: string }
  if (data.error) throw new Error(data.error)
  return data.rows ?? []
}

function computeRisk(
  prRows: DataRow[],
  sentryRows: DataRow[],
  pdRows: DataRow[],
  prNum: string,
  queries: string[]
): RiskResult {
  const pr = prRows[0] ?? {}
  const changeSize = Number(pr.additions ?? 0) + Number(pr.deletions ?? 0)
  const filesChanged = Number(pr.changed_files ?? pr.files ?? 0)

  let rawScore = 0
  const factors: RiskFactor[] = []

  // Change size
  if (changeSize > 1000) {
    rawScore += 35; factors.push({ label: 'Very large PR', value: `${changeSize.toLocaleString()} lines changed`, severity: 'high', points: 35 })
  } else if (changeSize > 500) {
    rawScore += 25; factors.push({ label: 'Large PR', value: `${changeSize.toLocaleString()} lines changed`, severity: 'medium', points: 25 })
  } else if (changeSize > 100) {
    rawScore += 12; factors.push({ label: 'Medium PR', value: `${changeSize.toLocaleString()} lines changed`, severity: 'low', points: 12 })
  } else {
    factors.push({ label: 'Small PR', value: `${changeSize.toLocaleString()} lines changed`, severity: 'good', points: 0 })
  }

  // Files changed
  if (filesChanged > 20) {
    rawScore += 20; factors.push({ label: 'Many files touched', value: `${filesChanged} files`, severity: 'high', points: 20 })
  } else if (filesChanged > 5) {
    rawScore += 10; factors.push({ label: 'Multiple files', value: `${filesChanged} files`, severity: 'medium', points: 10 })
  } else if (filesChanged > 0) {
    factors.push({ label: 'Few files', value: `${filesChanged} files`, severity: 'good', points: 0 })
  }

  // Sentry errors
  const sc = sentryRows.length
  if (sc > 20) {
    rawScore += 30; factors.push({ label: 'High error rate in project', value: `${sc} open issues (30d)`, severity: 'high', points: 30 })
  } else if (sc > 5) {
    rawScore += 18; factors.push({ label: 'Moderate errors in project', value: `${sc} open issues (30d)`, severity: 'medium', points: 18 })
  } else if (sc > 0) {
    rawScore += 8; factors.push({ label: 'Some errors in project', value: `${sc} open issues (30d)`, severity: 'low', points: 8 })
  } else {
    factors.push({ label: 'Low error rate', value: 'No recent issues', severity: 'good', points: 0 })
  }

  // PagerDuty incidents
  const pc = pdRows.length
  if (pc >= 3) {
    rawScore += 25; factors.push({ label: 'Frequent recent incidents', value: `${pc} incidents (30d)`, severity: 'high', points: 25 })
  } else if (pc >= 1) {
    rawScore += 12; factors.push({ label: 'Recent incidents', value: `${pc} incidents (30d)`, severity: 'medium', points: 12 })
  } else {
    factors.push({ label: 'Stable service', value: 'No recent incidents', severity: 'good', points: 0 })
  }

  const score = Math.min(Math.round((rawScore / 90) * 100), 100)
  const level: RiskResult['level'] =
    score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW'

  return {
    score,
    level,
    factors,
    prTitle: String(pr.title ?? `PR #${prNum}`),
    prAuthor: String(pr.user__login ?? pr.author ?? 'unknown'),
    changeSize,
    filesChanged,
    queries,
  }
}

export default function RiskPage() {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [prNum, setPrNum] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RiskResult | null>(null)

  const parsePRUrl = (url: string) => {
    const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
    if (m) { setOwner(m[1]); setRepo(m[2]); setPrNum(m[3]) }
  }

  const calculate = async () => {
    if (!owner || !repo || !prNum) return
    setLoading(true); setError(null); setResult(null)

    const q1 = `SELECT title, additions, deletions, changed_files, state, user__login FROM github.pull_requests WHERE owner='${owner}' AND repo='${repo}' AND number=${prNum} LIMIT 1`
    const q2 = `SELECT id, title, level, first_seen FROM sentry.issues WHERE project='${repo}' AND first_seen >= CURRENT_DATE - 30 LIMIT 25`
    const q3 = `SELECT id, title, urgency, created_at FROM pagerduty.incidents WHERE created_at >= CURRENT_DATE - 30 LIMIT 15`

    try {
      const [prRows, sentryRows, pdRows] = await Promise.all([
        runQuery(q1),
        runQuery(q2).catch(() => []),
        runQuery(q3).catch(() => []),
      ])
      setResult(computeRisk(prRows, sentryRows, pdRows, prNum, [q1, q2, q3]))
    } catch (e) {
      setError((e as Error).message)
    }
    setLoading(false)
  }

  const reset = () => { setResult(null); setError(null) }

  const levelCfg = result ? LEVEL_CONFIG[result.level] : null
  const LevelIcon = levelCfg?.icon ?? Info

  return (
    <Shell>
      <div className="h-full overflow-y-auto p-6">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <Zap size={20} style={{ color: 'var(--nx-warning)' }} />
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--nx-text)' }}>Pre-Merge Risk Scorer</h1>
            </div>
            <p style={{ fontSize: 13, color: 'var(--nx-muted)' }}>
              Score a pull request before merging. Combines PR size, historical Sentry errors, and PagerDuty incidents
              into a 0–100 risk score — powered by Coral SQL.
            </p>
          </div>

          {!result ? (
            <>
              {/* Input card */}
              <div className="glass-card p-6 mb-4">
                <div className="mb-5">
                  <label style={{ fontSize: 12, color: 'var(--nx-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Paste GitHub PR URL (auto-fills below)
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/owner/repo/pull/123"
                    onChange={e => parsePRUrl(e.target.value)}
                    className="nx-input w-full rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>

                <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 140px' }}>
                  {[
                    { label: 'Owner', value: owner, set: setOwner, ph: 'e.g. vercel' },
                    { label: 'Repository', value: repo, set: setRepo, ph: 'e.g. next.js' },
                    { label: 'PR Number', value: prNum, set: setPrNum, ph: 'e.g. 1234' },
                  ].map(({ label, value, set, ph }) => (
                    <div key={label}>
                      <label style={{ fontSize: 11, color: 'var(--nx-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={e => set(e.target.value)}
                        placeholder={ph}
                        className="nx-input w-full rounded-xl px-3 py-2.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              <button
                onClick={calculate}
                disabled={loading || !owner || !repo || !prNum}
                className="btn-primary w-full rounded-2xl py-3.5 text-base font-semibold flex items-center justify-center gap-2"
                style={{ opacity: (!owner || !repo || !prNum) ? 0.4 : 1 }}
              >
                {loading ? (
                  <>
                    <div className="rounded-full" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin-slow 0.8s linear infinite' }} />
                    Querying GitHub · Sentry · PagerDuty…
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Calculate Risk Score
                  </>
                )}
              </button>

              <p className="text-center mt-3" style={{ fontSize: 11, color: 'var(--nx-muted)' }}>
                Runs 3 Coral SQL queries in parallel — no data leaves your machine
              </p>
            </>
          ) : (
            /* Results */
            <div className="animate-fade-up">
              {/* PR title */}
              <div className="glass-card p-4 mb-4 flex items-center gap-3">
                <GitBranch size={16} style={{ color: 'var(--nx-muted)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nx-text)' }}>{result.prTitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--nx-muted)' }}>
                    {owner}/{repo} #{prNum} · by @{result.prAuthor}
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs btn-ghost"
                >
                  <RotateCcw size={11} /> New
                </button>
              </div>

              {/* Score + breakdown */}
              <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '200px 1fr' }}>
                {/* Gauge */}
                <div
                  className="glass-card p-5 flex flex-col items-center justify-center"
                  style={{ background: levelCfg?.bg, border: `1px solid ${levelCfg?.color}22` }}
                >
                  <RiskGauge score={result.score} level={result.level} />
                </div>

                {/* Factors */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <LevelIcon size={16} style={{ color: levelCfg?.color }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: levelCfg?.color }}>
                      {levelCfg?.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {result.factors.map((f, i) => <FactorRow key={i} factor={f} />)}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: levelCfg?.bg, border: `1px solid ${levelCfg?.color}20` }}
              >
                <div style={{ fontSize: 13, color: 'var(--nx-text)', lineHeight: 1.6 }}>
                  <strong style={{ color: levelCfg?.color }}>Recommendation: </strong>
                  {result.level === 'LOW' && 'Safe to merge. Change set is small and the service has been stable.'}
                  {result.level === 'MEDIUM' && 'Merge with caution. Consider a staging deploy first and monitor error rates for 15 minutes post-deploy.'}
                  {result.level === 'HIGH' && 'High risk. Strongly recommend feature flag wrapping, staged rollout, and on-call engineer awareness before merging.'}
                  {result.level === 'CRITICAL' && 'Do NOT merge on Friday or without a rollback plan. Coordinate with on-call, wrap in a feature flag, and deploy to staging first.'}
                </div>
              </div>

              {/* SQL queries used */}
              <details className="glass-card overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer"
                  style={{ fontSize: 12, color: 'var(--nx-muted)', listStyle: 'none', userSelect: 'none' }}>
                  <span style={{ color: 'var(--nx-indigo-light)' }}>▸ Coral SQL queries executed ({result.queries.length})</span>
                </summary>
                {result.queries.map((q, i) => (
                  <pre key={i} style={{
                    padding: '10px 16px',
                    margin: 0,
                    fontSize: 11.5,
                    lineHeight: 1.7,
                    fontFamily: 'var(--font-geist-mono)',
                    color: 'var(--nx-text-2)',
                    borderTop: '1px solid var(--nx-border)',
                    background: 'rgba(0,0,0,0.2)',
                    overflowX: 'auto',
                  }}>
                    {q}
                  </pre>
                ))}
              </details>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
