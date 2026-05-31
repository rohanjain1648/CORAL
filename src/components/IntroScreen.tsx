'use client'

import { useEffect, useRef, useState } from 'react'
import { HexagonIcon, ArrowRight, GitBranch, AlertCircle, Bell } from 'lucide-react'

interface IntroScreenProps {
  onComplete: () => void
}

const SOURCES = [
  { icon: GitBranch,   label: 'GitHub',    color: '#e2e8f0' },
  { icon: AlertCircle, label: 'Sentry',    color: '#a78bfa' },
  { icon: Bell,        label: 'PagerDuty', color: '#34d399' },
]

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase]     = useState(0)
  const [leaving, setLeaving] = useState(false)
  const completeRef           = useRef(onComplete)
  completeRef.current         = onComplete

  const advance = () => {
    setLeaving(true)
    setTimeout(() => completeRef.current(), 600)
  }

  useEffect(() => {
    const schedule = [300, 1000, 1650, 2350, 3100, 3850, 4650]
    const timers   = schedule.map((t, i) => setTimeout(() => setPhase(i + 1), t))
    const auto     = setTimeout(advance, 8200)
    return () => { timers.forEach(clearTimeout); clearTimeout(auto) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--nx-bg)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: leaving ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
      }}
    >
      {/* Dot-grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Ambient orbs */}
      <div className="orb orb-indigo" style={{ width: 700, height: 700, top: '-20%', left: '-15%', opacity: 0.09 }} />
      <div className="orb orb-cyan"   style={{ width: 500, height: 500, bottom: '-15%', right: '-10%', animationDelay: '-5s', opacity: 0.07 }} />

      {/* Skip */}
      {phase >= 1 && (
        <button
          onClick={advance}
          style={{
            position: 'absolute', top: 24, right: 24,
            fontSize: 12, color: 'var(--nx-muted)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--nx-border)',
            borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', letterSpacing: '0.04em',
            animation: 'introFadeIn 0.4s ease-out forwards',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--nx-text-2)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--nx-muted)')}
        >
          Skip →
        </button>
      )}

      {/* Main stage */}
      <div style={{
        textAlign: 'center', maxWidth: 560, padding: '0 32px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Phase 1 — Logo */}
        {phase >= 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 28,
            animation: 'introReveal 0.85s cubic-bezier(0.16,1,0.3,1) forwards',
          }}>
            <div style={{
              width: 68, height: 68,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 50px rgba(99,102,241,0.5), 0 0 100px rgba(99,102,241,0.18)',
            }}>
              <HexagonIcon size={34} strokeWidth={2} color="white" />
            </div>
          </div>
        )}

        {/* Phase 2 — Name */}
        {phase >= 2 && (
          <div style={{ animation: 'introFadeUp 0.6s ease-out forwards', marginBottom: 10 }}>
            <h1 style={{
              fontSize: 'clamp(48px, 9vw, 76px)',
              fontWeight: 900,
              letterSpacing: '-0.045em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #c4b5fd 0%, #818cf8 40%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              NEXUS
            </h1>
          </div>
        )}

        {/* Phase 3 — Subtitle */}
        {phase >= 3 && (
          <div style={{ animation: 'introFadeUp 0.5s ease-out forwards', marginBottom: 52 }}>
            <p style={{
              fontSize: 13, color: 'var(--nx-text-2)',
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
            }}>
              Engineering Intelligence Command Center
            </p>
          </div>
        )}

        {/* Phase 4 — Source nodes */}
        {phase >= 4 && (
          <div style={{ animation: 'introFadeIn 0.5s ease-out forwards' }}>
            <p style={{
              fontSize: 11, color: 'var(--nx-muted)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              Joins your engineering sources
            </p>
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'center', gap: 10,
            }}>
              {SOURCES.map(({ icon: Icon, label, color }, idx) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    animation: `introFadeScale 0.4s ease-out ${idx * 130}ms both`,
                  }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 15,
                      background: `${color}10`, border: `1px solid ${color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={24} style={{ color }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--nx-muted)', fontWeight: 500 }}>{label}</span>
                  </div>
                  {idx < 2 && (
                    <div style={{
                      width: 22, height: 1,
                      background: 'var(--nx-border-2)',
                      flexShrink: 0, marginBottom: 20,
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 5 — Coral connector */}
        {phase >= 5 && (
          <div style={{
            animation: 'introFadeIn 0.4s ease-out forwards',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, marginTop: 6,
          }}>
            <div style={{
              width: 1, height: 22,
              background: 'linear-gradient(180deg, var(--nx-border-2), transparent)',
            }} />
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 22px',
              background: 'var(--nx-indigo-dim)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 99, fontSize: 13,
              color: 'var(--nx-indigo-light)', fontWeight: 500,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--nx-indigo)',
                boxShadow: '0 0 6px var(--nx-indigo)',
                animation: 'pulseGlow 2s ease-in-out infinite',
                display: 'inline-block', flexShrink: 0,
              }} />
              via Coral SQL
            </span>
          </div>
        )}

        {/* Phase 6 — Tagline */}
        {phase >= 6 && (
          <div style={{
            animation: 'introFadeUp 0.55s ease-out forwards',
            marginTop: 36, marginBottom: 40,
          }}>
            <p style={{
              fontSize: 'clamp(20px, 3.5vw, 28px)',
              fontWeight: 700, letterSpacing: '-0.025em',
              lineHeight: 1.3, color: 'var(--nx-text)',
            }}>
              From commit to customer.
            </p>
            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              color: 'var(--nx-text-2)', fontWeight: 400,
              letterSpacing: '-0.01em', marginTop: 4,
            }}>
              Zero blind spots.
            </p>
          </div>
        )}

        {/* Phase 7 — CTA */}
        {phase >= 7 && (
          <div style={{ animation: 'introFadeUp 0.5s ease-out forwards' }}>
            <button
              onClick={advance}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', border: 'none',
                borderRadius: 14, padding: '14px 34px',
                fontSize: 15, fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 9,
                boxShadow: '0 8px 32px rgba(99,102,241,0.38)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 14px 44px rgba(99,102,241,0.52)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.38)'
              }}
            >
              Enter Command Center
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
