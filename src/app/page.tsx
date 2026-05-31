'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight, HexagonIcon,
  Flame, ShieldAlert, BarChart3,
  GitBranch, AlertCircle, Bell,
  Terminal, Database, Zap,
} from 'lucide-react'
import IntroScreen from '@/components/IntroScreen'

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

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Terminal,
    title: 'Ask in plain English',
    desc: 'Type any question about your engineering org. No SQL, no dashboards, no context-switching.',
    color: '#6366f1',
  },
  {
    step: '02',
    icon: Database,
    title: 'Coral queries all sources',
    desc: 'NEXUS generates and executes Coral SQL across GitHub, Sentry, PagerDuty, and 7+ more — simultaneously.',
    color: '#06b6d4',
  },
  {
    step: '03',
    icon: Zap,
    title: 'Instant, full-context answers',
    desc: 'Get analysis with data tables, transparent SQL, and actionable recommendations — in seconds.',
    color: '#10b981',
  },
]

const FEATURES = [
  {
    icon: Flame,
    title: 'Incident War Room',
    desc: 'Root cause in seconds. One JOIN across GitHub, Sentry, and PagerDuty. No tab-switching.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.14)',
    metric: '< 30s',
    metricLabel: 'to root cause',
  },
  {
    icon: ShieldAlert,
    title: 'Pre-Merge Risk Score',
    desc: "Know if a PR is risky before it ships. Historical error patterns + incident data = confidence score.",
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.14)',
    metric: '0 – 100',
    metricLabel: 'risk score',
  },
  {
    icon: BarChart3,
    title: 'Live DORA Metrics',
    desc: 'Deployment frequency, lead time, MTTR, change failure rate — from live data, always fresh.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.14)',
    metric: 'Always',
    metricLabel: 'fresh data',
  },
]

