'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, BarChart3, Plug, Zap, HexagonIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/chat',    icon: MessageSquare, label: 'Chat'    },
  { href: '/dora',    icon: BarChart3,     label: 'DORA'    },
  { href: '/sources', icon: Plug,          label: 'Sources' },
  { href: '/risk',    icon: Zap,           label: 'Risk'    },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col items-center py-4 gap-0.5 z-20"
      style={{
        width: 72,
        background: 'rgba(13,13,23,0.92)',
        borderRight: '1px solid var(--nx-border)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
        title="NEXUS Home"
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'box-shadow 0.2s',
        }}>
          <HexagonIcon size={17} strokeWidth={2.5} color="white" />
        </div>
      </Link>

      {/* Divider */}
      <div style={{ width: 28, height: 1, background: 'var(--nx-border)', marginBottom: 10 }} />

      {/* Nav links */}
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150',
              active ? 'text-white' : 'text-[var(--nx-muted)] hover:text-[var(--nx-text-2)]'
            )}
            style={{
              width: 52, height: 52,
              background: active ? 'rgba(99,102,241,0.16)' : 'transparent',
              boxShadow: active ? '0 0 18px rgba(99,102,241,0.18)' : 'none',
            }}
          >
            {/* Active left-bar indicator */}
            {active && (
              <div style={{
                position: 'absolute', left: -1, top: '50%',
                transform: 'translateY(-50%)',
                width: 3, height: 22, borderRadius: 99,
                background: 'linear-gradient(180deg, #818cf8, #06b6d4)',
              }} />
            )}
            <Icon size={16} strokeWidth={active ? 2.5 : 2} />
            <span style={{
              fontSize: 9.5, fontWeight: 600,
              letterSpacing: '0.04em', lineHeight: 1,
              color: active ? 'var(--nx-indigo-light)' : 'inherit',
              textTransform: 'uppercase',
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </aside>
  )
}
