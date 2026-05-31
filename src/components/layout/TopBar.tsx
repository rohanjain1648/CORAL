'use client'

import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/chat':    'Command Center',
  '/dora':    'DORA Metrics',
  '/sources': 'Data Sources',
  '/risk':    'Risk Scorer',
}

const SOURCES = [
  { id: 'github',    label: 'GitHub',    dot: '#e2e8f0' },
  { id: 'sentry',    label: 'Sentry',    dot: '#a78bfa' },
  { id: 'pagerduty', label: 'PagerDuty', dot: '#34d399' },
]

export default function TopBar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'NEXUS'

  return (
    <header
      className="flex items-center justify-between px-5 flex-shrink-0"
      style={{
        height: 'var(--nx-topbar-h)',
        background: 'rgba(13,13,23,0.8)',
        borderBottom: '1px solid var(--nx-border)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: page title */}
      <span
        className="text-sm font-semibold tracking-wide"
        style={{ color: 'var(--nx-text)' }}
      >
        {title}
      </span>

      {/* Right: source pills + settings */}
      <div className="flex items-center gap-3">
        {/* Source status pills */}
        <div className="flex items-center gap-2">
          {SOURCES.map(({ id, label, dot }) => (
            <div
              key={id}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: 'var(--nx-surface-2)',
                border: '1px solid var(--nx-border)',
                fontSize: 11,
                color: 'var(--nx-text-2)',
              }}
            >
              <div
                className="rounded-full animate-pulse-glow"
                style={{
                  width: 6,
                  height: 6,
                  background: dot,
                  boxShadow: `0 0 6px ${dot}`,
                  animation: 'pulseGlow 2s ease-in-out infinite',
                }}
              />
              {label}
            </div>
          ))}
        </div>

        {/* Settings icon */}
        <button
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: 32,
            height: 32,
            color: 'var(--nx-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--nx-text-2)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--nx-muted)')}
          title="Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  )
}
