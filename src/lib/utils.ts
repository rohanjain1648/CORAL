import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  return `${seconds.toFixed(1)}s`
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export const SOURCE_META: Record<string, { label: string; color: string; bg: string }> = {
  github:     { label: 'GitHub',     color: '#e2e8f0', bg: 'rgba(226,232,240,0.08)' },
  sentry:     { label: 'Sentry',     color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  pagerduty:  { label: 'PagerDuty',  color: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
  datadog:    { label: 'Datadog',    color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
  stripe:     { label: 'Stripe',     color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
  linear:     { label: 'Linear',     color: '#5e6ad2', bg: 'rgba(94,106,210,0.08)'  },
  slack:      { label: 'Slack',      color: '#f472b6', bg: 'rgba(244,114,182,0.08)' },
  jira:       { label: 'Jira',       color: '#38bdf8', bg: 'rgba(56,189,248,0.08)'  },
  confluence: { label: 'Confluence', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)'  },
  buildkite:  { label: 'Buildkite',  color: '#fb923c', bg: 'rgba(251,146,60,0.08)'  },
}
