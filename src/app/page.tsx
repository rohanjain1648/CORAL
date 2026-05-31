'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, HexagonIcon, Flame, ShieldAlert, BarChart3, GitBranch, AlertCircle, Bell } from 'lucide-react'

const SQL_DEMO = `SELECT
  g.title        AS deploy,
  g.merged_by    AS author,
  s.error_message,
  s.users_affected,
  pd.urgency     AS incident
FROM github.pull_requests g
JOIN sentry.issues s
  ON s.first_seen >= g.merged_at
JOIN pagerduty.incidents pd
  ON pd.created_at >= g.merged_at
WHERE s.level = 'fatal'
ORDER BY s.users_affected DESC
LIMIT 10`

const FEATURES = [
  {
    icon: Flame,
    title: 'Incident War Room',
    desc: 'Root cause in seconds. One JOIN across GitHub, Sentry, and PagerDuty. No tab-switching.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.15)',
  },
  {
    icon: ShieldAlert,
    title: 'Pre-Merge Risk Score',
    desc: "Know if a PR is risky before it ships. Historical error patterns + incident data = a confidence score.",
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: BarChart3,
    title: 'Live DORA Metrics',
    desc: 'Deployment frequency, lead time, MTTR, and change failure rate — calculated from live data, always fresh.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.15)',
  },
]

