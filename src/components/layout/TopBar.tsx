'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/chat':    'Command Center',
  '/dora':    'DORA Metrics',
  '/sources': 'Data Sources',
  '/risk':    'Risk Scorer',
}

interface SourceStatus {
  id: string
  label: string
  color: string
  connected: boolean
}

// Shown in TopBar always (core sources expected to be connected)
const CORE_IDS = ['github', 'sentry', 'pagerduty']

export default function TopBar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'NEXUS'
  const [sources, setSources] = useState<SourceStatus[]>([])
  const [coralOk, setCoralOk] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/sources')
      .then(r => r.json())
      .then((data: { coralAvailable: boolean; sources: SourceStatus[] }) => {
        setCoralOk(data.coralAvailable)
        setSources(data.sources ?? [])
      })
      .catch(() => setCoralOk(false))
  }, [])

  const connected = sources.filter(s => s.connected)
  const disconnected = sources.filter(s => !s.connected && CORE_IDS.includes(s.id))

  // Show connected sources first, then disconnected core sources
  const visible = connected.length > 0
    ? connected.slice(0, 6)           // up to 6 connected sources
    : sources.filter(s => CORE_IDS.includes(s.id)).slice(0, 3)  // fallback: core 3

  const extraCount = connected.length > 6 ? connected.length - 6 : 0

  return (
    <header
      className="flex items-center justify-between px-5 flex-shrink-0"
      style={{
        height: 'var(--nx-topbar-h)',
        background: 'rgba(13,13,23,0.8)',
        borderBottom: '1px solid var(--nx-border)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}
    >
      {/* Left: page title */}
      <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--nx-text)' }}>
        {title}
      </span>

      {/* Right: source pills + settings */}
      <div className="flex items-center gap-2">

        {/* Coral not detected warning */}
        {coralOk === false && (
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              fontSize: 11,
              color: '#fca5a5',
            }}
          >
            <div className="rounded-full" style={{ width: 5, height: 5, background: '#ef4444' }} />
            Coral not found
          </div>
        )}

        {/* Source pills */}
        {visible.map(({ id, label, color, connected: isConn }) => (
          <div
            key={id}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: isConn ? `${color}0d` : 'var(--nx-surface-2)',
              border: `1px solid ${isConn ? color + '28' : 'var(--nx-border)'}`,
              fontSize: 11,
              color: isConn ? color : 'var(--nx-muted)',
              transition: 'all 0.2s',
            }}
            title={`${label} — ${isConn ? 'connected' : 'not connected'}`}
          >
            <div
              className="rounded-full"
              style={{
                width: 6,
                height: 6,
                background: isConn ? color : 'var(--nx-muted)',
                boxShadow: isConn ? `0 0 5px ${color}` : 'none',
                animation: isConn ? 'pulseGlow 2s ease-in-out infinite' : 'none',
              }}
            />
            {label}
          </div>
        ))}

        {/* +N more badge */}
        {extraCount > 0 && (
          <div
            className="rounded-full px-2 py-1"
            style={{
              fontSize: 10,
              fontWeight: 600,
              background: 'var(--nx-indigo-dim)',
              color: 'var(--nx-indigo-light)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            +{extraCount}
          </div>
        )}

        {/* Connected count summary when nothing shown yet */}
        {visible.length === 0 && coralOk === null && (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer rounded-full" style={{ width: 72, height: 22 }} />
            ))}
          </div>
        )}

        {/* Settings */}
        <button
          style={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            color: 'var(--nx-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--nx-text-2)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--nx-muted)')}
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  )
}
