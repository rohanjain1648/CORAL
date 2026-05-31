'use client'

import { Flame, ShieldAlert, BarChart3, Users, DollarSign } from 'lucide-react'

const SCENARIOS = [
  {
    icon: Flame,
    label: 'Investigate last incident',
    prompt: "What caused the most recent production incident? Cross-reference GitHub deploys, Sentry errors, and PagerDuty alerts to find the root cause and estimate revenue impact.",
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.15)',
  },
  {
    icon: ShieldAlert,
    label: 'Risk-score a PR',
    prompt: "Analyze the most recent merged pull request. Check the files changed against historical Sentry error patterns and PagerDuty incidents in the same service to give a risk score.",
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: BarChart3,
    label: "This week's DORA metrics",
    prompt: "Calculate this week's DORA metrics: deployment frequency, lead time for changes, mean time to recovery (from PagerDuty), and change failure rate (from Sentry). Compare to last week.",
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    icon: Users,
    label: 'Who is most overloaded?',
    prompt: "Which engineer is most overloaded right now? Look at open GitHub PRs, open PagerDuty on-call incidents, and recent Sentry issues assigned per engineer.",
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    icon: DollarSign,
    label: 'Revenue impact of errors',
    prompt: "Which current Sentry errors have the highest potential revenue impact? Join error frequency and affected endpoint data with what you know about critical user paths.",
    color: '#10b981',
    glow: 'rgba(16,185,129,0.15)',
  },
]

interface ScenarioButtonsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export default function ScenarioButtons({ onSelect, disabled }: ScenarioButtonsProps) {
  return (
    <div className="w-full">
      {/* Hero text */}
      <div className="text-center mb-8 animate-fade-up">
        <div
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--nx-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Engineering Intelligence
        </div>
        <h2
          className="text-3xl font-bold mb-2 gradient-text"
          style={{ lineHeight: 1.2 }}
        >
          Ask anything about your stack
        </h2>
        <p style={{ fontSize: 15, color: 'var(--nx-text-2)', maxWidth: 420, margin: '0 auto' }}>
          NEXUS joins GitHub, Sentry, and PagerDuty in a single Coral SQL query — no context switching.
        </p>
      </div>

      {/* Scenario cards */}
      <div className="flex flex-wrap justify-center gap-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {SCENARIOS.map(({ icon: Icon, label, prompt, color, glow }) => (
          <button
            key={label}
            onClick={() => onSelect(prompt)}
            disabled={disabled}
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              background: 'var(--nx-surface)',
              border: '1px solid var(--nx-border)',
              color: 'var(--nx-text-2)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              if (disabled) return
              const el = e.currentTarget
              el.style.background = glow
              el.style.borderColor = color + '44'
              el.style.color = 'var(--nx-text)'
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'var(--nx-surface)'
              el.style.borderColor = 'var(--nx-border)'
              el.style.color = 'var(--nx-text-2)'
              el.style.transform = 'translateY(0)'
            }}
          >
            <Icon size={14} style={{ color, flexShrink: 0 }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
