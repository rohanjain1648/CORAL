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
      className="flex flex-col items-center py-4 gap-1 z-20"
      style={{
        width: 'var(--nx-sidebar-w)',
        background: 'rgba(13,13,23,0.9)',
        borderRight: '1px solid var(--nx-border)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="mb-5 flex items-center justify-center"
        style={{ width: 36, height: 36 }}
        title="NEXUS Home"
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 34,
            height: 34,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}
        >
          <HexagonIcon size={18} strokeWidth={2.5} color="white" />
        </div>
      </Link>

      {/* Divider */}
      <div style={{ width: 28, height: 1, background: 'var(--nx-border)', marginBottom: 8 }} />

      {/* Nav links */}
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              'relative flex items-center justify-center rounded-xl transition-all duration-150',
              active
                ? 'text-white'
                : 'text-[var(--nx-muted)] hover:text-[var(--nx-text-2)]'
            )}
            style={{
              width: 40,
              height: 40,
              background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
              boxShadow: active ? '0 0 16px rgba(99,102,241,0.2)' : 'none',
            }}
          >
            {active && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 3,
                  height: 20,
                  background: 'linear-gradient(180deg, #6366f1, #06b6d4)',
                  left: -1,
                }}
              />
            )}
            <Icon size={17} strokeWidth={active ? 2.5 : 2} />
          </Link>
        )
      })}
    </aside>
  )
}
