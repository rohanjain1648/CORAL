'use client'

import { HexagonIcon } from 'lucide-react'

interface ThinkingIndicatorProps {
  label?: string
}

export default function ThinkingIndicator({ label = 'Thinking…' }: ThinkingIndicatorProps) {
  return (
    <div className="flex items-start gap-3 animate-fade-up" style={{ padding: '4px 0' }}>
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          boxShadow: '0 0 12px rgba(99,102,241,0.3)',
          marginTop: 2,
        }}
      >
        <HexagonIcon size={13} strokeWidth={2.5} color="white" />
      </div>

      {/* Bubble */}
      <div
        className="glass-card flex items-center gap-3 px-4 py-3"
        style={{ maxWidth: 220 }}
      >
        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="think-dot"
              style={{
                width: 6,
                height: 6,
                background: i === 0 ? 'var(--nx-indigo)' : i === 1 ? '#818cf8' : 'var(--nx-cyan)',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--nx-text-2)' }}>{label}</span>
      </div>
    </div>
  )
}
