'use client'

import { Flame, ShieldAlert, BarChart3, Users, DollarSign, GitMerge, MessageSquare, Flag, TrendingUp, Link2, MousePointerClick } from 'lucide-react'

const SCENARIOS = [
  {
    icon: Flame,
    label: 'Investigate last incident',
    prompt: 'What caused the most recent production incident? Cross-reference GitHub pull requests merged in the last 3 hours, Sentry fatal errors, and PagerDuty incidents to identify the root cause commit, affected users, and estimated revenue impact.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.12)',
    group: 'core',
  },
  {
    icon: ShieldAlert,
    label: 'Risk-score latest PR',
    prompt: 'Analyze the most recently merged pull request on the main branch. Check the files changed against historical Sentry error patterns in the same project and PagerDuty incidents for that service in the last 30 days. Give a 0–100 risk score with breakdown.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
    group: 'core',
  },
  {
    icon: BarChart3,
    label: "This week's DORA",
    prompt: "Calculate this week's DORA metrics: deployment frequency (GitHub merged PRs to main), lead time for changes (avg PR open-to-merge time), MTTR (PagerDuty incident resolution time), and change failure rate (Sentry fatal errors / deployments). Compare to the previous week.",
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.12)',
    group: 'core',
  },
  {
    icon: Users,
    label: 'Who is most overloaded?',
    prompt: 'Which engineer is most overloaded right now? Look at open GitHub PRs by author, unresolved Sentry issues, and PagerDuty on-call assignments. Rank by total workload and flag anyone with more than 5 open items.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.12)',
    group: 'core',
  },
  {
    icon: DollarSign,
    label: 'Revenue impact of errors',
    prompt: 'Which current Sentry errors are most likely impacting revenue? Look at fatal and error-level issues opened in the last 24 hours, their affected user count, and frequency. Rank by potential business impact.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.12)',
    group: 'core',
  },
  {
    icon: GitMerge,
    label: "Sprint blockers",
    prompt: 'What issues in the current sprint are blocked or have been sitting in review the longest? Join Linear issues with GitHub pull requests to show which have open PRs waiting for review and for how long.',
    color: '#5e6ad2',
    glow: 'rgba(94,106,210,0.12)',
    group: 'extended',
  },
  {
    icon: MessageSquare,
    label: 'Incident Slack threads',
    prompt: 'What are engineers discussing about incidents and outages in Slack in the last 48 hours? Join Slack messages from #incidents or #engineering channels with PagerDuty incidents to get full context.',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.12)',
    group: 'extended',
  },
  {
    icon: Flag,
    label: 'Risky feature flags',
    prompt: 'Which LaunchDarkly feature flags are currently enabled for 100% of users but have associated Sentry errors or PagerDuty incidents? Show flags that might need to be rolled back.',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.12)',
    group: 'extended',
  },
  {
    icon: TrendingUp,
    label: 'Newsletter subscriber growth',
    prompt: 'Show our Beehiiv newsletter subscriber growth over the last 30 days. Break down new subscribers by UTM source and campaign. Which acquisition channel is performing best? Also show which posts had the highest open and click rates.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.12)',
    group: 'growth',
  },
  {
    icon: Link2,
    label: 'Top performing links',
    prompt: 'Which Dub short links have the most clicks, leads, and sales revenue this month? Show UTM breakdown and identify which campaigns are driving the most conversions. Flag any links with high clicks but zero conversions.',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.12)',
    group: 'growth',
  },
  {
    icon: MousePointerClick,
    label: 'Campaign → subscriber funnel',
    prompt: 'Join Dub link clicks with Beehiiv subscriptions on utm_campaign to show which link campaigns converted to newsletter subscribers. Show click-to-subscribe conversion rate per campaign. Then check if any of those subscribers also hit Sentry errors.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.12)',
    group: 'growth',
  },
  {
    icon: BarChart3,
    label: 'Product funnel health',
    prompt: 'Use PostHog to show current funnel conversion rates for our key user flows. Identify where users are dropping off. Cross-reference with any Sentry errors occurring at those same steps. Which errors are directly killing conversions?',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.12)',
    group: 'growth',
  },
]

interface ScenarioButtonsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export default function ScenarioButtons({ onSelect, disabled }: ScenarioButtonsProps) {
  const core = SCENARIOS.filter(s => s.group === 'core')
  const extended = SCENARIOS.filter(s => s.group === 'extended')
  const growth = SCENARIOS.filter(s => s.group === 'growth')

  return (
    <div className="w-full">
      {/* Hero text */}
      <div className="text-center mb-8 animate-fade-up">
        <div style={{ fontSize: 11, color: 'var(--nx-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
          Engineering Intelligence
        </div>
        <h2 className="gradient-text font-black mb-3"
          style={{ fontSize: 'clamp(24px, 4vw, 34px)', lineHeight: 1.15 }}>
          Ask anything about your stack
        </h2>
        <p style={{ fontSize: 14, color: 'var(--nx-text-2)', maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
          NEXUS joins GitHub, Sentry, PagerDuty, Linear, Slack and more
          in a single Coral SQL query — no tab-switching.
        </p>
      </div>

      {/* Core scenarios */}
      <div className="flex flex-wrap justify-center gap-2 mb-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {core.map(({ icon: Icon, label, prompt, color, glow }) => (
          <ScenarioBtn key={label} Icon={Icon} label={label} prompt={prompt} color={color} glow={glow} onSelect={onSelect} disabled={disabled} />
        ))}
      </div>

      {/* Extended engineering scenarios */}
      <div className="flex flex-wrap justify-center gap-2 animate-fade-up" style={{ animationDelay: '0.18s' }}>
        {extended.map(({ icon: Icon, label, prompt, color, glow }) => (
          <ScenarioBtn key={label} Icon={Icon} label={label} prompt={prompt} color={color} glow={glow} onSelect={onSelect} disabled={disabled} dim />
        ))}
      </div>

      {/* Growth scenarios — PostHog, Beehiiv, Dub */}
      <div className="flex flex-wrap justify-center gap-2 mt-2 animate-fade-up" style={{ animationDelay: '0.24s' }}>
        {growth.map(({ icon: Icon, label, prompt, color, glow }) => (
          <ScenarioBtn key={label} Icon={Icon} label={label} prompt={prompt} color={color} glow={glow} onSelect={onSelect} disabled={disabled} dim />
        ))}
      </div>

      <p className="text-center mt-4" style={{ fontSize: 11, color: 'var(--nx-muted)' }}>
        Extended requires Linear · Slack · LaunchDarkly &nbsp;·&nbsp; Growth requires PostHog · Beehiiv · Dub
      </p>
    </div>
  )
}

function ScenarioBtn({
  Icon, label, prompt, color, glow, onSelect, disabled, dim,
}: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  label: string; prompt: string; color: string; glow: string
  onSelect: (p: string) => void; disabled?: boolean; dim?: boolean
}) {
  return (
    <button
      onClick={() => onSelect(prompt)}
      disabled={disabled}
      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
      style={{
        background: 'var(--nx-surface)',
        border: '1px solid var(--nx-border)',
        color: dim ? 'var(--nx-muted)' : 'var(--nx-text-2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
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
      {label}
    </button>
  )
}
