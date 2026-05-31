'use client'

import {
  Flame, ShieldAlert, BarChart3, Users, DollarSign,
  GitMerge, MessageSquare, Flag, TrendingUp, Link2,
  MousePointerClick, HexagonIcon,
} from 'lucide-react'

const SCENARIOS = [
  {
    icon: Flame, color: '#ef4444', glow: 'rgba(239,68,68,0.12)', group: 'core',
    label: 'Investigate last incident',
    prompt: 'What caused the most recent production incident? Cross-reference GitHub pull requests merged in the last 3 hours, Sentry fatal errors, and PagerDuty incidents to identify the root cause commit, affected users, and estimated revenue impact.',
  },
  {
    icon: ShieldAlert, color: '#f59e0b', glow: 'rgba(245,158,11,0.12)', group: 'core',
    label: 'Risk-score latest PR',
    prompt: 'Analyze the most recently merged pull request on the main branch. Check the files changed against historical Sentry error patterns in the same project and PagerDuty incidents for that service in the last 30 days. Give a 0–100 risk score with breakdown.',
  },
  {
    icon: BarChart3, color: '#6366f1', glow: 'rgba(99,102,241,0.12)', group: 'core',
    label: "This week's DORA",
    prompt: "Calculate this week's DORA metrics: deployment frequency (GitHub merged PRs to main), lead time for changes (avg PR open-to-merge time), MTTR (PagerDuty incident resolution time), and change failure rate (Sentry fatal errors / deployments). Compare to the previous week.",
  },
  {
    icon: Users, color: '#8b5cf6', glow: 'rgba(139,92,246,0.12)', group: 'core',
    label: 'Who is most overloaded?',
    prompt: 'Which engineer is most overloaded right now? Look at open GitHub PRs by author, unresolved Sentry issues, and PagerDuty on-call assignments. Rank by total workload and flag anyone with more than 5 open items.',
  },
  {
    icon: DollarSign, color: '#10b981', glow: 'rgba(16,185,129,0.12)', group: 'core',
    label: 'Revenue impact of errors',
    prompt: 'Which current Sentry errors are most likely impacting revenue? Look at fatal and error-level issues opened in the last 24 hours, their affected user count, and frequency. Rank by potential business impact.',
  },
  {
    icon: GitMerge, color: '#5e6ad2', glow: 'rgba(94,106,210,0.12)', group: 'extended',
    label: 'Sprint blockers',
    prompt: 'What issues in the current sprint are blocked or have been sitting in review the longest? Join Linear issues with GitHub pull requests to show which have open PRs waiting for review and for how long.',
  },
  {
    icon: MessageSquare, color: '#f472b6', glow: 'rgba(244,114,182,0.12)', group: 'extended',
    label: 'Incident Slack threads',
    prompt: 'What are engineers discussing about incidents and outages in Slack in the last 48 hours? Join Slack messages from #incidents or #engineering channels with PagerDuty incidents to get full context.',
  },
  {
    icon: Flag, color: '#fb923c', glow: 'rgba(251,146,60,0.12)', group: 'extended',
    label: 'Risky feature flags',
    prompt: 'Which LaunchDarkly feature flags are currently enabled for 100% of users but have associated Sentry errors or PagerDuty incidents? Show flags that might need to be rolled back.',
  },
  {
    icon: TrendingUp, color: '#22c55e', glow: 'rgba(34,197,94,0.12)', group: 'growth',
    label: 'Newsletter subscriber growth',
    prompt: 'Show our Beehiiv newsletter subscriber growth over the last 30 days. Break down new subscribers by UTM source and campaign. Which acquisition channel is performing best?',
  },
  {
    icon: Link2, color: '#3b82f6', glow: 'rgba(59,130,246,0.12)', group: 'growth',
    label: 'Top performing links',
    prompt: 'Which Dub short links have the most clicks, leads, and sales revenue this month? Show UTM breakdown and identify which campaigns are driving the most conversions.',
  },
  {
    icon: MousePointerClick, color: '#a855f7', glow: 'rgba(168,85,247,0.12)', group: 'growth',
    label: 'Campaign → subscriber funnel',
    prompt: 'Join Dub link clicks with Beehiiv subscriptions on utm_campaign to show which link campaigns converted to newsletter subscribers. Show click-to-subscribe conversion rate per campaign.',
  },
  {
    icon: BarChart3, color: '#f97316', glow: 'rgba(249,115,22,0.12)', group: 'growth',
    label: 'Product funnel health',
    prompt: 'Use PostHog to show current funnel conversion rates for our key user flows. Identify where users are dropping off. Cross-reference with any Sentry errors occurring at those same steps.',
  },
]

interface ScenarioButtonsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

const GROUPS = [
  { key: 'core',     label: 'Core Intelligence', dim: false },
  { key: 'extended', label: 'Extended',           dim: true  },
  { key: 'growth',   label: 'Growth',             dim: true  },
]

export default function ScenarioButtons({ onSelect, disabled }: ScenarioButtonsProps) {
  return (
    <div style={{ width: '100%', maxWidth: 680 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(99,102,241,0.3)',
          margin: '0 auto 20px',
        }}>
          <HexagonIcon size={24} strokeWidth={2} color="white" />
        </div>
        <h2 style={{
          fontSize: 'clamp(22px, 3.5vw, 30px)',
          fontWeight: 800, letterSpacing: '-0.03em',
          color: 'var(--nx-text)', marginBottom: 10, lineHeight: 1.15,
        }}>
          Ask anything about your stack
        </h2>
        <p style={{
          fontSize: 14, color: 'var(--nx-text-2)',
          maxWidth: 380, margin: '0 auto', lineHeight: 1.65,
        }}>
          NEXUS answers in natural language by running Coral SQL
          across all your connected sources simultaneously.
        </p>
      </div>

      {/* Scenario groups */}
      {GROUPS.map(({ key, label, dim }, gi) => {
        const items = SCENARIOS.filter(s => s.group === key)
        return (
          <div
            key={key}
            className="animate-fade-up"
            style={{ marginBottom: 20, animationDelay: `${0.08 + gi * 0.06}s` }}
          >
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{
                fontSize: 10, color: 'var(--nx-muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--nx-border)' }} />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {items.map(({ icon: Icon, label: btn, prompt, color, glow }) => (
                <button
                  key={btn}
                  onClick={() => onSelect(prompt)}
                  disabled={disabled}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    background: 'var(--nx-surface)', border: '1px solid var(--nx-border)',
                    color: dim ? 'var(--nx-muted)' : 'var(--nx-text-2)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s',
                  }}
                  onMouseEnter={e => {
                    if (disabled) return
                    const el = e.currentTarget
                    el.style.background = glow
                    el.style.borderColor = color + '40'
                    el.style.color = 'var(--nx-text)'
                    el.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = 'var(--nx-surface)'
                    el.style.borderColor = 'var(--nx-border)'
                    el.style.color = dim ? 'var(--nx-muted)' : 'var(--nx-text-2)'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <Icon size={13} style={{ color, flexShrink: 0 }} />
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--nx-muted)', lineHeight: 1.6 }}>
        Extended requires Linear · Slack · LaunchDarkly
        &nbsp;·&nbsp;
        Growth requires PostHog · Beehiiv · Dub
      </p>
    </div>
  )
}