export default function LandingPage() {
  const [typed, setTyped] = useState('')
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= SQL_DEMO.length) {
        setTyped(SQL_DEMO.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 500)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="relative min-h-screen overflow-auto flex flex-col"
      style={{ background: 'var(--nx-bg)' }}
    >
      {/* Orbs */}
      <div className="orb orb-indigo" style={{ width: 600, height: 600, top: '-10%', left: '-10%' }} />
      <div className="orb orb-cyan"   style={{ width: 500, height: 500, top: '30%', right: '-8%', animationDelay: '-6s' }} />
      <div className="orb orb-violet" style={{ width: 400, height: 400, bottom: '5%', left: '30%' }} />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Nav */}
        <nav
          className="flex items-center justify-between px-8 py-4"
          style={{ borderBottom: '1px solid var(--nx-border)', background: 'rgba(3,3,8,0.7)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
            >
              <HexagonIcon size={15} strokeWidth={2.5} color="white" />
            </div>
            <span className="font-bold text-base tracking-wide gradient-text">NEXUS</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://withcoral.com/docs"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 13, color: 'var(--nx-muted)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--nx-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--nx-muted)')}
            >
              Coral Docs
            </a>
            <Link
              href="/chat"
              className="btn-primary rounded-xl px-4 py-2 text-sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Open NEXUS <ArrowRight size={13} />
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 animate-fade-up"
            style={{ background: 'var(--nx-indigo-dim)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12 }}
          >
            <div className="rounded-full" style={{ width: 6, height: 6, background: 'var(--nx-indigo)', boxShadow: '0 0 6px var(--nx-indigo)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
            <span style={{ color: 'var(--nx-indigo-light)', fontWeight: 500 }}>Built for Pirates of the Coral-bean · Track 1</span>
          </div>

          {/* Title */}
          <h1
            className="font-black mb-5 animate-fade-up"
            style={{ fontSize: 'clamp(42px, 7vw, 80px)', lineHeight: 1.05, letterSpacing: '-0.03em', animationDelay: '0.05s' }}
          >
            <span className="gradient-text-warm">From commit</span>
            <br />
            <span style={{ color: 'var(--nx-text)' }}>to customer.</span>
          </h1>

          <p
            className="animate-fade-up mb-10"
            style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--nx-text-2)', maxWidth: 520, lineHeight: 1.6, animationDelay: '0.1s' }}
          >
            NEXUS joins GitHub, Sentry, and PagerDuty in a single Coral SQL query.
            Zero blind spots. Zero tab-switching.
          </p>

          <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <Link
              href="/chat"
              className="btn-primary rounded-2xl px-7 py-3.5 text-base font-semibold"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Open Command Center
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Source logos */}
          <div className="flex items-center gap-6 mt-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: GitBranch,    label: 'GitHub',    color: '#e2e8f0' },
              { icon: AlertCircle,  label: 'Sentry',    color: '#a78bfa' },
              { icon: Bell,         label: 'PagerDuty', color: '#34d399' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--nx-muted)' }}>
                <Icon size={15} style={{ color }} />
                {label}
              </div>
            ))}
            <span style={{ color: 'var(--nx-border-2)', fontSize: 13 }}>via Coral SQL</span>
          </div>
        </section>

        {/* SQL demo window */}
        <section className="px-6 pb-16" style={{ maxWidth: 780, margin: '0 auto', width: '100%' }}>
          <div
            className="rounded-2xl overflow-hidden animate-fade-up"
            style={{
              border: '1px solid rgba(99,102,241,0.2)',
              background: 'rgba(13,13,23,0.8)',
              boxShadow: '0 0 60px rgba(99,102,241,0.08)',
              animationDelay: '0.25s',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.3)' }}
            >
              <div className="rounded-full" style={{ width: 10, height: 10, background: '#ef4444', opacity: 0.7 }} />
              <div className="rounded-full" style={{ width: 10, height: 10, background: '#f59e0b', opacity: 0.7 }} />
              <div className="rounded-full" style={{ width: 10, height: 10, background: '#10b981', opacity: 0.7 }} />
              <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--nx-muted)', fontFamily: 'var(--font-geist-mono)' }}>
                nexus-query.sql
              </span>
            </div>
            <pre
              style={{
                padding: '20px 24px',
                margin: 0,
                fontSize: 13,
                lineHeight: 1.8,
                fontFamily: 'var(--font-geist-mono), monospace',
                color: 'var(--nx-text-2)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {typed.split('\n').map((line, i) => {
                const sqlKw = /\b(SELECT|FROM|JOIN|ON|WHERE|ORDER|BY|LIMIT|AS)\b/g
                const parts = line.split(sqlKw)
                return (
                  <span key={i}>
                    {parts.map((part, j) =>
                      /^(SELECT|FROM|JOIN|ON|WHERE|ORDER|BY|LIMIT|AS)$/.test(part)
                        ? <span key={j} className="sql-keyword">{part}</span>
                        : /\b(github|sentry|pagerduty)\.\w+/.test(part)
                        ? <span key={j} className="sql-table">{part}</span>
                        : <span key={j}>{part}</span>
                    )}
                    {'\n'}
                  </span>
                )
              })}
              <span style={{ opacity: cursor ? 1 : 0, color: 'var(--nx-indigo)' }}>▊</span>
            </pre>
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderTop: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.2)' }}
            >
              <span style={{ fontSize: 11, color: 'var(--nx-success)' }}>→ 3 sources joined · 0 glue code · 100% local</span>
              <span style={{ fontSize: 11, color: 'var(--nx-muted)' }}>Powered by Coral</span>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="px-6 pb-20" style={{ maxWidth: 960, margin: '0 auto', width: '100%' }}>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {FEATURES.map(({ icon: Icon, title, desc, color, glow }, i) => (
              <div
                key={title}
                className="glass-card p-6 animate-fade-up"
                style={{ animationDelay: `${0.3 + i * 0.08}s`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = `0 8px 40px ${glow}`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="rounded-xl flex items-center justify-center mb-4"
                  style={{ width: 40, height: 40, background: `${color}18`, border: `1px solid ${color}22` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--nx-text)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--nx-text-2)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section
          className="px-6 py-12 text-center"
          style={{ borderTop: '1px solid var(--nx-border)', background: 'rgba(13,13,23,0.5)' }}
        >
          <p style={{ fontSize: 13, color: 'var(--nx-muted)', marginBottom: 16 }}>
            Built on{' '}
            <a href="https://withcoral.com" target="_blank" rel="noreferrer" style={{ color: 'var(--nx-indigo-light)', textDecoration: 'none' }}>
              Coral
            </a>
            {' '}· Pirates of the Coral-bean Hackathon · May 2026
          </p>
          <Link
            href="/chat"
            className="btn-primary rounded-2xl px-8 py-3 text-base font-semibold"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Start Investigating <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  )
}