const SOURCES = [
  { icon: GitBranch,   label: 'GitHub',    color: '#e2e8f0' },
  { icon: AlertCircle, label: 'Sentry',    color: '#a78bfa' },
  { icon: Bell,        label: 'PagerDuty', color: '#34d399' },
]

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(false)
  const [typed, setTyped]         = useState('')
  const [cursor, setCursor]       = useState(true)

  useEffect(() => {
    const seen = sessionStorage.getItem('nexus_intro_v1')
    if (!seen) setShowIntro(true)
  }, [])

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('nexus_intro_v1', '1')
    setShowIntro(false)
  }, [])

  // Typewriter — delayed when intro is visible
  useEffect(() => {
    const startDelay = showIntro ? 9000 : 700
    let i = 0
    const t0 = setTimeout(() => {
      const iv = setInterval(() => {
        if (i <= SQL_DEMO.length) { setTyped(SQL_DEMO.slice(0, i)); i++ }
        else clearInterval(iv)
      }, 15)
      return () => clearInterval(iv)
    }, startDelay)
    return () => clearTimeout(t0)
  }, [showIntro])

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

      <div
        style={{ background: 'var(--nx-bg)', height: '100%', overflowY: 'auto', position: 'relative' }}
      >
        {/* Dot-grid background */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Ambient orbs */}
        <div className="orb orb-indigo" style={{ width: 620, height: 620, top: '-8%', left: '-10%' }} />
        <div className="orb orb-cyan"   style={{ width: 480, height: 480, top: '32%', right: '-7%', animationDelay: '-6s' }} />
        <div className="orb orb-violet" style={{ width: 380, height: 380, bottom: '8%', left: '32%' }} />

        {/* ── Content ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Nav */}
          <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 36px', height: 60,
            position: 'sticky', top: 0, zIndex: 50,
            borderBottom: '1px solid var(--nx-border)',
            background: 'rgba(3,3,8,0.75)', backdropFilter: 'blur(24px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                boxShadow: '0 0 18px rgba(99,102,241,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <HexagonIcon size={16} strokeWidth={2.5} color="white" />
              </div>
              <span style={{
                fontWeight: 800, fontSize: 14, letterSpacing: '0.12em',
                background: 'linear-gradient(135deg, #a5b4fc, #67e8f9)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                NEXUS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <a
                href="https://withcoral.com/docs" target="_blank" rel="noreferrer"
                style={{ fontSize: 13, color: 'var(--nx-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--nx-text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--nx-muted)')}
              >
                Coral Docs
              </a>
              <Link
                href="/chat"
                className="btn-primary"
                style={{
                  borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                Open NEXUS <ArrowRight size={13} />
              </Link>
            </div>
          </nav>

          {/* ── Hero — split layout ── */}
          <section style={{ padding: '80px 36px 64px' }}>
            <div style={{
              maxWidth: 1100, margin: '0 auto', display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center',
            }}>

              {/* Left — text */}
              <div>
                {/* Badge */}
                <div
                  className="animate-fade-up"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    borderRadius: 99, padding: '6px 14px', marginBottom: 32,
                    background: 'var(--nx-indigo-dim)', border: '1px solid rgba(99,102,241,0.25)',
                    fontSize: 12,
                  }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--nx-indigo)', display: 'inline-block',
                    boxShadow: '0 0 6px var(--nx-indigo)',
                    animation: 'pulseGlow 2s ease-in-out infinite',
                  }} />
                  <span style={{ color: 'var(--nx-indigo-light)', fontWeight: 500 }}>
                    Built on Coral SQL · 10+ sources
                  </span>
                </div>

                {/* Headline */}
                <h1
                  className="animate-fade-up"
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 58px)',
                    fontWeight: 900, letterSpacing: '-0.04em',
                    lineHeight: 1.06, marginBottom: 22,
                    animationDelay: '0.05s',
                  }}
                >
                  <span style={{ color: 'var(--nx-text)' }}>Your engineering</span>
                  <br />
                  <span style={{ color: 'var(--nx-text)' }}>org has zero</span>
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #818cf8 50%, #67e8f9 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    blind spots.
                  </span>
                </h1>

                {/* Body */}
                <p
                  className="animate-fade-up"
                  style={{
                    fontSize: 17, color: 'var(--nx-text-2)',
                    lineHeight: 1.7, maxWidth: 420,
                    marginBottom: 38, animationDelay: '0.1s',
                  }}
                >
                  Ask anything about your engineering stack in plain English.
                  NEXUS joins GitHub, Sentry, PagerDuty, and 7+ more sources
                  in a single Coral SQL query — no dashboards.
                </p>

                {/* CTA */}
                <div className="animate-fade-up" style={{ animationDelay: '0.15s', marginBottom: 40 }}>
                  <Link
                    href="/chat"
                    className="btn-primary"
                    style={{
                      borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 600,
                      textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    Open Command Center
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Source list */}
                <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 20, animationDelay: '0.2s' }}>
                  {SOURCES.map(({ icon: Icon, label, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--nx-muted)' }}>
                      <Icon size={13} style={{ color }} />
                      {label}
                    </div>
                  ))}
                  <span style={{ fontSize: 12, color: 'var(--nx-border-2)' }}>+7 more</span>
                </div>
              </div>

              {/* Right — SQL demo window */}
              <div
                className="animate-fade-up"
                style={{
                  borderRadius: 18, overflow: 'hidden',
                  border: '1px solid rgba(99,102,241,0.18)',
                  background: 'rgba(13,13,23,0.85)',
                  boxShadow: '0 0 80px rgba(99,102,241,0.07), 0 40px 80px rgba(0,0,0,0.4)',
                  animationDelay: '0.22s',
                }}
              >
                {/* Window chrome */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px',
                  borderBottom: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.3)',
                }}>
                  {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.75 }} />
                  ))}
                  <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--nx-muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    nexus-query.sql
                  </span>
                </div>

                {/* SQL */}
                <pre style={{
                  padding: '18px 22px', margin: 0,
                  fontSize: 13, lineHeight: 1.9,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  color: 'var(--nx-text-2)', whiteSpace: 'pre-wrap',
                  minHeight: 210,
                }}>
                  {typed.split('\n').map((line, li) => {
                    const kw = /\b(SELECT|FROM|JOIN|ON|WHERE|ORDER|BY|LIMIT|AS|DESC)\b/g
                    const parts = line.split(kw)
                    return (
                      <span key={li}>
                        {parts.map((p, pi) =>
                          /^(SELECT|FROM|JOIN|ON|WHERE|ORDER|BY|LIMIT|AS|DESC)$/.test(p)
                            ? <span key={pi} className="sql-keyword">{p}</span>
                            : /\b(github|sentry|pagerduty)\.\w+/.test(p)
                            ? <span key={pi} className="sql-table">{p}</span>
                            : <span key={pi}>{p}</span>
                        )}
                        {'\n'}
                      </span>
                    )
                  })}
                  <span style={{ opacity: cursor ? 1 : 0, color: 'var(--nx-indigo)' }}>▊</span>
                </pre>

                {/* Footer */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 16px',
                  borderTop: '1px solid var(--nx-border)', background: 'rgba(0,0,0,0.2)',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--nx-success)', fontFamily: 'var(--font-geist-mono)' }}>
                    → 3 sources joined · 0.3ms · 100% local
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--nx-muted)' }}>Coral</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── How it works ── */}
          <section style={{ padding: '72px 36px', borderTop: '1px solid var(--nx-border)' }}>
            <div style={{ maxWidth: 920, margin: '0 auto' }}>
              <p style={{
                fontSize: 11, color: 'var(--nx-muted)', letterSpacing: '0.12em',
                textTransform: 'uppercase', textAlign: 'center', marginBottom: 52, fontWeight: 600,
              }}>
                How Nexus works
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }, i) => (
                  <div
                    key={step}
                    className="glass-card animate-fade-up"
                    style={{ padding: 24, animationDelay: `${0.05 + i * 0.08}s` }}
                  >
                    <span style={{
                      fontSize: 11, color: 'var(--nx-muted)',
                      fontFamily: 'var(--font-geist-mono)',
                      letterSpacing: '0.06em', display: 'block', marginBottom: 18,
                    }}>
                      {step}
                    </span>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${color}14`, border: `1px solid ${color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                    }}>
                      <Icon size={17} style={{ color }} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--nx-text)', marginBottom: 8 }}>{title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--nx-text-2)', lineHeight: 1.65 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Capabilities ── */}
          <section style={{ padding: '64px 36px' }}>
            <div style={{ maxWidth: 920, margin: '0 auto' }}>
              <p style={{
                fontSize: 11, color: 'var(--nx-muted)', letterSpacing: '0.12em',
                textTransform: 'uppercase', textAlign: 'center', marginBottom: 52, fontWeight: 600,
              }}>
                Capabilities
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {FEATURES.map(({ icon: Icon, title, desc, color, glow, metric, metricLabel }, i) => (
                  <div
                    key={title}
                    className="glass-card animate-fade-up"
                    style={{
                      padding: 24, animationDelay: `${0.1 + i * 0.08}s`,
                      transition: 'transform 0.22s, box-shadow 0.22s', cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = `0 16px 48px ${glow}`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: `${color}14`, border: `1px solid ${color}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={17} style={{ color }} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--nx-text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{metric}</div>
                        <div style={{ fontSize: 11, color: 'var(--nx-muted)', marginTop: 3 }}>{metricLabel}</div>
                      </div>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--nx-text)', marginBottom: 8 }}>{title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--nx-text-2)', lineHeight: 1.65 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Footer CTA ── */}
          <section style={{
            padding: '72px 36px',
            borderTop: '1px solid var(--nx-border)',
            background: 'rgba(13,13,23,0.5)',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800,
              letterSpacing: '-0.03em', color: 'var(--nx-text)', marginBottom: 14,
            }}>
              Start investigating in seconds.
            </h2>
            <p style={{
              fontSize: 15, color: 'var(--nx-text-2)', lineHeight: 1.6,
              maxWidth: 380, margin: '0 auto 36px',
            }}>
              Connect your sources and ask your first question.
              No setup. No dashboards.
            </p>
            <Link
              href="/chat"
              className="btn-primary"
              style={{
                borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 600,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              Open Command Center <ArrowRight size={15} />
            </Link>
            <p style={{ fontSize: 12, color: 'var(--nx-muted)', marginTop: 44 }}>
              Built on{' '}
              <a
                href="https://withcoral.com" target="_blank" rel="noreferrer"
                style={{ color: 'var(--nx-indigo-light)', textDecoration: 'none' }}
              >
                Coral
              </a>
              {' '}· Pirates of the Coral-bean Hackathon · May 2026
            </p>
          </section>

        </div>
      </div>
    </>
  )
}
